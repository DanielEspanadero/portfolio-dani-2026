import { renderPresentation as render } from '../shared/render.mjs';

const canonical = 'https://daniel-espanadero.com/presentaciones/odd/';
const title = 'Desarrollo Orgánico: cómo dirigir IA sin perder el control | Daniel Españadero';
const description = 'Organic Driven Development explicado desde cero: siete pasos para que el proceso crezca con el problema, sin burocracia y con el humano al mando. Presentación interactiva.';

/**
 * Pure renderer: the deck is one self-contained document (CSS, fonts and
 * player inlined), so a live stream never depends on a network request.
 */
export function renderPresentation({ slides, css, controller }) {
  return render({
    slides,
    css,
    controller,
    canonical,
    title,
    description,
    chapterDefault: 'Desarrollo Orgánico',
    noscriptDetail: 'puedes leer todas las diapositivas y enlazarlas por su número, por ejemplo #7.',
  });
}
