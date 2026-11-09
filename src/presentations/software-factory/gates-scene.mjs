/**
 * Automatic gates for factory-13: the author's rejection path, redrawn for this deck.
 *
 * The source delivered outside this repository (compuertas-automaticas.html) is procedural: one
 * `state(t)` function over a fixed cycle, its own eyebrow, title, subtitle, a pause button and a
 * row of status words. So it is ported, not copied. The author's idea and drawing language stay:
 * three controls on one line, a batch that only leaves a control after that control reported,
 * and the point of the slide, which is the rejection: one batch clears everything and advances,
 * another clears the first control, fails an acceptance case and stops, so the next check never
 * runs and the exit keeps no pass. Skipping that stop is a recorded decision, never an automatic
 * exception, so the drawing never opens a bypass.
 *
 * Everything else is this deck's: two lanes instead of one alternating loop, so both cases are
 * on stage at the same time; the three gate labels and their details come from the slide's own
 * items; the fourth item is drawn as the rule of the whole line, in a caption slot that cannot
 * be read as a fourth test; the type and the palette come from the deck tokens; and the source's
 * chrome is gone because the slide already renders its heading and this deck carries no buttons.
 *
 * One timeline drives both batches, the barriers and the scan, so the drawing cannot disagree
 * with itself about which control has reported. Activation, page visibility, the frame budget,
 * the still frame under reduced motion and disposal come from `scene-governor.mjs`, shared with
 * the hero plant and the plant map.
 */
import { mountGovernedScene } from './scene-governor.mjs';

export const GATES_SELECTOR = '[data-gates-scene]';
export const GATES_VIEW = '0 0 1680 480';
export const GATES_SECONDS = 16;
/** The reduced-motion frame: the passing batch at the exit with its three barriers open and the
    failing batch held at the second control, so one still shows both cases resolved. The loop
    starts on that tableau and restarts a couple of seconds later, so a live slide moves early. */
export const GATES_STILL = 13 / GATES_SECONDS;
/** The document reserves the drawing's own width, so a stage px is a viewBox unit. */
export const GATES_WIDTH = 1680;
/** Two lanes: the batch that clears every control and the batch that does not. */
export const GATES_LANES = [96, 206];
/** The rail runs from the inlet port to the exit; the verdict sits to its right. */
export const GATES_RAIL = [262, 1364];
/** A batch is held this far before the barrier: inside the lane, clear of the portal frame, so
    a stop is visible instead of inferred and the batch never hides behind a post. */
export const GATES_STOP = 96;
/** The three controls are the slide's first three items, evenly spread over the rail. */
const GATES_FIRST = 500;
const GATES_LAST = 1260;
/** Where the static text sits inside the viewBox. The renderer places the glyphs. */
export const GATES_TEXT = {
  label: 306,
  detail: [338, 366, 394],
  wrap: 26,
  rule: 450,
  ruleLine: 414,
  ruleTextX: 252,
  verdictX: 1400,
  caseX: 0,
};
/** One cycle: reach the first control, dwell while it reports, then travel to the next. */
export const GATES_TIMING = { first: 2.4, step: 3, check: 1.05, hold: .75, lift: .32, fade: .6, fadeOut: .7, exit: 1.9 };

export const gatesColumns = count => Array.from({ length: count }, (_, index) =>
  Math.round(GATES_FIRST + index * (GATES_LAST - GATES_FIRST) / Math.max(count - 1, 1)));
/** When the batch reaches each control, and when that control reports. */
export const gatesArrival = index => GATES_TIMING.first + index * GATES_TIMING.step;
const gatesReport = index => gatesArrival(index) + GATES_TIMING.check;
const gatesLeave = index => gatesReport(index) + GATES_TIMING.hold;

/* === PALETTE: deck tokens only, every other tone mixed towards the deepest shadow ===
   The source carried its own published hexes and a red for the rejection. Here the literals are
   the deck tokens and the rest is derived, so the drawing cannot drift from the deck it sits in
   and amber stays the deck's one accent for what leaves the ordinary path. */
const GATES_CYAN = '#94c9d2';
const GATES_AMBER = '#ffc36a';
const GATES_INK = '#e9eeeb';
const GATES_HAIR = '#557077';
const GATES_MUTED = '#b3ced4';
const GATES_DEEP = '#101719';
const gatesChannels = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
const gatesShade = (base, weight) => {
  const from = gatesChannels(base);
  const to = gatesChannels(GATES_DEEP);
  return `#${from.map((value, index) => Math.round(value + (to[index] - value) * weight)
    .toString(16).padStart(2, '0')).join('')}`;
};
const GATES_POST = gatesShade(GATES_CYAN, .8);
const GATES_LINTEL = gatesShade(GATES_CYAN, .62);
const GATES_ARM = gatesShade(GATES_CYAN, .46);
const GATES_ARM_STOPPED = gatesShade(GATES_AMBER, .58);
/** The shutter's own hairline: the barrier's tone, one step lighter. */
const gatesSlat = gate => gatesShade(gate.failed ? GATES_AMBER : GATES_CYAN, .22);

