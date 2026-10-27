import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = new URL('../src/content/odd/slides.html', import.meta.url);
const content = () => readFileSync(file, 'utf8');
const sections = (html) => [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)];
const attr = (attributes, name) => attributes.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

test('deck has 14–20 sequential, labelled slides with a single h1', () => {
  const html = content();
  const slides = sections(html);
  assert.ok(slides.length >= 14 && slides.length <= 20, `Found ${slides.length} slides`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
  slides.forEach(([, attributes, body], index) => {
    const number = index + 1;
    assert.equal(attr(attributes, 'id'), String(number));
    assert.match(attributes, /\bdata-slide(?:\s|$)/);
    assert.ok(attr(attributes, 'data-title'), `slide ${number} needs data-title`);
    assert.ok(attr(attributes, 'data-chapter'), `slide ${number} needs data-chapter`);
    assert.equal(attr(attributes, 'aria-labelledby'), `slide-title-${number}`);
    const heading = number === 1 ? 'h1' : 'h2';
    assert.match(body, new RegExp(`<${heading}[^>]*id="slide-title-${number}"`));
  });
});

test('fragment stays static: no scripts, no external resources, no inline behaviour', () => {
  const html = content();
  assert.doesNotMatch(html, /<(?:html|head|body|script|style|img|iframe|link|object|embed)\b/i);
  assert.doesNotMatch(html, /\son\w+\s*=|javascript:|\sstyle\s*=/i);
  assert.doesNotMatch(html, /https?:\/\//i, 'no remote URLs inside slide content');
});

test('decorative svg art is hidden from assistive technology', () => {
  const html = content();
  for (const [, attributes] of html.matchAll(/<svg\b([^>]*)>/g)) {
    assert.match(attributes, /aria-hidden="true"/);
    assert.match(attributes, /focusable="false"/);
  }
  for (const [, attributes] of html.matchAll(/<circle\b([^>]*)>/g)) {
    assert.doesNotMatch(attributes, /\btabindex=/, 'nodes must not be focusable');
  }
});

test('fragment uses balanced tags and explicit closing tags for content', () => {
  const html = content();
  const stack = [];
  const voidTags = new Set(['br', 'hr', 'wbr', 'path', 'circle', 'use', 'line', 'rect']);
  for (const [, close, tag, attributes] of html.matchAll(/<(\/?)([a-z][a-z0-9-]*)([^>]*)>/gi)) {
    if (voidTags.has(tag)) {
      assert.match(attributes, /\/\s*$/, `<${tag}> must be self-closing`);
      continue;
    }
    if (close) assert.equal(stack.pop(), tag, `Mismatched </${tag}>`);
    else stack.push(tag);
  }
  assert.deepEqual(stack, []);
});

test('progressive reveals only ever hide whole blocks, never inline fragments', () => {
  const html = content();
  const tags = [...html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*\bdata-step\b[^>]*)>/gi)].map((match) => match[1]);
  assert.ok(tags.length > 0, 'the deck uses stepped reveals for live delivery');
  for (const tag of tags) assert.ok(['li', 'p', 'tr'].includes(tag), `data-step found on <${tag}>`);
});

test('protocol names the seven steps in order', () => {
  const ordered = ['Autorizar', 'Explorar', 'Resolver', 'Clasificar', 'Registrar', 'Implementar', 'Cerrar'];
  const position = ordered.map((step) => content().indexOf(`class="p-name">${step}<`));
  position.forEach((index, offset) => assert.ok(index > -1, `missing step ${ordered[offset]}`));
  assert.deepEqual([...position].sort((a, b) => a - b), position, 'steps must stay in protocol order');
});

test('deck keeps the pedagogical promises: proportion, evidence and honest limits', () => {
  const body = text(content());
  for (const claim of [
    'Orgánico no significa improvisado',
    'se elige por consecuencia',
    'test de la continuidad',
    'Reduce el riesgo',
    'No es una garantía',
  ]) {
    assert.ok(body.includes(claim), `missing claim: ${claim}`);
  }
});
