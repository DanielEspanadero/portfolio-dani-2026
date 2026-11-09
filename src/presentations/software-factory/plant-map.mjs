/**
 * Plant map for factory-09: the author's four-zone route, redrawn for this deck.
 *
 * The source delivered outside this repository (mapa-planta.html) is procedural: one
 * `frame(t)` function over a 20 s cycle. So it is ported, not copied. The author's idea and
 * drawing language stay: four isometric islands on one unbroken belt, one order piece that
 * stops under each arm, three controls that fire in sequence before the batch advances, and
 * the assembled set, its evidence and a prepared rollback at integration. Everything else is
 * this deck's: the geometry is derived from the number of zones the slide declares, the type
 * and the palette come from the deck tokens, the markup is rendered by the deck (labels and
 * details are real `<text>`), and the source's eyebrow, title, subtitle and pause button are
 * gone because the slide already renders its heading and this deck carries no extra chrome.
 *
 * The route shown is the happy path. The drawing never depicts a rejection branch it does
 * not have: the only return it draws is the rollback prepared at integration.
 *
 * One timeline drives every moving part, so the piece and the controls cannot disagree about
 * when the batch is where. Activation, page visibility, the frame budget, the still frame
 * under reduced motion and disposal come from `scene-governor.mjs`, shared with the hero.
 */
import { mountGovernedScene } from './scene-governor.mjs';

export const PLANT_SELECTOR = '[data-plant-map]';
export const PLANT_VIEW = '0 0 1680 480';
export const PLANT_SECONDS = 20;
/** The document reserves the drawing's own width, so a stage px is a viewBox unit. */
export const PLANT_WIDTH = 1680;
/** One zone per slide item: entrance, stations, gates, integration. */
export const PLANT_COUNT = 4;
/** The reduced-motion frame: the batch held at the second control, the first already passed,
    so the still shows a route in progress instead of four empty islands. */
export const PLANT_STILL = 11.5 / PLANT_SECONDS;
/** Where the zone text sits inside the viewBox. The renderer places the glyphs. */
export const PLANT_TEXT = { index: 34, label: 352, detail: [392, 424, 456], wrap: [18, 26] };

/* === PALETTE: deck tokens only, every grey mixed towards the deepest shadow ===
   The source carried dozens of published hexes. Here the literals are the tokens and the
   rest is derived, so the drawing cannot drift away from the deck it sits in. */
const MAP_CYAN = '#94c9d2';
const MAP_AMBER = '#ffc36a';
const MAP_INK = '#e9eeeb';
const MAP_HAIR = '#557077';
const MAP_HAIR_SOFT = '#4f6b73';
const MAP_DEEP = '#101719';
const mapChannels = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
const mapShade = (base, weight) => {
  const from = mapChannels(base);
  const to = mapChannels(MAP_DEEP);
  return `#${from.map((value, index) => Math.round(value + (to[index] - value) * weight)
    .toString(16).padStart(2, '0')).join('')}`;
};
const MAP_TONE = {
  plinth: [mapShade(MAP_CYAN, .56), mapShade(MAP_CYAN, .82), mapShade(MAP_CYAN, .7)],
  deck: [mapShade(MAP_CYAN, .46), mapShade(MAP_CYAN, .74), mapShade(MAP_CYAN, .62)],
  body: [mapShade(MAP_CYAN, .4), mapShade(MAP_CYAN, .68), mapShade(MAP_CYAN, .56)],
  metal: [mapShade(MAP_INK, .38), mapShade(MAP_INK, .64), mapShade(MAP_INK, .52)],
  glass: [mapShade(MAP_CYAN, .34), mapShade(MAP_CYAN, .62), mapShade(MAP_CYAN, .5)],
};
const MAP_ARM = mapShade(MAP_INK, .55);
const MAP_ARM_LIGHT = mapShade(MAP_INK, .2);
const MAP_BELT = mapShade(MAP_CYAN, .72);
const MAP_ROLLER = mapShade(MAP_CYAN, .46);

/* === GEOMETRY: isometric zone islands, one horizontal belt, one route ===
   The belt runs at the front edge of every island, so the plant floors stay readable above it
   and the batch travels in front of the machinery that works on it. */
