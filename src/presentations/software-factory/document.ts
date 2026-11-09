import fonts from './fonts.css?raw';
import viewport from './viewport-base.css?raw';
import styles from './deck.css?raw';
import controller from '../shared/player.js?raw';
import sceneGovernor from './scene-governor.mjs?raw';
import heroScene from './hero-scene.mjs?raw';
import plantMap from './plant-map.mjs?raw';
import { inlineModules } from './inline-modules.mjs';
import { renderPresentation } from './render.mjs';

/** Online and downloadable HTML share every rendering-critical byte. */
export function presentationDocument(offline = false): string {
  return renderPresentation({
    css: `${fonts}\n${viewport}\n${styles}`,
    // The deck's two procedural scenes ride with the shared player, inlined by dependency
    // order: the governor first, then the scenes that mount through it.
    controller: inlineModules(controller, sceneGovernor, heroScene, plantMap),
    offline,
  });
}
