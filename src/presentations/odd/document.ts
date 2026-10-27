import slides from '../../content/odd/slides.html?raw';
import css from './deck.css?raw';
import controller from '../shared/player.js?raw';
import { renderPresentation } from './render.mjs';

/** Astro assembles the deck here; tests use the same renderer with disk assets. */
export function presentationDocument(): string {
  return renderPresentation({ slides, css, controller });
}
