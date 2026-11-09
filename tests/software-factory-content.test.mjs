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
test('36 diapositivas, siete capítulos ordenados y composición variada', () => {
  assert.equal(chapters.length, 7);
  // S10 added where the order and the context come from; S12 added the end-to-end flow.
  // The compression target stays a target: two useful slides were worth the extra pages.
  assert.equal(slides.length, 36);
  assert.deepEqual(chapters.map(c => c.slides.length), [7, 7, 4, 5, 5, 4, 4]);
  assert.deepEqual(chapters.map(c => c.id), ['foundations', 'line', 'loop', 'risks', 'build', 'parallel', 'closing']);
  assert.equal(new Set(chapters.map(c => c.id)).size, 7);
  assert.equal(new Set(slides.map(s => s.id)).size, slides.length);
  assert.deepEqual(slides.map(s => s.id), slides.map((_, index) => `factory-${String(index + 1).padStart(2, '0')}`));
  assert.deepEqual(slides, chapters.flatMap(c => c.slides));
  assert.equal(slides.filter(s => s.kind === 'hero').length, 1);
  assert.equal(slides[0].kind, 'hero');
  assert.equal(slides.filter(s => s.kind === 'closing').length, 1);
  assert.equal(slides.at(-1).kind, 'closing');
  assert.equal(new Set(slides.map(s => s.kind)).size, 16);
  // `quote` leaves the unused-kinds list: the definition of S9 is exactly one oversized sentence.
  assert.equal(slides.filter(s => s.kind === 'quote').length, 1);
  assert.ok(slides.filter(s => s.pause).length >= 1 && slides.filter(s => s.pause).length <= 2);
  // Una sola composición de compuerta: la integración no vuelve a ser el tema del deck.
  assert.equal(slides.filter(s => s.kind === 'gate').length, 1);
});

test('contrato de datos, densidad escénica y notas entre 90 y 150 palabras', () => {
  const kinds = new Set('hero timeline comparison flow loop gate risk code table parallel checklist exercise quote closing files circle'.split(' '));
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
    // S9 annotations: one plain sentence, one running-case label, one English alias.
    if (s.plain !== undefined) check(typeof s.plain === 'string' && words(s.plain) <= 18, `plain=${words(s.plain ?? '')}`);
    if (s.alias !== undefined) check(typeof s.alias === 'string' && words(s.alias) <= 4, `alias=${s.alias}`);
    if (s.terms !== undefined) check(Array.isArray(s.terms) && s.terms.length === 3
      && s.terms.every(term => typeof term === 'string' && words(term) <= 2), 'terms');
    if (s.quote !== undefined) check(typeof s.quote === 'string' && words(s.quote) >= 25, 'quote statement');
    if (s.sources !== undefined) {
      check(Array.isArray(s.sources), 'sources array');
      for (const source of s.sources) check(sources.includes(source), `source no acordada: ${source}`);
    }
  }
  assert.deepEqual(issues, []);
});

