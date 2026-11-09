# AI Software Factory: contenido para enseñar y practicar

36 diapositivas en español, notas de ponente separadas y un kit local ejecutable. La densidad se recortó a propósito: cada diapositiva sostiene una idea y el directo se apoya en las notas, no en paredes de texto. La entrada es explícita para público no técnico: definición en la segunda diapositiva, una línea «en criollo» en las diapositivas con jerga y dos diapositivas de contexto (un día normal y qué problema resuelve). El caso de la reserva se presenta cuando empieza el ejemplo, sin banda en el pie. El día normal termina en la compuerta que aplica la regla escrita, con la escalación como excepción, no en una decisión personal. El hilo conductor es la fábrica como sistema de producción —orden de trabajo, estaciones especializadas, estándares, compuertas automáticas, evidencia, integración y medición— y no la aprobación humana: el criterio está escrito y la línea lo aplica igual cada vez. Una persona actúa en cuatro momentos (definir el estándar, diseñar la política de autonomía, responder una escalada y corregir tras un incidente), y el muestreo con métricas es control, no permiso (S7, S16). El renderer local integra ese currículo con la dirección elegida «Plano de fábrica» (S4), sin modificar otros decks ni el player compartido (S5). **Ruta implementada:** `/presentaciones/software-factory` (S6); lectura en `/presentaciones/software-factory/guia` y HTML autónomo en `/presentaciones/software-factory/descargar.html`. Son rutas Astro prerenderizadas; su respuesta HTTP en el hosting requiere la verificación posterior del orquestador. No se ha ejecutado build ni despliegue.

## Camino rápido

1. Revisar capítulos en `src/content/software-factory/`, empezando por las notas y ejemplos fronterizos.
2. Copiar el kit completo de `public/resources/software-factory/` a una carpeta local de prácticas con el gestor de archivos. Consultar su README antes de editar.
3. Desde la raíz del repositorio comprobar contenido y kit con el comando indicado más abajo. No ejecutar un build.
4. Abrir el deck en `/presentaciones/software-factory`. El deck muestra solo diapositivas: las notas completas y el kit están en `/presentaciones/software-factory/guia`, y el HTML autónomo en `/presentaciones/software-factory/descargar.html` (ambos requieren conexión la primera vez).

## Presentación y controles

- Flechas / Page Up y Page Down: paso o diapositiva anterior/siguiente. Espacio revela estaciones antes de avanzar; Home / End van al principio/final.
- I: índice con foco en la diapositiva actual; Escape cierra y devuelve el foco. También hay selector y botones fuera del escenario.
- F: pantalla completa; el player reajusta el escenario sin redistribuir contenido. Los controles reaparecen al enfocarlos o pasar el puntero.
- El escenario no lleva controles propios: no hay notas, pausa, reinicio, guía ni descarga en pantalla. Se usan los controles compartidos del player (flechas, Espacio, índice, pantalla completa).
- Las notas del ponente no se incrustan en el deck; viven en la guía y siguen siendo la referencia para narrar cada ID.
- Sin JavaScript se ofrece lectura vertical de las diapositivas; la guía añade notas completas y estilos de impresión.

El escenario se autoriza a 1920×1080 y el player escala cada slide una sola vez. En teléfono permanece 16:9 con bandas vacías; no se garantiza leer un directo completo en una pantalla pequeña. La guía sí redistribuye texto de forma responsive. El HTML de descarga incluye CSS, SVG, fuentes con licencia OFL y scripts sin recursos de render externos; no incluye notas. Sus láminas usan rutas absolutas `/resources/software-factory-art/...`, así que el archivo guardado necesita el sitio online para mostrarlas: el marco, el pie y el texto alternativo siguen apareciendo si no cargan.

### Módulos de implementación

`src/presentations/software-factory/render.mjs` transforma los 13 tipos en composiciones distintas y escapa contenido, código y fuentes. `document.ts` une `fonts.css`, la copia íntegra `viewport-base.css`, `deck.css` y los scripts inline. No hay script local adicional: el deck usa el player compartido tal cual. `guide.css` es independiente del escenario fijo. `src/presentations/shared/render.mjs` y `player.js` se reutilizan sin cambios.

