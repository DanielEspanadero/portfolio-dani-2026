// === DECK-LOCAL NOTES: separate from the stage and never persisted ===
(() => {
  const deck = document.getElementById('deck');
  const notes = document.getElementById('notes-dialog');
  const opener = document.getElementById('notes-toggle');
  const content = document.getElementById('notes-content');
  const pause = document.getElementById('animation-pause');
  const restart = document.getElementById('animation-restart');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let returnFocus;

  function syncNotes() {
    const active = deck.querySelector('.active');
    const source = document.getElementById(`note-${active?.dataset.slide}`);
    if (source && content.dataset.slide !== active.dataset.slide) {
      const clone = source.cloneNode(true);
      clone.removeAttribute('id');
      content.replaceChildren(clone);
      content.dataset.slide = active.dataset.slide;
    }
  }
  function openNotes() {
    if (document.querySelector('dialog[open]')) return;
    returnFocus = document.activeElement;
    syncNotes();
    notes.showModal();
    document.getElementById('notes-close').focus();
  }
  opener.addEventListener('click', openNotes);
  document.getElementById('notes-close').addEventListener('click', () => notes.close());
  notes.addEventListener('close', () => returnFocus?.focus({ preventScroll: true }));
  document.addEventListener('keydown', event => {
    // N is additive. Shared arrows, Space, I, F and Escape remain untouched.
    if (event.key.toLowerCase() !== 'n' || event.defaultPrevented || event.isComposing ||
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.target.closest('input, select, textarea, button, a, [contenteditable], dialog[open]')) return;
    event.preventDefault();
    openNotes();
  });
  new MutationObserver(syncNotes).observe(deck, { subtree: true, attributes: true, attributeFilter: ['class'] });
  syncNotes();

  // === DIAGRAM MOTION: controls never approve or execute anything ===
  function setPaused(value) {
    deck.classList.toggle('paused', value);
    pause.setAttribute('aria-pressed', String(value));
    pause.textContent = reduced.matches ? 'Movimiento reducido' : value ? 'Reanudar diagrama' : 'Pausar diagrama';
  }
  pause.addEventListener('click', () => setPaused(!deck.classList.contains('paused')));
  restart.addEventListener('click', () => {
    deck.querySelectorAll('.packet').forEach(packet => {
      packet.getAnimations().forEach(animation => { animation.currentTime = 0; });
    });
    setPaused(false);
  });
  function preference() {
    pause.disabled = reduced.matches;
    restart.disabled = reduced.matches;
    setPaused(reduced.matches);
  }
  reduced.addEventListener('change', preference);
  preference();
})();
