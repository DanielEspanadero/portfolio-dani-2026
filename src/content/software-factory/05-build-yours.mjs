export default {
 id: 'build', title: 'Monta tu propia fábrica',
 slides: [
 {
 id: 'factory-24', title: 'Los ocho archivos', kind: 'code',
 plain: 'Ocho archivos de texto bastan para que otra persona siga el trabajo sin preguntarte.',
 lead: 'Cada archivo tiene una responsabilidad que se localiza sin preguntar.',
 figure: { src: '04-banco.png', mode: 'feature', alt: 'Alzado de un banco de trabajo con seis bandejas de herramientas y planos técnicos, y dos hojas de plano superpuestas.' },
 items: [
 { label: 'Acuerdo', detail: 'AGENTS.md y la spec fijan reglas y comportamiento esperado.' },
 { label: 'Trabajo', detail: 'factory contiene instrucciones de roles y un handoff sin rellenar.' },
 { label: 'Arranque', detail: 'README explica cómo empezar sin instalar dependencias ni claves.' },
 ],
 code: `software-factory/
 README.md
 AGENTS.md
 specs/cancel-booking.md
 factory/worker.md
 factory/reviewer.md
 factory/handoff.md
 src/cancellation.mjs
 tests/cancellation.test.mjs`,
 notes: `Recorre el árbol de arriba abajo y pide que no memoricen nombres todavía. README explica cómo empezar. AGENTS contiene reglas para trabajar en esta copia. La especificación define la cancelación. Los documentos de factory describen roles y entrega. La función vive en src y las comprobaciones en tests. Usamos una carpeta visible llamada factory para facilitar las descargas individuales desde un sitio estático. Las plantillas largas permanecen en el kit y no en la pantalla. Esta estructura es una propuesta educativa, no un estándar obligatorio. Lo importante es que quien continúa encuentre las decisiones sin recuperar una conversación privada. Ocho archivos bastan para practicar; no necesitas una plataforma ni una cuenta de pago.`,
 },
 {
 id: 'factory-25', title: 'Reglas operativas', kind: 'checklist',
 lead: 'Las instrucciones se señalan explícitamente; los permisos no se amplían para avanzar.',
 figure: { src: '06-carriles.png', mode: 'wash', alt: 'Tres carriles paralelos con cajas en movimiento que convergen en una compuerta vertical ámbar.' },
 items: [
 { label: 'Lectura explícita', detail: 'Pide leer AGENTS.md, la spec y worker.md antes de proponer cambios.' },
 { label: 'Superficie', detail: 'Solo los dos archivos del ejercicio; el resto queda fuera del encargo.' },
 { label: 'Parada', detail: 'Si falta una herramienta o cambia la política, se pregunta antes de improvisar.' },
 { label: 'Handoff honesto', detail: 'Comando, código de salida y límites; nunca resultados supuestos.' },
 { label: 'Manual', detail: 'El modo manual repite las mismas comprobaciones con el editor y el runner.' },
 ],
 notes: `No presupongas que un archivo con un nombre conocido se carga siempre. Distintas herramientas descubren instrucciones de formas diferentes y pueden tener reglas de precedencia propias. En el taller señalamos explícitamente los documentos que debe leer el asistente. Pedir un resumen del alcance no demuestra obediencia futura, pero permite detectar malentendidos antes de escribir. Las reglas operativas son pocas: superficie autorizada, parada ante una duda, handoff con salida real y un camino manual equivalente. Si el agente propone instalar una dependencia para restar fechas, vuelve al objetivo mínimo. Las instrucciones reducen ambigüedad; los permisos acotados y la verificación automática completan el encargo. Conserva esa distinción durante toda la demostración y no amplíes permisos para "avanzar".`,
 },
 {
 id: 'factory-26', title: 'De dónde salen la orden y el contexto', kind: 'comparison',
 plain: 'Si lo que está escrito miente, el trabajo repite el error con seguridad.',
 lead: 'Una orden no nace de la nada y un agente no adivina: ambos dependen de lo que está escrito.',
 items: [
 { label: 'Entrada', detail: 'Un issue, una alerta de producción o un pedido interno entran con enlace y contexto.' },
 { label: 'Documentación viva', detail: 'README, arquitectura y decisiones previas: lo que el agente lee antes de proponer.' },
 { label: 'Convenciones', detail: 'Estilo, comandos permitidos y límites del equipo viven en el repositorio, no en un chat.' },
 { label: 'Frescura', detail: 'Un documento desactualizado produce errores nuevos con seguridad vieja.' },
 ],
 notes: `La fábrica no empieza cuando alguien escribe en un chat. Empieza cuando una orden tiene origen rastreable: un issue con su discusión, una alerta de producción con su traza o un pedido interno con su contexto. Ese enlace evita que la orden dependa de la memoria de quien la cuenta. Después está el contexto: el agente solo conoce lo que puede leer, así que el README, la arquitectura y las decisiones anteriores son parte de la materia prima. Si esa documentación está desactualizada, el agente repetirá el error con mucha seguridad. Por eso el contexto se mantiene como código: versionado, revisable y cerca del cambio. Un equipo puede empezar con dos documentos honestos; no necesita una plataforma de contexto empresarial para la primera práctica.`,
 },
 {
 id: 'factory-27', title: 'Tu primera corrida', kind: 'code',
 lead: 'La misma prueba sirve con agente o a mano; el resultado lo aporta tu máquina.',
 items: [
 { label: 'Comando local', detail: 'Ejecuta desde la raíz de la copia del kit, no desde el portfolio.' },
 { label: 'Lo que se ve', detail: 'Node ejecuta los casos; registra la salida real en el handoff.' },
 ],
 code: `node --version
node --test tests/cancellation.test.mjs`,
 notes: `Aclara desde qué directorio se ejecuta el comando: la carpeta que contiene README, src y tests de la copia del kit, no necesariamente la raíz del portfolio. Node incluye el runner, de modo que no existe un paso de npm install. Si el comando no está disponible, no ejecutes un instalador improvisado en medio de la práctica. Quien tenga el entorno observará el resultado; los demás pueden revisar la regla y preparar casos. No mostramos una salida de éxito pregrabada como si fuera de su máquina. El resultado real depende de los archivos que tenga cada alumno. Registrarlo en el handoff es parte del ejercicio. El proceso sigue siendo válido sin contratar acceso a ningún modelo.`,
 },
 {
 id: 'factory-28', title: 'Observabilidad de la línea', kind: 'table',
 lead: 'Una fábrica que no se puede mirar por dentro pierde la confianza del equipo.',
 figure: { src: '07-panel.png', mode: 'feature', alt: 'Muro de doce pantallas de telemetría sobre una consola inclinada, con una gráfica y un indicador ámbar.' },
 items: [
 { label: 'Fase por orden', detail: 'En qué paso está cada trabajo y desde cuándo está ahí.' },
 { label: 'Cola de escaladas', detail: 'Órdenes esperando respuesta a una pregunta concreta o capacidad de revisión.' },
 { label: 'Compuertas fallidas', detail: 'Qué compuerta falló, con qué salida y cuántos reintentos acumuló.' },
 { label: 'Caja negra', detail: 'Si solo ves el resultado final, no distingues suerte de proceso.' },
 ],
 notes: `Una fábrica que no se puede mirar por dentro pierde la confianza del equipo. Lo que se observa mientras la línea corre: en qué fase está cada orden y desde cuándo, la cola de escaladas que esperan respuesta o capacidad de revisión, y las compuertas que fallan con su salida y su número de reintentos. Esa información no es vigilancia del agente: es el estado de producción, igual que un panel de planta. Si solo ves el resultado final, no distingues suerte de proceso ni puedes explicar por qué un lote tardó tres días. La caja negra obliga a confiar sin evidencia. Con fases registradas, un atasco se detecta antes de que se convierta en una entrega a ciegas.`,
 },
 ],
};
