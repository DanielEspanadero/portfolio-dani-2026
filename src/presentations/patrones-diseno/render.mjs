import { renderPresentation as render } from '../shared/render.mjs';
import { highlightJava } from './highlight.mjs';

/** Metadata belongs to this deck; navigation and document semantics stay shared. */
export function renderPresentation({ slides, css, controller }) {
  return render({
    slides: highlightJava(slides),
    css,
    controller,
    canonical: 'https://daniel-espanadero.com/presentaciones/patrones-diseño/',
    title: 'Patrones de diseño en Java desde cero | Daniel Españadero',
    description: 'Aprende los 23 patrones GoF con problemas cotidianos, ejemplos Java 25 y ejercicios. Incluye una guía práctica de arquitectura y resiliencia con Spring.',
    chapterDefault: 'Patrones de diseño',
  });
}