const MAP_DECK = 206; // projection origin: the belt sits one island edge lower
const MAP_BELT_TOP = 244;
const mapRound = value => Number(value.toFixed(2));
/** x to the right, y into the depth, z up, relative to the island's own centre. */
const MP = (cx, x, y, z = 0) => [cx + .82 * x - .54 * y, MAP_DECK + .2 * x + .18 * y - z];
const mapPoints = list => list.map(point => point.map(mapRound).join(',')).join(' ');
const mapFace = (outline, fill, edge = MAP_HAIR, width = 1.5) =>
  `<polygon points="${mapPoints(outline)}" fill="${fill}" stroke="${edge}" stroke-width="${width}" stroke-linejoin="round"/>`;
const mapLine = (from, to, color = MAP_CYAN, width = 2) =>
  `<path d="M${from.map(mapRound).join(' ')} L${to.map(mapRound).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
/** One extruded box: top face, right side and front side, in that paint order. */
function mapCube(cx, x, y, z, w, d, h, tone = MAP_TONE.body, edge = MAP_HAIR) {
  const topA = MP(cx, x, y, z + h);
  const topB = MP(cx, x + w, y, z + h);
  const topC = MP(cx, x + w, y + d, z + h);
  const topD = MP(cx, x, y + d, z + h);
  const lowB = MP(cx, x + w, y, z);
  const lowC = MP(cx, x + w, y + d, z);
  const lowD = MP(cx, x, y + d, z);
  return mapFace([topA, topB, topC, topD], tone[0], edge)
    + mapFace([topB, lowB, lowC, topC], tone[1], edge)
    + mapFace([topD, topC, lowC, lowD], tone[2], edge);
}

/** Zone centres: the drawing's own columns, derived from how many zones the slide declares. */
export const plantZones = count => Array.from({ length: count },
  (_, index) => Math.round(PLANT_WIDTH / count * (index + .5)));

/* === TIMELINE: seven stops, three of them controls ===
   The batch dwells at every stop, so a control always fires while the batch is held, and
   the batch only leaves a control after that control has fired. */
const PLANT_TRAVEL = 1.15;
const PLANT_HOLD = 1.35;
export const PLANT_TIMING = { travel: PLANT_TRAVEL, hold: PLANT_HOLD };
const PLANT_INLET = 56;
const PLANT_OUTLET = 1624;
const arrivalOf = index => (index + 1) * PLANT_TRAVEL + index * PLANT_HOLD;

/** Where the batch stops: the entrance, both arms, the three controls, integration. */
export const plantStops = zones => [zones[0], zones[1] - 70, zones[1] + 70,
  zones[2] - 80, zones[2], zones[2] + 80, zones[3]];

const plantKeys = zones => {
  const stops = plantStops(zones);
  const keys = [[0, PLANT_INLET]];
  stops.forEach((x, index) => {
    keys.push([arrivalOf(index), x], [arrivalOf(index) + PLANT_HOLD, x]);
  });
  keys.push([arrivalOf(stops.length), PLANT_OUTLET], [PLANT_SECONDS, PLANT_OUTLET]);
  return keys;
};

/** Eased travel between stops, no easing inside a dwell. */
const plantX = (seconds, keys) => {
  for (let index = 0; index < keys.length - 1; index += 1) {
    const [from, start] = keys[index];
    const [to, end] = keys[index + 1];
    if (seconds < from || seconds > to) continue;
    const raw = to === from ? 1 : (seconds - from) / (to - from);
    const eased = raw * raw * (3 - 2 * raw);
    return start + (end - start) * eased;
  }
  return keys[keys.length - 1][1];
};

/** One instant of the cycle: where the batch is, which arm works and which control fired. */
export function plantState(progress, zones) {
  const seconds = (((progress % 1) + 1) % 1) * PLANT_SECONDS;
  const stops = plantStops(zones);
  const x = plantX(seconds, plantKeys(zones));
  const arms = [1, 2].map(index => {
    const from = arrivalOf(index);
    return { active: seconds >= from && seconds < from + PLANT_HOLD,
      phase: Math.min(1, Math.max(0, (seconds - from) / PLANT_HOLD)) };
  });
  const gates = [3, 4, 5].map(index => {
    const from = arrivalOf(index);
    const fire = from + PLANT_HOLD * .62;
    return { x: stops[index], fired: seconds >= fire,
      scanning: seconds >= fire - .5 && seconds < fire + .12,
      phase: Math.min(1, Math.max(0, (seconds - (fire - .5)) / .62)) };
  });
  const column = PLANT_WIDTH / zones.length;
  const phase = Math.min(zones.length - 1, Math.max(0, Math.floor(x / column)));
  // The ports occlude the cycle's restart: the batch fades in and out instead of jumping.
  const fade = Math.min(1, seconds / .5, (PLANT_SECONDS - seconds) / .4);
  return { seconds, x, phase, arms, gates, opacity: Math.max(0, fade) };
}

/* === THE FOUR ZONES: the entrance, the arms, the controls and integration === */
const mapIsland = cx => {
  // Two levels: a wide base and a raised floor, so the island reads as a platform.
  let markup = mapCube(cx, -134, -64, -34, 268, 128, 18, MAP_TONE.plinth, MAP_HAIR);
  markup += mapCube(cx, -122, -56, -16, 244, 112, 16, MAP_TONE.plinth, MAP_HAIR);
  markup += mapLine(MP(cx, -108, 46, 0), MP(cx, 108, 46, 0), MAP_CYAN, 2.5);
  for (const x of [-84, -28, 28, 84]) markup += mapLine(MP(cx, x, 22, 0), MP(cx, x, 44, 0), MAP_HAIR_SOFT, 1.5);
  return markup;
};

/** Entrada: the work order stands on the deck while the batch becomes an order. */
const mapIntake = cx => {
  const x = cx + 30;
  // The order leans on its own crate: the panel alone read as a floating sheet.
  let markup = mapCube(cx, -30, -40, 0, 90, 60, 46, MAP_TONE.deck);
  markup += `<rect x="${x}" y="92" width="96" height="112" rx="7" fill="${mapShade(MAP_CYAN, .8)}" stroke="${MAP_CYAN}" stroke-width="2"/>`;
  markup += `<path d="M${x + 76} 92 L${x + 96} 112 L${x + 76} 112 Z" fill="${mapShade(MAP_CYAN, .58)}" stroke="${MAP_CYAN}" stroke-width="1.5" stroke-linejoin="round"/>`;
  for (let row = 0; row < 3; row += 1) {
    markup += mapLine([x + 16, 128 + row * 21], [x + 72 - row * 11, 128 + row * 21], MAP_CYAN, 2.5);
  }
  markup += `<path d="M${x + 16} 190 l9 10 19 -24" fill="none" stroke="${MAP_CYAN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  return markup;
};

