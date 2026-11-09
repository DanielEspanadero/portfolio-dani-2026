import fonts from './fonts.css?raw';
import viewport from './viewport-base.css?raw';
import styles from './deck.css?raw';
import controller from '../shared/player.js?raw';
import { renderPresentation } from './render.mjs';

/** Online and downloadable HTML share every rendering-critical byte. */
export function presentationDocument(offline = false): string {
  return renderPresentation({
    css: `${fonts}\n${viewport}\n${styles}`,
    controller,
    offline,
  });
}