La portada usa una línea de producción de tres estaciones (entrada, estaciones, salida); cronologías, tablas de fronteras, advertencias causales, paneles de código, carriles paralelos y taller tienen gramática propia. Las estaciones con `data-step` reservan su geometría. La compuerta de integración queda como lote pendiente de integrar después de revelar todo: avanzar pasos no equivale a integrar.

## Arquitectura y contrato para el renderer

Cada capítulo `.mjs` exporta por defecto `{ id, title, slides: [...] }`. `index.mjs` exporta con nombre `chapters` en orden narrativo y `slides` como concatenación de sus arrays. No hay side effects, HTML ni imports de herramientas de presentación. IDs estables `factory-01` a `factory-36`; no reconstruir IDs a partir de títulos.

| Campo de slide | Tipo y regla |
|---|---|
| `id` | string único global; ancla futura de navegación |
| `title` | string; idea principal |
| `kind` | hero, timeline, comparison, flow, loop, gate, risk, code, table, parallel, checklist, exercise, quote o closing |
| `lead` | string con menos de 25 palabras; mensaje escénico |
| `items` | 2–5 objetos `{label, detail}`; label <=8 palabras y detail <=22 |
| `notes` | string en español, 90–150 palabras; explicación para la persona que presenta, no texto escénico |
| `sources?` | array de URLs de referencia; enlaces de consulta, no recursos necesarios para renderizar |
| `code?` | string con máximo 12 líneas; escapar como texto, nunca evaluar ni inyectar como HTML |
| `steps?` | boolean; sugiere recorrido ordenado para flow/loop/ejercicio; no autoriza ejecución |
| `pause?` | boolean; marca una pausa intencional de chat (IDs 14 y 23) |
| `illustrated?` | boolean en una diapositiva `timeline`; dibuja el día como SVG animado en línea |
| `loopback?` | boolean en una diapositiva `flow`; dibuja el flujo completo como SVG animado en línea |
| `plain?` | string de ≤18 palabras, sin jerga; se dibuja como anotación bajo la entrada. Obligatoria en las diapositivas con vocabulario pesado |
| `alias?` | string corta con el término en inglés, solo en la portada, para búsqueda |
| `figure?` | objeto `{src, alt, mode}`; `mode` es `feature` (lámina visible) o `wash` (fondo muy tenue detrás de paneles opacos). `src` apunta a `public/resources/software-factory-art/` y `alt` describe el diagrama en español, nunca repite el título |

No se usan otros campos específicos de kind en esta entrega. Existen 16 kinds utilizados, incluidos `files` (árbol de archivos de estado), `circle` (ciclo producción→telemetría→backlog) y `quote` (la definición de la diapositiva 02). Cada item puede convertirse en nodo, fila, columna o estación según kind: no resolver todo con la misma card repetida. Las fuentes completas no deben apretarse en el escenario; ofrecerlas en notas o lectura. Las plantillas extensas pertenecen al kit.

### Límites para la siguiente unidad

- S2 pide escenario fijo 1920×1080 escalado uniformemente, también en teléfono. No convertir estas notas en párrafos escénicos ni redistribuir por breakpoint.
- Mantener semántica, navegación, acceso a notas y enlaces. No usar color como único indicador de estado. Texto y orden deben funcionar sin animación.
- Respetar reduced motion y composición por kind. Una secuencia `steps` es una sugerencia visual, no un requisito de autoplay.
- T3 implementa un renderer local sin modificar el player compartido ni otras presentaciones; T4 conserva la verificación independiente y la disponibilidad HTTP.
- Las comprobaciones de contenido no prueban fitting ni disponibilidad HTTP. El checker de navegador añade geometría, teclado y capturas; la inspección visual es evidencia separada y no una certificación automática de contraste o accesibilidad.

## Guía de capítulos para el directo

Duración orientativa: **90–120 minutos ajustables**, no una garantía. Acortar ejemplos o separar taller si hay muchas preguntas. Las notas de cada ID contienen la explicación concreta; los bloques siguientes orientan el ritmo sin duplicarla.

