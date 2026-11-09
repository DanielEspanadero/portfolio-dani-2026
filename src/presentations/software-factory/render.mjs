/** Local compositions: content is always text; only this module owns markup. */
import { slides, chapters } from '../../content/software-factory/index.mjs';
import { renderPresentation as shell } from '../shared/render.mjs';
import { plantZones, PLANT_TEXT, PLANT_VIEW } from './plant-map.mjs';

const route = '/presentaciones/software-factory';
const origin = 'https://daniel-espanadero.com';
const artRoot = '/resources/software-factory-art';
export const escapeText = value => String(value).replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const e = escapeText;
const total = slides.length;
const pad = value => String(value).padStart(2, '0');
const kit = ['README.md', 'AGENTS.md', 'specs/cancel-booking.md', 'factory/worker.md',
  'factory/reviewer.md', 'factory/handoff.md', 'src/cancellation.mjs', 'tests/cancellation.test.mjs'];
// State files follow the kit layout; the slide items annotate each row.
const stateFiles = ['backlog.md', 'specs/*.md', 'board.md', '*.md'];
// Thin connectors draw in sequence on these three slides (fan-out feel). Ids, not positions:
// station specialisation, the loop, and the worktree lanes. Renumbering the deck must not
// move the draw-in animation onto unrelated slides.
const fanout = new Set(['factory-13', 'factory-15', 'factory-32']);
const chapterOf = slide => chapters.find(chapter => chapter.slides.includes(slide));
const stepped = slide => slide.steps || ['flow', 'loop', 'gate', 'parallel', 'circle'].includes(slide.kind);

function item(slide, entry, index, tag = 'article') {
  // The station frame and its label are always visible: a slide must never open with
  // an empty diagram area. Only the explanation is revealed step by step.
  return `<${tag} class="panel station">
    <span class="station-number" aria-hidden="true">${pad(index + 1)}</span>
    <h3>${e(entry.label)}</h3><p ${stepped(slide) ? 'data-step' : ''}>${e(entry.detail)}</p></${tag}>`;
}

/** The illustrated plate keeps its frame, box and caption strip when a file is missing. */
function plate(slide) {
  const { src, mode, alt } = slide.figure;
  return `<figure class="plate plate-${mode}" data-plate="${mode}">
    <img src="${artRoot}/${e(src)}" alt="${e(alt)}" width="1600" height="893" decoding="async">
    <span class="plate-frame" aria-hidden="true"></span>
    <figcaption class="plate-caption" aria-hidden="true"></figcaption>
  </figure>`;
}

/* === LOOPBACK FLOW: one drawn journey replaces the card row and the CSS pseudo-arc ===
   A single timeline drives the piece, its amber return and the station pulse, so the drawing
   cannot disagree with itself about when the piece is where. Seconds in, percentages out. */
const journeySeconds = 14;
const journeyTrack = [[0, 200, 190], [1, 200, 190], [2.4, 520, 190], [3.2, 520, 190],
  [4.6, 840, 190], [5.4, 840, 190], [6.8, 1160, 190], [7.6, 1160, 190], [9, 1480, 190],
  [9.8, 1480, 190], [10.6, 1650, 190], [11.2, 1650, 402], [13, 30, 402], [13.6, 30, 190],
  [14, 200, 190]];
const journeyArrival = [0, 2.4, 4.6, 6.8, 9];
// One timeline, one formatter: every drawing derives its percentages from the same seconds.
const percentOf = (seconds, total) => `${Number((seconds / total * 100).toFixed(2))}%`;
const framesOf = (total, rows) => rows.map(([seconds, ...rules]) => `${percentOf(seconds, total)}{${rules.join('')}}`).join('');
const flowFrames = rows => framesOf(journeySeconds, rows);
const flowPiece = flowFrames(journeyTrack.map(([seconds, x, y]) => [seconds, `transform:translate(${x}px,${y}px)`]));
const flowAmber = flowFrames([[0, 'color:var(--cyan)'], [10.6, 'color:var(--cyan)'], [11.2, 'color:var(--amber)'],
  [13.6, 'color:var(--amber)'], [14, 'color:var(--cyan)']]);
