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

test('the loopback flow is one drawn journey, not five cards plus a pseudo-arc', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const css = read(`${base}deck.css`);
  const slide = slides.find(entry => entry.id === 'factory-33');
  const diagram = byId(html, 'factory-33');
  // The slide contract stays recognisable: kind flow + loopback true is the switch.
  assert.equal(slide.kind, 'flow');
  assert.equal(slide.loopback, true);
  assert.match(diagram, /class="diagram flow loopback"/);
  assert.doesNotMatch(diagram, /class="panel station"/);
  assert.doesNotMatch(diagram, /loopback-label/);
  assert.doesNotMatch(css, /\.diagram\.flow\.loopback::(?:after|before)|[.]loopback-label/);
  assert.match(css, /\.flow-diagram \{[^}]*width: 100%; height: auto/s);
  // One inline image, one Spanish label; the visible text carries the meaning.
  assert.match(diagram, /<svg class="flow-diagram" viewBox="0 0 1680 480" role="img" aria-label="[^"]{80,}">/);
  assert.ok(diagram.includes('un arco ámbar discontinuo devuelve la pieza al inicio'));
  assert.match(diagram, /class="flow-caption"[^>]*>Lo observado vuelve como una nueva orden</);
  // Every glyph is real SVG text, never a path, and never below the stage floor of 28px.
  const sizes = [...diagram.matchAll(/font-size:\s*([\d.]+)px/g)].map(match => Number(match[1]));
  assert.deepEqual([...new Set(sizes)].sort(), [28, 32]);
  for (const size of sizes) assert.ok(size >= 28, String(size));
  const glyphs = (kind) => [...diagram.matchAll(new RegExp(`class="${kind}"[^>]*>([^<]*)<`, 'g'))].map(match => match[1]);
  assert.equal(glyphs('flow-index').join(' '), '01 02 03 04 05');
  // Wrapping may break lines, but it must never lose a word of the content it renders.
  assert.equal(glyphs('flow-label').join(' '), slide.items.map(entry => entry.label).join(' '));
  assert.equal(glyphs('flow-label').length, 7);
  assert.equal(glyphs('flow-detail').join(' '), slide.items.map(entry => entry.detail).join(' '));
  assert.ok(glyphs('flow-detail').length <= slide.items.length * 2);
  // The moving piece is decoration for assistive tech and rests at station one when still.
  assert.match(diagram, /<g class="flow-piece" aria-hidden="true" transform="translate\(200 190\)"/);
  assert.match(diagram, /<path class="flow-return" d="M1650 190V372Q1650 402 1620 402H60Q30 402 30 372V214"\/>/);
  assert.match(diagram, /<path class="flow-return-tip"/);
  // One 14s journey, and the amber only returns after the last station has been reached.
  assert.match(diagram, /animation: flow-journey 14s ease-in-out infinite/);
  assert.match(diagram, /@keyframes flow-journey \{[\s\S]*?64.29%\{transform:translate\(1480px,190px\)\}[\s\S]*?75.71%\{transform:translate\(1650px,190px\)/);
  const amber = diagram.match(/@keyframes flow-feedback \{([\s\S]*?)\}\s*@keyframes flow-status/)[1];
  assert.ok(amber.includes('color:var(--amber)'));
  for (const [, percent] of amber.matchAll(/([\d.]+)%\{color:var\(--amber\)/g)) assert.ok(Number(percent) >= 75, percent);
  // Palette comes from the deck tokens: no gradients, no glow, no ChatGPT blues.
  for (const hex of new Set([...diagram.matchAll(/#[0-9a-fA-F]{6}/g)].map(match => match[0].toLowerCase()))) {
    assert.ok(['#b3ced4', '#a9c3c9', '#557077', '#4f6b73', '#94c9d2', '#e9eeeb', '#ffc36a'].includes(hex), hex);
  }
  for (const token of ['var(--cyan)', 'var(--amber)', 'var(--paper)']) assert.ok(diagram.includes(token), token);
  assert.doesNotMatch(diagram, /Gradient|filter:|drop-shadow|box-shadow/);
  // Reduced motion removes the travel and leaves a legible still: nothing is hidden behind it.
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\*, \*::before, \*::after \{ animation: none !important; transition: none !important; \}/);
  assert.doesNotMatch(diagram, /opacity:\s*0(?:[;}]|$)|display:\s*none|visibility:\s*hidden/);
  assert.doesNotMatch(diagram, /<script|requestAnimationFrame|setTimeout/);
  assert.match(diagram, /<path class="flow-rail" d="M30 190H1650"\/>/);
});

test('the ordinary day is one clock-like drawing, not five timeline cards', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const css = read(`${base}deck.css`);
  const slide = slides.find(entry => entry.id === 'factory-08');
  const day = byId(html, 'factory-08');
  // The switch mirrors the loopback flow: the kind stays, the flag replaces the card row.
  assert.equal(slide.kind, 'timeline');
  assert.equal(slide.illustrated, true);
  assert.match(day, /class="diagram day"/);
  assert.doesNotMatch(day, /class="panel station"/);
  assert.match(css, /\.day-diagram \{[^}]*width: 100%; height: auto/s);
  const svg = day.match(/<svg class="day-diagram" viewBox="0 0 1680 480" role="img" aria-label="([^"]+)">/);
  assert.ok(svg, 'diapositiva sin diagrama del día');
  // One Spanish label carries the whole day: production line, written standard, exception.
  assert.match(svg[1], /09:10/);
  assert.match(svg[1], /compuerta/i);
  assert.match(svg[1], /estándar/i);
  assert.match(svg[1], /excepción/i);
  assert.match(svg[1], /ilustrativas/i);
  // El día no se centra en el juicio humano: la compuerta aplica la regla y escala la excepción.
  assert.doesNotMatch(svg[1], /persona|decide|deciden|humano|criterio humano/i);
  // Every glyph is real SVG text, never a path, and never below the stage floor of 28px.
  const sizes = [...day.matchAll(/font-size:\s*([\d.]+)px/g)].map(match => Number(match[1]));
  assert.deepEqual([...new Set(sizes)].sort((a, b) => a - b), [28, 32]);
  for (const size of sizes) assert.ok(size >= 28, String(size));
  const glyphs = kind => [...day.matchAll(new RegExp(`class="${kind}"[^>]*>([^<]*)<`, 'g'))].map(match => match[1]);
  const clocks = slide.items.map(entry => entry.label.match(/\d{2}:\d{2}/)[0]);
  assert.deepEqual(glyphs('day-clock'), clocks);
  const labels = slide.items.map(entry => entry.label.replace(/^\d{2}:\d{2},\s*/, ''));
  assert.equal(glyphs('day-label').join(' '), labels.join(' '));
  assert.equal(glyphs('day-detail').join(' '), slide.items.map(entry => entry.detail).join(' '));
  // Five moments, five icons, and the columns are the drawing's own geometry.
  assert.equal((day.match(/class="day-icon/g) || []).length, 5);
  assert.deepEqual([...day.matchAll(/class="day-dock" cx="(\d+)" cy="214"/g)].map(match => Number(match[1])),
    [168, 504, 840, 1176, 1512]);
  assert.match(day, /<path class="day-rail" d="M168 214H1512"\/>/);
  // The travelling marker is decoration and rests on the first moment when nothing moves.
  assert.match(day, /<g class="day-marker" aria-hidden="true" transform="translate\(168 214\)">/);
  assert.match(day, /animation: day-move 18s ease-in-out infinite/);
  const move = day.match(/@keyframes day-move \{([\s\S]*?)\}\s*@keyframes/)[1];
  // Holds on each moment, then a short travel: 18s for five stops, never a measured duration.
  assert.match(move, /0%\{transform:translate\(168px,214px\)\}/);
  assert.match(move, /13\.89%\{transform:translate\(168px,214px\)\}/);
  assert.match(move, /20%\{transform:translate\(504px,214px\)\}/);
  assert.match(move, /80%\{transform:translate\(1512px,214px\)\}/);
  assert.match(day, /animation: day-sweep 18s ease-in-out infinite/);
  assert.match(day, /stroke-dasharray: 1344/);
  // Amber belongs to the exception path only, never to the machinery applying the standard.
  const style = day.match(/<style>([\s\S]*?)<\/style>/)[1];
  for (const block of style.split('}')) {
    if (block.includes('--amber')) assert.match(block, /escalate/, block);
  }
  const stops = day.split('<g class="day-stop').slice(1);
  assert.equal(stops.length, 5);
  for (const stop of stops.slice(0, 4)) assert.doesNotMatch(stop, /amber/i);
  // The gate is framed and reaches its written rule; only its escalation branch is amber.
  assert.match(stops[4], /day-stop-gate/);
  assert.match(stops[4], /class="day-chip"/);
  assert.match(stops[4], /class="day-escalate"/);
  assert.doesNotMatch(stops[4], /day-human/);
  // Palette comes from the deck tokens: no gradients, no glow, no ChatGPT blues.
  for (const hex of new Set([...day.matchAll(/#[0-9a-fA-F]{6}/g)].map(match => match[0].toLowerCase()))) {
    assert.ok(['#b3ced4', '#a9c3c9', '#557077', '#4f6b73', '#94c9d2', '#e9eeeb', '#ffc36a'].includes(hex), hex);
  }
  for (const token of ['var(--cyan)', 'var(--amber)', 'var(--paper)', 'var(--slide-bg)']) assert.ok(day.includes(token), token);
  assert.doesNotMatch(day, /Gradient|filter:|drop-shadow|box-shadow|<script|requestAnimationFrame|setTimeout|https?:/);
  assert.doesNotMatch(day, /opacity:\s*0(?:[;}]|$)|display:\s*none|visibility:\s*hidden/);
  // Reduced motion removes the travel through the shared rule; the still keeps every moment.
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\*, \*::before, \*::after \{ animation: none !important; transition: none !important; \}/);
  // The flag is opt-in: every other timeline slide keeps its cards.
  for (const other of slides.filter(entry => entry.kind === 'timeline' && entry.id !== 'factory-08')) {
    const markup = byId(html, other.id);
    assert.match(markup, /class="timeline main-panels"/, other.id);
    assert.equal((markup.match(/class="panel station"/g) || []).length, other.items.length, other.id);
    assert.doesNotMatch(markup, /day-diagram/, other.id);
  }
  assert.deepEqual(slides.filter(entry => entry.illustrated).map(entry => entry.id), ['factory-08']);
});