test('módulos legibles y fuentes presentes en datos y bibliografía', async () => {
  const modules = ['01-foundations', '02-production-line', '03-loop-state', '04-failure-modes',
    '05-build-yours', '06-example-parallel', '07-closing'];
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

test('temario requerido: la fábrica como sistema de producción y su bucle', () => {
  const context = slide => `${slide.title} ${slide.lead} ${slide.items.map(i => `${i.label} ${i.detail}`).join(' ')} ${slide.notes}`;
  const all = slides.map(context).join('\n');
  const topics = [
    // contexto histórico: dos orígenes de 1968 y su vocabulario
    [/Bemer/, /General Electric/, /McIlroy/, /Garmisch/, /1968/, /2001/, /diciembre de 2024/i,
      /predefinid/, /dinámicamente/, /AGENTS\.md/],
    // la orden de trabajo y la especialización de estaciones
    [/orden de trabajo/i, /criterios de aceptación/i, /especificaci[oó]n|\bspec\b/i,
      /implementador/i, /\btester\b/i, /\breviewer\b/i, /estaci[oó]n/i],
    // estándares, activos reutilizables, compuertas automáticas y evidencia
    [/est[aá]ndar|convenci/i, /reutiliz|plantilla/i, /compuerta/i, /integraci[oó]n continua/i,
      /evidencia/i, /c[oó]digo de salida/i, /handoff/i],
    // el bucle como maquinaria y su estado compartido
    [/bucle/i, /tope de reintentos|n[uú]mero fijo de reintentos/i, /backlog/i,
      /registro de estado|tablero/i, /markdown/i],
    // decisión escrita: la política de autonomía dice qué avanza solo y qué escala siempre
    [/pol[ií]tica de autonom[ií]a/i, /escala|escalado/i, /pagos/i, /accesos|credenciales/i,
      /invalidaci[oó]n de cach[eé]|migraciones/i, /irreversible/i],
    // flujo, integración y medición
    [/integrar|integraci[oó]n/i, /rollback|vuelta atr[aá]s/i, /tiempo de ciclo/i, /lote/i,
      /trabajo en curso/i, /coste/i, /tokens/i, /defectos? escapad/i],
    // observabilidad y cierre del círculo
    [/observabilidad|en qu[eé] fase|caja negra/i, /telemetr[ií]a/i, /alerta/i, /nueva orden|nuevas órdenes/i],
    // paralelismo y sus límites
    [/independiente/i, /worktree/i, /no.*sandbox/i, /puertos/, /base.*datos/,
      /capacidad de (?:revisi[oó]n|inspecci[oó]n)/i],
    // ejecución, alcance y alternativa manual
    [/autenticaci[oó]n/, /autorizaci[oó]n/, /concurrencia/, /modo manual|trabajo manual/i],
  ];
  for (const pattern of topics.flat()) assert.match(all, pattern);
  assert.ok(chapters.findIndex(c => c.id === 'risks') < chapters.findIndex(c => c.id === 'build'));
  assert.match(all, /no garantiza.*independiente/i);
  // Los modelos se reparten esfuerzo y la fábrica se mejora con el mejor de ellos.
  assert.match(all, /modelo (?:barato|m[aá]s (?:fuerte|capaz))/i);
  assert.match(all, /subagente/i);
});

test('la definición en lenguaje llano abre el deck, antes de cualquier detalle', () => {
  const definition = slides[1];
  assert.equal(definition.id, 'factory-02');
  assert.equal(definition.kind, 'quote');
  assert.equal(slides[0].kind, 'hero');
  // La definición va antes de la diapositiva que desmiente el producto milagro.
  assert.match(slides[2].title, /no es un producto/i);
  const statement = definition.quote;
  const all = `${definition.title} ${definition.lead} ${statement} ${definition.items.map(i => `${i.label} ${i.detail}`).join(' ')}`;
  // El significado acordado: sistema repetible, orden comprobable, equipo de agentes, comprobaciones y estándar escrito.
  assert.match(statement, /sistema de trabajo repetible/i);
  assert.match(statement, /criterios (?:que se pueden )?comprobables/i);
  assert.match(statement, /agentes/i);
  assert.match(statement, /construye/i);
  assert.match(statement, /prueba/i);
  assert.match(statement, /comprobaciones pasan/i);
  // El juicio está escrito: el resultado entra cuando el estándar y las comprobaciones lo permiten.
  assert.match(statement, /est[aá]ndar escrito/i);
  assert.match(statement, /comprobaciones/i);
  assert.doesNotMatch(statement, /criterio humano|persona con criterio|una persona decide|decisi[oó]n humana/i);
  // Legible sin contexto técnico: si el término es inevitable, va glosado en la misma frase.
  assert.doesNotMatch(statement, /handoff|worktree|compuerta|\bspec\b|backlog|pull request|\bmerge\b|\bdiff\b|\btoken\b|\blote\b|\bCI\b|runner/i);
  assert.match(statement, /programas de IA|\([^)]*IA[^)]*\)/i);
  // Tres claves cortas: misma entrada misma salida, máquina donde puede, registro de todo.
  assert.equal(definition.items.length, 3);
  assert.match(all, /mismo resultado|misma entrada/i);
  // La segunda clave nombra el estándar que decide, no una persona en el punto de decisión.
  assert.match(all, /est[aá]ndar[^.]*decid/i);
  assert.match(all, /persona[^.]*define|define[^.]*antes/i);
  assert.match(all, /registro|queda escrito/i);
});