// Icons stay stroke-only so they still read on a phone: no glyphs, no fills to mud up.
const flowIcons = [
  '<path d="M-42 4H12L42 34V112H-42Z"/><path d="M12 4V34H42"/><path class="flow-hair" d="M-24 54H24M-24 74H8M-24 94H18"/>',
  '<rect x="-40" y="18" width="80" height="94" rx="10"/><rect x="-18" y="4" width="36" height="22" rx="8"/>'
    + '<path d="M-28 48l6 7 12-15"/><path class="flow-hair" d="M2 48h20"/><path d="M-28 74l6 7 12-15"/>'
    + '<path class="flow-hair" d="M2 74h20"/><path d="M-28 100l6 7 12-15"/><path class="flow-hair" d="M2 100h20"/>',
  '<rect x="-42" y="96" width="84" height="16" rx="6"/><path d="M0 96V80"/><circle cx="0" cy="80" r="8"/>'
    + '<path d="M0 80L-34 52"/><circle cx="-34" cy="52" r="8"/><path d="M-34 52L-4 24"/><circle cx="-4" cy="24" r="7"/>'
    + '<rect class="flow-amber" x="4" y="8" width="22" height="22" rx="5" transform="rotate(45 15 19)"/>',
  '<path d="M0 4L38 20V66Q38 100 0 112Q-38 100-38 66V20Z"/><path class="flow-amber" d="M-18 60L-4 76L20 46"/>',
  '<rect x="-50" y="10" width="100" height="74" rx="9"/><path class="flow-hair" d="M-38 72H38"/>'
    + '<path d="M-36 66L-18 66L-4 42L12 56L26 32L38 40"/><path d="M-14 84V98M14 84V98M-30 104H30"/>'
    + '<circle class="flow-amber" cx="44" cy="10" r="11"/><path class="flow-amber" d="M39 10l3 4 7-8"/>',
];

/** Deterministic word wrap: the type never shrinks, so the lines are placed, not reflowed. */
const wrapText = (text, max) => String(text).split(' ').reduce((lines, word) => {
  const current = lines[lines.length - 1];
  if (current && current.length + word.length + 1 <= max) lines[lines.length - 1] = `${current} ${word}`;
  else lines.push(word);
  return lines;
}, []);

/** The whole chain as one drawing: five stations, one piece, one amber return arc.
    Five columns are part of the drawing, and the content contract keeps exactly five items. */
function loopbackDiagram(slide) {
  const labelRows = [256, 292];
  const detailRows = [326, 358];
  const stations = slide.items.map((entry, index) => {
    const x = 200 + index * 320;
    const label = wrapText(entry.label, 14);
    const detail = wrapText(entry.detail, 20);
    const row = (name, lines, rows) => lines.map((line, line_index) =>
      `<text class="${name}" x="${x}" y="${rows[Math.min(line_index, rows.length - 1)]}">${e(line)}</text>`).join('');
    return `<g class="flow-node">
    <text class="flow-index" x="${x}" y="28" style="animation-delay:-${(journeySeconds - (journeyArrival[index] ?? 0)).toFixed(1)}s">${pad(index + 1)}</text>
    <g class="flow-icon" transform="translate(${x} 34) scale(1.12)">${flowIcons[index]}</g>
    <circle class="flow-dock" cx="${x}" cy="190" r="11"/>
    ${row('flow-label', label, labelRows)}${row('flow-detail', detail, detailRows)}
  </g>`;
  }).join('');
  const style = `<style>
    .flow-diagram text { stroke: none; font-family: 'Instrument Sans', sans-serif; text-anchor: middle; }
    .flow-index { font-family: 'JetBrains Mono', monospace; font-size: 28px; fill: var(--cyan); letter-spacing: 2px; animation: flow-status ${journeySeconds}s ease-in-out infinite; }
    .flow-label { font-size: 32px; font-weight: 600; fill: var(--paper); }
    .flow-detail { font-size: 28px; fill: #b3ced4; }
    .flow-caption { font-family: 'JetBrains Mono', monospace; font-size: 28px; fill: var(--amber); }
    .flow-rail { fill: none; stroke: #557077; stroke-width: 3; }
    .flow-dock { fill: none; stroke: var(--cyan); stroke-width: 3; }
    .flow-return { fill: none; stroke: var(--amber); stroke-width: 3; stroke-dasharray: 14 12; stroke-linecap: round; }
    .flow-return-tip { fill: none; stroke: var(--amber); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
    .flow-icon { fill: none; stroke: var(--cyan); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
    .flow-icon .flow-hair { stroke: #557077; stroke-width: 3; }
    .flow-icon .flow-amber { stroke: var(--amber); stroke-width: 4; }
    .flow-piece { color: var(--cyan); animation: flow-journey ${journeySeconds}s ease-in-out infinite, flow-feedback ${journeySeconds}s ease-in-out infinite; }
    .flow-piece rect { fill: currentColor; }
    .flow-piece path { fill: none; stroke: var(--slide-bg); stroke-width: 4; stroke-linecap: round; }
    @keyframes flow-journey { ${flowPiece} }
    @keyframes flow-feedback { ${flowAmber} }
    @keyframes flow-status { 0%, 6% { fill: var(--amber); } 9%, 100% { fill: var(--cyan); } }
  </style>`;
  const label = 'Flujo completo de una pieza: entra como issue, se convierte en criterios comprobables, '
    + 'se construye y se prueba aislada, pasa revisión y compuertas, y se despliega y se observa; '
    + 'un arco ámbar discontinuo devuelve la pieza al inicio como una nueva orden.';
  return `<svg class="flow-diagram" viewBox="0 0 1680 480" role="img" aria-label="${e(label)}">${style}
    <path class="flow-rail" d="M30 190H1650"/>
    <path class="flow-return" d="M1650 190V372Q1650 402 1620 402H60Q30 402 30 372V214"/>
    <path class="flow-return-tip" d="M21 214L30 198L39 214"/>
    <text class="flow-caption" x="840" y="452">Lo observado vuelve como una nueva orden</text>
    ${stations}
    <g class="flow-piece" aria-hidden="true" transform="translate(200 190)"><rect x="-17" y="-19" width="34" height="38" rx="7"/><path d="M-9 -8H9M-9 1H2M-9 10H6"/></g>
  </svg>`;
}