/* Named for this module: the three scenes share one inline scope, so no helper of the deck's
   own may collide with another scene's helper. */
const gatesRound = value => Number(value.toFixed(2));
const gatesClamp = value => Math.min(1, Math.max(0, value));

/* === TIMELINE: both batches start together and split at the second control === */
const gatesEase = raw => raw * raw * (3 - 2 * raw);
/** Eased travel between stops, no easing inside a dwell. */
function gatesTravel(seconds, keys) {
  for (let index = 0; index < keys.length - 1; index += 1) {
    const [from, start] = keys[index];
    const [to, end] = keys[index + 1];
    if (seconds < from || seconds > to) continue;
    const raw = to === from ? 1 : (seconds - from) / (to - from);
    return start + (end - start) * gatesEase(raw);
  }
  return keys[keys.length - 1][1];
}

/** Where one batch sits over the cycle. Lane 0 clears every control; lane 1 is held at the
    second one, which is why it never reaches the third nor the exit. */
export function gatesKeys(columns, lane = 0) {
  const keys = [[0, GATES_RAIL[0]], [GATES_TIMING.fade, GATES_RAIL[0]]];
  const stops = lane === 1 ? columns.slice(0, 2) : columns;
  stops.forEach((cx, index) => {
    keys.push([gatesArrival(index), cx - GATES_STOP], [gatesLeave(index), cx - GATES_STOP]);
  });
  const last = keys[keys.length - 1];
  if (lane === 1) keys.push([GATES_SECONDS, last[1]]);
  else keys.push([last[0] + GATES_TIMING.exit, GATES_RAIL[1]], [GATES_SECONDS, GATES_RAIL[1]]);
  return keys;
}

/** One instant of the cycle: where each batch is and what each control reported for it. */
export function gatesState(progress, columns = gatesColumns(3)) {
  const seconds = (((progress % 1) + 1) % 1) * GATES_SECONDS;
  const stop = gatesReport(1);
  const lanes = [0, 1].map(lane => {
    const x = gatesTravel(seconds, gatesKeys(columns, lane));
    const gates = columns.map((cx, index) => {
      const failed = lane === 1 && index === 1 && seconds >= stop;
      const passed = !failed && (lane === 0 || index === 0) && seconds >= gatesReport(index);
      // A control only scans the batch that is actually held under it, so the control the
      // failing batch never reaches is never scanned: it is drawn shut, not merely failed.
      const held = Math.abs(x - (cx - GATES_STOP)) < 1.5;
      return {
        cx,
        passed,
        failed,
        skipped: lane === 1 && index === 2 && seconds >= stop,
        scanning: held && seconds >= gatesArrival(index) + .18 && seconds < gatesReport(index) + .12,
        lift: passed ? gatesClamp((seconds - gatesReport(index)) / GATES_TIMING.lift) : 0,
        phase: gatesClamp((seconds - gatesArrival(index) - .18) / GATES_TIMING.check),
      };
    });
    return {
      lane,
      y: GATES_LANES[lane],
      x,
      gates,
      failed: lane === 1 && seconds >= stop,
      // The ports occlude the cycle's restart: each batch fades in and out instead of jumping.
      opacity: Math.max(0, Math.min(1, seconds / GATES_TIMING.fade,
        (GATES_SECONDS - seconds) / GATES_TIMING.fadeOut)),
    };
  });
  return { seconds, lanes };
}

/* === ONE GATE, TWO LANES: one portal frame, one barrier per batch ===
   The three controls belong to the whole line, so each one is drawn once, crossing both lanes,
   and each lane carries its own barrier: that is what makes the failing batch stop where the
   passing one goes through, without drawing six unrelated devices. */