test('el juicio está escrito: la familia editorial «criterio humano» no vuelve al escenario', () => {
  // S16: la fábrica delega el juicio en criterios escritos que la línea aplica igual cada
  // corrida. Si esta familia reaparece en una diapositiva o en una nota, el foco vuelve a
  // estar en la intervención manual en lugar de en la producción repetible y verificable.
  const family = /(?:criterio\s+humano|persona\s+con\s+criterio|una\s+persona\s+decide|alguien\s+decide|decisi[oó]n\s+humana|acepta\w*\s+o\s+devuelv\w*)/i;
  const stage = slide => [slide.title, slide.lead, slide.plain, slide.quote, slide.code ?? '',
    ...slide.items.flatMap(entry => [entry.label, entry.detail])].filter(Boolean);
  for (const slide of slides) {
    for (const text of [...stage(slide), slide.notes]) assert.doesNotMatch(text, family, `${slide.id}: ${text}`);
  }
  // La definición nombra el estándar escrito y las comprobaciones, no a una persona que decide.
  const definition = slides.find(slide => slide.id === 'factory-02');
  assert.match(definition.quote, /est[aá]ndar escrito/i);
  assert.match(definition.quote, /comprobaciones/i);
  // La política de autonomía es explícita: cuatro momentos de una persona y lo que siempre escala.
  const policy = slides.find(slide => slide.id === 'factory-17');
  assert.equal(policy.kind, 'table');
  assert.equal(policy.items.length, 5);
  const labels = policy.items.map(entry => entry.label).join(' | ');
  for (const moment of [/est[aá]ndar/i, /autonom[ií]a/i, /escalada/i, /incidente/i, /siempre escala/i]) {
    assert.match(labels, moment, labels);
  }
  // Lo que la política escala siempre, y el criterio que la alimenta después de un incidente.
  assert.match(policy.items.at(-1).detail, /pagos/i);
  assert.match(policy.items.at(-1).detail, /accesos/i);
  assert.match(policy.items.at(-1).detail, /irreversible/i);
  // Muestreo y métricas son control, no permiso: nadie revisa cada cambio.
  assert.match(policy.notes, /muestreo|m[eé]tricas/i);
});

test('un día normal en la fábrica: cinco paradas con hora y detalle llano', () => {
  const day = slides.find(s => /un d[ií]a en la f[aá]brica/i.test(s.title));
  assert.ok(day, 'diapositiva ausente');
  assert.equal(day.kind, 'timeline');
  assert.equal(day.items.length, 5);
  const all = `${day.lead} ${day.items.map(i => `${i.label} ${i.detail}`).join(' ')}`;
  // Mundana, no mágica: entra la orden, se escribe la spec, se construye, se revisa y se decide.
  assert.match(all, /martes|normal|rutina/i);
  // La quinta parada no es una decisión humana: la compuerta aplica la regla y escala la excepción.
  for (const stop of [/entra la orden/i, /spec|se escribe/i, /constru/i, /revisi[oó]n/i, /compuerta|est[aá]ndar/i]) assert.match(all, stop);
  assert.match(all, /escala|excepci[oó]n/i);
  assert.doesNotMatch(all, /decisi[oó]n humana|criterio humano|una persona decide/i);
  for (const entry of day.items) assert.match(entry.label, /\b\d\d:\d\d\b/);
  // Cinco horas de reloj distintas y en orden ascendente: es un día, no un diagrama abstracto.
  const clocks = day.items.map(entry => entry.label.match(/\d\d:\d\d/)[0]);
  assert.deepEqual(clocks, [...clocks].sort());
  assert.equal(new Set(clocks).size, 5);
  assert.doesNotMatch(all, /handoff|worktree|atribuci[oó]n de lote|\btoken\b/i);
});

