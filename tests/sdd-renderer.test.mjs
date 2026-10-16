import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPresentation } from '../src/presentations/sdd/render.mjs';

const assets = {
  slides: '<section data-slide id="1"><h1>SDD con IA</h1></section>',
  css: 'body { color: white; }',
  controller: 'export const example = true;',
};

test('renders one complete Spanish document with embedded assets', () => {
  const html = renderPresentation(assets);
  assert.ok(html.startsWith('<!doctype html>'));
  assert.match(html, /<html lang="es">/);
  assert.ok(html.includes(assets.slides));
  assert.ok(html.includes(`<style>${assets.css}</style>`));
  assert.ok(html.includes(`<script type="module">${assets.controller}</script>`));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/);
});

test('includes canonical and complete social metadata without a nonexistent translation', () => {
  const html = renderPresentation(assets);
  assert.match(html, /rel="canonical" href="https:\/\/daniel-espanadero.com\/presentaciones\/sdd\/"/);
  for (const property of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 'og:image:alt']) {
    assert.ok(html.includes(`property="${property}"`), property);
  }
  for (const name of ['description', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    assert.ok(html.includes(`name="${name}"`), name);
  }
  assert.doesNotMatch(html, /hreflang="en"/);
});

test('provides the exact player DOM contract and accessible controls', () => {
  const html = renderPresentation(assets);
  const ids = [
    'chapter-label', 'index-toggle', 'fullscreen-toggle', 'deck',
    'previous-slide', 'next-slide', 'slide-select', 'slide-counter', 'deck-progress',
    'slide-index', 'index-title', 'index-close', 'index-links', 'keyboard-help',
  ];
  for (const id of ids) assert.equal(html.split(`id="${id}"`).length - 1, 1, id);
  assert.match(html, /<main id="deck" tabindex="-1">/);
  assert.match(html, /<dialog id="slide-index" aria-labelledby="index-title">/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<noscript>/);
  assert.match(html, /href="\/presentaciones\/sdd\/descargar.html" download="sdd-con-ia.html"/);
});

test('offline export embeds the same course and player without a server download dependency', () => {
  const html = renderPresentation({ ...assets, offline: true });
  assert.ok(html.includes(assets.slides));
  assert.ok(html.includes(assets.css));
  assert.ok(html.includes(assets.controller));
  assert.doesNotMatch(html, /href="\/presentaciones\/sdd\/descargar.html"/);
  assert.match(html, /Versión sin conexión/);
});