/* === ORDINARY DAY: factory-08 as one clock-like sweep, not five timeline cards ===
   The slide keeps kind timeline; `illustrated` replaces the card row. One 18s timeline drives
   the travelling marker, the sweep behind it and each moment's highlight, so the drawing and
   the motion cannot disagree about which moment is current. The hours are illustrative, and
   the last stop is the gate applying the written rule: amber belongs to the exception only. */
const daySeconds = 18;
const dayHold = 2.5;
const dayRail = 214;
const dayFirst = 168;
const dayLast = 1512;
const dayHoldEnd = Number((dayHold / daySeconds * 100).toFixed(2));
const dayRelease = Number((dayHoldEnd + 0.01).toFixed(2));
// Icons stay stroke-only so they still read on a phone: no glyphs, no fills to mud up.
const dayIcons = [
  '<path d="M-22 -30H14L22 -22V26A4 4 0 0 1 18 30H-18A4 4 0 0 1-22 26Z"/><path class="day-hair" d="M-12 -14H12M-12 -2H12M-12 10H2"/>',
  '<rect x="-24" y="-28" width="48" height="56" rx="7"/><path d="M-14 -12l4 5 9-11"/>'
    + '<path class="day-hair" d="M6 -12H16"/><path d="M-14 6l4 5 9-11"/><path class="day-hair" d="M6 6H16"/>'
    + '<path class="day-hair" d="M-14 22H16"/>',
  '<rect x="-30" y="-24" width="60" height="48" rx="8"/><path d="M-14 -8L-4 0L-14 8"/>'
    + '<path d="M14 -8L4 0L14 8"/><path class="day-hair" d="M-18 14H18"/>',
  '<rect x="-32" y="-22" width="28" height="44" rx="6"/><rect x="4" y="-22" width="28" height="44" rx="6"/>'
    + '<path d="M-26 -8l3 4 8-9"/><path d="M10 -8l3 4 8-9"/><path class="day-hair" d="M-26 10H-18M10 10H18"/>'
    + '<path class="day-hair" d="M-20 -30H20M0 -30V-22"/>',
  // La compuerta: un poste con la barra de paso, la misma idea que la compuerta del capítulo.
  // La excepción se dibuja aparte, en ámbar discontinuo, porque el ámbar pertenece solo a lo
  // que se sale de la regla escrita.
  '<path d="M-24 30V-22M-32 30H-16"/><path d="M-24 -14H24"/><path class="day-hair" d="M-2 -24V-4M8 -24V-4"/>',
];

/** The ordinary day as one drawing: five clock moments, one marker, one exception path.
    Five columns are part of the drawing, and the content contract keeps exactly five items. */
