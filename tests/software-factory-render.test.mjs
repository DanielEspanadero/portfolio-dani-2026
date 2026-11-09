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
  // El escenario tampoco reutiliza la familia «criterio humano»: vive en el contenido y en la
  // banda de la compuerta, así que se comprueba sobre el HTML renderizado y no solo en los datos.
  assert.doesNotMatch(stage,
    /(?:criterio\s+humano|persona\s+con\s+criterio|una\s+persona\s+decide|alguien\s+decide|decisi[oó]n\s+humana|acepta\w*\s+o\s+devuelv\w*)/i);
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
    for (const key of ['code', 'sources', 'alias', 'plain', 'story', 'figure']) if (!(key in original)) delete s[key];
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
  // Nine plates: the plant map and the end-to-end flow draw their own drawings, so a raster
  // behind them would only compete with the route the slide is teaching.
  assert.ok(withFigure.length >= 9, String(withFigure.length));
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
  // The hero is the exception: it draws its own animated plant, so it carries no raster plate.
  assert.equal(feature('factory-01'), undefined);
  assert.equal(feature('factory-31').src, '05-evidencia.png');
  assert.equal(feature('factory-34').src, '08-circulo.png');
  assert.equal(feature('factory-32').src, '06-carriles.png');
  assert.equal(feature('factory-36').src, '01-planta.png');
  // The plant map draws its own plant now: a second isometric drawing behind it would only
  // make both unreadable, so the slide carries no raster plate, exactly like the hero.
  assert.equal(feature('factory-09'), undefined);
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
  // The token belongs to the station row, so it is pinned to the loop that still draws one:
  // the gates slide is a governed drawing now and carries no packets.
  const flow = byId(html, 'factory-15');
  assert.match(flow, /class="packet packet-1"/);
  assert.match(flow, /class="packet packet-3"/);
  assert.match(css, /\.packet \{[^}]*opacity: 0/s);
  assert.match(css, /:has\(\.station:nth-child\(4\) p:not\(\.step-pending\)\) \.packet-4/);
  const gate = section(html, 'gate');
  assert.match(gate, /class="gate-arm"/);
  // La banda dice lo que la compuerta hace: aplica el estándar y devuelve lo que no cumple.
  assert.match(gate, /<div class="gate-banner">[^<]*aplica el est[aá]ndar[^<]*<span class="gate-arm"/);
  assert.doesNotMatch(gate, /acepta\w* o devuelv\w*/i);
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
  // Deck behaviour is the shared player plus the two governed scenes; nothing else to hide.
  assert.throws(() => read(`${base}enhancements.js`));
  for (const module of ['hero-scene.mjs', 'plant-map.mjs', 'gates-scene.mjs', 'scene-governor.mjs', 'inline-modules.mjs']) {
    assert.ok(existsSync(`${base}${module}`), module);
  }
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

