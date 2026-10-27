import slides from '../../content/sdd/slides.html?raw';
import css from './deck.css?raw';
import controller from '../shared/player.js?raw';
import { renderPresentation } from './render.mjs';

/** Both public routes use identical inline assets; no offline network requests. */
export function presentationDocument(offline = false): string {
  return renderPresentation({ slides, css, controller, offline });
}
