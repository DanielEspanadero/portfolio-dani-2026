import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDeckAssets } from './helpers/deck-assets.mjs';
import { sectionsOf } from './helpers/deck-shell.mjs';

const gof = {
  creational: ['singleton', 'factory-method', 'abstract-factory', 'builder', 'prototype'],
  structural: ['adapter', 'bridge', 'composite', 'decorator', 'facade', 'flyweight', 'proxy'],
  behavioral: ['chain-of-responsibility', 'command', 'interpreter', 'iterator', 'mediator', 'memento', 'observer', 'state', 'strategy', 'template-method', 'visitor'],
};
const modern = ['dependency-injection', 'repository', 'dto-mapping', 'service-layer', 'specification', 'circuit-breaker-retry'];

test('complete beginner journey, paired catalogue and sequential named slides', () => {
  const { slides } = loadDeckAssets('patrones-diseno');
  const sections = sectionsOf(slides);
  assert.equal(sections.length, 69);
  assert.equal((slides.match(/<h1\b/g) || []).length, 1);
  sections.forEach((s, i) => {
    assert.equal(s.id, String(i + 1));
    assert.ok(s.title && s.chapter);
    assert.match(s.attributes, /data-slide/);
    assert.doesNotMatch(s.attributes, /\bhidden\b/);
  });
  for (const [family, names] of [...Object.entries(gof), ['modern', modern]]) {
    for (const name of names) {
      const pair = sections.filter(s => s.attributes.includes(`data-pattern="${name}"`));
      assert.equal(pair.length, 2, name);
      assert.match(pair[0].attributes, new RegExp(`data-family="${family}"`));
      assert.match(pair[0].attributes, /data-kind="concept"/);
      assert.match(pair[1].attributes, /data-kind="code"/);
      assert.equal(Number(pair[1].id), Number(pair[0].id) + 1);
      if (family === 'modern') pair.forEach(s => assert.match(s.chapter, /No GoF/));
      for (const label of ['Problema', 'Analogía', 'Intención y roles', 'Cuándo usarlo', 'Coste y cuándo no']) assert.ok(pair[0].body.includes(label), `${name}: ${label}`);
      assert.match(pair[1].body, /data-java=/);
      assert.match(pair[1].body, /Recorrido/);
    }
  }
  assert.doesNotMatch(slides, /\.\.\.|…/);
  // La apertura (portada + qué es + por qué surgieron + por qué es buena práctica)
  // ocupa las cuatro primeras; el catálogo empieza en la quinta.
  assert.ok(sections.findIndex(s => s.attributes.includes('data-pattern')) >= 5);
  assert.match(slides, /Java 25/);
  assert.match(slides, /Respuesta/);
});

test('static semantic content remains readable without scripts or pre-applied reveal gates', () => {
  const { slides } = loadDeckAssets('patrones-diseno');
  assert.doesNotMatch(slides, /<script\b|<iframe\b|\bon\w+=|contenteditable|<link\b|<img\b/);
  assert.doesNotMatch(slides, /step-pending|<(?:article|aside)\b[^>]*(?:aria-hidden="true"|\binert\b)/);
  const stack = [];
  for (const [, closing, tag] of slides.matchAll(/<(\/?)(section|article|aside|div|h1|h2|h3|p|pre|code|ol|li|dl|dt|dd|em|strong|cite|a|span)\b[^>]*>/g)) {
    if (closing) assert.equal(stack.pop(), tag, `closing ${tag}`);
    else stack.push(tag);
  }
  assert.deepEqual(stack, []);
  for (const s of sectionsOf(slides).filter(s => s.attributes.includes('data-kind="code"'))) {
    const expected = s.body.match(/data-output="([^"]*)"/)?.[1];
    const displayed = s.body.match(/<pre class="result">([\s\S]*?)<\/pre>/)?.[1];
    assert.equal(displayed, expected, `${s.title}: visible result matches executable contract`);
    assert.match(s.body, /<pre tabindex="0"/);
  }
});