test('the hero draws its own plant instead of a static plate', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const css = read(`${base}deck.css`);
  const hero = byId(html, 'factory-01');
  const slide = slides[0];
  assert.equal(slide.figure, undefined);
  assert.doesNotMatch(hero, /class="plate/);
  // The drawing is a runtime container: decorative, empty in the document, never focusable.
  assert.match(hero, /<div class="hero-scene" data-hero-scene aria-hidden="true"><\/div>/);
  assert.doesNotMatch(hero, /<div class="hero-scene"[^>]*(?:tabindex|role=|aria-label)/);
  // The author's tagline becomes stage text: three items, hairline separators, no middle dots.
  assert.deepEqual(slide.terms, ['Agentes', 'Automatización', 'Verificación']);
  assert.match(hero, /<ul class="hero-terms"><li>Agentes<\/li><li>Automatización<\/li><li>Verificación<\/li><\/ul>/);
  // Each tagline word is listed once in the row, and the row exists once in the document.
  const terms = hero.match(/<ul class="hero-terms">([\s\S]*?)<\/ul>/)[1];
  for (const term of slide.terms) assert.equal(terms.split(`<li>${term}</li>`).length - 1, 1, term);
  assert.equal((html.match(/<ul class="hero-terms">/g) || []).length, 1);
  assert.doesNotMatch(html, /Agentes\s*[·•⋅]\s*Automatización/);
  assert.doesNotMatch(hero, /[·•⋅]/);
  assert.match(css, /\.hero-terms \{[^}]*display: flex/s);
  assert.match(css, /\.hero-terms li \+ li \{[^}]*border-left: 1px solid #557077/s);
  // The plant keeps the right side; the title block keeps the left and the station row.
  assert.match(css, /\.hero-scene \{[^}]*right: 0[^}]*width: 700px/s);
  assert.match(css, /\.kind-hero \.slide-heading \{[^}]*right: 860px/s);
  // The hero keeps no plate styles; the closing plate keeps its slow drift (PRESERVE).
  assert.doesNotMatch(css, /\.kind-hero \.plate|\.kind-hero\.has-plate/);
  assert.match(css, /\.slide\.active \.kind-closing \.plate img \{ animation: drift/s);
  assert.equal((hero.match(/<h1\b/g) || []).length, 1);
  assert.match(hero, /<p class="hero-alias">AI Software Factory<\/p>/);
  // The source's own eyebrow, title, subtitle and signature never enter the drawing.
  assert.doesNotMatch(hero, /De la intención|AGENTES ·|Portada/);
});

test('the hero plant module stays isolated and token-coloured', () => {
  const source = read(`${base}hero-scene.mjs`);
  // Palette: the drawing carries deck literals only; every shade is derived from them.
  const hexes = new Set([...source.matchAll(/#[0-9a-fA-F]{6}/g)].map(match => match[0].toLowerCase()));
  assert.deepEqual([...hexes].sort(), ['#101719', '#4f6b73', '#557077', '#94c9d2', '#e9eeeb', '#ffc36a']);
  assert.match(source, /shade\(CYAN, \.55\)|shade = \(base, weight\) => mix\(base, DEEP, weight\)/);
  // No external references, no words, no raster, no filters: one soft ground glow only.
  assert.doesNotMatch(source, /https?:|xlink|<image|<text|<use|href=|filter:|linearGradient/);
  assert.match(source, /radialGradient id="hero-ground"/);
  // The loop itself is not the hero's: it mounts through the shared governor (S19).
  assert.match(source, /import \{ mountGovernedScene \} from '\.\/scene-governor\.mjs';/);
  assert.match(source, /mountGovernedScene\(\{ host, cycle: HERO_CYCLE, still: HERO_STILL/);
  for (const owned of ['requestAnimationFrame', 'cancelAnimationFrame', 'MutationObserver', 'visibilitychange', 'pagehide']) {
    assert.ok(!source.includes(owned), `la gobernanza sigue en hero-scene.mjs: ${owned}`);
  }
  // It may not touch the shared player or any other slide.
  for (const forbidden of ['#deck', 'slide-select', 'slide-index', 'deck-controls', 'document.body', 'querySelectorAll(\'[data-slide']) {
    assert.ok(!source.includes(forbidden), forbidden);
  }
});

test('both procedural scenes mount through one governance helper', async () => {
  const governor = read(`${base}scene-governor.mjs`);
  // Activation, page visibility, about 30 fps, one still frame under reduced motion, disposal.
  assert.match(governor, /1000 \/ SCENE_FPS/);
  assert.match(governor, /export const SCENE_FPS = 30/);
  assert.match(governor, /requestAnimationFrame\(tick\)/);
  assert.match(governor, /cancelAnimationFrame/);
  assert.match(governor, /visibilitychange/);
  assert.match(governor, /prefers-reduced-motion: reduce/);
  assert.match(governor, /new win\.MutationObserver\(sync\)/);
  assert.match(governor, /attributeFilter: \['class', 'hidden'\]/);
  assert.match(governor, /pagehide/);
  assert.match(governor, /dataset\.draws/);
  assert.match(governor, /dataset\.stills/);
  // A scene is judged active by its own slide only: the helper never reads the deck.
  for (const forbidden of ['#deck', 'slide-select', 'slide-index', 'deck-controls']) assert.ok(!governor.includes(forbidden), forbidden);
  // Both scenes import it instead of reimplementing the loop.
  for (const file of ['hero-scene.mjs', 'plant-map.mjs', 'gates-scene.mjs']) {
    const source = read(`${base}${file}`);
    assert.match(source, /import \{ mountGovernedScene \} from '\.\/scene-governor\.mjs';/, file);
    assert.match(source, /mountGovernedScene\(\{ host/, file);
  }
  // Online and downloadable documents inline the same composition, by dependency order.
  const document = read(`${base}document.ts`);
  assert.match(document, /shared\/player\.js\?raw/);
  for (const module of ['scene-governor\.mjs', 'hero-scene\.mjs', 'plant-map\.mjs', 'gates-scene\.mjs']) assert.match(document, new RegExp(`${module}\\?raw`));
  assert.match(document, /inlineModules\(controller, sceneGovernor, heroScene, plantMap, gatesScene\)/);
  const { inlineModules } = await import('../src/presentations/software-factory/inline-modules.mjs');
  const bundle = inlineModules(read('src/presentations/shared/player.js'), governor,
    read(`${base}hero-scene.mjs`), read(`${base}plant-map.mjs`), read(`${base}gates-scene.mjs`));
  // One module script: no statement may survive as an import, and no two modules may
  // declare the same binding, which is the real failure mode of inline composition.
  assert.doesNotMatch(bundle, /^\s*import\b/m);
  assert.doesNotMatch(bundle, /^\s*export\b/m);
  for (const name of ['mountGovernedScene', 'heroScene', 'plantMapScene', 'gatesScene']) assert.ok(bundle.includes(name), name);
  assert.doesNotThrow(() => new Function(bundle));
});

test('the hero plant generates one deterministic, wordless frame per moment', async () => {
  const scene = await import('../src/presentations/software-factory/hero-scene.mjs');
  const still = scene.heroScene(scene.HERO_STILL);
  // Deterministic: the same instant always produces the same drawing.
  assert.equal(scene.heroScene(scene.HERO_STILL), still);
  assert.ok((still.match(/<(?:polygon|circle|path|g)\b/g) || []).length > 100, 'una planta vacía');
  // No words, no ids, no accessibility roles inside the drawing: the meaning is in the HTML.
  assert.doesNotMatch(still, /<text|<title|<desc|aria-|data-|id=|font-/);
  // Motion: the dwell (arms and scan) and the indexed advance are different instants.
  assert.notEqual(scene.heroScene(0.5), scene.heroScene(0.9));
  assert.match(still, /opacity="\.15"/);
  assert.doesNotMatch(scene.heroScene(0.5), /opacity="\.15"/);
  // One frame per cycle: 6 s of drawing, sampled at the deck's own still instant.
  assert.equal(scene.HERO_CYCLE, 6000);
  assert.ok(scene.HERO_STILL > 0.04 && scene.HERO_STILL < 0.37, String(scene.HERO_STILL));
  // The shell is the only place with a gradient: one soft ground glow, no words.
  const shell = scene.heroShell();
  assert.match(shell, /viewBox="[\d\s.-]+"/);
  assert.match(shell, /aria-hidden="true"/);
  assert.equal((shell.match(/<radialGradient/g) || []).length, 1);
  assert.doesNotMatch(shell, /<text|<image|https?:/);
});

test('draw-in connectors stay on their three subjects after renumbering', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  // The fan-out animation is pinned by slide id, not by position in the deck: inserting a
  // slide (S9) must not silently move the draw-in onto a slide nobody asked for.
  const withFanout = slides.filter(slide => byId(html, slide.id).match(/class="[^"]*\bfanout\b/)).map(slide => slide.id);
  // The gates slide draws its own line now, so the draw-in stays on the loop, the lanes and
  // the checklist: the fan-out effect needs connectors, and a drawing has none.
  assert.deepEqual(withFanout, ['factory-15', 'factory-32']);
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
  // The switch mirrors the loopback flow: the kind stays, `scene` replaces the card row.
  assert.equal(slide.kind, 'timeline');
  assert.equal(slide.scene, 'day');
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
  assert.deepEqual(slides.filter(entry => entry.scene === 'day').map(entry => entry.id), ['factory-08']);
});

test('the plant map is one drawn route from the slide items, not the station row', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const css = read(`${base}deck.css`);
  const slide = slides.find(entry => entry.id === 'factory-09');
  const map = byId(html, 'factory-09');
  // The switch mirrors the loopback flow and the drawn day: the kind stays, `scene` replaces
  // the card row. Only this slide draws the plant map.
  assert.equal(slide.kind, 'flow');
  assert.equal(slide.scene, 'map');
  assert.equal(slide.figure, undefined);
  assert.match(map, /class="diagram flow plant"/);
  assert.doesNotMatch(map, /class="panel station"/);
  assert.doesNotMatch(map, /class="connectors"|class="plate/);
  assert.match(css, /\.plant-map \{[^}]*width: 100%; height: auto/s);
  const drawing = map.match(/<div class="plant-map-host"[\s\S]*?<\/svg>/)[0];
  const svg = drawing.match(/<svg class="plant-map" viewBox="0 0 1680 480" role="img" aria-label="([^"]+)">/);
  assert.ok(svg, 'diapositiva sin mapa de planta');
  // The drawing is meaningful, so it names the route and the three controls, in sequence.
  for (const part of [/entrada/i, /estaciones/i, /compuertas/i, /integraci[oó]n/i,
    /tipos/i, /pruebas/i, /contrato/i, /secuencia/i, /vuelta atr[aá]s/i]) assert.match(svg[1], part);
  // It is the happy path: the drawing claims no rejection branch it does not have.
  assert.doesNotMatch(drawing, /rechaz|devolv/i);
  // Zone numbers, labels and details are the slide's own items, wrapped and never rewritten.
  const glyphs = kind => [...map.matchAll(new RegExp(`class="${kind}"[^>]*>([^<]*)<`, 'g'))].map(match => match[1]);
  assert.equal(glyphs('plant-index').join(' '), '01 02 03 04');
  assert.equal(glyphs('plant-label').join(' '), slide.items.map(entry => entry.label).join(' '));
  assert.equal(glyphs('plant-detail').join(' '), slide.items.map(entry => entry.detail).join(' '));
  assert.ok(glyphs('plant-detail').length <= slide.items.length * 3);
  assert.match(map, /data-zones="210 630 1050 1470"/);
  // Nothing but those three text roles is drawn as text, and the type never drops below the
  // projection floor: an index or a detail is 28px, a label 32px.
  for (const [, tag] of map.matchAll(/<text([^>]*)>/g)) assert.match(tag, /class="plant-(?:index|label|detail)"/, tag);
  const sizes = [...css.matchAll(/\.plant-map \.plant-(?:index|label|detail) \{[^}]*font-size: (\d+)px/g)]
    .map(match => Number(match[1])).sort((a, b) => a - b);
  assert.deepEqual(sizes, [28, 28, 32]);
  // The source's own chrome stays out: no eyebrow, no title, no subtitle, no pause button.
  assert.doesNotMatch(drawing, /Mapa de planta|AI SOFTWARE FACTORY|Pausar|pause|<button|eyebrow/i);
  // No external reference, no raster, no filter, no script, and no colour outside the tokens.
  assert.doesNotMatch(drawing, /https?:|xlink|<image|<use|href=|filter:|Gradient|<script/);
  assert.doesNotMatch(drawing, /#[0-9a-f]{3,6}\b/i);
  // The moving parts are decoration; the readable text stays text.
  assert.match(drawing, /<g class="plant-parts" aria-hidden="true"><\/g>/);
  // Composition switch: every other flow and loop keeps its station row (the loopback flow
  // draws its own journey, as it did before this unit).
  for (const other of slides.filter(entry => ['flow', 'loop'].includes(entry.kind)
    && entry.id !== 'factory-09' && !entry.loopback && !entry.scene)) {
    const markup = byId(html, other.id);
    assert.match(markup, /class="stations main-panels"/, other.id);
    assert.doesNotMatch(markup, /plant-map/, other.id);
  }
  assert.deepEqual(slides.filter(entry => entry.scene === 'map').map(entry => entry.id), ['factory-09']);
});

test('the plant map holds the batch at every stop until its control fires', async () => {
  const map = await import('../src/presentations/software-factory/plant-map.mjs');
  const zones = map.plantZones(map.PLANT_COUNT);
  assert.deepEqual(zones, [210, 630, 1050, 1470]);
  const stops = map.plantStops(zones);
  assert.equal(stops.length, 7);
  const arrival = index => (index + 1) * map.PLANT_TIMING.travel + index * map.PLANT_TIMING.hold;
  const at = seconds => seconds / map.PLANT_SECONDS;
  const scene = progress => map.plantMapScene(progress, zones);
  const pieceX = progress => Number(scene(progress).match(/class="plant-piece" transform="translate\(([-\d.]+) /)[1]);
  // Deterministic: the same instant always produces the same frame.
  assert.equal(scene(map.PLANT_STILL), scene(map.PLANT_STILL));
  assert.ok((scene(map.PLANT_STILL).match(/<(?:polygon|circle|path|rect|g)\b/g) || []).length > 100, 'planta vacía');
  // One route, forwards only: the batch never travels backwards inside a cycle.
  let previous = -1;
  for (let step = 0; step < 240; step += 1) {
    const x = pieceX(step / 240);
    assert.ok(x >= previous - .01, `retrocede en ${step}`);
    previous = x;
  }
  // It reaches the outlet and the cycle restarts inside the inlet port, out of sight.
  assert.equal(pieceX(.999), 1624);
  assert.equal(pieceX(0), 56);
  // It dwells at each of the seven stops, under the arms and at the three controls.
  stops.forEach((x, index) => {
    const from = arrival(index);
    assert.ok(Math.abs(pieceX(at(from + .05)) - x) < 2, `no se detiene en la parada ${index + 1}`);
    assert.ok(Math.abs(pieceX(at(from + map.PLANT_TIMING.hold - .05)) - x) < 2, `no se detiene en la parada ${index + 1}`);
  });
  // The three controls fire in sequence, always while the batch is held, and the batch only
  // moves on afterwards: that is the behaviour the author's drawing shows.
  [3, 4, 5].forEach((index, order) => {
    const from = arrival(index);
    const before = map.plantState(at(from), zones);
    const during = map.plantState(at(from + map.PLANT_TIMING.hold * .7), zones);
    assert.equal(before.gates[order].fired, false, `la compuerta ${order + 1} dispara antes de tiempo`);
    assert.equal(during.gates[order].fired, true, `la compuerta ${order + 1} no dispara`);
    assert.equal(before.gates.filter(gate => gate.fired).length, order, 'las compuertas no van en secuencia');
    assert.ok(pieceX(at(from + map.PLANT_TIMING.hold + .1)) > stops[index] + 1, 'el lote no avanza tras la compuerta');
  });
  // The arms work only while the batch is held under them.
  assert.deepEqual(map.plantState(at(arrival(1) + .6), zones).arms.map(arm => arm.active), [true, false]);
  assert.deepEqual(map.plantState(at(arrival(2) + .6), zones).arms.map(arm => arm.active), [false, true]);
  assert.deepEqual(map.plantState(at(arrival(1) - .4), zones).arms.map(arm => arm.active), [false, false]);
  // A control's bar lifts and its lamp turns amber once it has fired, in that order.
  const passed = progress => (scene(progress).match(/plant-gate-passed/g) || []).length;
  assert.equal(passed(at(arrival(3))), 0);
  assert.equal(passed(at(arrival(4) + .1)), 1);
  assert.equal(passed(at(arrival(5) + .1)), 2);
  // Integration reads as the end of the route: the zone marker is there, the evidence is
  // accented and the prepared rollback is drawn, always as a prepared return.
  const integrated = scene(at(arrival(6) + .5));
  assert.equal(map.plantState(at(arrival(6) + .5), zones).phase, 3);
  assert.match(integrated, /class="plant-marker"/);
  assert.match(integrated, /stroke-dasharray="7 6"/);
  assert.equal((integrated.match(/stroke-dasharray="7 6"/g) || []).length, 1);
  // No words, script or external reference inside the drawing itself.
  assert.doesNotMatch(scene(.5), /<text|<title|<desc|<image|https?:|<script|requestAnimationFrame/);
  // Palette: tokens and shades derived from them, nothing imported from the source.
  const source = read(`${base}plant-map.mjs`);
  const hexes = new Set([...source.matchAll(/#[0-9a-fA-F]{6}/g)].map(match => match[0].toLowerCase()));
  assert.deepEqual([...hexes].sort(), ['#101719', '#4f6b73', '#557077', '#94c9d2', '#e9eeeb', '#ffc36a']);
  const tokens = [[148, 201, 210], [255, 195, 106], [233, 238, 235], [85, 112, 119], [79, 107, 115]];
  const channels = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
  const within = (value, a, b) => value >= Math.min(a, b) && value <= Math.max(a, b);
  const colours = new Set([...scene(.5).matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{6})"/g)].map(match => match[1].toLowerCase()));
  assert.ok(colours.size > 4, 'un dibujo de dos colores');
  const deepest = [16, 23, 25];
  for (const colour of colours) {
    const value = channels(colour);
    assert.ok(tokens.some(token => value.every((channel, index) => within(channel, token[index], deepest[index]))),
      `color fuera de los tokens del deck: ${colour}`);
  }
  for (const token of ['var(--slide-bg)']) assert.ok(scene(.5).includes(token), token);
});

test('one scene switch replaced both illustrated flags, and the old one is gone', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const css = read(`${base}deck.css`);
  const modules = ['01-foundations', '02-production-line', '03-loop-state', '04-failure-modes',
    '05-build-yours', '06-example-parallel', '07-closing'];
  // The switch is one field with three drawn values: the day, the map and the gates.
  for (const slide of slides) assert.equal(Object.hasOwn(slide, 'illustrated'), false, slide.id);
  assert.deepEqual(slides.filter(entry => entry.scene).map(entry => [entry.id, entry.scene]),
    [['factory-08', 'day'], ['factory-09', 'map'], ['factory-13', 'gates']]);
  // The old flag may not survive in the content, the renderer, the styles or the markup.
  for (const name of modules) {
    assert.doesNotMatch(read(`src/content/software-factory/${name}.mjs`), /illustrated/, name);
  }
  for (const source of [html, css, read(`${base}render.mjs`)]) assert.doesNotMatch(source, /illustrated/);
  // The renderer dispatches on `scene`: an unknown value is a mistake, never a silent card row.
  const slide = slides.find(entry => entry.id === 'factory-09');
  const original = slide.scene;
  try {
    slide.scene = 'planta';
    assert.throws(() => renderPresentation({ css: '', controller: '' }), /planta/);
  } finally {
    slide.scene = original;
  }
});

test('the gates slide draws both cases from its own items, not the source arrays', async () => {
  const { renderPresentation } = await renderer();
  const html = renderPresentation({ css: '', controller: '' });
  const css = read(`${base}deck.css`);
  const slide = slides.find(entry => entry.id === 'factory-13');
  const gates = byId(html, 'factory-13');
  // The kind stays, the switch replaces the station row, and nothing is revealed by steps.
  assert.equal(slide.kind, 'flow');
  assert.equal(slide.scene, 'gates');
  assert.equal(slide.steps, undefined);
  assert.match(gates, /class="diagram flow gates"/);
  assert.doesNotMatch(gates, /class="panel station"|class="connectors"|class="plate/);
  assert.match(css, /\.gates-scene \{[^}]*width: 100%; height: auto/s);
  const host = gates.match(/<div class="gates-scene-host"[\s\S]*?<\/svg><\/div>/)[0];
  const svg = host.match(/<svg class="gates-scene" viewBox="0 0 1680 480" role="img" aria-label="([^"]+)">/);
  assert.ok(svg, 'diapositiva sin dibujo de compuertas');
  // The drawing carries meaning, so it names both outcomes and the rule of the line.
  for (const part of [/avanza/i, /se detiene/i, /no se ejecuta/i, /sin paso/i, /decisi[oó]n registrada/i]) {
    assert.match(svg[1], part);
  }
  assert.doesNotMatch(svg[1], /excepci[oó]n autom[aá]tica|se salta sol|validado|bloqueado/i);
  const drawing = host.replace(/aria-label="[^"]*"/, '');
  // Three gate labels and their short details are the slide's own items, never rewritten.
  const glyphs = kind => [...drawing.matchAll(new RegExp(`class="${kind}"[^>]*>([^<]*)<`, 'g'))].map(match => match[1]);
  assert.equal(glyphs('gates-label').join(' '), slide.items.slice(0, 3).map(entry => entry.label).join(' '));
  assert.equal(glyphs('gates-detail').join(' '), slide.items.slice(0, 3).map(entry => entry.detail).join(' '));
  assert.ok(glyphs('gates-detail').length <= 9);
  // The fourth item is the rule of the whole line: its own caption slot, outside the gates,
  // so nobody can read it as a fourth test.
  const rule = drawing.match(/<g class="gates-rule">[\s\S]*?<\/g>/);
  assert.ok(rule, 'la regla de la línea no tiene ranura propia');
  assert.ok(rule[0].includes(escape(slide.items[3].label)));
  assert.ok(rule[0].includes(escape(slide.items[3].detail)));
  assert.equal((drawing.match(/class="gates-rule"/g) || []).length, 1);
  const columns = drawing.match(/<g class="gates-gate">[\s\S]*?<\/g>/g) || [];
  assert.equal(columns.length, 3);
  for (const column of columns) {
    assert.ok(!column.includes(escape(slide.items[3].label)), 'la regla se lee como una cuarta compuerta');
  }
  // Both cases are on stage as text: the passing batch advances, the failing one gets no pass.
  for (const part of [/Caso A/, /Caso B/, /Avanza/, /Sin paso/, /la tercera/, /no corre/]) assert.match(drawing, part);
  // Type floor: gate labels 32px, details, case labels, verdicts and the rule at 28px.
  const size = name => Number(css.match(new RegExp(`\\.gates-scene \\.${name} \\{[^}]*font-size: (\\d+)px`))[1]);
  assert.equal(size('gates-label'), 32);
  for (const name of ['gates-detail', 'gates-case', 'gates-verdict', 'gates-rule-label', 'gates-rule-text']) {
    assert.equal(size(name), 28, name);
  }
  // The drawing cannot shrink its own type: no inline style, no second font-size source.
  assert.doesNotMatch(drawing, /font-size|<style/);
  // Palette: deck tokens only, every other tone derived inside the module.
  assert.doesNotMatch(drawing, /https?:|xlink|<image|<use|href=|filter:|Gradient|<script/);
  const whitelist = ['#b3ced4', '#557077', '#4f6b73', '#94c9d2', '#e9eeeb', '#ffc36a'];
  const shown = [...drawing, ...(css.match(/\.gates-scene[^{]*\{[^}]*\}/g) || [])].join('\n');
  for (const hex of new Set([...shown.matchAll(/#[0-9a-fA-F]{6}/g)].map(match => match[0].toLowerCase()))) {
    assert.ok(whitelist.includes(hex), hex);
  }
  const rules = (css.match(/\.gates-scene[^{]*\{[^}]*\}/g) || []).join('\n');
  for (const token of ['var(--cyan)', 'var(--amber)', 'var(--paper)']) assert.ok(rules.includes(token), token);
  // The source's own chrome stays out: no eyebrow, title, subtitle, pause button or badges.
  assert.doesNotMatch(drawing, /Pausar|pause|<button|AI SOFTWARE FACTORY|VALIDADO|BLOQUEADO|EN ESPERA|COMPROBANDO/);
  // The moving parts are decoration; every word outside them is real SVG text.
  assert.match(host, /<g class="gates-parts" aria-hidden="true"><\/g>/);
  assert.match(host, /data-gates-scene/);
  // The switch changed nothing else: every other flow and timeline slide keeps its row.
  for (const other of slides.filter(entry => ['flow', 'loop'].includes(entry.kind)
    && entry.id !== 'factory-13' && !entry.loopback && !entry.scene)) {
    assert.match(byId(html, other.id), /class="stations main-panels"/, other.id);
  }
  for (const other of slides.filter(entry => entry.kind === 'timeline' && !entry.scene)) {
    assert.match(byId(html, other.id), /class="timeline main-panels"/, other.id);
  }
});

test('the gates scene advances the passing batch and stops the failing one', async () => {
  const scene = await import('../src/presentations/software-factory/gates-scene.mjs');
  const source = read(`${base}gates-scene.mjs`);
  const columns = scene.gatesColumns(3);
  assert.deepEqual(columns, [500, 880, 1260]);
  assert.equal(scene.GATES_VIEW, '0 0 1680 480');
  assert.equal(scene.GATES_SECONDS * 1000, 16000);
  const still = scene.gatesScene(scene.GATES_STILL);
  // Deterministic: the same instant always produces the same frame.
  assert.equal(scene.gatesScene(scene.GATES_STILL), still);
  assert.ok((still.match(/<(?:polygon|circle|path|rect|g)\b/g) || []).length > 20, 'compuertas vacías');
  // Three controls drawn once each, crossing both lanes, and one barrier per control and lane.
  assert.equal((still.match(/class="gates-portal"/g) || []).length, 3);
  assert.equal((still.match(/class="gates-arm/g) || []).length, 6);
  // The still shows both cases resolved: the passing batch at the exit, the failing one at
  // the second control with the third never executed.
  const pieces = [...still.matchAll(/class="gates-piece[^"]*" transform="translate\(([-\d.]+) ([-\d.]+)\)"/g)]
    .map(match => [Number(match[1]), Number(match[2])]);
  assert.deepEqual(pieces, [[scene.GATES_RAIL[1], scene.GATES_LANES[0]],
    [columns[1] - scene.GATES_STOP, scene.GATES_LANES[1]]]);
  const resolved = scene.gatesState(scene.GATES_STILL, columns);
  assert.deepEqual(resolved.lanes[0].gates.map(gate => gate.passed), [true, true, true]);
  assert.deepEqual(resolved.lanes[1].gates.map(gate => gate.failed), [false, true, false]);
  assert.deepEqual(resolved.lanes[1].gates.map(gate => gate.skipped), [false, false, true]);
  // The third control never runs for the failing batch, at any instant of the cycle.
  for (let step = 0; step < 240; step += 1) {
    const state = scene.gatesState(step / 240, columns);
    assert.equal(state.lanes[1].gates[2].passed, false, String(step));
    assert.equal(state.lanes[1].gates[2].scanning, false, String(step));
  }
  // The first control fires for both batches, and only the passing one leaves the second.
  const early = scene.gatesState(4.4 / scene.GATES_SECONDS, columns);
  assert.deepEqual(early.lanes.map(lane => lane.gates[0].passed), [true, true]);
  assert.deepEqual(early.lanes.map(lane => lane.gates[1].passed), [false, false]);
  const later = scene.gatesState(8.2 / scene.GATES_SECONDS, columns);
  assert.deepEqual(later.lanes.map(lane => lane.gates[1].passed), [true, false]);
  assert.deepEqual(later.lanes.map(lane => lane.failed), [false, true]);
  // Amber belongs to the stop only: one failed arm and one failed piece in that frame.
  const stopFrame = scene.gatesScene(8.2 / scene.GATES_SECONDS, columns);
  assert.equal((stopFrame.match(/gates-arm-failed/g) || []).length, 1);
  assert.equal((stopFrame.match(/gates-piece-failed/g) || []).length, 1);
  assert.equal((still.match(/gates-arm-failed/g) || []).length, 1);
  assert.equal((still.match(/gates-piece-failed/g) || []).length, 1);
  const before = scene.gatesScene(4.4 / scene.GATES_SECONDS, columns);
  assert.equal((before.match(/gates-arm-failed|gates-piece-failed/g) || []).length, 0);
  // The frames carry no words, no script and no external reference: the deck renders the text.
  for (const frame of [still, stopFrame, scene.gatesScene(0)]) {
    assert.doesNotMatch(frame, /<text|<title|<desc|<image|https?:|<script|requestAnimationFrame/);
  }
  // Palette: the module carries the tokens and derives every other tone from them.
  const hexes = new Set([...source.matchAll(/#[0-9a-fA-F]{6}/g)].map(match => match[0].toLowerCase()));
  assert.deepEqual([...hexes].sort(), ['#101719', '#557077', '#94c9d2', '#b3ced4', '#e9eeeb', '#ffc36a']);
  // Governance comes from the shared helper: the module owns the drawing and nothing else.
  assert.match(source, /import \{ mountGovernedScene \} from '\.\/scene-governor\.mjs';/);
  assert.match(source, /mountGovernedScene\(\{ host, cycle: GATES_SECONDS \* 1000, still: GATES_STILL/);
  for (const owned of ['requestAnimationFrame', 'cancelAnimationFrame', 'MutationObserver', 'visibilitychange', 'pagehide']) {
    assert.ok(!source.includes(owned), `la gobernanza sigue en gates-scene.mjs: ${owned}`);
  }
  for (const forbidden of ['#deck', 'slide-select', 'slide-index', 'deck-controls', 'document.body']) {
    assert.ok(!source.includes(forbidden), forbidden);
  }
});