test('qué problema resuelve y qué no, en lenguaje de negocio', () => {
  const business = slides.find(s => /qu[eé] problema resuelve/i.test(s.title));
  assert.ok(business, 'diapositiva ausente');
  assert.equal(business.kind, 'comparison');
  assert.equal(business.items.length, 3);
  const all = business.items.map(i => `${i.label} ${i.detail}`).join(' ');
  // Lo que mejora: espera, consistencia y conocimiento que sobrevive a las personas.
  assert.match(all, /espera/i);
  assert.match(all, /consistencia|consistente/i);
  assert.match(all, /conocimiento/i);
  assert.match(all, /personas|equipo/i);
  // Lo que no: la fábrica no elige qué construir; sin estándar escrito produce lo que nadie pidió.
  assert.match(all, /no elige qu[eé] construir/i);
  assert.match(all, /sin est[aá]ndar escrito/i);
  // Sin marketing: nada de superlativos ni promesas de velocidad mágica.
  assert.doesNotMatch(all, /revolucion|10x|milagro|garantiza|sin esfuerzo|disruptiv/i);
  assert.match(business.items.map(i => i.label).join(' '), /mejora/i);
  assert.match(business.items.map(i => i.label).join(' '), /no cambia/i);
});

test('la línea llana cubre la jerga mínima y no invade el resto del deck', () => {
  const plain = slides.filter(s => s.plain);
  // Coverage floor matters more than austerity: the glossary and the assistant/workflow/agent
  // slide now carry plain lines too, because they introduce the deck's own vocabulary.
  assert.ok(plain.length >= 8 && plain.length <= 16, `plain=${plain.length}`);
  // Cobertura obligatoria: orden de trabajo, estaciones, compuertas, bucle, estado,
  // política del aprobador, política de modelos, worktree y métricas.
  for (const id of ['factory-10', 'factory-11', 'factory-13', 'factory-15', 'factory-16',
    'factory-17', 'factory-18', 'factory-26', 'factory-33', 'factory-35']) {
    assert.ok(plain.some(s => s.id === id), `falta plain en ${id}`);
  }
  for (const slide of plain) {
    // Una sola frase, sin jerga sin traducir: es ayuda, no relleno.
    assert.equal((slide.plain.match(/[.!?]/g) || []).length, 1, `${slide.id}: ${slide.plain}`);
    assert.match(slide.plain, /\.$/, slide.id);
    assert.doesNotMatch(slide.plain, /handoff|worktree|compuerta|\bspec\b|backlog|pull request|\bmerge\b|\bdiff\b|\btoken\b|\blote\b|runner|\bestaci[oó]n\b|\bagente\b|\bmodelo\b/i, slide.id);
  }
});

test('el caso no se anuncia en el pie: se presenta con el ejemplo', () => {
  // Decisión del autor: el pie queda en autor y página; la reserva aparece en el capítulo del ejemplo.
  for (const slide of slides) assert.equal(slide.story, undefined, slide.id);
  const example = slides.filter(s => /cancel/i.test(JSON.stringify(s)));
  assert.ok(example.length >= 3, String(example.length));
});

