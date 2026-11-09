/**
 * Hero plant for factory-01: the author's animated cover, adapted to this deck.
 *
 * The drawing is procedural and isometric: every frame is recomputed from one time value,
 * so the belt dwell, the two arms, the scanner sweep and the amber verified parcel cannot
 * drift apart. Geometry comes from the author's cover generator delivered outside this
 * repository (portada-fabrica.html); its palette, its type and its chrome are replaced by
 * the deck's own. The source drew a title block, an eyebrow, a signature, a pause button
 * and a raster-friendly background: all of that is now HTML or nothing at all.
 *
 * The module owns the drawing and nothing else: activation, page visibility, the frame
 * budget, the still frame under reduced motion and disposal live in the shared
 * `scene-governor.mjs`, which the plant map uses too. It reads only its own container, so
 * the shared player and every other slide are untouched.
 */
import { mountGovernedScene } from './scene-governor.mjs';

const CYAN = '#94c9d2';
const AMBER = '#ffc36a';
const HAIR = '#557077';
const HAIR_SOFT = '#4f6b73';
const DEEP = '#101719';
const PAPER = '#e9eeeb';

/* === PALETTE: every shade is derived from the deck tokens above ===
   The source carried dozens of literals. A mix keeps the drawing inside the deck
   palette while leaving the depth cues the isometric reading depends on. Top faces
   stay lighter than the slide so the plant reads; only shadowed sides go darker. */
const channels = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
const mix = (from, to, weight) => {
  const a = channels(from);
  const b = channels(to);
  return `#${a.map((value, index) => Math.round(value + (b[index] - value) * weight)
    .toString(16).padStart(2, '0')).join('')}`;
};
const shade = (base, weight) => mix(base, DEEP, weight);
const tint = (base, weight) => mix(base, PAPER, weight);

const TONE = {
  plinth: [shade(CYAN, .6), shade(CYAN, .84), shade(CYAN, .76)],
  block: [shade(CYAN, .48), shade(CYAN, .74), shade(CYAN, .64)],
  panel: [shade(CYAN, .54), shade(CYAN, .78), shade(CYAN, .68)],
  wall: [shade(CYAN, .42), shade(CYAN, .74), shade(CYAN, .62)],
  post: [shade(CYAN, .34), shade(CYAN, .72), shade(CYAN, .58)],
  roof: [shade(CYAN, .38), shade(CYAN, .74), shade(CYAN, .6)],
  chassis: [shade(CYAN, .5), shade(CYAN, .8), shade(CYAN, .7)],
  belt: [shade(CYAN, .62), shade(CYAN, .82), shade(CYAN, .74)],
  roller: [shade(CYAN, .7), shade(CYAN, .82), shade(CYAN, .78)],
  parcel: [shade(CYAN, .4), shade(CYAN, .62), shade(CYAN, .5)],
  verified: [shade(AMBER, .42), shade(AMBER, .64), shade(AMBER, .52)],
  metal: [shade(PAPER, .5), shade(PAPER, .7), shade(PAPER, .6)],
  metalDark: [shade(PAPER, .58), shade(PAPER, .76), shade(PAPER, .66)],
  scanner: [shade(PAPER, .4), shade(PAPER, .7), shade(PAPER, .55)],
  cowl: [shade(CYAN, .56), shade(CYAN, .8), shade(CYAN, .72)],
  cowlSide: [shade(CYAN, .62), shade(CYAN, .84), shade(CYAN, .76)],
  cowlTop: [shade(CYAN, .52), shade(CYAN, .82), shade(CYAN, .7)],
};
const LINE = shade(CYAN, .22);
const TREAD = shade(CYAN, .38);
const METAL_LIGHT = shade(PAPER, .18);
const METAL_EDGE = shade(PAPER, .35);
const JOINT = shade(CYAN, .68);
const JOINT_CORE = shade(CYAN, .9);
const HOT = tint(AMBER, .3);
const COOL = tint(CYAN, .35);

