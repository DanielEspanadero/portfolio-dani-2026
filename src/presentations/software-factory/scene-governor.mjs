/**
 * Governance for this deck's procedural scenes: the cover plant (factory-01) and the plant
 * map (factory-09). Both draw one frame from one time value, so both need the same rules and
 * neither should reimplement them:
 *  - a scene runs only while its slide is the active, visible slide;
 *  - frames are sampled at about 30 fps instead of the display's 60;
 *  - leaving the slide or hiding the document stops the loop entirely;
 *  - with `prefers-reduced-motion: reduce` one still frame is painted and no frame is ever
 *    scheduled;
 *  - everything the scene attached is disconnected when the page goes away.
 * The helper never queries the document for anything but its own container, so the shared
 * player, the other decks and every other slide stay untouched.
 */

export const SCENE_FPS = 30;
export const SCENE_REDRAW_MS = 1000 / SCENE_FPS;
/** A tenth of the budget of slack: rAF timestamps jitter, and a strict 33.33 ms gate
    drops a 60 Hz display to 20 fps instead of the intended 30. */
const REDRAW_GATE = SCENE_REDRAW_MS * 0.9;

/**
 * Mount `paint` on `host` under the rules above. `paint` receives the progress of a cycle
 * in [0, 1) and is free to rebuild whatever it wants; the helper owns when it may draw.
 * `still` is the progress of the single frame painted under reduced motion.
 */
export function mountGovernedScene({ host, cycle, still, paint, doc = document, win = window }) {
  const slide = host?.closest('[data-slide]');
  if (!host || !slide) return null;
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)');
  let frameId = 0;
  let elapsed = cycle * still;
  let previous = 0;
  let lastDraw = 0;
  const state = { draws: 0, stills: 0 };

  const active = () => !slide.hidden && slide.classList.contains('active');
  const visible = () => active() && doc.visibilityState === 'visible';

  function tick(now) {
    frameId = 0;
    if (!visible() || motion.matches) return; // Never rebuild the drawing while off stage.
    if (!previous) previous = now;
    elapsed += Math.min(Math.max(now - previous, 0), 100);
    previous = now;
    if (now - lastDraw >= REDRAW_GATE) {
      lastDraw = now;
      paint((elapsed % cycle) / cycle);
      state.draws += 1;
      host.dataset.draws = String(state.draws);
    }
    frameId = win.requestAnimationFrame(tick);
  }

  function start() {
    if (frameId || motion.matches || !visible()) return;
    previous = 0;
    lastDraw = 0;
    frameId = win.requestAnimationFrame(tick);
  }

  function stop() {
    if (frameId) win.cancelAnimationFrame(frameId);
    frameId = 0;
    previous = 0;
  }

  /** One still frame, drawn once per document, for readers who asked for less motion. */
  function stillFrame() {
    if (state.stills) return;
    paint(still);
    state.stills += 1;
    host.dataset.stills = String(state.stills);
  }

  function sync() {
    stop();
    if (!visible()) return;
    if (motion.matches) stillFrame();
    else start();
  }

  function dispose() {
    stop();
    observer.disconnect();
    doc.removeEventListener('visibilitychange', sync);
    motion.removeEventListener?.('change', sync);
    win.removeEventListener('pagehide', dispose);
    win.removeEventListener('beforeunload', dispose);
  }

  const observer = new win.MutationObserver(sync);
  observer.observe(slide, { attributes: true, attributeFilter: ['class', 'hidden'] });
  doc.addEventListener('visibilitychange', sync);
  motion.addEventListener?.('change', sync);
  win.addEventListener('pagehide', dispose);
  win.addEventListener('beforeunload', dispose);
  sync();
  return { sync, stop, dispose, state };
}