test('el registro es español neutro, sin voseo ni regionalismos', () => {
  // Decisión del autor: el directo se dirige a una audiencia de varios países, así que el
  // texto usa español neutro. Se vigilan las marcas más fáciles de colar sin querer.
  // Only forms that are unambiguously voseo: unaccented pronouns and verbs, or accented
  // imperatives like "dejá". Plain third-person forms such as "deja" must keep passing.
  // Only unambiguously voseo forms: unaccented pronouns and verbs, or accented imperatives.
  // Plain third-person forms such as "deja" or "usa" must keep passing, so accents matter here.
  const voseo = /(\bvos\b|\bsos\b|\btenés\b|\bpodés\b|\bquerés\b|\bsabés\b|\bfijate\b|\bacordate\b|\bquedate\b|\bhacé\b|\bmirá\b|\bandá\b|\bdecí\b|\bponé\b|\bdejá\b|\bprobá\b|\btomá\b|\busá\b|\belegí\b|\bescribí\b|\bbuscá\b|\bagregá\b|\brevisá\b|\bpedí\b|\bmedí\b|\bpor vos\b|\bpara vos\b|\ba vos\b)/i;
  const regional = /\b(che|boludo|laburo|plata|guita|quilombo|copado|posta|garr[óo]n|ordenador|guay|chaval|coger|vale t[íi]o)\b/i;
  for (const slide of slides) {
    const fields = [slide.title, slide.lead, slide.plain, slide.quote, slide.notes,
      ...slide.items.flatMap(entry => [entry.label, entry.detail])].filter(Boolean);
    for (const text of fields) {
      assert.doesNotMatch(text, voseo, `${slide.id}: ${text}`);
      assert.doesNotMatch(text, regional, `${slide.id}: ${text}`);
    }
  }
});

test('portada en español con el alias inglés para la búsqueda', () => {
  const hero = slides[0];
  assert.equal(hero.kind, 'hero');
  assert.equal(hero.title, 'Fábrica de software con IA');
  assert.equal(hero.alias, 'AI Software Factory');
  assert.ok(!/[A-Z]{2,} SOFTWARE FACTORY/.test(hero.title));
  // La portada dibuja su propia planta animada: ya no lleva lámina raster.
  assert.equal(hero.figure, undefined);
  // Las tres palabras del autor son texto de escenario, no parte del dibujo.
  assert.deepEqual(hero.terms, ['Agentes', 'Automatización', 'Verificación']);
  assert.equal(new Set(hero.terms).size, 3);
  for (const term of hero.terms) assert.ok(!/[·•⋅]/.test(term), term);
  // Ninguna otra diapositiva declara la fila de palabras.
  assert.deepEqual(slides.filter(s => s.terms).map(s => s.id), ['factory-01']);
});

