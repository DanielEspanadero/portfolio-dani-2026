export default {
  id: 'foundations',
  title: 'Del taller a la fábrica',
  slides: [
    {
      id: 'factory-01', title: 'AI Software Factory', kind: 'hero',
      lead: 'Un sistema de producción repetible que convierte intención en software verificado.',
      items: [
        { label: 'Entrada', detail: 'Una petición se convierte en orden de trabajo con especificación y criterios de aceptación.' },
        { label: 'Estaciones', detail: 'Agentes especializados construyen, prueban y revisan piezas pequeñas de software.' },
        { label: 'Salida', detail: 'Software integrado con evidencia de pruebas, estándares compartidos y métricas de flujo.' },
      ],
      notes: `Abre con una comparación industrial sencilla: una fábrica no es una máquina, es una organización que repite pasos conocidos. La entrada es una intención todavía vaga; la salida es código integrado con pruebas ejecutadas. Entre ambas hay estaciones con funciones distintas y estándares que se aplican siempre igual. Hoy veremos qué contiene cada estación, qué evidencia deja y cómo se mide si la línea mejora. La IA aporta la mayor parte del trabajo de producción: escribir, probar y revisar piezas. Las personas definen el encargo, fijan los estándares y deciden sobre las excepciones. Calcula entre noventa y ciento veinte minutos, ajustables según preguntas y práctica. El material ejecutable es educativo y aislado: no conecta reservas reales, dinero ni datos personales.`,
    },
    {
      id: 'factory-02', title: 'No es un producto, es una organización', kind: 'comparison',
      lead: 'Comprar agentes no crea una fábrica; falta el flujo que los ordena.',
      items: [
        { label: 'Metáfora', detail: 'Entradas, estaciones, estándares, compuertas y recuperación.' },
        { label: 'Realidad', detail: 'Repositorio, herramientas, acuerdos explícitos y personas responsables.' },
        { label: 'Antipatrón', detail: 'Encadenar herramientas sin decidir qué problema resuelven.' },
      ],
      notes: `Compara una cocina organizada con comprar un horno más rápido. El horno acelera una operación, pero no decide el menú, las alergias ni cuándo retirar un plato defectuoso. En nuestra fábrica, un modelo es una capacidad dentro de un sistema mayor. La palabra no identifica una certificación ni una arquitectura obligatoria. Dos equipos pueden usar herramientas distintas y compartir los mismos controles. Pide a la audiencia que nombre una entrada ambigua de su trabajo cotidiano, como mejorar el rendimiento. Esa frase todavía no permite comprobar un resultado. Convertirla en un objetivo observable y acotado es el primer paso real de la fábrica. Sin esa entrada, cualquier estación producirá algo que nadie puede aceptar ni rechazar con argumentos.`,
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
        { label: 'Hoy', detail: 'La generación acelera propuestas; integrar y verificar marcan el ritmo.' },
      ],
      sources: ['https://agilemanifesto.org/', 'https://martinfowler.com/articles/continuousIntegration.html'],
      notes: `Explica que esta diapositiva no es una genealogía exhaustiva. Elegimos dos antecedentes útiles para entender el trabajo actual: integrar frecuentemente y recibir información pronto. El manifiesto ágil de 2001 expresa valores; no es una receta de agentes ni obliga a usar una herramienta concreta. La explicación de integración continua de Fowler sirve para estudiar por qué acumular cambios aumenta el riesgo de sorpresa al juntarlos. Propón un ejemplo sencillo: descubrir hoy que dos módulos discrepan sobre un nombre cuesta menos que descubrirlo después de un mes de trabajo. Generar propuestas más deprisa no elimina esa discrepancia. Incluso puede multiplicar el volumen pendiente de integrar.`,
    },
    {
      id: 'factory-05', title: 'Un vocabulario compartido', kind: 'checklist',
      lead: 'Nombrar bien evita delegar cosas diferentes con la misma palabra.',
      items: [
        { label: 'Modelo', detail: 'Genera respuestas a partir del contexto disponible; no equivale al sistema completo.' },
        { label: 'Herramienta', detail: 'Permite una acción concreta: leer, probar o modificar archivos.' },
        { label: 'Contexto', detail: 'Información suministrada para decidir; puede estar incompleta o ser maliciosa.' },
        { label: 'Especificación', detail: 'Acuerdo observable sobre el comportamiento esperado y sus límites.' },
        { label: 'Orden de trabajo', detail: 'Spec más criterios de aceptación, superficie autorizada y comando de verificación.' },
      ],
      notes: `Presenta el vocabulario con una biblioteca. El modelo propone una respuesta; la herramienta permite buscar un libro; el contexto incluye la pregunta y los documentos encontrados; la especificación dice qué respuesta necesitamos y cómo reconocerla. La orden de trabajo reúne spec, criterios, superficie y comando de verificación: es la unidad que entra en la fábrica. Son funciones diferentes aunque una interfaz las esconda tras una sola ventana. Un modelo sin permiso de escritura no cambia archivos por sugerir código; una herramienta con permisos amplios sí puede causar efectos. Pide que identifiquen cuál de estas cinco piezas falta cuando una tarea dice solamente hazlo mejor. Normalmente faltan criterios observables e información concreta del sistema.`,
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
      id: 'factory-07', title: 'Empieza por lo más simple', kind: 'checklist',
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
      id: 'factory-08', title: 'Pausa de chat: ¿qué encargo escribirías?', kind: 'exercise',
      lead: 'Elige una tarea pequeña y comprobable, no todo tu producto.',
      items: [
        { label: 'Propuesta', detail: 'Escribe una tarea repetitiva que puedas comprobar sin confiar en el modelo.' },
        { label: 'Criterio', detail: 'Añade un ejemplo que debe pasar y otro que debe fallar.' },
        { label: 'Límite', detail: 'Nombra una decisión que todavía no delegarías.' },
      ],
      pause: true,
      notes: `Dedica unos dos minutos al chat. Recoge una propuesta acotada, como añadir una validación de fecha, y otra demasiado grande, como rehacer el sistema de pagos. No ridiculices ninguna respuesta: muestra qué información falta para convertir la segunda en una orden de trabajo comprobable. Pregunta qué ejemplo debería pasar y qué ejemplo debería fallar. Si nadie puede responder, la tarea aún no está escrita. Si no hay respuestas, usa la reserva del taller: podemos delegar una función pura, pero no autorizar cobros ni despliegues. Conserva una propuesta de la audiencia para volver al final. La pausa comprueba comprensión, no da por supuesto que todos conozcan Git o pruebas automáticas.`,
    },
  ],
};
