import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { slides, chapters } from '../src/content/software-factory/index.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const base = 'src/presentations/software-factory/';
const art = 'public/resources/software-factory-art/';
const pad = value => String(value).padStart(2, '0');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const section = (html, kind) => html.match(new RegExp(`<section class="slide kind-${kind}[\\s\\S]*?</section>`))[0];
async function renderer() { return import('../src/presentations/software-factory/render.mjs'); }

test('production route and offline response use the same inline document', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '/* inline */', controller: '// inline' });
  assert.equal((html.match(/data-slide=/g) || []).length, slides.length);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /canonical.*https:\/\/daniel-espanadero.com\/presentaciones\/software-factory/);
  for (const marker of ['og:title', 'og:description', 'twitter:card', 'name="description"', '<noscript>', 'id="slide-index"']) assert.ok(html.includes(marker), marker);
  const offline = renderPresentation({ css: '', controller: '', offline: true });
  assert.match(offline, /Versión sin conexión/);
  // The deck is a presentation, not a download kiosk: no download link in either mode.
  for (const page of [html, offline]) {
    assert.doesNotMatch(page, /download-link|descargar\.html/);
    assert.doesNotMatch(page, /notes-toggle|notes-dialog|note-bank|animation-pause|animation-restart|local-tools/);
  }
  assert.doesNotMatch(html, /<(?:script|img)[^>]+src="https?:|<link[^>]+rel="stylesheet"[^>]+href="https?:/);
  assert.match(read('src/pages/presentaciones/software-factory/index.astro'), /prerender = true/);
  assert.match(read('src/pages/presentaciones/software-factory/descargar.html.ts'), /Content-Disposition/);
  assert.match(read(`${base}document.ts`), /shared\/player.js\?raw/);
});

test('the deck length is derived from the content, never typed as a literal', async () => {
  const { renderPresentation, renderGuide } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const guide = renderGuide();
  const footers = [...html.matchAll(/<footer class="slide-footer">[\s\S]*?<span>(\d\d) \/ (\d\d)<\/span><\/footer>/g)];
  assert.equal(footers.length, slides.length);
  footers.forEach(([, shown, totalLength], index) => {
    assert.equal(shown, pad(index + 1));
    assert.equal(totalLength, pad(slides.length));
  });
  for (const page of [html, guide]) {
    assert.ok(!page.includes('54 diapositivas'), 'stale 54 literal');
    assert.ok(!/\/ 54/.test(page), 'stale footer total');
  }
  assert.ok(html.includes(`${slides.length} diapositivas`));
  assert.ok(guide.includes(`${slides.length} diapositivas`));
});

test('15 compositions preserve all stage text and keep notes and sources off stage', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const stage = html.match(/<main id="deck"[^>]*>([\s\S]*?)<\/main>/)[1];
  const kinds = new Set(slides.map(s => s.kind));
  assert.equal(kinds.size, 15);
  for (const kind of ['files', 'circle']) assert.ok(kinds.has(kind), kind);
  for (const slide of slides) {
    assert.ok(stage.includes(`data-kind="${slide.kind}"`));
    assert.ok(stage.includes(`id="${slide.id}"`));
    assert.ok(!stage.includes(slide.notes));
    for (const source of slide.sources || []) assert.ok(!stage.includes(source));
  }
  assert.match(stage, /data-step/);
  assert.match(stage, /<svg/);
  assert.match(stage, /<table/);
  assert.match(stage, /<pre/);
});

test('every content context is escaped, including code, notes and source attributes', async () => {
  const { renderPresentation, renderGuide } = await renderer();
  const s = slides[0];
  const original = { ...s };
  try {
    s.title = '<script>alert("title")</script>';
    s.notes = '<img src=x onerror="bad()">';
    s.items = [{ label: '<svg onload=x>', detail: 'A & B' }];
    s.code = '</pre><script>bad()</script>';
    s.kind = 'code';
    s.figure = { src: '01-planta.png', mode: 'feature', alt: '"><script alt()</script>' };
    s.sources = ['https://example.org/" onclick="bad()'];
    for (const html of [renderPresentation({ css: '', controller: '' }), renderGuide()]) {
      assert.ok(!html.includes(s.title));
      assert.ok(!html.includes(s.notes));
      assert.ok(!html.includes(s.code));
      assert.match(html, /&lt;script&gt;/);
      assert.match(html, /A &amp; B/);
      assert.ok(!html.includes('href="https://example.org/" onclick='));
    }
    assert.match(renderPresentation({ css: '', controller: '' }), /&quot;&gt;&lt;script alt\(\)&lt;\/script&gt;/);
  } finally { Object.assign(s, original); delete s.code; delete s.sources; }
});

