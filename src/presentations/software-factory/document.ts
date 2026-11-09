import fonts from './fonts.css?raw';
import viewport from './viewport-base.css?raw';
import styles from './deck.css?raw';
import controller from '../shared/player.js?raw';
import heroScene from './hero-scene.mjs?raw';
import { renderPresentation } from './render.mjs';

/** Online and downloadable HTML share every rendering-critical byte. */
export function presentationDocument(offline = false): string {
  return renderPresentation({
    css: `${fonts}\n${viewport}\n${styles}`,
    // The hero plant is the deck's only per-slide script: it rides with the shared player.
    controller: `${controller}\n${heroScene}`,
    offline,
  });
}
