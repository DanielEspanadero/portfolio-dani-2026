import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadDeckAssets } from './helpers/deck-assets.mjs';
import { sectionsOf } from './helpers/deck-shell.mjs';

test('design-patterns catalog metadata matches the deck slide count and Java version', () => {
  const catalog = readFileSync(new URL('../src/pages/presentaciones/index.astro', import.meta.url), 'utf8');
  const card = catalog.match(/\{\s*href: '\/presentaciones\/patrones-diseño\/'[\s\S]*?\n  \}/)?.[0];
  assert.ok(card, 'design-patterns card is discoverable');

  const { slides } = loadDeckAssets('patrones-diseno');
  const versions = [...new Set(slides.match(/Java \d+/g))];
  assert.equal(versions.length, 1, 'deck advertises one Java version');
  const description = card.match(/description:\s*'([^']*)'/)?.[1];
  const meta = [...(card.match(/meta: \[([^\]]*)\]/)?.[1] || '').matchAll(/'([^']*)'/g)].map(match => match[1]);
  assert.deepEqual({
    meta,
    descriptionVersions: description?.match(/Java \d+/g),
  }, {
    meta: [`${sectionsOf(slides).length} diapositivas`, 'Principiantes', versions[0]],
    descriptionVersions: versions,
  });
});
