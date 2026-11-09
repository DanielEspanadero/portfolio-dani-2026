export default {
  id: 'workshop', title: 'Taller y puesta en marcha responsable',
  slides: [
    {
      id: 'factory-48', title: 'Taller: una vuelta completa', kind: 'exercise',
      lead: 'Practica una unidad pequeña antes de diseñar una gran plataforma.',
      items: [
        { label: 'Preparar', detail: 'Copia el kit, lee instrucciones y calcula los casos frontera.' },
        { label: 'Construir', detail: 'En copia desechable: stub, RED observado, implementación y GREEN observado.' },
        { label: 'Entregar', detail: 'Revisa el diff y completa el handoff; detente antes de integrar.' },
      ], steps: true,
      notes: `Reserva un bloque práctico ajustable de unos quince a veinte minutos si el entorno ya está preparado; no prometas que todos lo terminarán en ese tiempo. La unidad consiste en reproducir un ciclo, no en diseñar un servicio completo. Primero se leen las reglas y se calculan las fronteras. Después se usa una copia desechable para observar un fallo por comportamiento ausente. Se implementa y se registra lo que ocurre al ejecutar las pruebas. Por último, otra persona o el propio alumno con una pausa revisa el cambio desde la spec. El handoff queda pendiente de decisión humana. Quien trabaje sin modelo realiza exactamente las mismas comprobaciones.`,
    },
    {
      id: 'factory-49', title: 'Pausa: explica tu decisión', kind: 'exercise',
      lead: 'Demuestra comprensión con un caso, no con una captura verde.',
      items: [
        { label: 'Pregunta', detail: '¿Por qué repetir conserva outcome pero devuelve events vacío?' },
        { label: 'Contraste', detail: '¿Qué cambia un segundo antes y exactamente al inicio?' },
        { label: 'Entrega al chat', detail: 'Comparte una duda o un defecto concreto, nunca datos personales ni credenciales.' },
      ], pause: true,
      notes: `Abre la tercera y última pausa intencional de chat. Busca una explicación que distinga estado persistido de acciones nuevas: el recibo original permanece, pero no se vuelve a solicitar una devolución. Si alguien dice que toda la respuesta es idéntica, vuelve al campo events y corrige con cuidado. Para la frontera del inicio, pide comparar dos tiempos concretos en UTC. No hace falta que compartan código completo ni archivos de su empresa; una pregunta bien formulada basta. Si aparece un fallo de entorno, sepáralo del comportamiento de la función. Cierra recuperando la tarea que propuso la audiencia al principio y preguntando qué contrato y freno le añadirían ahora.`,
    },
    {
      id: 'factory-50', title: 'Medir valor, no líneas', kind: 'table',
      lead: 'La automatización merece quedarse si mejora resultados observables.',
      items: [
        { label: 'Tiempo completo', detail: 'Incluye preparar contexto, revisar, corregir e integrar; no solo generar.' },
        { label: 'Calidad', detail: 'Observa defectos escapados, retrabajo y claridad del comportamiento.' },
        { label: 'Coste', detail: 'Cuenta recursos, herramientas y atención humana; compara tareas similares.' },
        { label: 'Comprensión', detail: 'Comprueba si el equipo puede mantener el resultado sin el agente.' },
      ],
      notes: `Propón registrar una línea base manual antes de afirmar que existe ahorro. Una tarea con IA puede producir código en minutos y consumir después una hora de revisión; medir solo la primera fase engaña. Las líneas añadidas tampoco expresan valor: borrar una complejidad innecesaria puede ser el mejor resultado. Para comparar, busca tareas de dificultad parecida y anota también contexto, errores y límites de la muestra. No ofrecemos porcentajes de productividad ni una garantía de seguridad. El taller enseña a formular una hipótesis medible: quizá esta tarea repetitiva reduzca tiempo total sin aumentar defectos. Si los datos no lo respaldan, ajustar o retirar la automatización es una decisión razonable.`,
    },
    {
      id: 'factory-51', title: 'El modo manual no es un fracaso', kind: 'comparison',
      lead: 'El proceso debe seguir siendo comprensible cuando falta el proveedor.',
      items: [
        { label: 'Con agente', detail: 'Delegas propuestas dentro de alcance; conservas pruebas y decisiones.' },
        { label: 'Sin agente', detail: 'Editas a mano y ejecutas exactamente el mismo contrato y runner.' },
        { label: 'Continuidad', detail: 'Documentos portables y conocimiento compartido reducen dependencia operativa.' },
      ],
      notes: `Imagina que el modelo no está disponible durante una sesión de trabajo o que el presupuesto se ha agotado. La especificación no desaparece y los tests siguen funcionando. Una persona puede leer la tabla, implementar la condición y verificar la respuesta. Ese camino alternativo es parte del diseño, no un recurso vergonzante. También sirve para detectar cuándo hemos añadido una capa que complica más de lo que ayuda. No prometemos que cualquier equipo pueda sustituir inmediatamente todas sus herramientas; hablamos de conservar comprensión y capacidad de avanzar en una unidad acotada. En el kit, ninguna prueba importa un SDK de modelos ni requiere una clave, precisamente para mantener esa independencia básica.`,
    },
    {
      id: 'factory-52', title: 'Checklist de tu primera fábrica', kind: 'checklist',
      lead: 'No necesitas una plataforma; necesitas un primer acuerdo verificable.',
      items: [
        { label: 'Unidad pequeña', detail: 'Una conducta, ejemplos frontera, errores y exclusiones explícitas.' },
        { label: 'Permisos limitados', detail: 'Archivos autorizados, sin secretos y con acciones sensibles separadas.' },
        { label: 'Evidencia y parada', detail: 'Pruebas reproducibles, presupuesto finito y handoff honesto.' },
        { label: 'Persona disponible', detail: 'Tiempo para comprender, rechazar y decidir antes de integrar.' },
        { label: 'Recuperación', detail: 'Alternativa manual y límites de rollback conocidos.' },
      ],
      notes: `Invita a escoger una tarea real pequeña para la semana siguiente, no a desplegar una flota de agentes al acabar el directo. Recorre la lista en orden: comportamiento, permisos, pruebas, persona y recuperación. Si falta una pieza, no se soluciona aumentando la autonomía. Por ejemplo, si nadie tiene tiempo de revisar, reduce el lote antes de acelerar la generación. Si no puedes definir cómo detectar un error, vuelve al contrato. Si una tarea requiere secretos o acciones externas, diseña un ejercicio aislado antes de conectarla. La lista no certifica seguridad absoluta; sirve para descubrir carencias temprano. El primer éxito debería ser un cambio comprensible y comprobado, aunque sea muy pequeño.`,
    },
    {
      id: 'factory-53', title: 'Fuentes para seguir contrastando', kind: 'table',
      lead: 'Separa hechos históricos, recomendaciones de diseño y decisiones de este taller.',
      items: [
        { label: 'Historia', detail: 'McIlroy y actas OTAN; manifiesto ágil; explicación de integración continua de Fowler.' },
        { label: 'Agentes', detail: 'Anthropic, Building Effective Agents, diciembre de 2024; distinción workflow/agente.' },
        { label: 'Riesgos', detail: 'OWASP: prompt injection, excessive agency y unbounded consumption, edición 2025.' },
        { label: 'Herramientas', detail: 'Documentación oficial de Git worktree; no implica aislamiento de procesos.' },
      ],
      sources: [
        'https://mcilroy.cs.dartmouth.edu/pubs.html',
        'http://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF',
        'https://agilemanifesto.org/',
        'https://martinfowler.com/articles/continuousIntegration.html',
        'https://www.anthropic.com/engineering/building-effective-agents',
        'https://genai.owasp.org/llmrisk/llm012025-prompt-injection/',
        'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/',
        'https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/',
        'https://git-scm.com/docs/git-worktree',
      ],
      notes: `Explica cómo leer la bibliografía sin atribuirle más de lo que dice. Las actas y el catálogo de McIlroy respaldan el hito histórico, no una fecha de nacimiento de los agentes actuales. El manifiesto y Fowler ayudan a comprender feedback e integración. Anthropic aporta una distinción de diseño útil y recomienda empezar sencillo; no impone una arquitectura universal. OWASP organiza riesgos que debemos analizar según el contexto. Git documenta la herramienta, no promete una frontera de seguridad. La regla de veinticuatro horas es una decisión didáctica propia del taller, no una recomendación de esas fuentes. Los enlaces completos también están en la guía para poder consultarlos después del directo.`,
    },
    {
      id: 'factory-54', title: 'Más capacidad, mejor criterio', kind: 'closing',
      lead: 'Automatiza propuestas; conserva comprensión, evidencia y capacidad de parar.',
      items: [
        { label: 'Hoy', detail: 'Un contrato pequeño, una función local y una revisión con preguntas concretas.' },
        { label: 'Siguiente paso', detail: 'Repite el ciclo en una tarea real acotada y mide el resultado completo.' },
        { label: 'Recuerda', detail: 'Aceptar código, integrar y publicar son decisiones distintas.' },
      ],
      notes: `Cierra regresando a la imagen del volante. Una fábrica útil no elimina al conductor para demostrar que tiene motor; organiza el trabajo para que las decisiones lleguen con información suficiente. Hemos pasado de una metáfora histórica a una unidad ejecutable, atravesando riesgos antes de conceder permisos. El kit permite practicar sin proveedor y la documentación conserva el contrato para futuras revisiones. No hemos construido una aplicación de reservas lista para producción ni probado todas las amenazas posibles. Invita a compartir qué tarea pequeña intentarán y qué decisión humana conservarán. El objetivo final no es generar más texto o más código, sino entregar cambios que alguien pueda explicar, comprobar y mantener.`,
    },
  ],
};
