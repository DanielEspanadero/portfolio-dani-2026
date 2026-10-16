import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSlideHash, canonicalSlideHash, navigationIntent, advancePosition } from '../src/presentations/sdd/controller.js';

const event = (key, extra = {}) => ({ key, target: { closest: () => null }, ...extra });

test('numeric URLs select #12 and canonicalize empty, invalid and out-of-range hashes', () => {
  for (const [hash, expected] of [['#12', 12], ['', 1], ['#', 1], ['#abc', 1], ['#1.5', 1], ['#-2', 1], ['#0', 1], ['#999', 20], ['#0012', 12], ['#12x', 1], ['#9007199254740992', 1]]) {
    assert.equal(parseSlideHash(hash, 20), expected, hash);
    assert.equal(canonicalSlideHash(hash, 20), `#${expected}`, hash);
  }
  assert.equal(parseSlideHash('#12', 0), 1);
});

test('keyboard maps slide, reveal, notes, index and fullscreen commands', () => {
  for (const key of ['ArrowRight', 'PageDown', ' ']) assert.equal(navigationIntent(event(key)), 'next');
  for (const key of ['ArrowLeft', 'PageUp']) assert.equal(navigationIntent(event(key)), 'previous');
  for (const [key, intent] of [['Home', 'first'], ['End', 'last'], ['i', 'index'], ['f', 'fullscreen'], ['Escape', 'escape']]) {
    assert.equal(navigationIntent(event(key)), intent);
  }
  assert.equal(navigationIntent(event('x')), null);
});

test('keyboard preserves native interactive, editable, modified and dialog events', () => {
  for (const modifier of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'defaultPrevented', 'isComposing']) {
    assert.equal(navigationIntent(event('ArrowRight', { [modifier]: true })), null);
  }
  for (const tag of ['input', 'select', 'textarea', 'button', 'a', 'summary', '[contenteditable]', 'dialog[open]']) {
    const target = { closest: selector => selector.includes(tag) ? {} : null };
    assert.equal(navigationIntent(event('ArrowRight', { target })), null, tag);
  }
  assert.equal(navigationIntent(event('ArrowRight'), true), null);
  assert.equal(navigationIntent(event('Escape'), true), 'escape');
});

test('reveal steps precede forward movement and previous unwinds steps', () => {
  let position = { slide: 1, step: 0 };
  position = advancePosition(position, 'next', 3, 2);
  assert.deepEqual(position, { slide: 1, step: 1 });
  position = advancePosition(position, 'next', 3, 2);
  assert.deepEqual(position, { slide: 1, step: 2 });
  assert.deepEqual(advancePosition(position, 'previous', 3, 2), { slide: 1, step: 1 });
  assert.deepEqual(advancePosition(position, 'next', 3, 2), { slide: 2, step: 0 });
  assert.deepEqual(advancePosition({ slide: 2, step: 0 }, 'previous', 3, 2), { slide: 1, step: 0 });
});

test('first/last and boundary controls preserve bounded deterministic positions', () => {
  assert.deepEqual(advancePosition({ slide: 1, step: 0 }, 'previous', 3, 2), { slide: 1, step: 0 });
  assert.deepEqual(advancePosition({ slide: 3, step: 2 }, 'next', 3, 2), { slide: 3, step: 2 });
  assert.deepEqual(advancePosition({ slide: 2, step: 1 }, 'first', 3, 2), { slide: 1, step: 0 });
  assert.deepEqual(advancePosition({ slide: 2, step: 1 }, 'last', 3, 2), { slide: 3, step: 0 });
  assert.deepEqual(advancePosition({ slide: 2, step: 1 }, 'unknown', 3, 2), { slide: 2, step: 1 });
});
