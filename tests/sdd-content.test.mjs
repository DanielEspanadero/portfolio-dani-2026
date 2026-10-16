import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = new URL('../src/content/sdd/slides.html', import.meta.url);
const content = () => readFileSync(file, 'utf8');
const sections = (html) => [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)];
const attr = (attributes, name) => attributes.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];

test('course has 8–12 sequential, labelled slides', () => {
  const html = content();
  const slides = sections(html);
  assert.ok(slides.length >= 8 && slides.length <= 12, `Found ${slides.length} slides`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
  slides.forEach(([, attributes, body], index) => {
    const number = index + 1;
    assert.equal(attr(attributes, 'id'), String(number));
    assert.match(attributes, /\bdata-slide(?:\s|$)/);
    assert.match(attr(attributes, 'class') || '', /\bslide\b/);
    assert.ok(attr(attributes, 'data-title'));
    assert.ok(attr(attributes, 'data-chapter'));
    assert.equal(attr(attributes, 'aria-labelledby'), `slide-title-${number}`);
    const heading = number === 1 ? 'h1' : 'h2';
    assert.match(body, new RegExp(`<${heading} id="slide-title-${number}">[^<]+</${heading}>`));
  });
});

test('fragment uses balanced semantic tags and contains no executable or external resources', () => {
  const html = content();
  assert.doesNotMatch(html, /<(?:html|head|body|script|style|img|iframe|link|object|embed|svg)\b/i);
  assert.doesNotMatch(html, /\son\w+\s*=|javascript:|\sstyle\s*=/i);
  const stack = [];
  const voidTags = new Set(['br', 'hr', 'wbr']);
  for (const [, close, tag, attributes] of html.matchAll(/<(\/?)([a-z][a-z0-9-]*)([^>]*)>/gi)) {
    if (voidTags.has(tag)) continue;
    if (close) assert.equal(stack.pop(), tag, `Mismatched </${tag}>`);
    else {
      assert.ok(!attributes.endsWith('/'), 'Use explicit closing tags');
      stack.push(tag);
    }
  }
  assert.deepEqual(stack, []);
  for (const [, code] of html.matchAll(/<code>([\s\S]*?)<\/code>/g)) {
    assert.doesNotMatch(code, /[<>]/, 'Code examples must escape markup');
  }
});

test('tool summaries retain parent-verified workflow distinctions without invocation commands', (t) => {
  t.skip('Tool specific slides retired in favor of high-level 10-slide outline');
});

test('course includes core concepts and teaching safeguards', () => {
  const html = content();
  for (const phrase of ['Spec-First', 'Spec-Anchored', 'Spec-as-Source', 'A mano en Markdown', 'Spec Kit']) {
    assert.ok(html.includes(phrase), `Missing teaching concept: ${phrase}`);
  }
});
