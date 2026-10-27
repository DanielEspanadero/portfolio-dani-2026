# Presentación de Desarrollo Orgánico (ODD)

Presentación en español para explicar Organic Driven Development en un directo de YouTube: qué problema resuelve, la metáfora que le da nombre y el protocolo de siete pasos, sin código y sin asumir que la audiencia programa. Una idea por diapositiva, con revelados progresivos para acompañar la explicación en vivo.

## Abrir y compartir

- Presentación: `/presentaciones/odd/`.
- Diapositiva concreta: `/presentaciones/odd/#7` (número, sin prefijo).
- Índice de presentaciones: `/presentaciones/`.

No hay versión descargable: el documento ya es autónomo. El CSS, las tres familias tipográficas y el reproductor van en línea, así que una vez cargada la página no hace falta ninguna petición de red para presentar.

## Controles

| Acción | Control |
| --- | --- |
| Avanzar o revelar el siguiente paso | Flecha derecha, Av Pág, Espacio o Siguiente |
| Retroceder | Flecha izquierda, Re Pág o Anterior |
| Primera / última diapositiva | Inicio / Fin |
| Saltar a una diapositiva | Selector, índice o número en el fragmento de la URL |
| Abrir índice | `I` o botón Índice |
| Pantalla completa | `F` o botón Pantalla completa |
| Cerrar índice / salir de pantalla completa | Escape |

En pantalla completa se oculta todo el cromo (cabecera, controles y barra de progreso) y la diapositiva ocupa el máximo de pantalla; Escape lo restaura. Los atajos no interceptan la escritura ni el uso normal de controles interactivos.

## Preparar la emisión

1. Abre la presentación en el navegador que capturarás con OBS o YouTube, pulsa `F` y comprueba el tamaño de letra en la resolución real de emisión.
2. La diapositiva mantiene siempre 16:9 y se escala como un todo: en una ventana pequeña o en un móvil se ve más chica, nunca se reordena. Para leer en móvil, gira el dispositivo a horizontal.
3. Las diapositivas con revelado progresivo muestran primero el titular y van sumando contenido. El contador indica el paso actual; sirve de guía durante el directo.
4. No hay notas del presentador: el texto visible es todo el guion. Si necesitas apoyo, tenlo fuera de la captura.
5. La preferencia del sistema **reducir movimiento** elimina las animaciones y deja el contenido en su estado final. Sin JavaScript, todas las diapositivas siguen siendo legibles; la impresión muestra el deck completo, una diapositiva por página.

## Editar sin duplicar la presentación

| Archivo | Responsabilidad |
| --- | --- |
| `src/content/odd/slides.html` | Contenido, títulos, capítulos y pasos revelados |
| `src/presentations/odd/deck.css` | Sistema visual completo: tipografía, componentes, animaciones e impresión |
| `src/presentations/odd/render.mjs` | Metadatos de este deck sobre el renderer compartido |
| `src/presentations/odd/document.ts` | Ensamblado de los recursos inline |
| `src/presentations/shared/render.mjs` | Documento HTML y contrato de accesibilidad, parametrizado por deck |
| `src/presentations/shared/player.js` | URL, teclado, índice, revelado progresivo y modo inmersivo |
| `src/pages/presentaciones/odd/index.astro` | Ruta pública prerenderizada |
| `src/pages/presentaciones/index.astro` | Índice de presentaciones del sitio |

Conserva los identificadores numéricos consecutivos y sus etiquetas `aria-labelledby`. Solo la primera diapositiva tiene `h1`; las demás usan `h2`. Marca los revelados con `data-step` únicamente en bloques completos (`li`, `p`, `tr`): un fragmento en línea oculto deja huecos raros en la maqueta. Los elementos decorativos `<svg>` deben llevar `aria-hidden="true"` y `focusable="false"`, y sus trazos se animan desde `deck.css` con `pathLength="1"`.

Los tres tipos están embebidos como woff2 (subconjunto latino) bajo SIL Open Font License 1.1: Instrument Serif e Instrument Sans de Instrument, y JetBrains Mono de JetBrains. Si los cambias, actualiza el bloque `@font-face` y su comentario de licencia.

## Comprobaciones locales

```sh
node --test tests/odd-*.test.mjs
pnpm dev
```

Los tests de Node cubren contenido, contrato del documento y navegación compartida; no sustituyen la comprobación visual. Con el servidor iniciado, en macOS puedes usar WebKit del sistema, sin instalar paquetes:

```sh
# En una terminal: pnpm dev --host 127.0.0.1 --port 4322
swift tests/deck-browser.swift http://127.0.0.1:4322/presentaciones/odd/#1 .artifacts/odd-desktop 1440 900 1 14 20
swift tests/deck-browser.swift http://127.0.0.1:4322/presentaciones/odd/#1 .artifacts/odd-mobile 390 844 1 14 20
```

El comprobador navega con teclado, historial, índice y selector, comprueba que ninguna diapositiva se recorta y guarda una captura. Revisa además con tus propios ojos: legibilidad a la resolución de emisión, ritmo de los revelados y captura real de OBS. Los informes viven en `.artifacts/` y no se publican como código fuente.