/* === VIEW: the plant's own crop, so the drawing never carries the cover's text zone === */
export const HERO_VIEW = '625 -35 1030 845';
export const HERO_CYCLE = 6000;
export const HERO_STILL = 0.19;
export const HERO_SELECTOR = '[data-hero-scene]';

const round = value => Number(value.toFixed(2));
/** Isometric projection: x to the right, y into the depth, z up. */
const P = (x, y, z = 0) => [1090 + .86 * x - .65 * y, 495 + .36 * x + .34 * y - z];
const points = list => list.map(point => point.map(round).join(',')).join(' ');
const face = (outline, fill, edge = HAIR, width = 1, extra = '') =>
  `<polygon points="${points(outline)}" fill="${fill}" stroke="${edge}" stroke-width="${width}" stroke-linejoin="round" ${extra}/>`;
const stroke = (from, to, color = CYAN, width = 2, extra = '') =>
  `<path d="M${from.map(round).join(' ')} L${to.map(round).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
const polyline = (list, color, width, extra = '') =>
  `<path d="${list.map((point, index) => `${index ? 'L' : 'M'}${point.map(round).join(' ')}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;

/** One extruded box: top face, right side and front side, in that paint order. */
function box(x, y, z, w, d, h, colors = TONE.block, edge = HAIR, opacity = 1) {
  const topA = P(x, y, z + h);
  const topB = P(x + w, y, z + h);
  const topC = P(x + w, y + d, z + h);
  const topD = P(x, y + d, z + h);
  const lowB = P(x + w, y, z);
  const lowC = P(x + w, y + d, z);
  const lowD = P(x, y + d, z);
  return `<g opacity="${opacity}">${face([topA, topB, topC, topD], colors[0], edge)}`
    + `${face([topB, lowB, lowC, topC], colors[1], edge)}${face([topD, topC, lowC, lowD], colors[2], edge)}</g>`;
}

/** Two-link arm. The work amplitude is the dwell curve: zero the moment the belt moves. */
function robot(x, t) {
  const work = t < .4 ? Math.sin(Math.PI * t / .4) : 0;
  const base = [-100, 148];
  const target = [78, 244 - 100 * work];
  const [upper, lower] = [164, 153];
  const dy = target[0] - base[0];
  const dz = target[1] - base[1];
  const distance = Math.hypot(dy, dz);
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance);
  const height = Math.sqrt(Math.max(0, upper * upper - along * along));
  const elbow = [base[0] + along * dy / distance - height * dz / distance,
    base[1] + along * dz / distance + height * dy / distance];
  const shoulder = P(x, ...base);
  const joint = P(x, ...elbow);
  const wrist = P(x, ...target);
  let markup = box(x - 32, -132, 55, 64, 64, 65, TONE.metalDark, HAIR_SOFT);
  markup += box(x - 22, -122, 120, 44, 44, 28, TONE.panel, HAIR);
  for (const [from, to] of [[shoulder, joint], [joint, wrist]]) {
    markup += stroke([from[0] + 6, from[1] + 6], [to[0] + 6, to[1] + 6], DEEP, 35);
    markup += stroke(from, to, TONE.metal[1], 29) + stroke(from, to, METAL_EDGE, 23);
    markup += stroke([from[0] - 4, from[1] - 3], [to[0] - 4, to[1] - 3], METAL_LIGHT, 2.2, 'opacity=".8"');
  }
  [shoulder, joint, wrist].forEach((point, index) => {
    const radius = index === 2 ? 12 : 19;
    const cx = round(point[0]);
    const cy = round(point[1]);
    markup += `<circle cx="${cx}" cy="${cy}" r="${radius + 4}" fill="${DEEP}" stroke="${HAIR}" stroke-width="2"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${radius - 3}" fill="${JOINT}" stroke="${CYAN}" stroke-width="2.8"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${radius - 9}" fill="${JOINT_CORE}"/>`;
  });
  const tip = P(x, 78, target[1] - 30);
  const jawLeft = P(x - 17, 78, target[1] - 40);
  const jawRight = P(x + 17, 78, target[1] - 40);
  markup += stroke(wrist, tip, HAIR, 6);
  markup += stroke(jawLeft, [jawLeft[0], jawLeft[1] - 13], AMBER, 3);
  markup += stroke(jawRight, [jawRight[0], jawRight[1] - 13], AMBER, 3);
  markup += stroke([jawLeft[0], jawLeft[1] - 13], [jawRight[0], jawRight[1] - 13], HAIR_SOFT, 4);
  return markup;
}