function gatePortal(cx) {
  const top = GATES_LANES[0] - 38;
  const base = GATES_LANES[1] + 38;
  const mid = GATES_LANES[1] - 38;
  return `<g class="gates-portal">`
    + `<rect x="${cx - 56}" y="${top}" width="12" height="${base - top}" rx="3" fill="${GATES_POST}" stroke="${GATES_HAIR}" stroke-width="1.5"/>`
    + `<rect x="${cx + 44}" y="${top}" width="12" height="${base - top}" rx="3" fill="${GATES_POST}" stroke="${GATES_HAIR}" stroke-width="1.5"/>`
    + `<rect x="${cx - 56}" y="${top - 16}" width="112" height="16" rx="4" fill="${GATES_LINTEL}" stroke="${GATES_HAIR}" stroke-width="1.5"/>`
    + `<rect x="${cx - 44}" y="${mid - 10}" width="88" height="10" rx="3" fill="${GATES_LINTEL}" stroke="${GATES_HAIR}" stroke-width="1.5"/>`
    + '</g>';
}

/** One lane's barrier: closed it spans the lane, open it is a stub in its own frame. */
function gateBarrier(gate, y) {
  const top = y - 38;
  const accent = gate.failed ? GATES_AMBER : gate.skipped ? GATES_MUTED : GATES_CYAN;
  const height = 4 + 72 * (1 - gate.lift);
  let markup = `<rect class="gates-arm${gate.failed ? ' gates-arm-failed' : ''}" x="${gate.cx - 6}" y="${top}"`
    + ` width="12" height="${gatesRound(height)}" rx="3" fill="${gate.failed ? GATES_ARM_STOPPED : GATES_ARM}"`
    + ` stroke="${accent}" stroke-width="2"${gate.skipped ? ' stroke-dasharray="6 5"' : ''}/>`;
  // A blind that is still down reads as a shutter, not as a floating post. The barrier the
  // failing batch never reaches keeps its outline and loses its slats: it was never armed.
  for (let row = top + 14; !gate.skipped && row < top + height - 10; row += 16) {
    markup += `<path d="M${gate.cx - 2} ${gatesRound(row)}H${gate.cx + 2}" stroke="${gatesSlat(gate)}" stroke-width="1.5" stroke-linecap="round"/>`;
  }
  if (gate.scanning) {
    markup += `<rect x="${gatesRound(gate.cx - 46 + 68 * gate.phase)}" y="${y - 3}" width="22" height="6" rx="3" fill="${GATES_CYAN}" opacity=".62"/>`;
  }
  return markup;
}

/** The batch itself: cyan while it can still advance, amber and crossed once it is stopped. */
function gatePiece(lane) {
  if (lane.opacity <= 0) return '';
  const accent = lane.failed ? GATES_AMBER : GATES_CYAN;
  const mark = lane.failed
    ? `<path d="M-7 -5L7 5M7 -5L-7 5" fill="none" stroke="${GATES_AMBER}" stroke-width="3.5" stroke-linecap="round"/>`
    : `<path d="M-9 -8H9M-9 1H1M-9 10H6" fill="none" stroke="${GATES_INK}" stroke-width="2.5" stroke-linecap="round"/>`;
  return `<g class="gates-piece${lane.failed ? ' gates-piece-failed' : ''}"`
    + ` transform="translate(${gatesRound(lane.x)} ${lane.y})" opacity="${gatesRound(lane.opacity)}">`
    + `<rect x="-18" y="-20" width="36" height="40" rx="8" fill="${gatesShade(accent, .3)}" stroke="${accent}" stroke-width="2"/>`
    + `${mark}</g>`;
}

/** Both lanes at one instant. The words are the deck's, so a frame is pure decoration. */
export function gatesScene(progress, columns = gatesColumns(3)) {
  const state = gatesState(progress, columns);
  const portals = columns.map(gatePortal).join('');
  const barriers = state.lanes
    .map(lane => lane.gates.map(gate => gateBarrier(gate, lane.y)).join('')).join('');
  return portals + barriers + state.lanes.map(gatePiece).join('');
}

/**
 * Mount the drawing on its own container. The shell (rails, case names, gate labels, the rule
 * caption, the reserved drawing box) is rendered by the deck, so a frame only replaces the
 * decorative parts group. The columns travel as data so the drawing and the labels cannot drift.
 */
export function mountGatesScene(doc = document, win = window) {
  const host = doc.querySelector(GATES_SELECTOR);
  if (!host) return null;
  const parts = host.querySelector('.gates-parts');
  if (!parts) return null;
  const columns = String(host.dataset.columns || '').trim().split(/\s+/).map(Number);
  if (!columns.length || columns.some(column => !Number.isFinite(column))) return null;
  return mountGovernedScene({ host, cycle: GATES_SECONDS * 1000, still: GATES_STILL,
    paint: progress => { parts.innerHTML = gatesScene(progress, columns); }, doc, win });
}

if (typeof document !== 'undefined') mountGatesScene();
