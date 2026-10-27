// Import-free: the same module runs inline in the online and offline decks.
export function parseSlideHash(hash, total) {
  const value = /^#\d+$/.test(hash) ? Number(hash.slice(1)) : 1;
  const number = Number.isSafeInteger(value) ? value : 1;
  return Math.max(1, Math.min(Math.max(1, total), number));
}

export function canonicalSlideHash(hash, total) {
  return `#${parseSlideHash(hash, total)}`;
}

export function navigationIntent(event, dialogOpen = false) {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return null;
  if (event.key === 'Escape') return 'escape';
  if (dialogOpen || event.target?.closest?.('input, select, textarea, button, a, summary, [contenteditable], dialog[open]')) return null;
  const keys = {
    ArrowRight: 'next', PageDown: 'next', ' ': 'next',
    ArrowLeft: 'previous', PageUp: 'previous', Home: 'first', End: 'last',
    i: 'index', f: 'fullscreen',
  };
  return keys[event.key.length === 1 ? event.key.toLowerCase() : event.key] ?? null;
}

export function advancePosition(position, intent, total, steps) {
  const { slide, step } = position;
  if (intent === 'first') return { slide: 1, step: 0 };
  if (intent === 'last') return { slide: total, step: 0 };
  if (intent === 'next') {
    if (step < steps) return { slide, step: step + 1 };
    if (slide < total) return { slide: slide + 1, step: 0 };
  }
  if (intent === 'previous') {
    if (step > 0) return { slide, step: step - 1 };
    if (slide > 1) return { slide: slide - 1, step: 0 };
  }
  return { slide, step };
}