/** One work piece. The verified copy turns amber and carries its check mark. */
function parcel(x, verified) {
  const edge = verified ? AMBER : CYAN;
  let markup = box(x - 28, 47, 57, 56, 65, 46, verified ? TONE.verified : TONE.parcel, edge, .98);
  markup += face([P(x - 24, 112, 62), P(x + 24, 112, 62), P(x + 24, 112, 99), P(x - 24, 112, 99)],
    verified ? shade(AMBER, .62) : shade(CYAN, .7), edge, 1.2);
  markup += verified
    ? polyline([P(x - 14, 113, 79), P(x - 4, 113, 70), P(x + 16, 113, 91)], HOT, 4.5,
      'stroke-linecap="round" stroke-linejoin="round"')
    : polyline([P(x - 16, 113, 76), P(x - 6, 113, 76), P(x + 3, 113, 87), P(x + 17, 113, 87)], COOL, 2.1);
  return markup;
}

/** The whole plant at one instant of the 6 s cycle (0 to 1). */
export function heroScene(t) {
  let markup = '';
  // Foundation, back wall, light rails and utility panels.
  markup += box(-380, -190, -23, 880, 390, 35, TONE.plinth, shade(CYAN, .85));
  for (const x of [-300, -110, 80, 270]) markup += box(x, -160, 12, 140, 110, 38, TONE.block, HAIR);
  markup += box(-320, -161, 50, 570, 26, 185, TONE.wall, HAIR);
  for (let x = -285; x < 240; x += 85) {
    markup += box(x, -132, 82, 52, 3, 100, TONE.panel, HAIR_SOFT);
    markup += stroke(P(x + 8, -127, 100), P(x + 8, -127, 164), LINE, 1);
  }
  markup += stroke(P(-310, -129, 224), P(240, -129, 224), AMBER, 3);
  for (const x of [-325, 255]) {
    markup += box(x, -176, 35, 30, 50, 278, TONE.post, HAIR);
    markup += stroke(P(x + 8, -124, 88), P(x + 8, -124, 278), AMBER, 3);
  }
  markup += box(-335, -183, 303, 630, 70, 28, TONE.roof, HAIR);
  markup += stroke(P(-320, -110, 304), P(280, -110, 304), AMBER, 3);
  // Conveyor chassis, deck, moving treads and rollers.
  markup += box(-370, 28, 0, 850, 126, 50, TONE.chassis, LINE);
  markup += face([P(-370, 29, 52), P(480, 29, 52), P(480, 154, 52), P(-370, 154, 52)],
    TONE.belt[0], METAL_EDGE, 1.8);
  // One indexed advance per loop: eased travel, then a full stop while the arms work.
  const phase = Math.max(0, Math.min(1, (t - .4) / .43));
  const glide = phase * phase * (3 - 2 * phase);
  const offset = 160 * glide;
  for (let x = -390 + offset % 32; x < 500; x += 32) {
    if (x > -370 && x < 480) markup += stroke(P(x, 33, 53), P(x, 150, 53), TREAD, 1.5);
  }
  markup += stroke(P(-365, 155, 35), P(477, 155, 35), CYAN, 4);
  for (const x of [-310, -150, 10, 170, 330]) {
    markup += face([P(x, 155, 9), P(x + 95, 155, 9), P(x + 95, 155, 31), P(x, 155, 31)],
      TONE.roller[0], HAIR_SOFT, 1);
    for (let j = 8; j < 80; j += 12) markup += stroke(P(x + j, 156, 12), P(x + j, 156, 27), TREAD, 1);
  }
  // Scanner: rear post and lintel now, front post once the work has passed.
  markup += box(148, 18, 52, 24, 20, 150, TONE.scanner, METAL_EDGE);
  markup += box(148, 18, 202, 62, 141, 22, TONE.metal, METAL_EDGE);
  markup += stroke(P(168, 37, 200), P(168, 148, 200), CYAN, 5);
  // Pieces cycle through an occluded inlet and outlet, one station per loop.
  for (let index = 0; index < 7; index += 1) {
    const station = -460 + 160 * index;
    const x = station + offset;
    if (x < -370 || x > 480) continue;
    const fade = Math.min(1, (x + 370) / 35, (480 - x) / 35);
    const verified = station > 180 || (station === 180 && t > .235);
    markup += `<g opacity="${round(Math.max(0, fade))}">${parcel(x, verified)}</g>`;
  }
  // Scan sweep, only while the belt stands still at the verification station.
  if (t > .04 && t < .37) {
    const sweep = 190 - 130 * ((t - .04) / .33);
    markup += face([P(150, 39, sweep), P(208, 39, sweep), P(208, 145, sweep), P(150, 145, sweep)],
      COOL, CYAN, 1, 'opacity=".15"');
    markup += stroke(P(150, 145, sweep), P(208, 145, sweep), CYAN, 3);
  }
  // Arm motion is locked to the dwell: nothing reaches into moving work.
  markup += robot(-140, t) + robot(20, t);
  markup += box(148, 140, 52, 24, 22, 150, TONE.metalDark, METAL_EDGE);
  markup += stroke(P(173, 143, 65), P(173, 143, 200), CYAN, 4);
  // Inlet and outlet cowls hide the cyclic insertion and removal of pieces.
  for (const [x, outlet] of [[-372, false], [429, true]]) {
    markup += box(x, 26, 50, 52, 131, 9, TONE.cowl, HAIR_SOFT);
    markup += box(x, 24, 50, 52, 16, 85, TONE.cowlSide, HAIR_SOFT);
    markup += box(x, 140, 50, 52, 18, 85, TONE.cowlSide, HAIR_SOFT);
    markup += box(x, 24, 135, 52, 134, 14, TONE.cowlTop, HAIR_SOFT);
    markup += stroke(P(x + 4, 160, 60), P(x + 4, 160, 143), outlet ? AMBER : CYAN, 2.5);
  }
  // Intake specification, drawn as an object: the drawing carries no words at all.
  markup += box(-354, 56, 149, 37, 53, 3, TONE.panel, CYAN);
  markup += face([P(-352, 55, 155), P(-305, 55, 155), P(-305, 55, 218), P(-352, 55, 218)],
    shade(CYAN, .74), CYAN, 1.5);
  for (const z of [170, 183, 196]) markup += stroke(P(-344, 54, z), P(-314, 54, z), CYAN, 1.8);
  return markup;
}

/** The static shell: one soft ground glow, then the group every frame replaces. */
export function heroShell() {
  return `<svg class="hero-plant" viewBox="${HERO_VIEW}" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">`
    + '<defs><radialGradient id="hero-ground">'
    + `<stop stop-color="${CYAN}" stop-opacity=".14"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/>`
    + '</radialGradient></defs>'
    + '<ellipse cx="1115" cy="645" rx="420" ry="160" fill="url(#hero-ground)"/>'
    + '<g class="hero-plant-parts"></g></svg>';
}

/**
 * Mount the plant on its own container. The shell is built on the first paint and then
 * reused, so a frame only replaces the parts group; everything else is the governor's.
 */
export function mountHeroScene(doc = document, win = window) {
  const host = doc.querySelector(HERO_SELECTOR);
  if (!host) return null;
  let parts = null;
  const paint = progress => {
    if (!parts) {
      host.innerHTML = heroShell();
      parts = host.querySelector('.hero-plant-parts');
    }
    parts.innerHTML = heroScene(progress);
  };
  return mountGovernedScene({ host, cycle: HERO_CYCLE, still: HERO_STILL, paint, doc, win });
}

if (typeof document !== 'undefined') mountHeroScene();
