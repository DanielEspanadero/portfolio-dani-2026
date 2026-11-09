// Focused, dependency-free T1 validation. Chrome uses a fresh, temporary profile.
// Usage: node design/ai-software-factory/validate.mjs [--board=01|02|03]
// Select one board to keep foreground validation below 30 seconds.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(root, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'design.json'), 'utf8'));
const base = fs.readFileSync('/Users/daniel/.gentle-shell/agent/skills/frontend-slides/viewport-base.css', 'utf8');
let browserTests = 0;
let scratch;
let chrome;
let socket;
const pending = new Map();
let sequence = 0;
function check(value, label) { assert.ok(value, label); console.log(`PASS ${label}`); }
function command(method, params = {}, sessionId) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 12000);
    pending.set(id, { resolve: result => { clearTimeout(timer); resolve(result); }, reject });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  check(manifest.artboards.length === 3, 'exactly three artboards');
  const args = process.argv.slice(2);
  check(args.length === 0 || (args.length === 1 && /^--board=0[123]$/.test(args[0])), 'valid optional --board=01|02|03 selector');
  const boards = args.length ? manifest.artboards.filter(board => board.id === args[0].slice(8)) : manifest.artboards;
  for (const [index, board] of manifest.artboards.entries()) {
    const html = fs.readFileSync(path.join(root, board.file), 'utf8');
    check(board.width === 1920 && board.height === 1080, `${board.file}: fixed manifest geometry`);
    check(html.includes(base), `${board.file}: full viewport-base.css verbatim`);
    check(html === fs.readFileSync(path.join(project, `.frontend-slides/slide-previews/style-${'abc'[index]}.html`), 'utf8'), `${board.file}: preview is byte-identical`);
    check((html.match(/<h1\b/g) || []).length === 1 && html.includes('lang="es"'), `${board.file}: semantic Spanish title`);
    check((html.match(/@font-face/g) || []).length === 4 && html.includes('SIL Open Font License'), `${board.file}: embedded fonts and attribution`);
    check(!/<(?:link|script|img)[^>]+(?:src|href)\s*=/i.test(html) && !/url\(\s*['"]?https?:/i.test(html), `${board.file}: no external rendering resources`);
    for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Function(script[1]);
    console.log(`PASS ${board.file}: JavaScript syntax; ${html.split('\n').length - 1} lines; ${Buffer.byteLength(html)} bytes`);
  }
  check(typeof WebSocket === 'function', 'native WebSocket available');
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'factory-t1-browser-'));
  console.log(`Browser scratch: ${scratch}`);
  chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless', '--remote-debugging-port=0', `--user-data-dir=${scratch}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-sync', '--disable-default-apps', '--disable-component-update',
    '--disable-breakpad', '--disable-crash-reporter', '--password-store=basic', '--use-mock-keychain', 'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let chromeLog = '';
  chrome.stderr.on('data', data => { chromeLog += data.toString(); });
  const endpoint = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Chrome setup timed out. stderr:\n${chromeLog.slice(-6000)}`)), 15000);
    chrome.on('error', error => { clearTimeout(timeout); reject(error); });
    chrome.on('exit', code => { clearTimeout(timeout); reject(new Error(`Chrome setup exit ${code}. stderr:\n${chromeLog.slice(-6000)}`)); });
    chrome.stderr.on('data', () => {
      const match = chromeLog.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
  });
  socket = new WebSocket(endpoint);
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (request) { pending.delete(message.id); message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result); }
  });
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  const output = path.join(root, 'checks-t1');
  fs.mkdirSync(output, { recursive: true });
  for (const board of boards) {
    const { targetId } = await command('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await command('Target.attachToTarget', { targetId, flatten: true });
    const run = (method, params) => command(method, params, sessionId);
    const evaluate = async expression => {
      const result = await run('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };
    await run('Page.enable');
    await run('Runtime.enable');
    for (const [viewport, width, height] of [['desktop', 1280, 720], ['phone', 390, 844]]) {
      await run('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await run('Page.navigate', { url: pathToFileURL(path.join(root, board.file)).href });
      await sleep(700);
      // Unused embedded faces are lazily unloaded; explicitly load every declared face
      // so the assertion below checks actual decoding, not browser usage heuristics.
      await evaluate('Promise.all([...document.fonts].map(face=>face.load())).then(()=>document.fonts.ready).then(()=>true)');
      await sleep(6500);
      const geometry = await evaluate(`(() => {
        const stage=document.querySelector('.deck-stage'), r=stage.getBoundingClientRect();
        const overflow=[];
        for(const el of document.querySelectorAll('h1,p,header,footer,figure,svg text')) {
          if(!stage.contains(el))continue;
          const b=el.getBoundingClientRect();
          if(b.left<r.left-1||b.top<r.top-1||b.right>r.right+1||b.bottom>r.bottom+1)overflow.push(el.tagName+': '+el.textContent.trim());
        }
        const buttons=[...document.querySelectorAll('button')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}));
        return {ratio:r.width/r.height,overflow,buttons,fit:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight-77,fonts:[...document.fonts].every(f=>f.status==='loaded'), title:document.querySelector('h1').innerText.replace(/\\s+/g,' ').trim()};
      })()`);
      check(Math.abs(geometry.ratio - 16/9) < 0.001 && geometry.fit, `${board.file}/${viewport}: uniform 16:9 fit`);
      check(geometry.overflow.length === 0, `${board.file}/${viewport}: text and semantic blocks within stage ${JSON.stringify(geometry.overflow)}`);
      check(geometry.buttons.every(b => b.w >= 44 && b.h >= 44), `${board.file}/${viewport}: 44px controls`);
      check(geometry.fonts, `${board.file}/${viewport}: all embedded fonts loaded`);
      check(geometry.title.toLocaleLowerCase('es') === 'fábrica de software con ia', `${board.file}/${viewport}: exact visible title`);
      const image = await run('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(output, `${board.id}-${viewport}.png`), Buffer.from(image.data, 'base64'));
      // A newly created CDP target may be backgrounded. DOM focus alone does
      // not grant keyboard input; activate its page before exercising Enter.
      await run('Page.bringToFront');
      await run('Emulation.setFocusEmulationEnabled', { enabled: true });
      await evaluate("document.querySelector('#pause').focus()");
      check(await evaluate("document.hasFocus() && document.activeElement.id==='pause'"), `${board.file}/${viewport}: keyboard target focused`);
      // CDP keyDown without text omits the character/keypress event and does
      // not activate a native button. Return text reproduces physical Enter;
      // keep the browser's trusted click/default action, not a scripted click.
      const enter = async () => {
        await run('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
        await run('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      };
      await evaluate("window.keyboardClicks=[]; document.addEventListener('click',event=>{if(event.isTrusted)window.keyboardClicks.push(event.target.id)}); true");
      await enter();
      check(await evaluate("window.keyboardClicks.join(',')==='pause' && document.querySelector('#pause').getAttribute('aria-pressed')==='true' && document.querySelector('.deck-stage').classList.contains('paused')"), `${board.file}/${viewport}: native keyboard pause`);
      await enter();
      check(await evaluate("window.keyboardClicks.join(',')==='pause,pause' && document.querySelector('#pause').getAttribute('aria-pressed')==='false' && !document.querySelector('.deck-stage').classList.contains('paused')"), `${board.file}/${viewport}: native keyboard resume`);
      await evaluate("document.querySelector('#pause').click()");
      check(await evaluate("document.querySelector('#pause').getAttribute('aria-pressed')==='true' && document.querySelector('.deck-stage').classList.contains('paused')"), `${board.file}/${viewport}: click pause preserved`);
      await evaluate("document.querySelector('#restart').focus()");
      await enter();
      const restarted = "document.querySelector('#pause').getAttribute('aria-pressed')==='false' && !document.querySelector('.deck-stage').classList.contains('paused') && document.querySelector('.deck-stage').getAnimations({subtree:true}).length>0 && document.querySelector('.deck-stage').getAnimations({subtree:true}).every(a=>a.currentTime<500)";
      check(await evaluate(`window.keyboardClicks.join(',')==='pause,pause,restart' && (${restarted})`), `${board.file}/${viewport}: native keyboard restart resets animations`);
      await evaluate("document.querySelector('#restart').click()");
      check(await evaluate(restarted), `${board.file}/${viewport}: click restart preserved`);
      await run('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await sleep(100);
      check(await evaluate("document.querySelector('.deck-stage').getAnimations({subtree:true}).length===0 && document.querySelector('#pause').disabled"), `${board.file}/${viewport}: reduced motion is static`);
      await run('Emulation.setEmulatedMedia', { features: [] });
      browserTests++;
    }
    await command('Target.closeTarget', { targetId });
  }
  console.log(`PASS complete: ${browserTests} browser viewport probes; ${browserTests} screenshots in design/ai-software-factory/checks-t1/`);
} catch (error) {
  console.error(`FAIL ${error.stack || error}`);
  console.error(`Browser viewport probes completed: ${browserTests}. No automatic setup retry.`);
  process.exitCode = 1;
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await command('Browser.close'); } catch {} }
  socket?.close();
  if (chrome && chrome.exitCode === null) { chrome.kill('SIGTERM'); await sleep(750); }
  if (scratch) { fs.rmSync(scratch, { recursive: true, force: true }); console.log(`Removed browser scratch: ${scratch}`); }
}
