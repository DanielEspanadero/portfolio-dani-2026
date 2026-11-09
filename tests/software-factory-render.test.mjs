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
const byId = (html, id) => html.match(new RegExp(`<section [^>]*id="${id}"[\\s\\S]*?</section>`))[0];
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
  const footers = [...html.matchAll(/<footer class="slide-footer">([\s\S]*?)<\/footer>/g)];
  assert.equal(footers.length, slides.length);
  footers.forEach(([, inner], index) => {
    const page = inner.match(/<span class="footer-page">(\d\d) \/ (\d\d)<\/span>/);
    assert.ok(page, `footer sin número: ${inner}`);
    assert.equal(page[1], pad(index + 1));
    assert.equal(page[2], pad(slides.length));
    // El pie es autor y número de página: el caso en curso ya no ocupa el pie.
    assert.ok(inner.indexOf('class="footer-author"') < inner.indexOf('class="footer-page"'), inner);
    assert.ok(!inner.includes('footer-story'), inner);
  });
  for (const page of [html, guide]) {
    assert.ok(!page.includes('54 diapositivas'), 'stale 54 literal');
    assert.ok(!page.includes('32 diapositivas'), 'stale 32 literal');
    assert.ok(!/\/ 54/.test(page), 'stale footer total');
    assert.ok(!/\/ 32/.test(page), 'stale footer total');
  }
  assert.ok(html.includes(`${slides.length} diapositivas`));
  assert.ok(guide.includes(`${slides.length} diapositivas`));
});

test('16 compositions preserve all stage text and keep notes and sources off stage', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const stage = html.match(/<main id="deck"[^>]*>([\s\S]*?)<\/main>/)[1];
  const kinds = new Set(slides.map(s => s.kind));
  assert.equal(kinds.size, 16);
  for (const kind of ['files', 'circle', 'quote']) assert.ok(kinds.has(kind), kind);
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
    s.alias = '<em>alias</em>';
    s.plain = '<b>plain</b> & neutral';
    s.figure = { src: '01-planta.png', mode: 'feature', alt: '"><script alt()</script>' };
    s.sources = ['https://example.org/" onclick="bad()'];
    const deck = renderPresentation({ css: '', controller: '' });
    for (const html of [deck, renderGuide()]) {
      assert.ok(!html.includes(s.title));
      assert.ok(!html.includes(s.notes));
      assert.ok(!html.includes(s.code));
      assert.ok(!html.includes('<em>alias</em>'));
      assert.match(html, /&lt;script&gt;/);
      assert.match(html, /A &amp; B/);
      assert.ok(!html.includes('href="https://example.org/" onclick='));
    }
    // The plain-language annotation lives on the deck only, and it is text, never markup.
    assert.ok(!deck.includes('<b>plain</b>'));
    assert.match(deck, /&lt;b&gt;plain&lt;\/b&gt; &amp; neutral/);
    assert.match(deck, /&quot;&gt;&lt;script alt\(\)&lt;\/script&gt;/);
  } finally {
    Object.assign(s, original);
    // Remove only the fields this test invented: the hero legitimately owns an alias now,
    // so a blanket delete would leak a mutated fixture into later tests.
    for (const key of ['code', 'sources', 'alias', 'plain', 'story']) if (!(key in original)) delete s[key];
  }
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
  // Artwork is pinned to its subject, not to a page number: ids move as slides are inserted.
  assert.equal(feature('factory-01').mode, 'feature');
  assert.equal(feature('factory-31').src, '05-evidencia.png');
  assert.equal(feature('factory-34').src, '08-circulo.png');
  assert.equal(feature('factory-32').src, '06-carriles.png');
  assert.equal(feature('factory-36').src, '01-planta.png');
  assert.equal(feature('factory-09').src, '02-linea.png');
  assert.equal(feature('factory-09').mode, 'wash');
  // Washes stay only where opaque panels sit over them; text over artwork was removed.
  assert.equal(feature('factory-19'), undefined);
  assert.equal(feature('factory-04'), undefined);
  assert.equal(feature('factory-25').mode, 'wash');
  assert.equal(feature('factory-23').src, '03-fallo.png');
  assert.equal(feature('factory-23').mode, 'feature');
  // The new end-to-end flow deliberately carries no artwork: the diagram is the content.
  assert.equal(feature('factory-33'), undefined);
  assert.equal(feature('factory-16'), undefined);
  // The new definition, ordinary day and problem/not slides carry no artwork.
  for (const id of ['factory-02', 'factory-05', 'factory-08']) assert.equal(feature(id), undefined, id);
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

