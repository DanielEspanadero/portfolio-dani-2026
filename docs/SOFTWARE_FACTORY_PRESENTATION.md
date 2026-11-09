# AI Software Factory: contenido para enseñar y practicar

54 diapositivas en español, notas de ponente separadas y un kit local ejecutable. El renderer local integra el currículo S1, el formato de directo S2 y el control humano S3 con la dirección elegida «Plano de fábrica» (S4), sin modificar otros decks ni el player compartido (S5). **Ruta implementada:** `/presentaciones/software-factory` (S6); lectura en `/presentaciones/software-factory/guia` y HTML autónomo en `/presentaciones/software-factory/descargar.html`. Son rutas Astro prerenderizadas; su respuesta HTTP en el hosting requiere la verificación posterior del orquestador. No se ha ejecutado build ni despliegue.

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

El escenario se autoriza a 1920×1080 y el player escala cada slide una sola vez. En teléfono permanece 16:9 con bandas vacías; no se garantiza leer un directo completo en una pantalla pequeña. La guía sí redistribuye texto de forma responsive. El HTML de descarga incluye CSS, SVG, fuentes con licencia OFL y scripts sin recursos de render externos; no incluye notas ni enlaces de kit, que quedan en la guía online.

### Módulos de implementación

`src/presentations/software-factory/render.mjs` transforma los 13 tipos en composiciones distintas y escapa contenido, código y fuentes. `document.ts` une `fonts.css`, la copia íntegra `viewport-base.css`, `deck.css` y los scripts inline. No hay script local adicional: el deck usa el player compartido tal cual. `guide.css` es independiente del escenario fijo. `src/presentations/shared/render.mjs` y `player.js` se reutilizan sin cambios.

La portada usa una línea de ensamblaje con límite humano; cronologías, tablas de fronteras, advertencias causales, paneles de código, carriles paralelos y taller tienen gramática propia. Las estaciones con `data-step` reservan su geometría. Una puerta sigue indicando decisión humana pendiente después de revelar todo: avanzar no equivale a aprobar.

## Arquitectura y contrato para el renderer

Cada capítulo `.mjs` exporta por defecto `{ id, title, slides: [...] }`. `index.mjs` exporta con nombre `chapters` en orden narrativo y `slides` como concatenación de sus arrays. No hay side effects, HTML ni imports de herramientas de presentación. IDs estables `factory-01` a `factory-54`; no reconstruir IDs a partir de títulos.

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
| `pause?` | boolean; marca una pausa intencional de chat en los IDs 08, 24 y 49 |

No se usan otros campos específicos de kind en esta entrega. `quote` está permitido para evolución, sin obligación de usarlo. Existen 13 kinds utilizados. Cada item puede convertirse en nodo, fila, columna o estación según kind: no resolver todo con la misma card repetida. Las fuentes completas no deben apretarse en el escenario; ofrecerlas en notas o lectura. Las plantillas extensas pertenecen al kit.

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
| `01-foundations.mjs` | 01–08 | Metáfora no estándar; McIlroy 1968; antecedentes; vocabulario; distinción asistente/workflow/agente; pausa 08 | 12–15 min |
| `02-anatomy.mjs` | 09–16 | Entrada → propuesta → contraste → decisión; autoridad de roles; procedencia; loop acotado; handoff; palanca humana | 10–13 min |
| `03-risks.mjs` | 17–24 | Riesgos antes de crear: rubber stamp, falso verde correlacionado, inyección, permisos, coste, dependencia y recuperación; pausa 24 | 14–17 min |
| `04-create.mjs` | 25–32 | Entorno mínimo, árbol, instrucciones explícitas, política, worker, reviewer, plantilla y comando | 10–13 min |
| `05-execute.mjs` | 33–40 | API y validación, RED, tabla de segundos, repetición, GREEN, STOP real, integración distinta de despliegue | 15–18 min |
| `06-parallel.mjs` | 41–47 | Independencia, contrato, worktrees, propiedad, integración y presupuesto humano de revisión | 9–12 min |
| `07-workshop.mjs` | 48–54 | Taller ajustable y pausa 49; medir valor total, fallback, checklist, fuentes y cierre | 20–32 min |

Los rangos permiten elegir ritmo; no deben sumarse como una promesa exacta. Para un directo corto, dar la práctica como continuación local. Para uno largo, ampliar preguntas sin añadir permisos ni servicios reales.

### Puntos que no deben perderse al presentar

- 03–04: no atribuir fechas no verificadas a Hitachi/SDC ni páginas no comprobadas a las actas. CI se presenta como antecedente sin fecha fundacional.
- 06–07: Anthropic (diciembre de 2024) distingue rutas predefinidas de decisiones dinámicas y recomienda simplicidad. No es una norma universal.
- 14, 18, 30: separar revisión no garantiza independencia de razonamiento. Código y tests pueden tener el mismo error.
- 16–17, 39: control humano significa información, tiempo, autoridad para rechazar y capacidad real de detener; no mero botón.
- 28, 36–37: >=24h devuelve 100%; <24h antes devuelve 0%; inicio exacto o después rechaza intacta. Repetir conserva outcome, pero events vacío hace que la respuesta completa pueda diferir.
- 33–34: autenticación y autorización están fuera de alcance; tiempos UTC canónicos e importes válidos se verifican antes de eventos. No exponer el ejemplo como API de producción.
- 35, 38: expectativas de terminal se etiquetan como tales; cada participante registra su resultado real. No prometer una suite pasada sin observarla.
- 40, 43: rollback de código no deshace efectos externos; worktree no aísla puertos, procesos, bases de datos ni permisos.
- 46, 50: atención humana como cuello de botella; medir ciclo completo y calidad, no líneas ni ahorro prometido.

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

El checker recorre todas las diapositivas a 1280×720 y 390×844, revela pasos por teclado, comprueba proporción/encaje, cajas e ink de texto, separación de paneles, geometría reservada y slides inertes. Captura portada, cronología, flow/loop/gate, riesgo, código, tablas, paralelo y cierre. El modo interaction verifica Enter nativo con texto `\r` y click trusted, navegación, historial, foco, ausencia de controles extra, fullscreen y movimiento reducido. Reading comprueba fallback sin scripts y guía responsive/imprimible. Se registran peticiones de red y excepciones. Las métricas no sustituyen mirar las imágenes ni verifican HTTP.

No build, dependencias nuevas ni despliegue en esta unidad. El resultado observado se comunica en el handoff de implementación, no se pre-rellena en la plantilla del alumno.

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