| Módulo | IDs | Recorrido y atención del ponente | Tiempo orientativo |
|---|---|---|---|
| `01-foundations.mjs` | 01–07 | Portada en español con alias; definición en una frase; qué no es; 1968 con dos orígenes; qué problema resuelve y qué no; vocabulario mínimo; asistente, workflow o agente | 11–14 min |
| `02-production-line.mjs` | 08–14 | Un día en la fábrica, animado con sus cinco momentos; mapa de planta; de petición a orden de trabajo; estaciones especializadas; estándares y activos; compuertas automáticas; pausa de evidencia | 11–14 min |
| `03-loop-state.mjs` | 15–18 | El bucle completo; estado en archivos; quién decide y cuándo escalar; política de modelos y esfuerzo | 9–12 min |
| `04-failure-modes.mjs` | 19–23 | Dos fábricas; falso verde; texto hostil y permisos; coste y conocimiento; pausa con tres fallos reales | 12–15 min |
| `05-build-yours.mjs` | 24–28 | Los ocho archivos; reglas operativas; de dónde salen la orden y el contexto; primera corrida; observabilidad de la línea | 10–13 min |
| `06-example-parallel.mjs` | 29–32 | Fronteras de la cancelación; RED antes de la solución; el lote aterriza integrado; worktrees y contrato compartido | 11–14 min |
| `07-closing.mjs` | 33–36 | El flujo completo de una pieza; del despliegue a la siguiente orden; medir coste, calidad y ciclo; cierre y checklist de arranque | 9–12 min |

Los rangos permiten elegir ritmo; no deben sumarse como una promesa exacta. Para un directo corto, dar la práctica como continuación local. Para uno largo, ampliar preguntas sin añadir permisos ni servicios reales.

### Puntos que no deben perderse al presentar

- 02: leer la definición entera y sin prisa. Si la audiencia solo retiene una idea, que sea esa frase y las tres claves.
- 04: dos orígenes en 1968 (Bemer en GE y McIlroy en Garmisch) sin fechas ni páginas no comprobadas; CI se presenta como antecedente sin fecha fundacional.
- 07: Anthropic (diciembre de 2024) distingue rutas predefinidas de decisiones dinámicas y recomienda simplicidad. No es una norma universal.
- 08: los horarios del día normal son ilustrativos, no una medición.
- 11, 20, 32: separar revisión no garantiza independencia de razonamiento; código y prueba pueden compartir el mismo error.
- 19–23, 31: el capítulo de fallos es la parte negativa del método; el control humano es una familia de riesgo más y la única compuerta explícita, nunca el tema de la presentación.
- 29: >=24h devuelve 100%; <24h antes devuelve 0%; inicio exacto o después rechaza intacta. Repetir conserva el resultado, pero sin eventos nuevos.
- 30: autenticación y autorización están fuera de alcance; tiempos UTC canónicos e importes válidos se verifican antes de emitir eventos. No exponer el ejemplo como API de producción.
- 30, 31: las expectativas de terminal se etiquetan como tales; cada participante registra su resultado real.
- 31, 32: rollback de código no deshace efectos externos; worktree no aísla puertos, procesos, bases de datos ni permisos.
- 35: capacidad de revisión como cuello de botella; medir ciclo completo y calidad, no líneas ni ahorro prometido.

## Kit: archivos y distribución

| Archivo dentro de `public/resources/software-factory/` | Uso |
|---|---|
| `README.md` | Inicio, copia, descargas y fallback manual |
| `AGENTS.md` | Alcance, runner, reglas y paradas; la persona debe indicar su lectura |
| `specs/cancel-booking.md` | API, códigos de error, precedencia, límites y ejemplos |
| `factory/worker.md` | Práctica RED segura en copia desechable, implementación y entrega |
| `factory/reviewer.md` | Revisión desde el contrato y reproducción |
| `factory/handoff.md` | Plantilla sin resultados rellenados ni aprobaciones ficticias |
| `src/cancellation.mjs` | Función pura de referencia con eventos simulados |
| `tests/cancellation.test.mjs` | Runner incorporado de Node, API pública, outputs e inmutabilidad |