function dayDiagram(slide) {
  const count = slide.items.length;
  const step = (dayLast - dayFirst) / Math.max(count - 1, 1);
  const columns = slide.items.map((_, index) => Math.round(dayFirst + index * step));
  // Each moment owns one equal slice of the loop: the marker holds, then travels on.
  const arrivals = columns.map((_, index) => Number((index * daySeconds / count).toFixed(2)));
  const leaves = arrivals.map(seconds => Math.min(seconds + dayHold, daySeconds));
  const railWidth = dayLast - dayFirst;
  const track = (index, rules) => [[arrivals[index], rules(columns[index])], [leaves[index], rules(columns[index])]];
  const moveRows = columns.flatMap((_, index) => track(index, x => `transform:translate(${x}px,${dayRail}px)`));
  const sweepRows = columns.flatMap((_, index) => track(index, x => `stroke-dashoffset:${railWidth - (x - dayFirst)}`));
  const said = slide.items.map(entry => {
    const match = String(entry.label).match(/^(\d{2}:\d{2}),\s*(.+)$/);
    return match ? `${match[1]} ${match[2].toLowerCase()}` : String(entry.label);
  }).join(', ');
  const stations = slide.items.map((entry, index) => {
    const x = columns[index];
    const gate = index === count - 1;
    const match = String(entry.label).match(/^(\d{2}:\d{2}),\s*(.+)$/);
    const delay = (daySeconds - arrivals[index]).toFixed(1);
    const rows = (name, lines, starts) => lines.map((line, line_index) =>
      `<text class="${name}" x="${x}" y="${starts[Math.min(line_index, starts.length - 1)]}">${e(line)}</text>`).join('');
    return `<g class="day-stop${gate ? ' day-stop-gate' : ''}">
    ${gate ? `<rect class="day-chip" x="${x - 76}" y="24" width="152" height="44" rx="14"/>` : ''}
    <text class="day-clock" x="${x}" y="56" style="animation-delay:-${delay}s">${e(match ? match[1] : '')}</text>
    <g class="day-icon" transform="translate(${x} 130)">${dayIcons[index] ?? ''}</g>
    ${gate ? `<path class="day-escalate" d="M${x + 12} ${dayRail - 12}L${x + 72} ${dayRail - 52}"/>`
      + `<path class="day-escalate" d="M${x + 58} ${dayRail - 52}L${x + 72} ${dayRail - 52}L${x + 72} ${dayRail - 38}"/>` : ''}
    <circle class="day-dock" cx="${x}" cy="${dayRail}" r="8" style="animation-delay:-${delay}s"/>
    ${rows('day-label', wrapText(match ? match[2] : entry.label, 18), [276, 312])}
    ${rows('day-detail', wrapText(entry.detail, 22), [352, 388, 424])}
  </g>`;
  }).join('');
  const style = `<style>
    .day-diagram text { stroke: none; font-family: 'Instrument Sans', sans-serif; text-anchor: middle; }
    .day-clock { font-family: 'JetBrains Mono', monospace; font-size: 28px; fill: #b3ced4; letter-spacing: 2px; animation: day-clock ${daySeconds}s linear infinite; }
    .day-label { font-size: 32px; font-weight: 600; fill: var(--paper); }
    .day-detail { font-size: 28px; fill: #b3ced4; }
    .day-rail { fill: none; stroke: #557077; stroke-width: 3; }
    .day-sweep { fill: none; stroke: var(--cyan); stroke-width: 4; stroke-dasharray: ${railWidth}; animation: day-sweep ${daySeconds}s ease-in-out infinite; }
    .day-dock { fill: var(--slide-bg); stroke: var(--cyan); stroke-width: 3; animation: day-dock ${daySeconds}s linear infinite; }
    .day-icon { fill: none; stroke: var(--cyan); stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
    .day-icon .day-hair { stroke: #4f6b73; stroke-width: 3; }
    .day-marker { color: var(--cyan); animation: day-move ${daySeconds}s ease-in-out infinite; }
    .day-marker .day-halo { fill: var(--slide-bg); }
    .day-marker .day-core { fill: currentColor; }
    .day-stop-gate .day-chip { fill: none; stroke: var(--cyan); stroke-width: 2; }
    .day-stop-gate .day-escalate { fill: none; stroke: var(--amber); stroke-width: 4; stroke-dasharray: 9 7; stroke-linecap: round; stroke-linejoin: round; animation: day-escalate 4s linear infinite; }
    @keyframes day-move { ${framesOf(daySeconds, moveRows)} }
    @keyframes day-sweep { ${framesOf(daySeconds, sweepRows)} }
    @keyframes day-escalate { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -32; } }
    @keyframes day-clock { 0%, ${dayHoldEnd}% { fill: var(--paper); } ${dayRelease}%, 100% { fill: #b3ced4; } }
    @keyframes day-dock { 0%, ${dayHoldEnd}% { fill: var(--cyan); } ${dayRelease}%, 100% { fill: var(--slide-bg); } }
  </style>`;
  const label = `Un día en la fábrica, de 09:10 a 11:40: ${said}. En el último momento la compuerta aplica el estándar `
    + 'escrito; lo que no encaja se escala como excepción, marcada con una rama ámbar discontinua. '
    + 'Las horas son ilustrativas.';
  return `<svg class="day-diagram" viewBox="0 0 1680 480" role="img" aria-label="${e(label)}">${style}
    <path class="day-rail" d="M${dayFirst} ${dayRail}H${dayLast}"/>
    <path class="day-sweep" d="M${dayFirst} ${dayRail}H${dayLast}" aria-hidden="true"/>
    ${stations}
    <g class="day-marker" aria-hidden="true" transform="translate(${dayFirst} ${dayRail})"><circle class="day-halo" r="14"/><circle class="day-core" r="9"/></g>
  </svg>`;
}

