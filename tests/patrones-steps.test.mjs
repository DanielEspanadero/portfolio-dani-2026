import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDeckAssets } from './helpers/deck-assets.mjs';
import { sectionsOf } from './helpers/deck-shell.mjs';
import { renderPresentation } from '../src/presentations/patrones-diseno/render.mjs';
import { advancePosition, navigationIntent } from '../src/presentations/shared/player.js';

const stepsOf = html => [...html.matchAll(/<\w+\b[^>]*\bdata-step(?:="[^"]*")?[^>]*>/g)].map(match => match[0]);

test('exactly 58 reveals belong only to the last concept article and code aside', () => {
  const { slides } = loadDeckAssets('patrones-diseno');
  const sections = sectionsOf(slides);
  assert.equal(stepsOf(slides).length, 58);
  for (const kind of ['concept', 'code']) {
    const paired = sections.filter(s => s.attributes.includes(`data-kind="${kind}"`));
    assert.equal(paired.length, 29);
    for (const section of paired) {
      assert.equal(stepsOf(section.body).length, 1, section.title);
      if (kind === 'concept') {
        const grid = section.body.match(/<div class="concept-grid concept-pilot">([\s\S]*?)<\/div>/)?.[1];
        const articles = [...grid.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g)];
        assert.equal(articles.length, 4, section.title);
        assert.deepEqual(articles.map(a => a[1]), ['', '', '', ' data-step=""'], section.title);
        assert.match(articles[3][2], /^\s*<h3>Coste y cuándo no<\/h3>/);
      } else {
        assert.match(section.body, /<div class="code-grid">[\s\S]*<\/pre>\s*<aside data-step="">/);
        assert.deepEqual(stepsOf(section.body), ['<aside data-step="">']);
      }
    }
  }
  for (const section of sections.filter(s => !/data-kind="(?:concept|code)"/.test(s.attributes))) {
    assert.equal(stepsOf(section.body).length, 0, section.title);
  }
});

test('rendered concept and code each reveal before Space advances, while ordinary slides advance immediately', () => {
  const assets = loadDeckAssets('patrones-diseno');
  const sections = sectionsOf(renderPresentation(assets));
  const intent = navigationIntent({ key: ' ', target: { closest: () => null } });
  assert.equal(intent, 'next');
  for (const section of sections) {
    const slide = Number(section.id);
    const steps = stepsOf(section.body).length;
    const position = { slide, step: 0 };
    if (/data-kind="(?:concept|code)"/.test(section.attributes)) {
      assert.equal(steps, 1, section.title);
      const revealed = advancePosition(position, intent, sections.length, steps);
      assert.deepEqual(revealed, { slide, step: 1 }, section.title);
      assert.deepEqual(advancePosition(revealed, 'previous', sections.length, steps), position);
      assert.deepEqual(advancePosition(revealed, intent, sections.length, steps), { slide: slide + 1, step: 0 });
    } else {
      assert.equal(steps, 0, section.title);
      assert.deepEqual(advancePosition(position, intent, sections.length, steps), { slide: Math.min(slide + 1, sections.length), step: 0 });
    }
  }
});