export function initDeck(doc = document, win = window) {
  const deck = doc.querySelector('#deck');
  const slides = [...doc.querySelectorAll('[data-slide]')];
  if (!deck || !slides.length) return;
  const byId = id => doc.getElementById(id);
  const previous = byId('previous-slide');
  const next = byId('next-slide');
  const select = byId('slide-select');
  const counter = byId('slide-counter');
  const progress = byId('deck-progress');
  const chapter = byId('chapter-label');
  const index = byId('slide-index');
  const links = byId('index-links');
  const fullscreen = byId('fullscreen-toggle');
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');
  const stepLists = slides.map(slide => [...slide.querySelectorAll('[data-step]')]);
  let position = { slide: 1, step: 0 };
  let animations = [];
  let indexOpener = null;

  slides.forEach((slide, offset) => {
    const title = `${offset + 1}. ${slide.dataset.title || slide.querySelector('h1, h2')?.textContent || 'Diapositiva'}`;
    const option = doc.createElement('option');
    option.value = String(offset + 1);
    option.textContent = title;
    select.append(option);
    const link = doc.createElement('a');
    link.href = `#${offset + 1}`;
    link.textContent = title;
    link.addEventListener('click', () => {
      index.close();
      if (position.slide === offset + 1) render({ slide: offset + 1, step: 0 });
    });
    links.append(link);
  });

  function cancelAnimations() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }

  function render(target, initial = false) {
    const old = position;
    const changed = old.slide !== target.slide;
    const active = slides[target.slide - 1];
    const moveFocus = changed && slides[old.slide - 1].contains(doc.activeElement);
    cancelAnimations();
    position = target;
    slides.forEach((slide, offset) => {
      const visible = offset === target.slide - 1;
      slide.hidden = !visible;
      slide.inert = !visible;
      slide.classList.toggle('active', visible);
      slide.setAttribute('aria-hidden', String(!visible));
      stepLists[offset].forEach((element, step) => {
        const revealed = step < target.step;
        element.classList.toggle('step-pending', !revealed);
        element.inert = !revealed;
        element.setAttribute('aria-hidden', String(!revealed));
      });
    });
    if (changed || initial) active.scrollTop = 0;
    if (moveFocus) deck.focus({ preventScroll: true });
    const steps = stepLists[target.slide - 1].length;
    previous.disabled = target.slide === 1 && target.step === 0;
    next.disabled = target.slide === slides.length && target.step === steps;
    select.value = String(target.slide);
    counter.textContent = `${target.slide} / ${slides.length}${steps ? ` · Paso ${target.step} de ${steps}` : ''}`;
    progress.max = slides.length;
    progress.value = target.slide;
    progress.setAttribute('aria-label', `Diapositiva ${target.slide} de ${slides.length}`);
    chapter.textContent = active.dataset.chapter || 'Spec-Driven Development';
    [...links.children].forEach((link, offset) => {
      if (offset === target.slide - 1) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    if (!changed && target.step > old.step) {
      stepLists[target.slide - 1][target.step - 1].scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    if (!initial && !reducedMotion.matches && active.animate) {
      if (changed) {
        animations.push(active.animate([
          { opacity: 0 },
          { opacity: 1 },
        ], { duration: 280, easing: 'ease-out' }));
      } else if (target.step > old.step) {
        const element = stepLists[target.slide - 1][target.step - 1];
        animations.push(element.animate([
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 200, easing: 'ease-out' }));
      }
    }
  }

  function readURL(initial = false) {
    const hash = canonicalSlideHash(win.location.hash, slides.length);
    if (win.location.hash !== hash) win.history.replaceState(null, '', hash);
    render({ slide: parseSlideHash(hash, slides.length), step: 0 }, initial);
  }

  function navigate(intent) {
    const target = advancePosition(position, intent, slides.length, stepLists[position.slide - 1].length);
    if (target.slide !== position.slide) {
      // pushState avoids a second asynchronous hashchange resetting a fresh reveal.
      win.history.pushState(null, '', `#${target.slide}`);
    }
    render(target);
  }

  function openIndex() {
    if (index.open) { index.close(); return; }
    indexOpener = doc.activeElement;
    index.showModal();
    links.querySelector('[aria-current]')?.focus();
  }

  async function toggleFullscreen() {
    try {
      if (doc.fullscreenElement) await doc.exitFullscreen();
      else await doc.documentElement.requestFullscreen();
    } catch {
      // Fullscreen can be denied by the embedding browser; navigation still works.
      fullscreen.title = 'Pantalla completa no disponible en este navegador';
    }
  }

  previous.addEventListener('click', () => navigate('previous'));
  next.addEventListener('click', () => navigate('next'));
  select.addEventListener('change', () => {
    win.history.pushState(null, '', `#${select.value}`);
    readURL();
  });
  byId('index-toggle').addEventListener('click', openIndex);
  byId('index-close').addEventListener('click', () => index.close());
  index.addEventListener('close', () => indexOpener?.focus({ preventScroll: true }));
  fullscreen.addEventListener('click', toggleFullscreen);
  doc.addEventListener('fullscreenchange', () => {
    const immersive = Boolean(doc.fullscreenElement);
    fullscreen.setAttribute('aria-pressed', String(immersive));
    // Decks may drop their chrome in fullscreen and refit the stage to the new box.
    doc.body.classList.toggle('immersive', immersive);
    fitStage();
  });
  doc.addEventListener('keydown', event => {
    const intent = navigationIntent(event, Boolean(doc.querySelector('dialog[open]')));
    if (!intent) return;
    if (intent === 'escape') {
      if (index.open) index.close();
      if (doc.fullscreenElement) doc.exitFullscreen().catch(() => {});
      return;
    }
    event.preventDefault();
    if (intent === 'index') openIndex();
    else if (intent === 'fullscreen') toggleFullscreen();
    else navigate(intent);
  });
  win.addEventListener('hashchange', () => readURL());
  win.addEventListener('popstate', () => readURL());
  reducedMotion.addEventListener('change', cancelAnimations);
  let closedExercises = [];
  win.addEventListener('beforeprint', () => {
    cancelAnimations();
    closedExercises = [...deck.querySelectorAll('details:not([open])')];
    closedExercises.forEach(exercise => { exercise.open = true; });
  });
  win.addEventListener('afterprint', () => {
    closedExercises.forEach(exercise => { exercise.open = false; });
    closedExercises = [];
  });
  function fitStage() {
    const width = deck.clientWidth;
    const height = deck.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(width / 1920, height / 1080);
    slides.forEach(slide => {
      slide.style.transform = `scale(${scale})`;
    });
  }

  win.addEventListener('resize', fitStage);
  doc.body.classList.add('deck-ready');
  fitStage();
  readURL(true);
}

if (typeof document !== 'undefined') initDeck();