/** The whole route as one drawing: four isometric zones, one batch, one prepared return.
    The zones are the slide's own items, and the drawing wraps their text, never shrinks it. */
function plantDiagram(slide) {
  const zones = plantZones(slide.items.length);
  const glyphs = slide.items.map((entry, index) => {
    const x = zones[index];
    const rows = (name, lines, starts) => lines.map((line, row) =>
      `<text class="${name}" x="${x}" y="${starts[Math.min(row, starts.length - 1)]}">${e(line)}</text>`).join('');
    return `<g class="plant-zone">
    <text class="plant-index" x="${x}" y="${PLANT_TEXT.index}">${pad(index + 1)}</text>
    ${rows('plant-label', wrapText(entry.label, PLANT_TEXT.wrap[0]), [PLANT_TEXT.label])}
    ${rows('plant-detail', wrapText(entry.detail, PLANT_TEXT.wrap[1]), PLANT_TEXT.detail)}
  </g>`;
  }).join('');
  const said = slide.items.map(entry => entry.label.toLowerCase()).join(', ');
  // The drawing is the content here, so it carries a name that describes the route and the
  // three controls. The motion inside it is decoration and stays hidden from assistive tech.
  const label = `Recorrido de una orden por la planta: ${said}. Se detiene bajo cada estación y en cada una de las tres compuertas, `
    + 'donde tipos, pruebas y contrato se activan en secuencia y solo entonces el lote avanza. '
    + 'En integración el conjunto se comprueba, la evidencia queda registrada y la vuelta atrás está preparada.';
  return `<div class="plant-map-host" data-plant-map data-zones="${zones.join(' ')}">
    <svg class="plant-map" viewBox="${PLANT_VIEW}" role="img" aria-label="${e(label)}">
    <g class="plant-parts" aria-hidden="true"></g>${glyphs}</svg></div>`;
}

/** SVG connectors stay behind the stations. A token exists only past a revealed station. */
function connectors(slide) {
  const id = e(slide.id);
  const count = slide.items.length;
  const cell = (1680 + 42) / count;
  const segment = (_, index) => {
    const start = (index + 1) * cell - 42;
    const end = (index + 1) * cell - 3;
    return `<path class="route-line" style="--i:${index}" d="M${start} 230H${end}" marker-end="url(#arrow-${id})"/>
      <path class="packet packet-${index + 1}" d="M${start} 230H${end}"/>`;
  };
  const links = Array.from({ length: count - 1 }, segment).join('');
  const parallel = `<path class="route-line" style="--i:0" d="M1200 80H1245V240H1283" marker-end="url(#arrow-${id})"/>
    <path class="route-line" style="--i:1" d="M1200 240H1283" marker-end="url(#arrow-${id})"/>
    <path class="route-line" style="--i:2" d="M1200 410H1245V240H1283" marker-end="url(#arrow-${id})"/>`;
  return `<svg class="connectors" viewBox="0 0 1680 480" aria-hidden="true">
    <defs><marker id="arrow-${id}" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2 2L10 6L2 10" fill="none" stroke="currentColor" stroke-width="2"/></marker></defs>
    ${slide.kind === 'parallel' ? parallel : links}
  </svg>`;
}

