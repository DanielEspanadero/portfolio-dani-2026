# Presentación de SDD con IA

Presentación en español para explicar Spec-Driven Development en YouTube: fundamentos, caso práctico backend, trabajo con agentes, ventajas, límites y prácticas avanzadas. Las diapositivas son visuales; las notas contienen el desarrollo de cada explicación.

## Abrir y compartir

- Presentación: `/presentaciones/sdd/`.
- Diapositiva concreta: `/presentaciones/sdd/#12` (número, sin prefijo).
- Descargar para usar sin conexión: `/presentaciones/sdd/descargar.html` o el enlace **Descargar HTML**.
- Abre el archivo descargado en un navegador moderno: no necesita servidor ni conexión. Los enlaces a fuentes y al portfolio sí requieren internet.

## Controles

| Acción | Control |
| --- | --- |
| Avanzar o revelar el siguiente paso | Flecha derecha, Av Pág, Espacio o Siguiente |
| Retroceder | Flecha izquierda, Re Pág o Anterior |
| Primera / última diapositiva | Inicio / Fin |
| Saltar a una diapositiva | Selector, índice o número en el fragmento de la URL |
| Abrir índice | `I` o botón Índice |
| Mostrar notas | `N` o botón Notas |
| Pantalla completa | `F` o botón Pantalla completa |
| Cerrar índice / salir de pantalla completa | Escape |

Los atajos no interceptan la escritura ni el uso normal de controles interactivos. Atrás y adelante del navegador recuperan las diapositivas visitadas. Los pasos revelados dentro de una diapositiva no crean entradas adicionales en el historial.

## Preparar la emisión

1. Abre la presentación en el navegador que capturarás con OBS o YouTube. Comprueba el tamaño de letra en la resolución real de emisión.
2. Revisa las notas antes de empezar. **Las notas aparecen en la misma pantalla: si capturas esa ventana, también las verá la audiencia.** No es un modo de presentador privado ni una segunda pantalla sincronizada.
3. Usa pantalla completa y cierra el índice y las notas para la toma principal. Comprueba que tu cámara no tape controles o ejemplos.
4. Ensaya el caso práctico. Los ejemplos de API son contratos didácticos, no un backend ejecutable incluido en el portfolio. No presentes una salida como ejecutada si no la ejecutaste.
5. Descarga el HTML y comprueba que abre con la conexión desactivada; sirve de respaldo si falla el sitio.

La preferencia del sistema **reducir movimiento** desactiva las transiciones. En móvil, los controles y el contenido se adaptan y las diapositivas largas se pueden desplazar. Sin JavaScript, todas las diapositivas siguen siendo legibles. La impresión muestra el contenido completo y las notas, sin controles.

## Editar sin duplicar la presentación

| Archivo | Responsabilidad |
| --- | --- |
| `src/content/sdd/slides.html` | Contenido, títulos, capítulos y notas |
| `src/presentations/sdd/deck.css` | Diseño, transiciones, responsive e impresión |
| `src/presentations/shared/player.js` | URL, teclado, índice, notas, revelado progresivo y modo inmersivo (compartido con la presentación de ODD) |
| `src/presentations/shared/render.mjs` | Documento HTML y metadatos, parametrizado por deck |
| `src/presentations/sdd/render.mjs` | Metadatos de este deck sobre el renderer compartido |
| `src/presentations/sdd/document.ts` | Ensamblado de los recursos inline |
| `src/pages/presentaciones/sdd/index.astro` | Ruta pública prerenderizada |
| `src/pages/presentaciones/sdd/descargar.html.ts` | Descarga del mismo contenido como HTML autónomo |

Conserva los identificadores numéricos consecutivos y sus etiquetas `aria-labelledby`. Solo la primera diapositiva tiene `h1`; las demás utilizan `h2`. Las notas van en `aside.speaker-notes`. No añadas recursos remotos necesarios para presentar: romperían el funcionamiento offline. El HTML de contenido es estático y de confianza; no debe recibir entrada de usuarios.

## Comprobaciones locales

```sh
node --test tests/sdd-*.test.mjs
pnpm dev
```

Con el servidor iniciado, comprueba la ruta web, `#12`, atrás/adelante, teclado, índice, notas, animaciones, pantalla completa y descarga. Prueba escritorio y móvil. Los tests de Node no sustituyen la comprobación visual en un navegador.

Las pruebas HTTP usan por defecto el puerto 4322 (puedes cambiarlo con `SDD_BASE_URL`). En macOS, el comprobador opcional utiliza WebKit del sistema, sin instalar paquetes:

```sh
# En una terminal: pnpm dev --host 127.0.0.1 --port 4322
node --test tests/sdd-http.mjs
swift tests/deck-browser.swift http://127.0.0.1:4322/presentaciones/sdd/#12 .artifacts/browser-desktop 1440 900 12 8 15
swift tests/deck-browser.swift http://127.0.0.1:4322/presentaciones/sdd/#12 .artifacts/browser-mobile 390 844 12 8 15
swift tests/deck-browser.swift .artifacts/sdd-con-ia.html .artifacts/browser-offline 1440 900 12 8 15
```

La prueba HTTP guarda el HTML descargado en `.artifacts/`; los comprobadores de navegador guardan allí sus informes y capturas. No publiques esos archivos de comprobación como código fuente. El comprobador automatizado cubre navegación y dimensiones; revisa también legibilidad, animaciones y la captura real de OBS con tus propios ojos.

No se añaden dependencias y no es necesario ejecutar el build para estas comprobaciones. El despliegue de producción se activa al publicar en `main`, según las normas del repositorio.

## Fuentes y alcance

El contenido diferencia definiciones, propuestas de herramientas y recomendaciones prácticas. Consulta las fuentes enlazadas en las diapositivas: GitHub Spec Kit, Kiro, OpenSpec y el análisis de Birgitta Böckeler publicado en martinfowler.com. Las herramientas evolucionan; confirma sus instrucciones oficiales antes de hacer una demostración en vivo. No se prometen mejoras cuantitativas de productividad ni dominio experto por asistir a una presentación.
