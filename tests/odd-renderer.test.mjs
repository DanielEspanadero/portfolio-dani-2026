import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPresentation } from '../src/presentations/odd/render.mjs';
import { loadDeckAssets } from './helpers/deck-assets.mjs';
import { sectionsOf, playerIds, assertShellContract } from './helpers/deck-shell.mjs';

const assets = loadDeckAssets('odd');
const html = renderPresentation(assets);

test('renders one self-contained Spanish document', () => {
  assert.ok(html.startsWith('<!doctype html>'));
  assert.match(html, /<html lang="es">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/);
  assert.match(html, /<script type="module">/);
  assert.ok(html.includes(assets.slides));
  assert.ok(html.includes(assets.controller));
});

test('inlines its fonts so a live stream never depends on the network', () => {
  assert.equal((html.match(/@font-face/g) || []).length, 4);
  assert.equal((html.match(/data:font\/woff2;base64,/g) || []).length, 4);
  for (const family of ['Instrument Serif', 'Instrument Sans', 'JetBrains Mono']) {
    assert.ok(html.includes(`font-family: '${family}'`), family);
  }
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/);
});

test('publishes its own canonical URL and complete social metadata', () => {
  assert.match(html, /rel="canonical" href="https:\/\/daniel-espanadero\.com\/presentaciones\/odd\/"/);
  assert.ok(html.includes('Desarrollo Orgánico'));
  for (const property of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:image:alt']) {
    assert.ok(html.includes(`property="${property}"`), property);
  }
  for (const name of ['description', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    assert.ok(html.includes(`name="${name}"`), name);
  }
  assert.doesNotMatch(html, /hreflang=/);
});

test('ships the shared player without a download route it does not have', () => {
  for (const id of playerIds) assert.equal(html.split(`id="${id}"`).length - 1, 1, id);
  assertShellContract(html);
  assert.doesNotMatch(html, /descargar\.html/);
  assert.doesNotMatch(html, /Versión sin conexión/);
  assert.match(html, /id="chapter-label">Desarrollo Orgánico</);
});

test('every slide reaches the document with its heading and chapter', () => {
  const sections = sectionsOf(html);
  assert.equal(sections.length, 17);
  assert.equal(sections[0].chapter, 'Portada');
  assert.equal(sections.at(-1).chapter, 'Cierre');
  for (const [index, section] of sections.entries()) {
    assert.equal(section.id, String(index + 1));
    assert.equal((html.match(/id="slide-title-(\d+)"/g) || []).length, 17);
  }
});
