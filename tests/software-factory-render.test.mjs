import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { slides, chapters } from '../src/content/software-factory/index.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const base = 'src/presentations/software-factory/';
async function renderer() { return import('../src/presentations/software-factory/render.mjs'); }

test('production route and offline response use the same inline document', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '/* inline */', controller: '// inline' });
  assert.equal((html.match(/data-slide=/g) || []).length, 54);
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

test('13 compositions preserve all stage text and keep notes and sources off stage', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const stage = html.match(/<main id="deck"[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal(new Set(slides.map(s => s.kind)).size, 13);
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
    s.sources = ['https://example.org/" onclick="bad()'];
    for (const html of [renderPresentation({ css: '', controller: '' }), renderGuide()]) {
      assert.ok(!html.includes(s.title));
      assert.ok(!html.includes(s.notes));
      assert.ok(!html.includes(s.code));
      assert.match(html, /&lt;script&gt;/);
      assert.match(html, /A &amp; B/);
      assert.ok(!html.includes('href="https://example.org/" onclick='));
    }
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
  // Deck behaviour is the shared player plus the content itself; nothing local to hide.
  assert.throws(() => read(`${base}enhancements.js`));
  assert.doesNotMatch(css, /\.local-tools|\.checkpoint|\.closing-stamp|\.download-link/);
});
