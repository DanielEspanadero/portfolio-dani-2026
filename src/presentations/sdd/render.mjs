const canonical = 'https://daniel-espanadero.com/presentaciones/sdd/';
const title = 'SDD con IA: de cero a avanzado | Daniel Españadero';
const description = 'Aprende Spec-Driven Development con IA: especificaciones, ejemplos backend, prompts, ventajas, límites y verificación. Presentación interactiva descargable.';

/** Render the website and offline export from the same trusted, versioned assets. */
export function renderPresentation({ slides, css, controller, offline = false }) {
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
  <meta property="og:image" content="https://daniel-espanadero.com/og/default-og-image.png">
  <meta property="og:image:alt" content="Daniel Españadero, Backend Software Engineer especializado en Java e IA aplicada">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="https://daniel-espanadero.com/og/default-og-image.png">
  <style>${css}</style>
</head>
<body>
  <a class="skip-link" href="#deck">Saltar a la presentación</a>
  <header class="deck-toolbar" aria-label="Herramientas de presentación">
    <a class="deck-brand" href="https://daniel-espanadero.com/" aria-label="Portfolio de Daniel Españadero">DE<span> / LAB</span></a>
    <span id="chapter-label">SDD con IA</span>
    <div class="toolbar-actions">
      <button id="index-toggle" type="button" aria-haspopup="dialog" aria-controls="slide-index" title="Índice (I)">Índice <kbd>I</kbd></button>
      <button id="fullscreen-toggle" type="button" aria-pressed="false" title="Pantalla completa (F)">Pantalla completa <kbd>F</kbd></button>
      ${offline ? '<span class="offline-label">Versión sin conexión</span>' : '<a class="download-link" href="/presentaciones/sdd/descargar.html" download="sdd-con-ia.html">Descargar HTML ↓</a>'}
    </div>
  </header>
  <noscript><p class="callout">JavaScript está desactivado: puedes leer todas las diapositivas y enlazarlas por su número, por ejemplo #12. Las animaciones y los controles requieren JavaScript.</p></noscript>
  <main id="deck" tabindex="-1">${slides}</main>
  <footer class="deck-controls" aria-label="Navegación de diapositivas">
    <p id="keyboard-help">← → navegar · Espacio revelar · I índice · F pantalla completa</p>
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
