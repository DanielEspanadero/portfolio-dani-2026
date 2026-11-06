import slides from '../../content/patrones-diseno/slides.html?raw';
import css from './deck.css?raw';
import controller from '../shared/player.js?raw';
import { renderPresentation } from './render.mjs';

export function presentationDocument(): string {
  return renderPresentation({ slides, css, controller });
}