test('los ocho modos de fallo siguen presentes en el capítulo de riesgos', () => {
  const chapter = chapters.find(c => c.id === 'risks');
  assert.equal(chapter.slides.length, 5);
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

test('tres fallos reales de la fábrica como incidentes docentes', () => {
  const text = slides.map(s => `${s.title} ${s.lead} ${s.items.map(i => `${i.label} ${i.detail}`).join(' ')} ${s.notes}`).join('\n');
  // Árbol sucio, orden marcada como «necesita persona» sin acción y metadatos que bloquean el merge.
  assert.match(text, /[aá]rbol (?:de trabajo )?sucio/i);
  assert.match(text, /necesita (?:persona|intervenci[oó]n humana)/i);
  assert.match(text, /metadatos/i);
  assert.match(text, /impid\w* fusionar|impide fusionar/i);
  // Cada incidente deja una lección, no una burla.
  assert.match(text, /lecci[oó]n|escalar exige|versiona la configuraci[oó]n/i);
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
  assert.ok(approval.length <= 1, `aprobación/humano en titulares: ${approval.join(', ')}`);
  const stops = slides.filter(s => /\bSTOP\b|decisi[oó]n humana|control humano/i.test(`${s.title} ${s.lead}`)).map(s => s.id);
  assert.ok(stops.length <= 1, `paradas humanas en titulares: ${stops.join(', ')}`);
  // El flujo principal se explica con los verbos de producción, no con una compuerta humana al final.
  const spine = slides.map(s => `${s.title} ${s.lead}`).join(' ');
  assert.match(spine, /orden de trabajo/i);
  assert.match(spine, /integrar|integraci[oó]n/i);
  assert.match(spine, /medir|medici[oó]n|tiempo de ciclo|coste/i);
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
  // S9 renumbered the deck: the boundary table is now factory-29, because the definition,
  // the ordinary day and the problem/not slide came before it.
  const stageRules = slides.find(s => s.id === 'factory-29').items.map(i => `${i.label} ${i.detail}`).join(' ');
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

test('la pieza del flujo completo se lee dentro del diagrama, sin letra por debajo de 28 px', () => {
  // The closing diagram draws each detail at 28px in two 20-character lines. If a detail
  // stops fitting, the content is shortened: the type never shrinks to make room.
  const flow = slides.find(s => s.id === 'factory-33');
  assert.equal(flow.loopback, true);
  assert.equal(flow.kind, 'flow');
  assert.equal(flow.items.length, 5);
  for (const entry of flow.items) {
    assert.ok(words(entry.detail) <= 9, `${entry.label}: ${entry.detail}`);
    assert.ok(entry.detail.length <= 40, `${entry.label}: ${entry.detail}`);
    assert.ok(words(entry.label) <= 4, `${entry.label}`);
  }
  assert.deepEqual(flow.items.map(entry => entry.label),
    ['Entrada', 'Orden y spec', 'Construcción', 'Revisión y compuertas', 'Integración y operación']);
});

test('el día ilustrado cabe en el dibujo: cinco horas, rótulos cortos y la compuerta al final', () => {
  // The ordinary day is drawn, so its text has to fit three 22-character lines at 28px.
  // If a detail stops fitting, the wording is shortened: the type never shrinks.
  const day = slides.find(s => s.id === 'factory-08');
  assert.equal(day.kind, 'timeline');
  assert.equal(day.scene, 'day');
  // One switch now covers the three drawn slides: the day, the map and the gates.
  assert.deepEqual(slides.filter(s => s.scene).map(s => [s.id, s.scene]),
    [['factory-08', 'day'], ['factory-09', 'map'], ['factory-13', 'gates']]);
  assert.equal(day.items.length, 5);
  for (const entry of day.items) {
    const match = entry.label.match(/^(\d{2}:\d{2}), (.+)$/);
    assert.ok(match, entry.label);
    assert.ok(words(match[2]) <= 4, `${entry.label}`);
    assert.ok(entry.detail.length <= 68, `${entry.label}: ${entry.detail.length}`);
    assert.ok(words(entry.detail) <= 12, `${entry.label}: ${words(entry.detail)}`);
  }
  // La quinta parada es la compuerta aplicando la regla escrita: la excepción se escala.
  assert.match(day.items[4].label, /compuerta/i);
  assert.match(day.items[4].detail, /regla|est[aá]ndar/i);
  assert.match(day.items[4].detail, /escala|excepci[oó]n/i);
  assert.doesNotMatch(`${day.title} ${day.lead} ${day.items.map(i => `${i.label} ${i.detail}`).join(' ')}`,
    /persona|humano|decide|aprueba|aprobaci[oó]n/i);
  // Las horas son ilustrativas: la nota lo dice para que nadie las lea como medición.
  assert.match(day.notes, /ilustrativ/i);
});

test('el mapa de planta cabe en el dibujo: cuatro zonas con detalle corto y sin ramas inventadas', () => {
  // The map draws each zone detail on two 26-character lines at 28px. If a detail stops
  // fitting, the wording is shortened: the type never shrinks to make room.
  const map = slides.find(s => s.id === 'factory-09');
  assert.equal(map.kind, 'flow');
  assert.equal(map.scene, 'map');
  assert.equal(map.figure, undefined, 'el dibujo sustituye a la lámina');
  assert.equal(map.steps, undefined, 'el mapa no se revela por pasos: se anima solo');
  assert.equal(map.items.length, 4);
  assert.deepEqual(map.items.map(entry => entry.label), ['Entrada', 'Estaciones', 'Compuertas', 'Integración']);
  for (const entry of map.items) {
    assert.ok(words(entry.label) <= 2, entry.label);
    assert.ok(entry.detail.length <= 48, `${entry.label}: ${entry.detail.length}`);
    assert.ok(words(entry.detail) <= 7, `${entry.label}: ${words(entry.detail)}`);
  }
  // Las cuatro zonas siguen diciendo lo que la fábrica hace en cada una.
  const detail = map.items.map(entry => entry.detail).join(' ');
  assert.match(detail, /spec/i);
  assert.match(detail, /criterios/i);
  assert.match(detail, /superficie/i);
  assert.match(detail, /lote/i);
  assert.match(detail, /tipos/i);
  assert.match(detail, /pruebas/i);
  assert.match(detail, /contrato/i);
  assert.match(detail, /secuencia/i);
  assert.match(detail, /evidencia/i);
  assert.match(detail, /vuelta atr[aá]s/i);
  // El recorrido dibujado es el camino feliz: la nota lo dice para que nadie lea un rechazo.
  assert.match(map.notes, /compuertas/i);
  assert.doesNotMatch(detail, /rechaz|devuelv/i);
});

test('las compuertas dibujadas: tres controles de los ítems y la regla de toda la línea aparte', () => {
  // The drawing has room for three columns at 32px and two or three lines at 28px, plus the
  // rule of the line in its own caption slot. If something stops fitting, the wording is
  // shortened: the type never shrinks to make room.
  const lines = (text, max) => text.trim().split(/\s+/u).reduce((acc, word) => {
    const last = acc.length - 1;
    if (last >= 0 && acc[last].length + word.length + 1 <= max) acc[last] = `${acc[last]} ${word}`;
    else acc.push(word);
    return acc;
  }, []).length;
  const gates = slides.find(s => s.id === 'factory-13');
  assert.equal(gates.kind, 'flow');
  assert.equal(gates.scene, 'gates');
  assert.equal(gates.steps, undefined, 'el dibujo no se revela por pasos: se anima solo');
  assert.equal(gates.figure, undefined, 'el dibujo sustituye a la lámina');
  // Three controls and one rule: the fourth item is never drawn as a fourth gate.
  assert.equal(gates.items.length, 4);
  const [controls, rule] = [gates.items.slice(0, 3), gates.items[3]];
  assert.deepEqual(controls.map(entry => entry.label),
    ['Compilación y tipos', 'Pruebas del contrato', 'Integración continua']);
  assert.match(rule.label, /bloqueo real/i);
  assert.match(rule.detail, /detiene la l[ií]nea/i);
  assert.match(rule.detail, /decisi[oó]n registrada/i);
  for (const entry of controls) {
    assert.ok(entry.label.length <= 22, `${entry.label}: ${entry.label.length}`);
    assert.ok(lines(entry.detail, 26) <= 3, `${entry.label}: ${entry.detail}`);
  }
  // Los tres controles siguen diciendo qué comprueba cada uno.
  const detail = controls.map(entry => `${entry.label} ${entry.detail}`).join(' ');
  assert.match(detail, /tipos/i);
  assert.match(detail, /criterio de aceptaci[oó]n/i);
  assert.match(detail, /conjunto/i);
  // La nota enseña los dos casos y la regla: nada de excepciones automáticas.
  for (const part of [/supera/i, /falla/i, /no se ejecuta|sin ejecutar/i, /sin paso|no avanza/i,
    /decisi[oó]n registrada/i]) assert.match(gates.notes, part);
  assert.doesNotMatch(gates.notes, /excepci[oó]n autom[aá]tica|se salta sol|basta con ignorar/i);
  // La diapositiva conserva su línea llana y su fuente: el cambio es de composición.
  assert.equal(typeof gates.plain, 'string');
  assert.deepEqual(gates.sources, ['https://martinfowler.com/articles/continuousIntegration.html']);
});
