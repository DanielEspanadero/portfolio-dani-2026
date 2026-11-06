import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDeckAssets } from './helpers/deck-assets.mjs';

test('mobile reading grids can shrink below code min-content width', () => {
  const { css } = loadDeckAssets('patrones-diseno');
  const mobile = css.split('@media screen and (max-width: 1000px) {')[1]?.split('/* ---------- movimiento reducido')[0];
  assert.ok(mobile, 'mobile reading breakpoint exists');
  assert.match(mobile, /\.grid, \.concept-grid, \.code-grid, \.book-grid\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\);\s*gap:\s*0;\s*\}/);
});