/** Two arms over the belt: the work amplitude is the dwell, and amber marks the one working. */
function mapArm(cx, offset, work) {
  const pulse = work.active ? Math.sin(Math.PI * work.phase) : 0;
  const base = MP(cx, offset, -30, 76);
  const elbow = MP(cx, offset + 20, -6, 130 - 12 * pulse);
  const wrist = MP(cx, offset - 14, 40, -18 - 12 * pulse);
  const accent = work.active ? MAP_AMBER : MAP_CYAN;
  let markup = mapCube(cx, offset - 34, -56, 0, 68, 64, 52, MAP_TONE.metal);
  for (const [from, to] of [[base, elbow], [elbow, wrist]]) {
    markup += mapLine([from[0] + 4, from[1] + 4], [to[0] + 4, to[1] + 4], MAP_DEEP, 26);
    markup += mapLine(from, to, MAP_ARM, 20);
    markup += mapLine([from[0] - 3, from[1] - 2], [to[0] - 3, to[1] - 2], MAP_ARM_LIGHT, 1.8);
  }
  [base, elbow, wrist].forEach((joint, index) => {
    const radius = index === 2 ? 10 : 15;
    const x = mapRound(joint[0]);
    const y = mapRound(joint[1]);
    markup += `<circle cx="${x}" cy="${y}" r="${radius + 3}" fill="${MAP_DEEP}" stroke="${MAP_HAIR}" stroke-width="1.5"/>`
      + `<circle cx="${x}" cy="${y}" r="${radius - 3}" fill="${mapShade(MAP_CYAN, .5)}" stroke="${accent}" stroke-width="2"/>`;
  });
  const tip = MP(cx, offset - 14, 56, -34 - 12 * pulse);
  markup += mapLine(wrist, tip, MAP_HAIR, 5);
  markup += mapLine([tip[0] - 14, tip[1] - 2], [tip[0] - 14, tip[1] - 16], accent, 3.5);
  markup += mapLine([tip[0] + 14, tip[1] - 2], [tip[0] + 14, tip[1] - 16], accent, 3.5);
  markup += mapLine([tip[0] - 14, tip[1] - 2], [tip[0] + 14, tip[1] - 2], MAP_HAIR, 3);
  return markup;
}

