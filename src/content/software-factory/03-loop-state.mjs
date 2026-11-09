export default {
 id: 'loop', title: 'El bucle y su estado',
 slides: [
 {
 id: 'factory-15', title: 'El bucle completo', kind: 'loop',
 plain: 'La máquina repite a lo sumo unas vueltas y luego entrega lo que tiene.',
 lead: 'Un agente escribe la spec, otro construye, revisores independientes juzgan y alguien decide.',
 items: [
 { label: 'Spec writer', detail: 'Convierte la petición en contrato observable con casos frontera.' },
 { label: 'Builder', detail: 'Implementa en una superficie acotada y ve el fallo antes de arreglarlo.' },
 { label: 'Revisores en paralelo', detail: 'Dos o tres miradas independientes buscan contradicciones contra el contrato.' },
 { label: 'Decisión', detail: 'Fusionar, devolver con un defecto concreto o escalar a una persona.' },
 { label: 'Tope de reintentos', detail: 'Un número fijo de vueltas; al agotarse, el lote sale con evidencia.' },
 ], steps: true,
 notes: `Este es el corazón que faltaba: el bucle no son cuatro cajas, es una máquina con presupuesto. El agente de spec escribe el contrato; el constructor implementa en una superficie acotada; dos o tres revisores reciben el contrato y el cambio, no el relato del constructor, y buscan contradicciones por separado; la decisión fusiona, devuelve con un defecto concreto o escala. El tope de reintentos es parte del diseño: tres vueltas, por ejemplo, y al agotarse el lote sale con evidencia para que alguien decida. Compartir el mismo modelo y el mismo resumen no garantiza una revisión independiente; el contraste con la regla escrita y un cálculo manual sí ayuda. Dibuja también la salida: un bucle sin salida ocupa la línea sin entregar piezas.`,
 },
 {
 id: 'factory-16', title: 'El estado vive en archivos', kind: 'files',
 plain: 'Lo que se decide queda escrito en archivos que cualquiera puede leer mañana.',
 lead: 'Backlog, una spec por trabajo y un registro de estado: markdown que una persona puede leer.',
 items: [
 { label: 'Backlog', detail: 'Lista ordenada de trabajo pendiente con prioridad y tamaño aproximado.' },
 { label: 'Una spec por trabajo', detail: 'Cada orden tiene su archivo; el contrato se lee sin abrir un chat.' },
 { label: 'Registro de estado', detail: 'Tablero con fase, responsable y siguiente acción de cada orden.' },
 { label: 'Texto plano', detail: 'Markdown versionado: se lee, se compara y se revisa con las mismas herramientas.' },
 ],
 notes: `Una fábrica necesita memoria que no viva en un chat. El backlog es una lista ordenada de trabajo pendiente, con prioridad y tamaño aproximado. Cada orden tiene su propia spec en un archivo: el contrato se lee sin recuperar una conversación privada. Un registro de estado, como un tablero, dice en qué fase está cada orden, quién la tiene y cuál es la siguiente acción. Todo en markdown versionado, que se lee, se compara y se revisa con las mismas herramientas que el código. Eso permite reconstruir por qué se decidió algo y qué quedó pendiente. Lo que no está en un archivo se pierde al cambiar de sesión o de herramienta. Lo que está, cualquiera puede auditarlo y corregirlo.`,
 },
 {
 id: 'factory-17', title: 'Quién decide y cuándo escalar', kind: 'table',
 plain: 'Algunos cambios los cierra la máquina; los que no se deshacen pasan por una persona.',
 lead: 'Un agente puede fusionar lotes verdes; lo irreversible siempre escala a una persona.',
 items: [
 { label: 'Fusiona solo', detail: 'Cambio dentro de la spec, compuertas verdes y superficie autorizada.' },
 { label: 'Escala pagos', detail: 'Cualquier cambio que mueva dinero o precios sale del piloto automático.' },
 { label: 'Escala accesos', detail: 'Permisos, credenciales y autenticación requieren una persona explícita.' },
 { label: 'Escala lo irreversible', detail: 'Migraciones, borrados e invalidación de caché no se deshacen solos.' },
 { label: 'Tope y registro', detail: 'Número fijo de reintentos; al agotarse, se entrega el fallo.' },
 ],
 notes: `Un agente puede decidir sin pedir permiso cuando el cambio está dentro de la spec, las compuertas están verdes y la superficie era la autorizada: eso es fusionar. Fuera de ahí, escala a una persona. Las reglas de escalado son explícitas: pagos y precios, accesos y credenciales, invalidación de caché, migraciones y borrados, y cualquier efecto que no se pueda deshacer. El aprobador no juzga estética; comprueba que la decisión cae en la zona permitida y que existe evidencia. Hay un tope de reintentos: cuando se agota, no se abre otro bucle, se entrega el fallo con lo observado. Ese límite evita que una duda se convierta en gasto silencioso. Y el registro de la decisión queda escrito, con motivo, para la siguiente persona.`,
 },
 {
 id: 'factory-18', title: 'Política de modelos y esfuerzo', kind: 'comparison',
 plain: 'Pagar por el cerebro más capaz para el plan; usar los rápidos para tareas pequeñas.',
 lead: 'El modelo caro orquesta; los subagentes baratos ejecutan; el mejor modelo mejora la fábrica.',
 items: [
 { label: 'Orquestador', detail: 'Un modelo capaz planifica, escribe contratos y resuelve ambigüedad.' },
 { label: 'Subagentes', detail: 'Modelos rápidos ejecutan tareas acotadas con contrato y evidencia.' },
 { label: 'Mejorar la fábrica', detail: 'El modelo más fuerte revisa el proceso, no escribe más código.' },
 { label: 'Riesgo', detail: 'Bajar de modelo en una tarea difícil multiplica reintentos y coste total.' },
 ],
 notes: `Piensa en un equipo con un senior y varios juniors rápidos. El senior planifica, escribe el contrato y resuelve la ambigüedad; los juniors ejecutan tareas acotadas y devuelven evidencia. Funciona porque el contrato está escrito y la tarea es pequeña. Falla cuando la tarea difícil se asigna al modelo barato: aparecen reintentos, revisiones y un coste total mayor que el ahorro aparente. Por eso conviene probar el modelo más capaz en la tarea que más incertidumbre tiene, y usar el mejor modelo disponible para mejorar la propia fábrica: revisar el proceso, detectar fallos repetidos y escribir mejores reglas. El esfuerzo también se gradúa: no todas las estaciones necesitan el mismo razonamiento ni el mismo presupuesto de contexto.`,
 },
 ],
};