La guía enlaza `/resources/software-factory-kit.zip`, con una raíz `software-factory/` y exactamente los ocho archivos anteriores. Se ha generado con `zipfile` de Python y comprobado el listado exacto, CRC y contenido byte a byte contra los originales. Alternativa: guardar **los ocho archivos** desde `/resources/software-factory/<ruta-relativa>` conservando el árbol; ejemplo: `/resources/software-factory/factory/worker.md`. No hay endpoint de descarga recursiva. Mientras se trabaja en el repositorio, también se puede copiar la carpeta con un gestor de archivos. `factory/` es visible deliberadamente: no depender de que el hosting sirva `.factory/`. Astro public distribuye archivos sin importar el kit; su disponibilidad HTTP aún requiere comprobación posterior.

Node >=22; sin npm install, API key, SDK ni cuenta de proveedor. El comando dentro del kit es `node --test tests/cancellation.test.mjs`. No necesita Git; las worktrees son una explicación opcional para repositorios de prácticas preparados, no una acción ejecutada aquí.

### Contrato de cancelación resumido

`cancelBooking(booking, nowUTC)` acepta booking con id, startUTC, amountCents y status. Valida forma/estado, tiempos, importe y, si ya está cancelada, outcome almacenado. Formatos UTC con segundos y Z, opcionalmente tres milisegundos; rechaza fechas normalizadas o no finitas. Importe entero seguro >=0.

Éxito: `{ok:true, booking, outcome, events}`. Primera cancelación devuelve reserva nueva y almacena `{refundCents, cancelledAtUTC}`. Si refundCents >0, un evento `{type:'refund.requested', bookingId, amountCents}`; con cero, ninguno. Repetición válida conserva booking y outcome y devuelve `events:[]` incluso después del inicio. Rechazo: `{ok:false, error, booking, events:[]}`; entrada sin modificar. Códigos: INVALID_BOOKING, INVALID_TIME, INVALID_AMOUNT, BOOKING_STARTED. Véase spec para precedencia y ejemplos exactos.

Los eventos son datos, no dinero enviado. El ejemplo no implementa autenticación, autorización, persistencia, concurrencia, integridad de pagos ni compensación. Nunca presentarlo como solución lista para producción.

## Verificación sin build

Desde la raíz del repositorio:

```sh
node --test public/resources/software-factory/tests/cancellation.test.mjs tests/software-factory-content.test.mjs
```

El test de contenido valida cantidades, IDs, esquema, límites de texto/código, notas, fuentes acordadas, temas obligatorios, kit y coherencia de fronteras. Los tests de dominio comparan outputs completos, eventos y preservación de entradas. No consultan historial Git ni usan servicios externos o scratch en el repositorio.

RED de autoría: antes de implementar se ejecutó `node --test public/resources/software-factory/tests/cancellation.test.mjs` contra el stub TODO; salida 1, 19 tests fallidos por `TODO: implementar contrato de cancelación`. Esa evidencia es del proceso de autoría, no de las máquinas del público. El kit enseña a repetirlo en una copia autorizada sin borrar nada.

### Verificación del renderer y navegador

Comando focalizado de renderer, contenido, kit y regresión del player/otros decks (sin build):

```sh
node --test tests/software-factory-render.test.mjs tests/software-factory-content.test.mjs public/resources/software-factory/tests/cancellation.test.mjs tests/odd-renderer.test.mjs tests/patrones-renderer.test.mjs tests/patrones-responsive.test.mjs tests/patrones-steps.test.mjs tests/sdd-renderer.test.mjs tests/sdd-navigation.test.mjs
```

Chrome instalado y CDP nativo, sin npm ni servidor: ejecutar por separado `node tests/software-factory-browser.mjs --chapter=1`, repitiendo con 2 a 7; después `node tests/software-factory-browser.mjs --mode=interaction` y `node tests/software-factory-browser.mjs --mode=reading`. Cada comando es de primer plano, acotado, y genera evidencia en `design/ai-software-factory/checks-deck/`. Los JSON con timestamp conservan fallos anteriores; las capturas y HTML standalone reflejan la última ejecución. Un fallo de setup no se reintenta automáticamente.