/** The gate token rolls once and rests before the barrier; advancing is not approving. */
function gateTrack() {
  return `<svg viewBox="0 0 1680 46" aria-hidden="true">
    <path class="route-line" d="M0 23H1490"/>
    <path class="packet gate-packet" d="M0 23H1490"/>
    <path class="gate-stop" d="M1496 4V42"/>
  </svg><span class="gate-stop-label">Lote pendiente de integrar</span>`;
}

/** Closed circle: three forward arcs and one animated return arc on the measured ring. */
function ring(slide) {
  const id = e(slide.id);
  const marker = `url(#arrow-${id})`;
  const labels = slide.items.map((entry, index) => `<div class="ring-label ring-label-${index} panel">
      <span class="station-number" aria-hidden="true">${pad(index + 1)}</span>
      <h3>${e(entry.label)}</h3><p data-step>${e(entry.detail)}</p></div>`).join('');
  return `<div class="circle-loop">
    <svg class="ring" viewBox="0 0 1680 480" aria-hidden="true">
      <defs><marker id="arrow-${id}" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2 2L10 6L2 10" fill="none" stroke="currentColor" stroke-width="2"/></marker></defs>
      <ellipse class="ring-track" cx="840" cy="240" rx="600" ry="205"/>
      <path class="ring-flow" d="M416 95A600 205 0 0 1 1264 95" marker-end="${marker}"/>
      <path class="ring-flow" d="M1264 95A600 205 0 0 1 1264 385" marker-end="${marker}"/>
      <path class="ring-flow" d="M1264 385A600 205 0 0 1 416 385" marker-end="${marker}"/>
      <path class="ring-return" d="M416 385A600 205 0 0 1 416 95" marker-end="${marker}"/>
      ${[[416, 95], [1264, 95], [1264, 385], [416, 385]].map(([x, y]) => `<circle class="ring-node" cx="${x}" cy="${y}" r="8"/>`).join('')}
    </svg>${labels}
  </div>`;
}

function loopReturn() {
  return `<div class="loop-return"><span class="return-sweep" aria-hidden="true"></span>
    <span class="rounds">máx. 3 rondas</span></div>`;
}

