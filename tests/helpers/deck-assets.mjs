import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);

/** Read one deck's versioned assets exactly as Astro's `?raw` import would. */
export function loadDeckAssets(slug) {
  const read = (path) => readFileSync(new URL(path, root), 'utf8');
  return {
    slides: read(`src/content/${slug}/slides.html`),
    css: read(`src/presentations/${slug}/deck.css`),
    controller: read('src/presentations/shared/player.js'),
  };
}
