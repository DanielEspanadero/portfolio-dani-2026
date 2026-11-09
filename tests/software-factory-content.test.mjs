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
  // The route now exists as a prerendered Astro page; the docs must say so and
  // must not claim the hosting response was already verified.
  assert.match(docs, /ruta implementada/i);
  assert.match(docs, /verificación posterior/i);
  assert.match(docs, /\/presentaciones\/software-factory/);
});

test('temario requerido: la fábrica como sistema de producción', () => {
  const context = slide => `${slide.title} ${slide.lead} ${slide.items.map(i => `${i.label} ${i.detail}`).join(' ')} ${slide.notes}`;
  const all = slides.map(context).join('\n');
  const topics = [
    // contexto histórico y vocabulario
    [/McIlroy/, /Garmisch/, /1968/, /2001/, /diciembre de 2024/i,
      /predefinid/, /dinámicamente/, /AGENTS\.md/],
    // la orden de trabajo y la especialización de estaciones
    [/orden de trabajo/i, /criterios de aceptación/i, /especificaci[oó]n|\bspec\b/i,
      /implementador/i, /\btester\b/i, /\breviewer\b/i, /estaci[oó]n/i],
    // estándares, activos reutilizables, compuertas automáticas y evidencia
    [/est[aá]ndar|convenci/i, /reutiliz|plantilla/i, /compuerta/i, /integraci[oó]n continua/i,
      /evidencia/i, /c[oó]digo de salida/i, /handoff/i],
    // flujo, integración y medición
    [/integrar|integraci[oó]n/i, /rollback|vuelta atr[aá]s/i, /tiempo de ciclo/i, /lote/i,
      /trabajo en curso/i],
    // paralelismo y sus límites
    [/independiente/i, /worktree/i, /no.*sandbox/i, /puertos/, /base.*datos/,
      /capacidad de (?:revisi[oó]n|inspecci[oó]n)/i],
    // ejecución, alcance y alternativa manual
    [/autenticaci[oó]n/, /autorizaci[oó]n/, /concurrencia/, /modo manual|trabajo manual/i],
  ];
  for (const pattern of topics.flat()) assert.match(all, pattern);
  assert.ok(chapters.findIndex(c => c.id === 'risks') < chapters.findIndex(c => c.id === 'create'));
  assert.match(all, /no garantiza.*independiente/i);
});

test('los ocho modos de fallo siguen presentes en el capítulo de riesgos', () => {
  const chapter = chapters.find(c => c.id === 'risks');
  const text = chapter.slides.map(s => `${s.title} ${s.lead} ${s.items.map(i => `${i.label} ${i.detail}`).join(' ')} ${s.notes}`).join('\n');
  const families = [
    [/falso verde|correlacionad/i, 'fallos correlacionados'],
    [/prompt injection/i, 'inyección de instrucciones'],
    [/LLM06:2025/, 'permisos excesivos'],
    [/LLM10:2025|consumo|bucle/i, 'consumo y bucles sin límite'],
    [/p[eé]rdida de conocimiento/i, 'pérdida de conocimiento'],
    [/proveedor/i, 'dependencia del proveedor'],
    [/recuperar/i, 'recuperación'],
    [/sin control|control [uú]til/i, 'ausencia de control significativo'],
  ];
  for (const [pattern, label] of families) assert.match(text, pattern, label);
  // El capítulo presenta fallos de fábrica; no necesita encabezarse con la aprobación humana.
  assert.doesNotMatch(`${chapter.slides[0].title} ${chapter.slides[0].lead}`, /aprob|human/i);
});

test('sin eslóganes heredados ni aprobación humana como tema dominante', () => {
  const removed = [
    /construir con criterio/i,
    /m[aá]s capacidad/i,
    /volante/i,
    /YouTube|suscr[ií]b/i,
    /no entregar(?:le)?s? el control/i,
  ];
  const stage = slide => [slide.title, slide.lead, ...slide.items.flatMap(i => [i.label, i.detail]), slide.code ?? ''].join('\n');
  for (const slide of slides) {
    for (const pattern of removed) assert.doesNotMatch(stage(slide), pattern, `${slide.id}: ${pattern}`);
  }
  // La decisión humana es un control entre varios: si domina los titulares, el deck vuelve a ser de gobernanza.
  const approval = slides.filter(s => /aprob|human/i.test(`${s.title} ${s.lead}`)).map(s => s.id);
  assert.ok(approval.length <= 2, `aprobación/humano en titulares: ${approval.join(', ')}`);
  const stops = slides.filter(s => /\bSTOP\b|decisi[oó]n humana|control humano/i.test(`${s.title} ${s.lead}`)).map(s => s.id);
  assert.ok(stops.length <= 1, `paradas humanas en titulares: ${stops.join(', ')}`);
  // El flujo principal se explica con los verbos de producción, no con una compuerta humana al final.
  const spine = slides.map(s => `${s.title} ${s.lead}`).join(' ');
  assert.match(spine, /orden de trabajo/i);
  assert.match(spine, /integrar|integraci[oó]n/i);
  assert.match(spine, /medir|medici[oó]n|tiempo de ciclo/i);
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