const mapStations = (cx, state) => [-70, 70]
  .map((offset, index) => mapArm(cx, offset, state.arms[index])).join('');

/** Compuertas: three portals behind the belt, one per control, in sequence. */
const mapGateFrames = cx => [-80, 0, 80].map(offset => {
  const x = cx + offset;
  // Rear post, slanted top and lintel: a portal frame the batch passes through.
  return `<rect x="${x + 22}" y="112" width="12" height="126" rx="4" fill="${mapShade(MAP_CYAN, .8)}" stroke="${MAP_HAIR}" stroke-width="1.5"/>`
    + `<polygon points="${x - 28},${104} ${x + 22},${91} ${x + 34},${91} ${x - 16},${104}" fill="${mapShade(MAP_CYAN, .66)}" stroke="${MAP_HAIR}" stroke-width="1.5" stroke-linejoin="round"/>`
    + `<rect x="${x - 28}" y="104" width="62" height="14" rx="4" fill="${mapShade(MAP_CYAN, .56)}" stroke="${MAP_HAIR}" stroke-width="1.5"/>`;
}).join('');

/** A control's lamp and rod turn amber only once that control fires, in order. */
const mapGateFronts = (cx, state) => state.gates.map((gate, index) => {
  const offset = [-80, 0, 80][index];
  const x = cx + offset;
  const accent = gate.fired ? MAP_AMBER : MAP_CYAN;
  let markup = `<rect x="${x - 28}" y="118" width="12" height="132" rx="4" fill="${mapShade(MAP_CYAN, .8)}" stroke="${MAP_HAIR}" stroke-width="1.5"/>`;
  markup += `<circle class="plant-gate${gate.fired ? ' plant-gate-passed' : ''}" cx="${x + 3}" cy="84" r="7" fill="${gate.fired ? MAP_AMBER : MAP_DEEP}" stroke="${accent}" stroke-width="2.5"/>`;
  markup += mapLine([x - 22, 132], [x - 22, 244], accent, 3.5);
  if (gate.scanning) {
    markup += `<rect x="${x - 20}" y="228" width="40" height="48" fill="${MAP_CYAN}" opacity=".12"/>`
      + `<rect x="${x - 20}" y="${mapRound(228 + 42 * gate.phase)}" width="40" height="7" rx="3.5" fill="${MAP_CYAN}" opacity=".6"/>`;
  }
  return markup;
}).join('');

