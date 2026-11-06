import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadDeckAssets } from './helpers/deck-assets.mjs';
import { assertShellContract } from './helpers/deck-shell.mjs';

test('inherits shared shell and exact public Unicode route', async () => {
  const { renderPresentation } = await import('../src/presentations/patrones-diseno/render.mjs');
  const assets = loadDeckAssets('patrones-diseno');
  const html = renderPresentation(assets);
  assertShellContract(html);
  assert.match(html, /<link rel="canonical" href="https:\/\/daniel-espanadero.com\/presentaciones\/patrones-diseño\/">/);
  for (const key of ['og:title', 'og:description', 'og:url', 'twitter:card']) assert.ok(html.includes(key));
  assert.ok(html.includes(assets.controller));
  assert.match(assets.css, /prefers-reduced-motion/);
  assert.match(assets.css, /@media print/);
  assert.match(assets.css, /transform: none !important/);
  const route = readFileSync(new URL('../src/pages/presentaciones/patrones-diseño/index.astro', import.meta.url), 'utf8');
  assert.match(route, /prerender = true/);
  const index = readFileSync(new URL('../src/pages/presentaciones/index.astro', import.meta.url), 'utf8');
  assert.ok(index.includes('/presentaciones/patrones-diseño/'));
});
