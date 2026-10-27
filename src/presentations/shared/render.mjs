/**
 * Shared presentation shell for every deck on this site.
 *
 * Each deck owns its slides, CSS and metadata; this module owns the document
 * contract (SEO, player DOM, accessibility affordances) so two decks can never
 * drift apart on markup. Assets stay inline: a deck must render with no network
 * request for anything it needs to present.
 */

const defaultOgImage = 'https://daniel-espanadero.com/og/default-og-image.png';
const defaultOgImageAlt = 'Daniel Españadero, Backend Software Engineer especializado en Java e IA aplicada';

export function renderPresentation(options) {
  const {
    slides,
    css,
    controller,
    canonical,
    title,
    description,
    chapterDefault,
    offline = false,
    downloadHref,
    downloadName,
    brandLabel = 'DE<span> / LAB</span>',
    brandHref = 'https://daniel-espanadero.com/',
    brandAriaLabel = 'Portfolio de Daniel Españadero',
    skipLabel = 'Saltar a la presentación',
    toolbarLabel = 'Herramientas de presentación',
    controlsLabel = 'Navegación de diapositivas',
    keyboardHelp = '← → navegar · Espacio revelar · I índice · F pantalla completa',
    noscriptDetail = 'puedes leer todas las diapositivas y enlazarlas por su número.',
    ogImage = defaultOgImage,
    ogImageAlt = defaultOgImageAlt,
  } = options;

  const download = !offline && downloadHref
    ? `<a class="download-link" href="${downloadHref}" download="${downloadName}">Descargar HTML ↓</a>`
    : offline ? '<span class="offline-label">Versión sin conexión</span>' : '';

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#05070d">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="Daniel Españadero">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_ES">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:alt" content="${ogImageAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  <style>${css}</style>
</head>
<body>
  <a class="skip-link" href="#deck">${skipLabel}</a>
  <header class="deck-toolbar" aria-label="${toolbarLabel}">
    <a class="deck-brand" href="${brandHref}" aria-label="${brandAriaLabel}">${brandLabel}</a>
    <span id="chapter-label">${chapterDefault}</span>
    <div class="toolbar-actions">
      <button id="index-toggle" type="button" aria-haspopup="dialog" aria-controls="slide-index" title="Índice (I)">Índice <kbd>I</kbd></button>
      <button id="fullscreen-toggle" type="button" aria-pressed="false" title="Pantalla completa (F)">Pantalla completa <kbd>F</kbd></button>
      ${download}
    </div>
  </header>
  <noscript><p class="callout">JavaScript está desactivado: ${noscriptDetail} Las animaciones y los controles requieren JavaScript.</p></noscript>
  <main id="deck" tabindex="-1">${slides}</main>
  <footer class="deck-controls" aria-label="${controlsLabel}">
    <p id="keyboard-help">${keyboardHelp}</p>
    <div class="navigation-buttons">
      <button id="previous-slide" type="button" aria-label="Diapositiva o paso anterior">← Anterior</button>
      <label for="slide-select" class="sr-only">Ir a la diapositiva</label>
      <select id="slide-select" aria-label="Ir a la diapositiva"></select>
      <span id="slide-counter" role="status" aria-live="polite" aria-atomic="true"></span>
      <button id="next-slide" type="button" aria-label="Diapositiva o paso siguiente">Siguiente →</button>
    </div>
    <progress id="deck-progress" max="100" value="0" aria-label="Progreso de la presentación"></progress>
  </footer>
  <dialog id="slide-index" aria-labelledby="index-title">
    <div class="index-header"><h2 id="index-title">Elige tu siguiente idea</h2><button id="index-close" type="button" aria-label="Cerrar índice">Cerrar ×</button></div>
    <nav id="index-links" aria-label="Índice de diapositivas"></nav>
  </dialog>
  <script type="module">${controller}</script>
</body>
</html>`;
}
