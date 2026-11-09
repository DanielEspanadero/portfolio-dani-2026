// Dependency-free CDP checks. Each selector is one bounded foreground run.
// node tests/software-factory-browser.mjs --chapter=1 (through 7)
// node tests/software-factory-browser.mjs --mode=interaction|reading
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { chapters, slides } from '../src/content/software-factory/index.mjs';
import { renderPresentation, renderGuide } from '../src/presentations/software-factory/render.mjs';

const selector = process.argv[2];
assert.match(selector || '', /^--(?:chapter=[1-7]|mode=(?:interaction|reading))$/);
const label = selector.slice(2).replace('=', '-');
const output = path.resolve('design/ai-software-factory/checks-deck');
fs.mkdirSync(output, { recursive: true });
const read = file => fs.readFileSync(`src/presentations/software-factory/${file}`, 'utf8');
const css = ['fonts.css', 'viewport-base.css', 'deck.css'].map(read).join('\n');
assert.ok(css.includes(fs.readFileSync('/Users/daniel/.gentle-shell/agent/skills/frontend-slides/viewport-base.css', 'utf8')));
const controller = fs.readFileSync('src/presentations/shared/player.js', 'utf8') + '\n' + read('enhancements.js');
const file = path.join(output, 'standalone.html');
fs.writeFileSync(file, renderPresentation({ css, controller, offline: true }));
fs.writeFileSync(path.join(output, 'guide.html'), renderGuide({ css: read('fonts.css') + read('guide.css') }));
let scratch, chrome, socket, sessionId;
let sequence = 0;
const pending = new Map();
const results = { selector, probes: [], failures: [], requests: [], errors: [] };
function check(value, message) {
  if (!value) results.failures.push(message);
  console.log(`${value ? 'PASS' : 'FAIL'} ${message}`);
}
function command(method, params = {}, session = sessionId) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout ${method}`)); }, 10000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
    socket.send(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }));
  });
}
async function evaluate(expression) {
  const reply = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (reply.exceptionDetails) throw new Error(JSON.stringify(reply.exceptionDetails));
  return reply.result.value;
}
async function frame() {
  await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
}
async function key(key, code = key, number = 0, text) {
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: number, ...(text ? { text } : {}) });
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: number });
  await frame();
}
async function enter(id) {
  await evaluate(`document.getElementById(${JSON.stringify(id)}).focus()`);
  await key('Enter', 'Enter', 13, '\r');
}
async function go(number) {
  await evaluate(`location.hash='#${number}'; document.querySelector('#deck').focus(); true`);
  await frame();
}
async function load(url, scripts = true) {
  const loaded = new Promise(resolve => {
    const listener = event => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Page.loadEventFired' && msg.sessionId === sessionId) { socket.removeEventListener('message', listener); resolve(); }
    };
    socket.addEventListener('message', listener);
  });
  await command('Page.navigate', { url });
  await loaded;
  if (scripts) {
    await evaluate('Promise.all([...document.fonts].map(f=>f.load())).then(()=>document.fonts.ready).then(()=>true)');
    await frame();
  }
}
async function capture(name) {
  const image = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(output, name), Buffer.from(image.data, 'base64'));
}

// Use text ranges as well as boxes: scrollHeight alone misses panel overlap.
const geometry = `(() => {
 const s=document.querySelector('.slide.active'), r=s.getBoundingClientRect(), scale=r.width/1920;
 const errors=[], rect=el=>el.getBoundingClientRect();
 const within=(a,b,t=1)=>a.left>=b.left-t&&a.top>=b.top-t&&a.right<=b.right+t&&a.bottom<=b.bottom+t;
 const overlaps=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>scale*2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>scale*2;
 for(const el of s.querySelectorAll('h1,h2,h3,p,pre,th,td,.station-number,.checkpoint,.closing-stamp,.integration strong,.gate-banner')) {
  if(getComputedStyle(el).visibility==='hidden'||el.getClientRects().length===0)continue;
  const b=rect(el);
  if(!within(b,r))errors.push('stage overflow: '+el.textContent);
  const panel=el.closest('.station,.code-panel,.integration,th,td');
  if(panel&&panel!==el&&!within(b,rect(panel)))errors.push('panel overflow: '+el.textContent);
  const range=document.createRange();range.selectNodeContents(el);
  for(const textRect of range.getClientRects()) {
   if(!within(textRect,r,scale*2))errors.push('text ink outside stage: '+el.textContent);
   if(panel && !within(textRect,rect(panel),scale*2))errors.push('text ink outside panel: '+el.textContent);
   // Font ascenders/descenders can exceed a CSS line box. Horizontal escape is not legitimate.
   if(textRect.left<b.left-scale*2||textRect.right>b.right+scale*2)errors.push('text horizontally escapes box: '+el.textContent);
  }
 }
 const panels=[...s.querySelectorAll('.panel')];
 for(let i=0;i<panels.length;i++)for(let j=i+1;j<panels.length;j++) {
  const a=panels[i],b=panels[j];
  if(!a.contains(b)&&!b.contains(a)&&overlaps(rect(a),rect(b)))errors.push('panel overlap: '+a.textContent.slice(0,50)+' / '+b.textContent.slice(0,50));
 }
 const heading=rect(s.querySelector('.slide-heading')),composition=rect(s.querySelector('.composition')),footer=rect(s.querySelector('.slide-footer'));
 if(overlaps(heading,composition))errors.push('heading / composition overlap');
 for(const el of s.querySelectorAll('.panel,.checkpoint,.closing-stamp'))if(overlaps(rect(el),footer))errors.push('content / footer overlap');
 return {slide:s.dataset.slide,kind:s.dataset.kind,ratio:r.width/r.height,fit:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1,errors,
  steps:[...s.querySelectorAll('[data-step]')].map(el=>{const b=rect(el);return [b.x,b.y,b.width,b.height]})};
})()`;

try {
  assert.equal(typeof WebSocket, 'function');
  scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'factory-deck-browser-'));
  chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless', '--remote-debugging-port=0', `--user-data-dir=${scratch}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-sync', '--disable-default-apps', '--disable-component-update',
    '--disable-breakpad', '--disable-crash-reporter', '--password-store=basic', '--use-mock-keychain', 'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = await new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error('Chrome setup timeout: ' + log.slice(-2000))), 12000);
    chrome.once('error', reject);
    chrome.stderr.on('data', data => {
      log += data;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  socket = new WebSocket(endpoint);
  socket.addEventListener('message', event => {
    const msg = JSON.parse(event.data), request = pending.get(msg.id);
    if (request) { pending.delete(msg.id); msg.error ? request.reject(new Error(JSON.stringify(msg.error))) : request.resolve(msg.result); }
    if (msg.method === 'Network.requestWillBeSent' && /^https?:/.test(msg.params.request.url)) results.requests.push(msg.params.request.url);
    if (msg.method === 'Runtime.exceptionThrown') results.errors.push(msg.params.exceptionDetails);
  });
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  const { targetId } = await command('Target.createTarget', { url: 'about:blank' }, null);
  ({ sessionId } = await command('Target.attachToTarget', { targetId, flatten: true }, null));
  for (const domain of ['Page', 'Runtime', 'Network']) await command(`${domain}.enable`);
  await command('Page.bringToFront');
  await command('Emulation.setFocusEmulationEnabled', { enabled: true });
  const chapter = selector.startsWith('--chapter=') ? chapters[Number(selector.at(-1)) - 1] : null;
  for (const [mode, width, height] of [['desktop', 1280, 720], ['phone', 390, 844]]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await load(pathToFileURL(file).href);
    check(await evaluate("document.body.classList.contains('deck-ready') && [...document.fonts].every(f=>f.status==='loaded')"), `${mode}: shared controller and all fonts ready`);
    if (chapter) {
      await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      for (const slide of chapter.slides) {
        const number = slides.indexOf(slide) + 1;
        await go(number);
        const initial = await evaluate(geometry);
        for (let step = 0; step < initial.steps.length; step++) await key(' ', 'Space', 32, ' ');
        const result = await evaluate(geometry);
        results.probes.push({ mode, ...result });
        check(Math.abs(result.ratio - 16 / 9) < .001 && result.fit, `${mode}/#${number}: 16:9 viewport fit`);
        check(result.errors.length === 0, `${mode}/#${number}: text bounds + panel separation ${JSON.stringify(result.errors)}`);
        check(JSON.stringify(initial.steps) === JSON.stringify(result.steps), `${mode}/#${number}: reserved step geometry`);
        check(await evaluate("document.querySelectorAll('.slide:not([hidden])').length===1 && [...document.querySelectorAll('.slide[hidden]')].every(s=>s.inert)"), `${mode}/#${number}: single active stage + inert siblings`);
        if ([1, 3, 9, 13, 16, 18, 26, 28, 36, 41, 54].includes(number)) await capture(`slide-${number}-${mode}.png`);
      }
    } else if (selector.endsWith('interaction')) {
      await evaluate("window.trusted=[];document.addEventListener('click',e=>{if(e.isTrusted)window.trusted.push(e.target.id)})");
      await go(1);
      await key('ArrowLeft', 'ArrowLeft', 37);
      check(await evaluate("location.hash==='#1' && document.querySelector('#previous-slide').disabled"), `${mode}: first boundary`);
      await key('ArrowRight', 'ArrowRight', 39);
      check(await evaluate("location.hash==='#2'"), `${mode}: native arrow navigation`);
      await evaluate('history.back()'); await frame();
      check(await evaluate("location.hash==='#1'"), `${mode}: browser history`);
      await go(9);
      await key(' ', 'Space', 32, ' ');
      check(await evaluate("location.hash==='#9' && document.querySelectorAll('.active [data-step]:not(.step-pending)').length===1"), `${mode}: Space reveals before advancing`);
      await key('ArrowLeft', 'ArrowLeft', 37);
      check(await evaluate("location.hash==='#9' && document.querySelectorAll('.active .step-pending').length===4"), `${mode}: previous unwinds step`);
      await key('i', 'KeyI', 73, 'i');
      check(await evaluate("document.querySelector('#slide-index').open && document.activeElement.getAttribute('href')==='#9'"), `${mode}: index keyboard + focus`);
      await capture(`index-${mode}.png`);
      await key('Escape', 'Escape', 27);
      check(await evaluate("!document.querySelector('#slide-index').open && document.activeElement.id==='deck'"), `${mode}: index Escape restores focus`);
      await key('n', 'KeyN', 78, 'n');
      check(await evaluate("document.querySelector('#notes-dialog').open && document.activeElement.id==='notes-close' && document.querySelector('#notes-content').textContent.includes('De petición a evidencia')"), `${mode}: N notes + focus`);
      await capture(`notes-${mode}.png`);
      await key('ArrowRight', 'ArrowRight', 39);
      check(await evaluate("location.hash==='#9'"), `${mode}: notes isolate navigation`);
      await key('Escape', 'Escape', 27);
      check(await evaluate("!document.querySelector('#notes-dialog').open && document.activeElement.id==='deck'"), `${mode}: notes Escape restores focus`);
      await enter('notes-toggle'); await enter('notes-close');
      check(await evaluate("document.activeElement.id==='notes-toggle' && window.trusted.includes('notes-toggle')"), `${mode}: trusted Enter opens notes and returns trigger`);
      await enter('animation-pause');
      check(await evaluate("document.querySelector('#animation-pause').getAttribute('aria-pressed')==='true' && [...document.querySelectorAll('.active .packet')].every(p=>p.getAnimations().every(a=>a.playState==='paused'))"), `${mode}: trusted Enter pauses CSS motion`);
      await enter('animation-restart');
      check(await evaluate("document.querySelector('#animation-pause').getAttribute('aria-pressed')==='false' && [...document.querySelectorAll('.active .packet')].some(p=>p.getAnimations().some(a=>a.currentTime<500))"), `${mode}: trusted restart resets motion`);
      await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }); await frame();
      check(await evaluate("document.querySelector('#animation-pause').disabled && document.querySelector('#animation-restart').disabled && document.querySelector('#deck').getAnimations({subtree:true}).length===0"), `${mode}: reduced motion removes CSS + WAAPI motion`);
      await go(54); await key('ArrowRight', 'ArrowRight', 39);
      check(await evaluate("location.hash==='#54' && document.querySelector('#next-slide').disabled"), `${mode}: last boundary`);
      await enter('fullscreen-toggle');
      check(await evaluate("!!document.fullscreenElement && document.querySelector('#fullscreen-toggle').getAttribute('aria-pressed')==='true'"), `${mode}: trusted fullscreen`);
      const full = await evaluate(geometry);
      check(full.fit && Math.abs(full.ratio - 16/9) < .001, `${mode}: fullscreen refit`);
      await key('Escape', 'Escape', 27);
      await command('Emulation.setEmulatedMedia', { features: [] });
      check(await evaluate("[...document.querySelectorAll('.local-tools button')].every(b=>{let r=b.getBoundingClientRect();return r.width>=44&&r.height>=44})"), `${mode}: local touch targets >=44px`);
    } else {
      await command('Emulation.setScriptExecutionDisabled', { value: true });
      await load(pathToFileURL(file).href, false);
      // Runtime evaluation still available with script execution disabled in page.
      const fallback = await evaluate("({classes:document.body.className,height:document.documentElement.scrollHeight,viewport:innerHeight,slides:[...document.querySelectorAll('.slide')].map(s=>({id:s.id,visibility:getComputedStyle(s).visibility,height:s.getBoundingClientRect().height,left:s.getBoundingClientRect().left,width:s.getBoundingClientRect().width}))})");
      results.probes.push({ mode, fallback });
      check(fallback.slides.every(s=>s.visibility==='visible' && s.height>100 && s.left>=0 && s.left+s.width<=width+1) && fallback.height>fallback.viewport, `${mode}: no-script reading fallback; ${fallback.slides.length} visible, viewport-contained slides; document height ${fallback.height}`);
      await capture(`no-script-${mode}.png`);
      await command('Emulation.setScriptExecutionDisabled', { value: false });
      await load(pathToFileURL(path.join(output, 'guide.html')).href);
      check(await evaluate("document.querySelectorAll('h1').length===1 && document.querySelectorAll('article').length===54 && document.documentElement.scrollWidth<=innerWidth"), `${mode}: responsive guide, 54 notes, no horizontal overflow`);
      await capture(`guide-${mode}.png`);
      await command('Emulation.setEmulatedMedia', { media: 'print' });
      check(await evaluate("getComputedStyle(document.body).backgroundColor==='rgb(255, 255, 255)'"), `${mode}: printable guide`);
      await command('Emulation.setEmulatedMedia', { media: '' });
    }
  }
  check(results.requests.length === 0, 'standalone + guide: zero render network requests');
  check(results.errors.length === 0, 'zero browser exceptions');
  if (results.failures.length) process.exitCode = 1;
} catch (error) {
  results.failures.push(String(error.stack));
  console.error(error);
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(output, `${label}-${Date.now()}.json`), JSON.stringify(results, null, 2));
  if (socket?.readyState === WebSocket.OPEN) { try { await command('Browser.close', {}, null); } catch {} }
  socket?.close();
  if (chrome && chrome.exitCode === null) {
    chrome.kill('SIGTERM');
    await new Promise(resolve => chrome.once('exit', resolve));
  }
  // Only the freshly created test profile is removed, never repository paths.
  if (scratch) fs.rmSync(scratch, { recursive: true, force: true });
  console.log(`RESULT ${label}: ${results.probes.length} slide/viewport probes, ${results.failures.length} failures. Evidence: ${output}`);
}
