import { renderPresentation as render } from '../shared/render.mjs';

const canonical = 'https://daniel-espanadero.com/presentaciones/sdd/';
const title = 'SDD con IA: de cero a avanzado | Daniel Españadero';
const description = 'Aprende Spec-Driven Development con IA: especificaciones, ejemplos backend, prompts, ventajas, límites y verificación. Presentación interactiva descargable.';

/**
 * Pure renderer: the caller supplies the versioned assets, so the same function
 * builds the website route and the offline export, and tests can feed fixtures.
 */
export function renderPresentation({ slides, css, controller, offline = false }) {
  return render({
    slides,
    css,
    controller,
    offline,
    canonical,
    title,
    description,
    chapterDefault: 'Spec-Driven Development',
    noscriptDetail: 'puedes leer todas las diapositivas y enlazarlas por su número, por ejemplo #12.',
    downloadHref: '/presentaciones/sdd/descargar.html',
    downloadName: 'sdd-con-ia.html',
  });
}