El checker recorre todas las diapositivas a 1280×720 y 390×844, revela pasos por teclado, comprueba proporción/encaje, cajas e ink de texto, separación de paneles, geometría reservada y slides inertes. Captura portada, cronología, flow/loop/gate, riesgo, código, tablas, paralelo, la síntesis y el cierre. Los dos diagramas en línea se miden igual: que el dibujo quede dentro de su propio viewBox y del contenedor, que no toque el pie, que las columnas no se solapen y el tamaño de fuente calculado del texto del SVG. En modo interacción se busca un instante del recorrido: la pieza del flujo se mueve, es ámbar solo en el arco y queda quieta en la primera estación con movimiento reducido; el marcador del día avanza, resalta la hora que corresponde y deja el ámbar solo en la rama de escalación. Capturas: `slide-33-*`, `journey-on-the-arc-*`, `slide-8-*` y `day-at-the-fourth-moment-*`. El modo interaction verifica Enter nativo con texto `\r` y click trusted, navegación, historial, foco, ausencia de controles extra, fullscreen y movimiento reducido. Reading comprueba fallback sin scripts y guía responsive/imprimible. Se registran peticiones de red y excepciones. Las métricas no sustituyen mirar las imágenes ni verifican HTTP.

No build, dependencias nuevas ni despliegue en esta unidad. El resultado observado se comunica en el handoff de implementación, no se pre-rellena en la plantilla del alumno.

## Dónde entra una persona

El modelo que sostiene el deck: el criterio vive escrito en la especificación, las compuertas y el contrato de revisión, y la línea lo aplica igual en cada corrida. Una persona actúa en cuatro momentos y en ninguno revisa cambios uno por uno.

| Momento | Qué hace | Diapositiva |
|---|---|---|
| Definir el estándar | criterios, comprobaciones y contrato de revisión antes de arrancar | 17 |
| Diseñar la autonomía | qué avanza sin permiso y qué escala siempre | 17 |
| Responder una escalada | contesta con una pregunta concreta y desbloquea el lote | 17, 31 |
| Corregir tras un incidente | arregla el estándar para que la línea no repita el fallo | 23, 33 |

Siempre escala lo irreversible: pagos, accesos, migraciones, borrados y cualquier efecto que no se pueda deshacer. Auditoría por muestreo y métricas de la línea hacen de control, no de permiso. Una prueba de contenido falla si vuelve la familia de frases que devolvía el foco a la intervención manual ("criterio humano", "una persona decide", "alguien decide", "acepta o devuelve").

## La diapositiva de síntesis

`factory-33` reúne el flujo completo en un único SVG animado en línea: cinco estaciones sobre un riel (entrada, orden y spec, construcción, revisión y compuertas, integración y operación), una pieza de trabajo que viaja de estación en estación y un arco ámbar discontinuo de retorno con la leyenda "Lo observado vuelve como una nueva orden".

El recorrido dura 14 segundos y se genera desde una sola línea de tiempo en el renderer: los keyframes de la pieza, su ventana ámbar y el pulso de cada estación salen del mismo arreglo, así el dibujo no puede desincronizarse de su animación. La pieza es cian sobre el riel y ámbar solo cuando el arco la devuelve; nunca cruza una compuerta antes de que su paso esté revelado. `role="img"` con etiqueta en español, pieza oculta a lectores de pantalla y texto real en `<text>`, no trazado.

La base del dibujo es una adaptación de una animación que el autor generó fuera del repositorio: se conservaron la idea y el lenguaje gráfico, se quitó su bloque de título para no duplicar el encabezado de la diapositiva y se remapearon los colores a los tokens del deck. La tipografía se rehizo al piso proyectable: índices 28 px, rótulos 32 px, detalles 28 px; los detalles del contenido se acortaron antes de reducir el tamaño. Se usa el SVG y no el GIF por nitidez, recoloreado y control de movimiento reducido.

El interruptor es `loopback: true` en una diapositiva de tipo `flow`: solo esa variante dibuja el diagrama; el resto de los flujos y bucles siguen usando las estaciones de texto.

