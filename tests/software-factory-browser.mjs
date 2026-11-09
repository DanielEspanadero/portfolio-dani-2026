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
const controller = fs.readFileSync('src/presentations/shared/player.js', 'utf8');
const file = path.join(output, 'standalone.html');
// The deck addresses art from the site root. When it is opened from disk for the
// visual check, point the same approved files at their local absolute URL instead.
const artDir = `${pathToFileURL(path.resolve('public/resources/software-factory-art')).href}/`;
fs.writeFileSync(file, renderPresentation({ css, controller, offline: true })
  .replaceAll('src="/resources/software-factory-art/', `src="${artDir}`));
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
 // Ink means text nodes only: an absolutely positioned ornament inside a block is not text.
 const ink=el=>{const rects=[];const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  for(let n=walker.nextNode();n;n=walker.nextNode()){if(!n.nodeValue.trim())continue;
   const range=document.createRange();range.selectNodeContents(n);rects.push(...range.getClientRects());}
  return rects;};
 for(const el of s.querySelectorAll('h1,h2,h3,p,pre,th,td,.station-number,.checkpoint,.closing-stamp,.integration strong,.gate-banner')) {
  if(getComputedStyle(el).visibility==='hidden'||el.getClientRects().length===0)continue;
  const b=rect(el);
  if(!within(b,r))errors.push('stage overflow: '+el.textContent);
  const panel=el.closest('.station,.code-panel,.integration,th,td');
  if(panel&&panel!==el&&!within(b,rect(panel)))errors.push('panel overflow: '+el.textContent);
  for(const textRect of ink(el)) {
   if(!within(textRect,r,scale*2))errors.push('text ink outside stage: '+el.textContent);
   if(panel && !within(textRect,rect(panel),scale*2))errors.push('text ink outside panel: '+el.textContent);
   // Font ascenders/descenders can exceed a CSS line box. Horizontal escape is not legitimate.
   if(textRect.left<b.left-scale*2||textRect.right>b.right+scale*2)errors.push('text horizontally escapes box: '+el.textContent);
  }
 }
 // A plate may never sit on top of readable text or leave the stage.
 const textNodes=[...s.querySelectorAll('.slide-heading h1,.slide-heading h2,.slide-heading .lead,.composition h3,.composition p,.composition pre,.composition th,.composition td')];
 for(const plate of s.querySelectorAll('.plate')) {
  const b=rect(plate);
  if(!within(b,r))errors.push('plate outside stage: '+plate.dataset.plate);
  // Only a visible plate can cover something: a wash sits behind the scrim by design.
  if(!plate.classList.contains('plate-feature'))continue;
  for(const el of textNodes) {
   if(el===plate||plate.contains(el)||getComputedStyle(el).visibility==='hidden'||el.getClientRects().length===0)continue;
   for(const textRect of ink(el)) {
    if(overlaps(b,textRect))errors.push('plate covers text: '+el.textContent.slice(0,40));
   }
  }
 }
 for(const el of s.querySelectorAll('.composition p,.slide-heading .lead')) {
  if(!el.getClientRects().length)continue;
  if(parseFloat(getComputedStyle(el).fontSize)<28)errors.push('stage text below 28px: '+el.textContent.slice(0,40));
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
        // Hero, definition, business why, ordinary day, wash opener, work order, gates, loop,
        // files, decision, incident, files/kit, last story slide, boundaries, gate, worktree,
        // circle and closing. S9 slides carry their own identifiers so they can be inspected.
        if ([1, 2, 5, 8, 9, 10, 13, 15, 16, 17, 18, 23, 24, 25, 28, 30, 31, 32, 34].includes(number)) await capture(`slide-${number}-${mode}.png`);
        check(await evaluate("location.hash==='#"+number+"' && [...document.querySelectorAll('.slide.active img')].every(img=>img.complete&&img.naturalWidth>0)"), `${mode}/#${number}: plate files resolve`);
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
      const stepSlide = slides.findIndex(slide => slide.kind === 'flow') + 1;
      const stepCount = slides[stepSlide - 1].items.length;
      await go(stepSlide);
      await key(' ', 'Space', 32, ' ');
      check(await evaluate(`location.hash==='#${stepSlide}' && document.querySelectorAll('.active [data-step]:not(.step-pending)').length===1`), `${mode}: Space reveals before advancing`);
      await key('ArrowLeft', 'ArrowLeft', 37);
      check(await evaluate(`location.hash==='#${stepSlide}' && document.querySelectorAll('.active .step-pending').length===${stepCount}`), `${mode}: previous unwinds step`);
      await key('i', 'KeyI', 73, 'i');
      check(await evaluate(`document.querySelector('#slide-index').open && document.activeElement.getAttribute('href')==='#${stepSlide}'`), `${mode}: index keyboard + focus`);
      await capture(`index-${mode}.png`);
      await key('Escape', 'Escape', 27);
      check(await evaluate("!document.querySelector('#slide-index').open && document.activeElement.id==='deck'"), `${mode}: index Escape restores focus`);
      // A missing plate file keeps the reserved box, the frame and the caption strip.
      const missingPlate = await evaluate(`(() => {
        const slide=[...document.querySelectorAll('.slide')].find(s=>s.querySelector('.plate-feature'));
        const figure=slide.querySelector('.plate'), img=figure.querySelector('img');
        const before={width:figure.getBoundingClientRect().width,height:figure.getBoundingClientRect().height,src:img.src};
        img.src='/resources/software-factory-art/does-not-exist.png';
        return new Promise(resolve=>setTimeout(()=>{
          const after={width:figure.getBoundingClientRect().width,height:figure.getBoundingClientRect().height};
          const frame=figure.querySelector('.plate-frame'), caption=figure.querySelector('.plate-caption');
          img.src=before.src;
          resolve({before,after,frame:!!frame,caption:getComputedStyle(caption).minHeight});
        },150));
      })()`);
      check(missingPlate.before.width>0 && Math.abs(missingPlate.before.height-missingPlate.after.height)<1 && missingPlate.frame && missingPlate.caption!=='0px', `${mode}: missing plate keeps frame, box and caption`);
      // No notes drawer, animation pause or download chrome: the deck is slides only.
      check(await evaluate("!document.querySelector('#notes-dialog') && !document.querySelector('#notes-toggle') && !document.querySelector('#animation-pause') && !document.querySelector('#animation-restart') && !document.querySelector('.local-tools') && !document.querySelector('.download-link')"), `${mode}: no extra deck chrome`);
      const stillAnimates = await evaluate("[...document.querySelectorAll('.active .packet')].every(p=>p.getAnimations().length===0 || p.getAnimations().every(a=>a.playState==='running'))");
      await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await go(stepSlide); await frame();
      check(stillAnimates && await evaluate("document.querySelector('#deck').getAnimations({subtree:true}).length===0"), `${mode}: reduced motion removes CSS + WAAPI motion`);
      await command('Emulation.setEmulatedMedia', { features: [] });
      await go(slides.length); await key('ArrowRight', 'ArrowRight', 39);
      check(await evaluate(`location.hash==='#${slides.length}' && document.querySelector('#next-slide').disabled`), `${mode}: last boundary`);
      await enter('fullscreen-toggle');
      check(await evaluate("!!document.fullscreenElement && document.querySelector('#fullscreen-toggle').getAttribute('aria-pressed')==='true'"), `${mode}: trusted fullscreen`);
      const full = await evaluate(geometry);
      check(full.fit && Math.abs(full.ratio - 16/9) < .001, `${mode}: fullscreen refit`);
      await key('Escape', 'Escape', 27);
      await command('Emulation.setEmulatedMedia', { features: [] });
      check(await evaluate("[...document.querySelectorAll('.deck-toolbar button, .deck-controls button, .deck-controls select')].every(b=>{let r=b.getBoundingClientRect();return r.width>=24&&r.height>=24})"), `${mode}: player controls keep usable targets`);
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
      check(await evaluate(`document.querySelectorAll('h1').length===1 && document.querySelectorAll('article').length===${slides.length} && document.documentElement.scrollWidth<=innerWidth`), `${mode}: responsive guide, ${slides.length} notes, no horizontal overflow`);
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