function composition(slide) {
  const items = slide.items.map((entry, index) => item(slide, entry, index)).join('');
  const hasFanout = fanout.has(slide.id) ? ' fanout' : '';
  // A loopback flow is one continuous journey: the drawing replaces the station cards.
  if (slide.loopback) return `<div class="diagram flow loopback">${loopbackDiagram(slide)}</div>`;
  // The ordinary day is the same idea for a timeline: the flag replaces the card row.
  if (slide.illustrated && slide.kind === 'timeline') return `<div class="diagram day">${dayDiagram(slide)}</div>`;
  // The plant map is the same switch for a flow: the route replaces the station row.
  if (slide.illustrated && slide.kind === 'flow') return `<div class="diagram flow plant">${plantDiagram(slide)}</div>`;
  switch (slide.kind) {
    case 'hero':
      // The plant is generated at runtime: the document only reserves its decorative box.
      return `<div class="hero-scene" data-hero-scene aria-hidden="true"></div><svg class="hero-route" viewBox="0 0 1680 40" aria-label="Línea de producción de tres estaciones" role="img"><path d="M0 20H1660M530 10L550 20L530 30M1090 10L1110 20L1090 30" fill="none" stroke="#94c9d2" stroke-width="3"/></svg><div class="hero-line main-panels">${items}</div>`;
    case 'timeline':
      return `<div class="timeline main-panels" style="--count:${slide.items.length}">${items}</div>`;
    case 'comparison':
      return `<div class="comparison main-panels" style="--count:${slide.items.length}">${items}</div>`;
    case 'flow': case 'loop':
      return `<div class="diagram ${slide.kind}${hasFanout}">${connectors(slide)}<div class="stations main-panels" style="--count:${slide.items.length}">${items}</div>${slide.kind === 'loop' ? loopReturn() : ''}</div>`;
    case 'gate':
      return `<div class="gate-layout">
        <div class="gate-banner">Compuerta de integración, aplica el estándar y devuelve lo que no cumple<span class="gate-arm" aria-hidden="true"></span></div>
        <div class="gate main-panels" style="--count:${slide.items.length}">${items}</div>
        <div class="gate-track">${gateTrack()}</div></div>`;
    case 'risk':
      return `<div class="risk main-panels">${items}</div>`;
    case 'circle':
      return ring(slide);
    case 'files':
      return `<div class="files main-panels"><p class="files-root"><span aria-hidden="true">▾</span> software-factory/</p>
        <ol class="tree">${slide.items.map((entry, index) => `<li class="file-row">
          <span class="file-path"><span aria-hidden="true">${index === slide.items.length - 1 ? '└──' : '├──'}</span> ${e(stateFiles[index] || '*.md')}</span>
          <div class="file-note"><h3>${e(entry.label)}</h3><p>${e(entry.detail)}</p></div></li>`).join('')}</ol></div>`;
    case 'code':
      return `<div class="code-layout main-panels"><pre class="panel code-panel"><code>${e(slide.code || '')}</code></pre>
        <div class="callouts">${items}</div></div>`;
    case 'table':
      return `<table class="boundary-table" data-rows="${slide.items.length}"><caption class="sr-only">${e(slide.title)}</caption><thead><tr><th scope="col">Entrada / criterio</th><th scope="col">Resultado / significado</th></tr></thead>
        <tbody>${slide.items.map(entry => `<tr class="panel"><th scope="row">${e(entry.label)}</th><td>${e(entry.detail)}</td></tr>`).join('')}</tbody></table>`;
    case 'quote':
      // The definition is one oversized sentence plus three short keys: no numbered chips.
      return `<div class="quote"><p class="quote-statement">${e(slide.quote || '')}</p>
        <ul class="quote-keys">${slide.items.map(entry => `<li class="panel quote-key"><h3>${e(entry.label)}</h3><p>${e(entry.detail)}</p></li>`).join('')}</ul></div>`;
    case 'parallel':
      return `<div class="parallel main-panels${hasFanout}"><div class="lanes">${items}</div><aside class="integration panel"><h3>Integración compartida</h3><p>Contrato + pruebas del conjunto.</p><strong>Cierra el lote antes de operar</strong></aside></div>`;
    case 'exercise':
      return `<div class="workshop"><aside class="workshop-sign"><span>${slide.pause ? 'CHAT' : 'TALLER'}</span><p>Piensa, contrasta y explica</p></aside><div class="exercise main-panels">${items}</div></div>`;
    case 'closing':
      return `<div class="closing main-panels">${items}</div>`;
    default:
      return `<div class="checklist main-panels${hasFanout}">${items}</div>`;
  }
}

function renderSlide(slide, index) {
  const chapter = chapterOf(slide);
  const heading = index === 0 ? 'h1' : 'h2';
  const classes = ['slide', `kind-${slide.kind}`, ...(slide.figure ? ['has-plate'] : [])];
  // The hero states the English term as its own alias line, so the running header carries
  // only the Spanish chapter context: the audience reads the concept first, the term second.
  const eyebrow = index === 0 ? e(chapter.title) : `AI SOFTWARE FACTORY / ${e(chapter.title)}`;
  return `<section class="${classes.join(' ')}" data-slide="${index + 1}" data-kind="${e(slide.kind)}" id="${e(slide.id)}" data-title="${e(slide.title)}" data-chapter="${e(chapter.title)}" aria-labelledby="title-${e(slide.id)}">
    ${slide.figure?.mode === 'wash' ? plate(slide) : ''}<div class="registration" aria-hidden="true"></div>
    <header class="slide-heading"><p class="eyebrow">${eyebrow}</p>
    <${heading} id="title-${e(slide.id)}">${e(slide.title)}</${heading}>${slide.alias ? `<p class="hero-alias">${e(slide.alias)}</p>` : ''}<p class="lead">${e(slide.lead)}</p>${slide.terms ? `<ul class="hero-terms">${slide.terms.map(term => `<li>${e(term)}</li>`).join('')}</ul>` : ''}${slide.plain ? `<p class="plain">${e(slide.plain)}</p>` : ''}</header>
    <div class="composition">${composition(slide)}${slide.figure && slide.figure.mode !== 'wash' ? plate(slide) : ''}</div>
    <footer class="slide-footer"><span class="footer-author">Daniel Españadero</span><span class="footer-page">${pad(index + 1)} / ${pad(total)}</span></footer>
  </section>`;
}