## Un día en la fábrica

`factory-08` dibuja el día como un SVG animado en línea, con el mismo patrón que la síntesis: la diapositiva mantiene el tipo `timeline` y el interruptor `illustrated: true`. Cinco momentos sobre un riel, con hora, icono, rótulo y un detalle corto: 09:10 entra la orden, 09:35 se escribe la spec, 10:15 se construye, 11:05 revisión en paralelo y 11:40 la compuerta aplica la regla escrita.

El bucle dura 18 segundos y hace una pausa en cada momento; una sola línea de tiempo genera la posición del marcador, el avance del riel y el resaltado de la hora. El último tramo no se dibuja como una persona decidiendo: es la compuerta aplicando el estándar, y el ámbar queda reservado a la rama corta de escalación que sale de ese atraque. Los horarios son ilustrativos, no una medición, y así lo dicen la etiqueta accesible y las notas.

Geometría y tipografía: viewBox de 1680 por 480, igual que la caja de composición; horas 28 px mono, rótulos 32 px, detalles 28 px; los textos del contenido se acortaron antes de tocar el tamaño. Se usa el SVG y no el GIF por las mismas razones que en la síntesis. Con movimiento reducido queda un diagrama estático legible con los cinco momentos.

## Símbolos y estilo de escritura

Registro: español neutro, para una audiencia de varios países. No se usa voseo ni léxico regional (vos, tenés, podés, hacé, mirá, dejá, por vos, plata, laburo). Las instrucciones al ponente usan la segunda persona neutra habitual en material técnico (lee, compara, pide). Una prueba de contenido vigila voseo y regionalismos.

Decisión del autor: los textos del escenario y las notas se escriben con puntuación normal. No se usan rayas, puntos medios, comillas tipográficas ni flechas; en su lugar van comas, paréntesis, comillas rectas o la palabra «y luego». La única excepción son los caracteres de árbol del diagrama de archivos, porque son parte del dibujo. Una prueba de contenido impide que vuelvan a aparecer.

## Ilustraciones

Ocho láminas originales en `public/resources/software-factory-art/` (1600 px de ancho, 1 MB en total), generadas con el modelo de imágenes de la sesión a partir de los prompts de `docs/SOFTWARE_FACTORY_ART_BRIEF.md`. Se usan como lámina visible en portada, pausa de evidencia, ocho archivos, observabilidad, compuertas, paralelismo, círculo y cierre, y como fondo tenue solo donde hay paneles opacos encima (07 y 23). El movimiento es CSS/SVG, no GIF: se mantiene nítido a pantalla completa y respeta `prefers-reduced-motion`. Para sustituirlas por otras, guardar el mismo nombre de archivo; el brief incluye los prompts listos para pegar.

## Bibliografía y límites de atribución

| Fuente | Qué respalda |
|---|---|
| https://mcilroy.cs.dartmouth.edu/pubs.html | Catálogo de McIlroy y título de su propuesta de componentes |
| http://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF | Actas de la conferencia OTAN de Garmisch, 1968; sin páginas atribuidas aquí |
| https://agilemanifesto.org/ | Manifiesto ágil, 2001; valores y colaboración |
| https://martinfowler.com/articles/continuousIntegration.html | Explicación de integración continua como antecedente conceptual |
| https://www.anthropic.com/engineering/building-effective-agents | Diciembre 2024; workflow frente a agente, simplicidad primero |
| https://genai.owasp.org/llmrisk/llm012025-prompt-injection/ | LLM01:2025, prompt injection |
| https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ | LLM06:2025, excessive agency |
| https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/ | LLM10:2025, unbounded consumption |
| https://git-scm.com/docs/git-worktree | Árboles de trabajo y ramas; no sandbox de seguridad |

Referencias suministradas como evidencia en T2/L25–L27; esta unidad no añade supuestas verificaciones web ni benchmarks. La política de cancelación es una decisión didáctica, no una regla de las fuentes. «Fábrica» es metáfora organizativa, no estándar formal. No se hacen afirmaciones universales sobre responsabilidad legal, superioridad profesional de modelos, ahorro o seguridad garantizados.
