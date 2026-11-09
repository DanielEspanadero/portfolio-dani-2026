import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { chapters, slides } from '../src/content/software-factory/index.mjs';

const words = text => text.trim().split(/\s+/u).length;
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const kit = 'public/resources/software-factory/';
const sources = [
  'https://mcilroy.cs.dartmouth.edu/pubs.html',
  'http://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF',
  'https://agilemanifesto.org/',
  'https://martinfowler.com/articles/continuousIntegration.html',
  'https://www.anthropic.com/engineering/building-effective-agents',
  'https://genai.owasp.org/llmrisk/llm012025-prompt-injection/',
  'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/',
  'https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/',
  'https://git-scm.com/docs/git-worktree',
];

// Structural guarantees complement, not replace, editorial and later visual review.
test('54 diapositivas, siete capítulos ordenados y composición variada', () => {
  assert.equal(chapters.length, 7);
  assert.ok(slides.length >= 52 && slides.length <= 56);
  assert.equal(new Set(chapters.map(c => c.id)).size, 7);
  assert.equal(new Set(slides.map(s => s.id)).size, slides.length);
  assert.deepEqual(slides, chapters.flatMap(c => c.slides));
  assert.equal(slides.filter(s => s.kind === 'hero').length, 1);
  assert.equal(slides[0].kind, 'hero');
  assert.equal(slides.filter(s => s.kind === 'closing').length, 1);
  assert.equal(slides.at(-1).kind, 'closing');
  assert.ok(new Set(slides.map(s => s.kind)).size >= 9);
  assert.ok(slides.filter(s => s.pause).length >= 2 && slides.filter(s => s.pause).length <= 3);
  for (const chapter of chapters) {
    assert.ok(chapter.title && chapter.slides.length >= 7 && chapter.slides.length <= 8);
  }
});

test('contrato de datos, densidad escénica y notas entre 90 y 150 palabras', () => {
  const kinds = new Set('hero timeline comparison flow loop gate risk code table parallel checklist exercise quote closing'.split(' '));
  const issues = [];
  for (const s of slides) {
    const check = (ok, description) => { if (!ok) issues.push(`${s.id}: ${description}`); };
    check(typeof s.id === 'string' && typeof s.title === 'string' && s.title.length > 0, 'id/title');
    check(kinds.has(s.kind), 'kind');
    check(typeof s.lead === 'string' && words(s.lead) < 25, 'lead');
    check(Array.isArray(s.items) && s.items.length >= 2 && s.items.length <= 5, 'items');
    for (const item of s.items) {
      check(typeof item.label === 'string' && words(item.label) <= 8, `label: ${item.label}`);
      check(typeof item.detail === 'string' && words(item.detail) <= 22, `detail: ${item.detail}`);
    }
    check(typeof s.notes === 'string' && words(s.notes) >= 90 && words(s.notes) <= 150, `notes=${words(s.notes)}`);
    if (s.code !== undefined) check(typeof s.code === 'string' && s.code.split('\n').length <= 12, 'code lines');
    if (s.steps !== undefined) check(typeof s.steps === 'boolean', 'steps');
    if (s.pause !== undefined) check(typeof s.pause === 'boolean', 'pause');
    if (s.sources !== undefined) {
      check(Array.isArray(s.sources), 'sources array');
      for (const source of s.sources) check(sources.includes(source), `source no acordada: ${source}`);
    }
  }
  assert.deepEqual(issues, []);
});

test('módulos legibles y fuentes presentes en datos y bibliografía', async () => {
  const modules = ['01-foundations', '02-anatomy', '03-risks', '04-create', '05-execute', '06-parallel', '07-workshop'];
  for (const name of modules) {
    const content = await read(`src/content/software-factory/${name}.mjs`);
    assert.ok(content.split('\n').length <= 351, name);
    assert.match(content, /export default/);
  }
  const cited = new Set(slides.flatMap(s => s.sources ?? []));
  const docs = await read('docs/SOFTWARE_FACTORY_PRESENTATION.md');
  for (const source of sources) {
    assert.ok(cited.has(source), source);
    assert.ok(docs.includes(source), source);
  }
  assert.match(docs, /ruta planificada/i);
  assert.match(docs, /\/presentaciones\/software-factory/);
});

test('temario requerido y riesgos antes de crear', () => {
  const all = slides.map(s => `${s.title} ${s.lead} ${s.items.map(i => `${i.label} ${i.detail}`).join(' ')} ${s.notes}`).join('\n');
  for (const topic of [/McIlroy/, /Garmisch/, /1968/, /2001/, /diciembre de 2024/i,
    /predefinid/, /dinámicamente/, /AGENTS.md/, /prompt injection/i,
    /LLM06:2025/, /LLM10:2025/, /correlacionad/, /permisos/, /presupuesto/,
    /proveedor/, /rollback/i, /autenticación/, /autorización/, /concurrencia/,
    /worktree/i, /no.*sandbox/i, /puertos/, /base.*datos/,
    /capacidad humana/i, /trabajo manual/i, /código de salida/]) assert.match(all, topic);
  assert.ok(chapters.findIndex(c => c.id === 'risks') < chapters.findIndex(c => c.id === 'create'));
  assert.match(chapters.find(c => c.id === 'risks').slides[0].items[1].detail, /decisión humana/);
  assert.match(all, /no garantiza.*independiente/i);
});

test('kit completo, sin plantillas ocultas ni resultados inventados y contrato coherente', async () => {
  const files = ['README.md', 'AGENTS.md', 'specs/cancel-booking.md', 'factory/worker.md',
    'factory/reviewer.md', 'factory/handoff.md', 'src/cancellation.mjs', 'tests/cancellation.test.mjs'];
  for (const file of files) await access(new URL(kit + file, root));
  const spec = await read(kit + 'specs/cancel-booking.md');
  const readme = await read(kit + 'README.md');
  const agents = await read(kit + 'AGENTS.md');
  const worker = await read(kit + 'factory/worker.md');
  const handoff = await read(kit + 'factory/handoff.md');
  const stageRules = slides.find(s => s.id === 'factory-28').items.map(i => `${i.label} ${i.detail}`).join(' ');
  for (const text of [spec, readme, stageRules]) {
    assert.match(text, />=24h/);
    assert.match(text, /100%/);
    assert.match(text, /<24h/);
    assert.match(text, /BOOKING_STARTED/);
    assert.match(text, /outcome/);
    assert.match(text, /event/i);
  }
  for (const text of [readme, agents, worker]) assert.ok(text.includes('node --test tests/cancellation.test.mjs'));
  assert.match(worker, /Resultado esperado, no informe de ejecución/);
  assert.match(handoff, /plantilla sin ejecutar/);
  assert.match(handoff, /\[observado \/ no ejecutado\]/);
  for (const file of files) assert.ok(readme.includes(`./${file}`), file);
  assert.match(spec, /no significa respuesta completa idéntica/);
  assert.match(agents, /Publicar|publicar/);
});