/** Integración: the assembled set, its evidence and the rollback it keeps ready. */
function mapIntegration(cx, state) {
  const settled = state.phase === 3;
  const accent = settled ? MAP_AMBER : MAP_CYAN;
  let markup = mapCube(cx, -86, -50, 0, 94, 66, 48, MAP_TONE.body)
    + mapCube(cx, -78, -44, 48, 42, 42, 34, MAP_TONE.glass)
    + mapCube(cx, -32, -44, 48, 42, 42, 34, MAP_TONE.glass)
    + mapCube(cx, -55, -40, 82, 42, 42, 34, MAP_TONE.glass, accent);
  const panel = cx + 38;
  markup += `<rect x="${panel}" y="96" width="68" height="82" rx="5" fill="${mapShade(MAP_CYAN, .82)}" stroke="${accent}" stroke-width="2"/>`;
  for (let row = 0; row < 3; row += 1) {
    const y = 114 + row * 24;
    markup += `<path d="M${panel + 10} ${y} l5 6 10 -13" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    markup += mapLine([panel + 34, y], [panel + 58, y], accent, 2);
  }
  return markup;
}

/** A dotted amber arc beside the evidence: what was integrated can be taken back out.
    It is drawn as prepared, not as taken: this slide shows the happy path only. */
const mapRollback = cx =>
  `<path d="M${cx + 96} 254 C${cx + 148} 250 ${cx + 152} 210 ${cx + 118} 186" fill="none" stroke="${MAP_AMBER}" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>`
  + `<path d="M${cx + 108} 192 L${cx + 118} 186 L${cx + 124} 197" fill="none" stroke="${MAP_AMBER}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

/** The belt: one unbroken run with rollers, its ends occluded by the machine ports. */
function mapBelt() {
  let markup = `<rect x="44" y="${MAP_BELT_TOP}" width="1592" height="28" rx="8" fill="${MAP_BELT}" stroke="${MAP_HAIR_SOFT}" stroke-width="1.5"/>`;
  markup += mapLine([48, MAP_BELT_TOP + 4], [1632, MAP_BELT_TOP + 4], MAP_CYAN, 1.5);
  const centre = MAP_BELT_TOP + 14;
  for (let x = 60; x <= 1620; x += 40) {
    markup += `<circle cx="${x}" cy="${centre}" r="4" fill="${MAP_ROLLER}" stroke="${MAP_HAIR_SOFT}" stroke-width="1"/>`;
  }
  markup += `<rect x="12" y="228" width="32" height="64" rx="8" fill="${mapShade(MAP_CYAN, .76)}" stroke="${MAP_HAIR}"/>`
    + mapLine([44, 236], [44, 284], MAP_CYAN, 3)
    + `<rect x="1636" y="228" width="32" height="64" rx="8" fill="${mapShade(MAP_CYAN, .76)}" stroke="${MAP_HAIR}"/>`
    + mapLine([1636, 236], [1636, 284], MAP_CYAN, 3);
  return markup;
}

/** The whole route at one instant. Four zones are part of the drawing. */
export function plantMapScene(progress, zones = plantZones(PLANT_COUNT)) {
  const state = plantState(progress, zones);
  const [entrada, estaciones, compuertas, integracion] = zones;
  let markup = zones.map(cx => mapIsland(cx)).join('');
  // Behind the belt: the islands' own machinery.
  markup += mapIntake(entrada) + mapStations(estaciones, state) + mapGateFrames(compuertas)
    + mapIntegration(integracion, state);
  markup += mapBelt();
  // On the belt: the batch, the controls' rods in front of it and the prepared return.
  markup += `<g class="plant-piece" transform="translate(${mapRound(state.x)} ${MAP_BELT_TOP + 14})" opacity="${mapRound(state.opacity)}">`
    + `<rect x="-19" y="-21" width="38" height="42" rx="8" fill="${MAP_CYAN}"/>`
    + '<path d="M-10 -9H10M-10 1H2M-10 11H6" fill="none" stroke="var(--slide-bg)" stroke-width="4.5" stroke-linecap="round"/></g>';
  markup += mapGateFronts(compuertas, state) + mapRollback(integracion);
  // The zone the batch is in, marked under its own column: the drawing's only state cue.
  markup += `<rect class="plant-marker" x="${mapRound(zones[state.phase] - 28)}" y="312" width="56" height="5" rx="2.5" fill="${MAP_AMBER}"/>`;
  return markup;
}

/**
 * Mount the map on its own container. The shell (labels, details, the reserved drawing box)
 * is rendered by the deck, so a frame only replaces the decorative parts group.
 */
export function mountPlantMap(doc = document, win = window) {
  const host = doc.querySelector(PLANT_SELECTOR);
  if (!host) return null;
  const parts = host.querySelector('.plant-parts');
  if (!parts) return null;
  const zones = String(host.dataset.zones || '').trim().split(/\s+/).map(Number);
  if (!zones.length || zones.some(zone => !Number.isFinite(zone))) return null;
  return mountGovernedScene({ host, cycle: PLANT_SECONDS * 1000, still: PLANT_STILL,
    paint: progress => { parts.innerHTML = plantMapScene(progress, zones); }, doc, win });
}

if (typeof document !== 'undefined') mountPlantMap();
