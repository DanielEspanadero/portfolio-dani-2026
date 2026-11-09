export default {
 id: 'closing', title: 'Cerrar el círculo',
 slides: [
 {
 id: 'factory-33', title: 'El flujo completo, de una pieza', kind: 'flow', loopback: true,
 plain: 'Todo lo anterior es una sola cadena: lo que entra vuelve a entrar si algo falla.',
 lead: 'Ahora sí, todas las piezas juntas y en el orden en que ocurren.',
 items: [
 { label: 'Entrada', detail: 'Un issue, una alerta o un pedido interno, con enlace y contexto.' },
 { label: 'Orden y spec', detail: 'La petición se convierte en criterios que se pueden comprobar.' },
 { label: 'Construcción', detail: 'Un agente implementa en un espacio aislado y ejecuta las pruebas.' },
 { label: 'Revisión y compuertas', detail: 'Revisores independientes y automatización buscan contradicciones.' },
 { label: 'Integración y operación', detail: 'Entra al producto, se despliega y se observa con la vuelta atrás lista.' },
 ],
 notes: `Recorre la cadena de izquierda a derecha sin prisa y nombra cada estación con lo que ya vieron. Esta es la diapositiva que conviene dejar en pantalla al cerrar, porque une el mapa de planta, el bucle de agentes y el círculo de producción. Insiste en dos cosas. Primero, la cadena es la misma cada vez: por eso se llama fábrica. Segundo, la flecha de abajo no es decorativa: lo que la operación observa vuelve a entrar como orden nueva, con su propio enlace y contexto. Si una compuerta falla, el trabajo no avanza; si la decisión es devolver, vuelve a construcción con el defecto escrito. Nada de esto promete autonomía total: promete un camino conocido, con evidencia en cada tramo y una persona en el punto donde hay que elegir.`,
 },
 {
 id: 'factory-34', title: 'Del despliegue a la siguiente orden', kind: 'circle',
 lead: 'Una alerta en producción es una orden de trabajo nueva, no el final del proceso.',
 figure: { src: '08-circulo.png', mode: 'feature', alt: 'Círculo de flechas que conecta una fábrica, un nodo de telemetría y un nodo de órdenes; el arco de retorno es discontinuo.' },
 items: [
 { label: 'Desplegar', detail: 'Autorización separada, observabilidad y plan de recuperación probado.' },
 { label: 'Observar', detail: 'Telemetría, alertas e incidencias reales alimentan el backlog.' },
 { label: 'Nueva orden', detail: 'Un fallo en producción vuelve a entrar como spec con criterios reproducibles.' },
 { label: 'Volver atrás', detail: 'La misma fábrica prepara y verifica el rollback de su propio cambio.' },
 ], steps: true,
 notes: `El despliegue no cierra el proceso: lo reabre. La telemetría y las alertas dicen qué está pasando con usuarios reales; una incidencia concreta se convierte en una orden de trabajo nueva, con spec, criterios y reproducción. Un fallo en producción es información de entrada, no una derrota. La misma fábrica prepara y verifica la vuelta atrás: revertir el código, comprobar el conjunto y decidir qué efectos externos quedan pendientes. Ese ida y vuelta es lo que distingue una línea de una demo. Si el equipo solo sabe desplegar y no sabe volver, la fábrica produce riesgo. Si sabe volver y además convierte el incidente en una prueba permanente, aprende. Las estaciones no se jubilan al publicar.`,
 },
 {
 id: 'factory-35', title: 'Medir coste, calidad y ciclo', kind: 'table',
 plain: 'Una entrega barata que obliga a rehacer es más cara que una entrega lenta.',
 lead: 'El coste es una palanca de diseño: se compara con el ciclo y los defectos escapados.',
 items: [
 { label: 'Coste por funcionalidad', detail: 'Tokens, contexto compartido y reintentos de ese lote concreto.' },
 { label: 'Tiempo de ciclo', detail: 'Desde la orden hasta la integración, con revisión y correcciones incluidas.' },
 { label: 'Defectos escapados', detail: 'Qué llegó a producción y cuánto costó detectarlo tarde.' },
 { label: 'Decisión', detail: 'Elige modelo y paralelismo según esa comparación, no por moda.' },
 ],
 notes: `El coste es una palanca de diseño, no solo un límite. Los subagentes intercambian contexto y ese intercambio cuesta tokens: cada estación añade una factura pequeña que se acumula. Para comparar dos formas de trabajar, mira tres cosas juntas: coste por funcionalidad, tiempo de ciclo y defectos escapados. Un lote barato que provoca retrabajo sale caro; un lote caro que evita un incidente puede ser la mejor compra. No damos cifras ni porcentajes: dependen del modelo, del repositorio y del equipo, y aquí no hemos medido nada. Registra una línea base manual antes de afirmar que existe ahorro. La decisión razonable es elegir modelo, paralelismo y presupuesto según esa comparación.`,
 },
 {
 id: 'factory-36', title: 'Cierre y checklist de arranque', kind: 'closing',
 lead: 'Definir, construir, verificar, integrar y medir: eso es una fábrica de software con IA.',
 figure: { src: '01-planta.png', mode: 'feature', alt: 'Plano isométrico de línea fina: tres módulos de producción unidos por una cinta, con una bandeja ámbar de inspección al costado.' },
 items: [
 { label: 'Hoy', detail: 'Una orden pequeña, una función local y evidencia observada.' },
 { label: 'Siguiente', detail: 'Repite el ciclo en una tarea real y mide ciclo y defectos.' },
 { label: 'Arranque', detail: 'Una conducta, permisos limitados, presupuesto y handoff honesto.' },
 { label: 'Límite', detail: 'El taller no es una aplicación lista para producción.' },
 ],
 notes: `Cierra volviendo al concepto inicial: una fábrica es un sistema de producción repetible. La intención se convirtió en una orden de trabajo; la orden pasó por estaciones especializadas; las compuertas automáticas filtraron lo que no cumplía; el cambio llegó integrado con evidencia y un plan de vuelta atrás. Hemos visto el bucle con su tope de reintentos, el estado en archivos, la política de escalado, la observabilidad y ocho formas de fallar. El kit permite practicar sin proveedor y la documentación conserva el contrato. No hemos construido una aplicación de reservas lista para producción ni probado todas las amenazas. Invita a compartir qué tarea pequeña intentarán y cómo medirán su tiempo de ciclo.`,
 },
 ],
};