test('guide has unique SEO, all detailed notes, sources and eight download fallbacks', async () => {
  const { renderGuide } = await renderer();
  const html = renderGuide();
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /software-factory\/guia/);
  assert.match(html, /software-factory-kit.zip/);
  assert.equal((html.match(/download href="\/resources\/software-factory\//g) || []).length, 8);
  for (const s of slides) assert.ok(html.includes(s.notes.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')));
  for (const chapter of chapters) assert.ok(html.includes(chapter.title));
  assert.match(read('src/pages/presentaciones/software-factory/guia.astro'), /renderGuide/);
});

test('figures use the approved plates with factual Spanish alt text and reserved boxes', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const css = read(`${base}deck.css`);
  const withFigure = slides.filter(slide => slide.figure);
  assert.ok(withFigure.length >= 10, String(withFigure.length));
  for (const slide of withFigure) {
    const { src, mode, alt } = slide.figure;
    assert.deepEqual(Object.keys(slide.figure).sort(), ['alt', 'mode', 'src'], slide.id);
    assert.ok(['feature', 'wash'].includes(mode), slide.id);
    assert.ok(existsSync(`${art}${src}`), src);
    assert.ok(alt.split(/\s+/).length >= 12, slide.id);
    assert.notEqual(alt, slide.title);
    assert.ok(html.includes(`src="/resources/software-factory-art/${src}"`), slide.id);
    assert.ok(html.includes(`alt="${escape(alt)}"`), slide.id);
  }
  const feature = id => slides.find(slide => slide.id === id).figure;
  assert.equal(feature('factory-01').mode, 'feature');
  assert.equal(feature('factory-28').src, '05-evidencia.png');
  assert.equal(feature('factory-30').src, '08-circulo.png');
  assert.equal(feature('factory-07').src, '02-linea.png');
  assert.equal(feature('factory-07').mode, 'wash');
  // Washes stay only where opaque panels sit over them; text over artwork was removed.
  assert.equal(feature('factory-17'), undefined);
  assert.equal(feature('factory-03'), undefined);
  assert.equal(feature('factory-23').mode, 'wash');
  assert.equal(feature('factory-21').src, '03-fallo.png');
  assert.equal(feature('factory-21').mode, 'feature');
  assert.equal(feature('factory-14'), undefined);
  // A missing file must keep the frame and caption area: explicit 16:9 box, no JS fallback.
  assert.match(css, /\.plate img \{[^}]*aspect-ratio: 16 \/ 9/s);
  assert.match(css, /\.plate-caption \{[^}]*min-height/s);
  assert.match(css, /\.plate-wash/);
  assert.match(css, /\.plate-wash::after \{[^}]*linear-gradient/s);
  // Bounded wash, checked numerically instead of by a magic alpha: the brightest artwork
  // line (#94c9d2) at 22% over #101719 yields roughly 9:1 against #e9eeeb body text, and the
  // scrim only darkens that further. So the bound is on image opacity plus a real scrim.
  const washImage = css.match(/\.plate-wash img \{[^}]*opacity: ([\d.]+)/s);
  assert.ok(Number(washImage[1]) <= 0.3, washImage[1]);
  const washScrim = css.match(/\.plate-wash::after \{[^}]*\}/s)[0];
  const alphas = [...washScrim.matchAll(/rgba\(16, 23, 25, ([\d.]+)\)/g)].map(m => Number(m[1]));
  assert.ok(alphas.length >= 2, String(alphas.length));
  for (const alpha of alphas) assert.ok(alpha >= 0.4, String(alpha));
});

test('loop return path is anchored to the measured station row, not a fixed anchor', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const loop = section(html, 'loop');
  assert.doesNotMatch(loop, /M1550 345|H80V345/);
  assert.match(loop, /<div class="stations[\s\S]*?<\/div>\s*<div class="loop-return"/);
  const css = read(`${base}deck.css`);
  // The return row follows the station row in the grid: no hard-coded bottom anchor.
  assert.match(css, /\.diagram\.loop \{[^}]*grid-template-rows: auto 62px/s);
  assert.match(css, /\.loop-return \{[^}]*border-bottom: 3px dashed/s);
  assert.doesNotMatch(css, /top: 345px|V462H80/);
});

test('the conveyor token only follows revealed stations and rests at the gate', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const css = read(`${base}deck.css`);
  const flow = section(html, 'flow');
  assert.match(flow, /class="packet packet-1"/);
  assert.match(flow, /class="packet packet-3"/);
  assert.match(css, /\.packet \{[^}]*opacity: 0/s);
  assert.match(css, /:has\(\.station:nth-child\(4\) p:not\(\.step-pending\)\) \.packet-4/);
  const gate = section(html, 'gate');
  assert.match(gate, /class="gate-arm"/);
  assert.match(css, /roll-to-gate/);
  assert.match(css, /\.kind-gate:has\(\.station p:not\(\.step-pending\)\) \.gate-arm/);
});

test('files renders a monospace tree and circle renders a closed ring', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const files = section(html, 'files');
  assert.equal((files.match(/class="file-path"/g) || []).length, 4);
  assert.match(files, /software-factory\//);
  assert.match(files, /backlog\.md/);
  assert.match(files, /specs\/\*\.md/);
  assert.match(files, /board\.md/);
  const circle = section(html, 'circle');
  assert.match(circle, /class="ring"/);
  assert.match(circle, /class="ring-return"/);
  assert.equal((circle.match(/class="ring-label ring-label-\d panel"/g) || []).length, 4);
  assert.equal((circle.match(/data-step/g) || []).length, 4);
  const css = read(`${base}deck.css`);
  assert.match(css, /\.file-path \{[^}]*'JetBrains Mono'/s);
  assert.match(css, /\.ring-return \{[^}]*stroke-dasharray/s);
  assert.match(css, /@keyframes sweep/);
});

test('assets retain fixed base, licensed fonts and reduced motion, with no extra deck chrome', () => {
  const css = read(`${base}deck.css`);
  const fonts = read(`${base}fonts.css`);
  const viewport = read(`${base}viewport-base.css`);
  assert.match(viewport, /FIXED 16:9 STAGE/);
  assert.equal((fonts.match(/@font-face/g) || []).length, 4);
  assert.match(fonts, /SIL OPEN FONT LICENSE/);
  assert.doesNotMatch(fonts, /url\(['"]?https?:/);
  assert.match(css, /animation: none !important/);
  assert.match(css, /\.step-pending/);
  // Every motion added by this unit is CSS; the shared player stays untouched.
  assert.match(css, /prefers-reduced-motion: reduce/);
  // Deck behaviour is the shared player plus the content itself; nothing local to hide.
  assert.throws(() => read(`${base}enhancements.js`));
  assert.doesNotMatch(css, /\.local-tools|\.checkpoint|\.closing-stamp|\.download-link/);
});
