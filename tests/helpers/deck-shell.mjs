/**
 * Assertions for the shared presentation shell.
 *
 * Both decks render through `src/presentations/shared/render.mjs`; these helpers
 * keep the accessibility contract in one place so a new deck inherits the same
 * checks instead of copying them.
 */

export const playerIds = [
  'chapter-label', 'index-toggle', 'fullscreen-toggle', 'deck',
  'previous-slide', 'next-slide', 'slide-select', 'slide-counter', 'deck-progress',
  'slide-index', 'index-title', 'index-close', 'index-links', 'keyboard-help',
];

export function sectionsOf(html) {
  return [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)].map(([, attributes, body]) => ({
    attributes,
    body,
    id: attributes.match(/\bid="([^"]*)"/)?.[1],
    chapter: attributes.match(/\bdata-chapter="([^"]*)"/)?.[1],
    title: attributes.match(/\bdata-title="([^"]*)"/)?.[1],
  }));
}

export function assertShellContract(html) {
  if (!/<main id="deck" tabindex="-1">/.test(html)) throw new Error('deck main landmark missing');
  if (!/<dialog id="slide-index" aria-labelledby="index-title">/.test(html)) throw new Error('index dialog missing');
  if (!/aria-live="polite"/.test(html)) throw new Error('live slide counter missing');
  if (!/<noscript>/.test(html)) throw new Error('noscript fallback missing');
  if (!/<progress id="deck-progress"/.test(html)) throw new Error('progress element missing');
  if (!/<a class="skip-link" href="#deck">/.test(html)) throw new Error('skip link missing');
}