function sources(slide) {
  return (slide.sources || []).map(source => {
    // Only absolute web citations are links; all other strings remain inert text.
    const safe = /^https?:\/\//.test(source);
    return `<li>${safe ? `<a href="${e(source)}" rel="noreferrer">${e(source)}</a>` : e(source)}</li>`;
  }).join('');
}

export function renderPresentation({ css, controller, offline = false }) {
  const html = shell({
    slides: slides.map(renderSlide).join('\n'), css, controller, offline,
    canonical: `${origin}${route}`, title: 'Fábrica de software con IA (AI Software Factory): qué es y cómo construir una | Daniel Españadero',
    description: `Fábrica de software con IA (AI Software Factory) en ${total} diapositivas: definición en lenguaje llano, historia, estaciones de trabajo, agentes, riesgos, desarrollo paralelo y taller local para crear la tuya.`,
    chapterDefault: chapters[0].title,
  });
  return html;
}

/** The reading view deliberately has its own responsive, printable document. */
export function renderGuide({ css = '' } = {}) {
  const title = 'Guía de fábrica de software con IA (AI Software Factory) y kit práctico | Daniel Españadero';
  const description = `Notas completas de las ${total} diapositivas sobre fábricas de software con IA, fuentes y kit local sin proveedor para practicar contratos y pruebas.`;
  const canonical = `${origin}${route}/guia`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title><meta name="description" content="${description}"><link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="article">
    <meta property="og:image" content="${origin}/og/default-og-image.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${origin}/og/default-og-image.png">
    <style>${css}</style></head><body class="guide"><main><a href="${route}">← Abrir presentación</a>
    <h1>Fábrica de software con IA: guía para enseñar y practicar (AI Software Factory)</h1><p>Notas completas de las ${total} diapositivas, fuentes y un kit local para repetir el ejemplo. El ejercicio es didáctico: no es una aplicación de reservas lista para producción.</p>
    <section aria-labelledby="kit-title"><h2 id="kit-title">Kit local, sin proveedor</h2><p>Node ≥22, sin instalar dependencias ni usar credenciales. Descarga el ZIP y extrae la carpeta; lee README.md. Desde su raíz: <code>node --test tests/cancellation.test.mjs</code>.</p>
    <p><a download href="/resources/software-factory-kit.zip">Descargar kit completo ZIP</a> y <a download href="${route}/descargar.html">Presentación HTML sin conexión</a></p>
    <p>El HTML incluye fuentes, estilos y diagramas; las ilustraciones y las notas se leen en esta guía, con conexión. Alternativa sin red: guarda estos ocho archivos conservando las carpetas:</p>
    <ul>${kit.map(file => `<li><a download href="/resources/software-factory/${file}">${file}</a></li>`).join('')}</ul>
    <p>Los eventos de devolución son simulados. No hay pagos, autenticación, persistencia ni concurrencia: integrar y publicar siguen siendo pasos separados con sus propias comprobaciones.</p></section>
    <nav aria-label="Capítulos"><h2>Recorrido</h2><ol>${chapters.map(ch => `<li><a href="#${ch.id}">${e(ch.title)}</a></li>`).join('')}</ol></nav>
    ${chapters.map(ch => `<section id="${ch.id}"><h2 class="chapter-title">${e(ch.title)}</h2>${ch.slides.map(slide => {
      const index = slides.indexOf(slide);
      return `<article id="${e(slide.id)}"><h3><a href="${route}#${index + 1}">${index + 1}. ${e(slide.title)}</a></h3><p class="guide-lead">${e(slide.lead)}</p>${slide.quote ? `<p><strong>${e(slide.quote)}</strong></p>` : ''}<ul>${slide.items.map(entry => `<li><strong>${e(entry.label)}:</strong> ${e(entry.detail)}</li>`).join('')}</ul>
      ${slide.code ? `<pre><code>${e(slide.code)}</code></pre>` : ''}<p>${e(slide.notes)}</p>${slide.sources?.length ? `<h4>Fuentes</h4><ul>${sources(slide)}</ul>` : ''}</article>`;
    }).join('')}</section>`).join('')}</main></body></html>`;
}