test('the definition renders as one oversized sentence and three keys, not chips', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const definition = byId(html, 'factory-02');
  assert.match(definition, /data-kind="quote"/);
  assert.match(definition, /class="quote-statement"/);
  assert.ok(definition.includes(escape(slides[1].quote).slice(0, 40)));
  // Three short keys in one row: no station numbering, no card grid of chips.
  assert.equal((definition.match(/class="panel quote-key"/g) || []).length, 3);
  assert.doesNotMatch(definition, /station-number/);
  assert.doesNotMatch(definition, /class="plate/);
  const css = read(`${base}deck.css`);
  assert.match(css, /\.kind-quote \.composition \{[^}]*top:/s);
  assert.match(css, /\.quote-statement \{[^}]*font-size/s);
  assert.match(css, /\.quote-keys \{[^}]*grid-template-columns: repeat\(3, 1fr\)/s);
  assert.match(css, /\.quote-key \{[^}]*border-top/s);
});

test('the plain annotation sits under the lead, styled as help and never as filler', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const slide = byId(html, 'factory-10');
  assert.match(slide, /class="plain">/);
  assert.ok(slide.indexOf('class="lead"') < slide.indexOf('class="plain"'), 'plain must follow the lead');
  const css = read(`${base}deck.css`);
  const rule = css.match(/\.plain \{[^}]*\}/s)[0];
  assert.match(rule, /border-left: 4px solid/);
  // The stage checker rejects composition and lead text under 28px; the annotation obeys it.
  const size = Number(rule.match(/font-size: (\d+)px/)[1]);
  assert.ok(size >= 28, String(size));
  const lead = Number(css.match(/\.lead \{[^}]*font-size: (\d+)px/s)[1]);
  assert.ok(size < lead, 'the annotation is secondary to the lead');
  // Only the slides that carry a plain line get one: the markup is opt-in per slide.
  const annotated = [...html.matchAll(/class="plain">/g)].length;
  assert.equal(annotated, slides.filter(s => s.plain).length);
});

test('the footer carries only the author and the page number', async () => {
  // The running-case band was removed by the author: the example is introduced where it starts.
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  assert.equal([...html.matchAll(/class="footer-story"/g)].length, 0);
  assert.equal(slides.filter(s => s.story).length, 0);
  assert.match(html, /<span class="footer-author">Daniel Españadero<\/span><span class="footer-page">01 \/ 36<\/span>/);
  const css = read(`${base}deck.css`);
  assert.doesNotMatch(css, /\.footer-story/);
  assert.match(css, /\.slide-footer \{[^}]*display: flex/s);
});

test('the hero leads in Spanish and keeps the English term as a quiet alias', async () => {
  const { renderPresentation, renderGuide } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  assert.match(html, /<h1 id="title-factory-01">Fábrica de software con IA<\/h1>/);
  assert.match(html, /<p class="hero-alias">AI Software Factory<\/p>/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  // Search still finds both terms in the SEO fields.
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
  for (const text of [title, description]) {
    assert.match(text, /Fábrica de software con IA/);
    assert.match(text, /AI Software Factory/);
  }
  assert.match(renderGuide(), /AI Software Factory/);
  assert.match(read(`${base}deck.css`), /\.hero-alias \{[^}]*'/s);
});

test('draw-in connectors stay on their three subjects after renumbering', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  // The fan-out animation is pinned by slide id, not by position in the deck: inserting a
  // slide (S9) must not silently move the draw-in onto a slide nobody asked for.
  const withFanout = slides.filter(slide => byId(html, slide.id).match(/class="[^"]*\bfanout\b/)).map(slide => slide.id);
  assert.deepEqual(withFanout, ['factory-13', 'factory-15', 'factory-32']);
  assert.match(read(`${base}deck.css`), /\.slide\.active \.fanout \.route-line/);
});
