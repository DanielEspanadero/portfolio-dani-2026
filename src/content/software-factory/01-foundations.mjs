export default {
  id: 'foundations',
  title: 'Del taller a la fábrica',
  slides: [
    {
      id: 'factory-01', title: 'AI Software Factory', kind: 'hero',
      lead: 'Construir con IA sin entregar el volante.',
      items: [
        { label: 'Entender', detail: 'Historia, vocabulario y límites antes de automatizar.' },
        { label: 'Practicar', detail: 'Una cancelación de reserva, con pruebas y decisiones humanas.' },
        { label: 'Llevarte', detail: 'Un kit local que funciona sin contratar un modelo.' },
      ],
      notes: `Abre con una situación reconocible: pedir una funcionalidad parece sencillo hasta que alguien pregunta quién comprobará que hace lo correcto. Hoy no vamos a vender una herramienta que programe sola. Vamos a organizar decisiones, trabajo y comprobaciones alrededor de una tarea pequeña. La metáfora de fábrica ayuda a ver entradas, estaciones y controles, pero el software no es una pieza idéntica que sale de una prensa. Habrá incertidumbre y decisiones humanas. Calcula entre noventa y ciento veinte minutos, ajustables según preguntas y práctica. Aclara que el material ejecutable es educativo y aislado: no conecta reservas reales, dinero ni datos personales.`,
    },
    {
      id: 'factory-02', title: 'La fábrica es una organización', kind: 'comparison',
      lead: 'No es un producto ni un estándar formal.',
      items: [
        { label: 'Metáfora', detail: 'Entradas claras, estaciones de trabajo, controles y recuperación.' },
        { label: 'Realidad', detail: 'Personas, repositorio, herramientas y acuerdos explícitos.' },
        { label: 'Antipatrón', detail: 'Comprar agentes sin decidir qué problema deben resolver.' },
      ],
      notes: `Compara una cocina organizada con comprar un horno más rápido. El horno puede acelerar una operación, pero no decide el menú, las alergias ni cuándo retirar un plato defectuoso. En nuestra fábrica, un modelo es una capacidad dentro de un sistema mayor. La palabra no identifica aquí una certificación ni una arquitectura obligatoria. Dos equipos pueden usar herramientas distintas y compartir los mismos controles. Pide a la audiencia que nombre una entrada ambigua de su trabajo cotidiano, como mejorar el rendimiento. Esa frase todavía no permite comprobar un resultado. Antes de añadir automatización necesitaremos convertirla en un objetivo observable y acotado.`,
    },
    {
      id: 'factory-03', title: '1968: componentes fabricados en serie', kind: 'timeline',
      lead: 'La aspiración de reutilizar software es anterior a los agentes.',
      items: [
        { label: 'Garmisch, 1968', detail: 'McIlroy presentó “Mass Produced Software Components” en la conferencia de la OTAN.' },
        { label: 'Idea central', detail: 'Construir sobre componentes reutilizables, en lugar de rehacer cada pieza.' },
        { label: 'Límite histórico', detail: 'No describía los agentes generativos actuales.' },
      ],
      sources: ['https://mcilroy.cs.dartmouth.edu/pubs.html', 'http://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF'],
      notes: `Sitúa el año sin inventar una línea de progreso inevitable. En la conferencia de ingeniería del software de la OTAN celebrada en Garmisch en 1968, McIlroy presentó su propuesta sobre componentes producidos en masa. Podemos reconocer la aspiración de no reconstruir todo desde cero. No debemos convertir esa conexión en la afirmación de que ya existían nuestras fábricas con agentes. Señala las dos referencias: el catálogo del autor y las actas completas. No hace falta atribuir páginas que no hemos comprobado. Usa la analogía de tornillos compatibles: reutilizar exige interfaces y calidad conocidas, no solamente producir muchas piezas con nombres parecidos.`,
    },
    {
      id: 'factory-04', title: 'Acortar el ciclo de aprendizaje', kind: 'timeline',
      lead: 'Reutilización, integración frecuente y feedback no nacen con los LLM.',
      items: [
        { label: 'Integración continua', detail: 'Antecedente: integrar y comprobar cambios frecuentemente; no asignamos aquí una fecha fundacional.' },
        { label: 'Agile, 2001', detail: 'El manifiesto pone en valor colaboración, software funcionando y respuesta al cambio.' },
        { label: 'Hoy', detail: 'La generación acelera propuestas; el feedback sigue siendo necesario.' },
      ],
      sources: ['https://agilemanifesto.org/', 'https://martinfowler.com/articles/continuousIntegration.html'],
      notes: `Explica que esta diapositiva no es una genealogía exhaustiva. Elegimos dos antecedentes útiles para entender el trabajo actual: integrar frecuentemente y recibir información pronto. El manifiesto ágil de 2001 expresa valores; no es una receta de agentes ni obliga a usar una herramienta concreta. La explicación de integración continua de Fowler sirve para estudiar por qué acumular cambios aumenta el riesgo de sorpresa al juntarlos. Propón un ejemplo sencillo: descubrir hoy que dos módulos discrepan sobre un nombre cuesta menos que descubrirlo después de un mes de trabajo. Generar propuestas más deprisa no elimina esa discrepancia. Incluso puede multiplicar el volumen pendiente de integrar.`,
    },
    {
      id: 'factory-05', title: 'Un vocabulario compartido', kind: 'table',
      lead: 'Nombrar bien evita delegar cosas diferentes con la misma palabra.',
      items: [
        { label: 'Modelo', detail: 'Genera respuestas a partir del contexto disponible; no equivale al sistema completo.' },
        { label: 'Herramienta', detail: 'Permite una acción concreta: leer, probar o modificar archivos.' },
        { label: 'Contexto', detail: 'Información suministrada para decidir; puede estar incompleta o ser maliciosa.' },
        { label: 'Especificación', detail: 'Acuerdo observable sobre el comportamiento esperado y sus límites.' },
      ],
      notes: `Presenta el vocabulario con una biblioteca. El modelo propone una respuesta; la herramienta permite buscar un libro; el contexto incluye la pregunta y los documentos encontrados; la especificación dice qué respuesta necesitamos y cómo reconocerla. Son funciones diferentes aunque una interfaz las esconda tras una sola ventana. Un modelo sin permiso de escritura no cambia archivos por el mero hecho de sugerir código. Una herramienta con permisos amplios sí puede causar efectos aunque la respuesta parezca educada. Pide que identifiquen cuál de estas cuatro cosas falta cuando una tarea dice solamente hazlo mejor. Normalmente faltan tanto criterios observables como información concreta sobre el sistema.`,
    },
    {
      id: 'factory-06', title: 'Asistente, workflow o agente', kind: 'comparison',
      lead: 'La diferencia importante es quién elige el siguiente paso.',
      items: [
        { label: 'Asistente', detail: 'La persona dirige el intercambio y decide las acciones.' },
        { label: 'Workflow', detail: 'El programa encadena pasos por caminos predefinidos.' },
        { label: 'Agente', detail: 'El modelo decide dinámicamente pasos y herramientas dentro de sus permisos.' },
      ],
      sources: ['https://www.anthropic.com/engineering/building-effective-agents'],
      notes: `Usa el artículo de Anthropic de diciembre de 2024 como referencia para distinguir workflows y agentes, no como clasificación universal de todos los productos. Un asistente puede sugerir un test mientras tú eliges ejecutarlo. Un workflow puede exigir primero validar entradas y después generar un borrador, siguiendo rutas diseñadas. Un agente puede decidir qué archivo consultar y qué prueba ejecutar al ver un fallo. En productos reales estas formas se mezclan. Pregunta quién elige el siguiente paso en cada ejemplo. La capacidad de decidir no implica permiso ilimitado: un agente puede estar restringido a lectura y aun así decidir dinámicamente qué investigar.`,
    },
    {
      id: 'factory-07', title: 'Empieza por lo más simple', kind: 'gate',
      lead: 'La autonomía debe justificar su coste y su superficie de riesgo.',
      items: [
        { label: 'Regla estable', detail: 'Usa código determinista cuando una condición conocida resuelve el problema.' },
        { label: 'Ruta conocida', detail: 'Prueba un workflow si los pasos pueden definirse de antemano.' },
        { label: 'Exploración necesaria', detail: 'Considera un agente con límites cuando el camino depende de lo descubierto.' },
      ],
      sources: ['https://www.anthropic.com/engineering/building-effective-agents'],
      notes: `Una calculadora no necesita un agente para multiplicar el importe por un porcentaje. El núcleo de cancelación que construiremos será deliberadamente determinista. La IA puede ayudarnos a producirlo o revisarlo, pero no decidirá en producción cuánto devolver. Esta separación reduce ambigüedad y permite pruebas reproducibles. El artículo citado recomienda empezar con la solución más sencilla que funcione y aumentar complejidad cuando sea necesaria. No lo presentes como prohibición de experimentar. Pide una justificación concreta: qué incertidumbre requiere decisiones dinámicas y cómo sabremos si esa capacidad mejora el trabajo. Si nadie puede responder, empezar manualmente también es una elección técnica válida.`,
    },
    {
      id: 'factory-08', title: 'Pausa de chat: ¿dónde delegarías?', kind: 'exercise',
      lead: 'Elige una tarea pequeña, no todo tu producto.',
      items: [
        { label: 'Propuesta', detail: 'Escribe una tarea repetitiva que puedas comprobar sin confiar en la explicación del modelo.' },
        { label: 'Freno', detail: 'Nombra una decisión que no delegarías todavía.' },
      ],
      pause: true,
      notes: `Dedica unos dos minutos al chat. Recoge una propuesta acotada, como añadir una validación de fecha, y otra demasiado grande, como rehacer el sistema de pagos. No ridiculices ninguna respuesta: muestra qué información falta para convertir la segunda en una unidad comprobable. Pregunta qué daño podría producir una interpretación equivocada y quién tendría que aprobarla. Si no hay respuestas, utiliza la reserva del taller: podemos delegar una función pura, pero no autorizar cobros ni despliegues. Conserva una propuesta de la audiencia para volver a ella al final. La pausa sirve para comprobar comprensión, no para dar por sentado que todos conocen Git o pruebas automáticas.`,
    },
  ],
};
