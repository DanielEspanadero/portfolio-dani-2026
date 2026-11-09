export default {
  id: 'foundations',
  title: 'Qué es una fábrica de software',
  slides: [
    {
      id: 'factory-01', title: 'AI Software Factory', kind: 'hero',
      lead: 'Un sistema de producción repetible que convierte intención en software verificado.',
      figure: { src: '01-planta.png', mode: 'feature', alt: 'Plano isométrico de línea fina: tres módulos de producción unidos por una cinta, con una bandeja ámbar de inspección al costado.' },
      items: [
        { label: 'Entrada', detail: 'Una petición se convierte en orden de trabajo con especificación y criterios de aceptación.' },
        { label: 'Estaciones', detail: 'Agentes especializados construyen, prueban y revisan piezas pequeñas de software.' },
        { label: 'Salida', detail: 'Software integrado con evidencia de pruebas, estándares compartidos y métricas de flujo.' },
      ],
      notes: `Empecemos con la metáfora industrial: una fábrica no es una máquina, es una organización que repite pasos conocidos. La entrada es una intención todavía vaga; la salida es software integrado con pruebas ejecutadas. Entre las dos hay estaciones con funciones distintas y estándares que se aplican siempre igual. Hoy veremos qué contiene cada estación, qué evidencia deja, cómo falla y cómo se mide si la línea mejora. La IA aporta la mayor parte del trabajo de producción: escribir, probar y revisar piezas pequeñas. Las personas definen el encargo, fijan los estándares y deciden sobre las excepciones. Son unas dos horas con preguntas. El material ejecutable es educativo y aislado: no conecta reservas reales, dinero ni datos personales, y no publica nada en tu nombre.`,
    },
    {
      id: 'factory-02', title: 'No es un producto: es una organización', kind: 'comparison',
      lead: 'Comprar agentes no crea una fábrica; falta el flujo que los ordena.',
      items: [
        { label: 'Metáfora', detail: 'Entradas, estaciones, estándares, compuertas y recuperación.' },
        { label: 'Realidad', detail: 'Repositorio, herramientas, acuerdos explícitos y personas responsables.' },
        { label: 'Antipatrón', detail: 'Encadenar herramientas sin decidir qué problema resuelven.' },
      ],
      notes: `Compara una cocina organizada con comprar un horno más rápido: el horno acelera una operación, pero no decide el menú, las alergias ni cuándo retirar un plato defectuoso. En la fábrica, un modelo es una capacidad dentro de un sistema mayor. La palabra no identifica una certificación ni una arquitectura obligatoria; dos equipos pueden usar herramientas distintas y compartir los mismos controles. Pide a la audiencia que nombre una entrada ambigua de su trabajo cotidiano, como mejorar el rendimiento. Esa frase no permite comprobar un resultado. Convertirla en un objetivo observable y acotado es el primer paso real. Sin esa entrada, cualquier estación producirá algo que nadie puede aceptar ni rechazar con argumentos.`,
    },
    {
      id: 'factory-03', title: '1968: dos orígenes, una aspiración', kind: 'timeline',
      lead: 'La idea de fabricar software con piezas reutilizables es anterior a los agentes.',
      items: [
        { label: 'Bemer, General Electric', detail: 'Describió en 1968 una “software factory” para organizar el desarrollo de programas.' },
        { label: 'McIlroy, Garmisch', detail: 'Presentó “Mass Produced Software Components” en la conferencia de la OTAN.' },
        { label: 'Idea común', detail: 'Fabricar software con piezas reutilizables y procesos repetibles, no como arte único.' },
      ],
      sources: ['https://mcilroy.cs.dartmouth.edu/pubs.html', 'http://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF'],
      notes: `Aquí conviene separar dos sentidos que se confunden. Bemer describió en 1968, en General Electric, una «software factory» como forma de organizar el desarrollo de programas: procesos, especialización y control. Ese mismo año, en la conferencia de la OTAN en Garmisch, McIlroy presentó su propuesta de componentes producidos en masa: construir sobre piezas reutilizables en lugar de rehacerlo todo. Las dos ideas apuntan a la misma aspiración, pero no describían agentes generativos. Citamos el catálogo y las actas de McIlroy; no añadimos páginas ni fechas que no hayamos comprobado. Usa la analogía del tornillo: reutilizar exige interfaces y calidad conocidas, no solo producir muchas piezas parecidas.`,
    },
    {
      id: 'factory-04', title: 'De cascada a CI/CD a agentes', kind: 'flow',
      lead: 'Reutilizar, integrar pronto y responder al cambio no nacen con los modelos.',
      items: [
        { label: 'Cascada', detail: 'Fases largas y feedback tardío: el error aparece cuando ya nadie recuerda la decisión.' },
        { label: 'Integración continua', detail: 'Integrar y comprobar con frecuencia; sin fecha fundacional inventada.' },
        { label: 'Ágil, 2001', detail: 'El manifiesto valora colaboración, software funcionando y respuesta al cambio.' },
        { label: 'Agentes', detail: 'Generan propuestas rápido; integrar y verificar siguen marcando el ritmo.' },
      ], steps: true,
      sources: ['https://agilemanifesto.org/', 'https://martinfowler.com/articles/continuousIntegration.html'],
      notes: `Esta diapositiva no es una genealogía exhaustiva; elige tres antecedentes útiles. La cascada alargaba las fases y dejaba el feedback para el final: el error aparecía cuando ya nadie recordaba la decisión. La integración continua propone lo contrario: unir y comprobar con frecuencia. No le asignamos una fecha fundacional porque el término tiene varias. El manifiesto ágil de 2001 aporta valores: colaboración, software funcionando, respuesta al cambio; no es una receta de agentes. Hoy los modelos aceleran la generación de propuestas, pero el ritmo real lo marcan integrar y verificar. Generar más deprisa sin integrar solo multiplica el material pendiente. Propón un ejemplo cotidiano: descubrir hoy una discrepancia de nombres cuesta menos que descubrirla tras un mes de trabajo.`,
    },
    {
      id: 'factory-05', title: 'Un vocabulario mínimo', kind: 'checklist',
      lead: 'Nombrar bien evita delegar cosas distintas con la misma palabra.',
      items: [
        { label: 'Modelo', detail: 'Genera respuestas a partir del contexto disponible; no equivale al sistema completo.' },
        { label: 'Herramienta', detail: 'Permite una acción concreta: leer, probar o modificar archivos.' },
        { label: 'Contexto', detail: 'Información suministrada para decidir; puede estar incompleta o ser maliciosa.' },
        { label: 'Especificación', detail: 'Acuerdo observable sobre el comportamiento esperado y sus límites.' },
        { label: 'Orden de trabajo', detail: 'Spec más criterios de aceptación, superficie autorizada y comando de verificación.' },
      ],
      notes: `Presenta el vocabulario con una biblioteca. El modelo propone una respuesta; la herramienta permite buscar un libro; el contexto incluye la pregunta y los documentos encontrados; la especificación dice qué respuesta necesitamos y cómo reconocerla. La orden de trabajo reúne spec, criterios, superficie y comando de verificación: es la unidad que entra en la fábrica. Son funciones diferentes aunque una interfaz las esconda tras una sola ventana. Un modelo sin permiso de escritura no cambia archivos por sugerir código; una herramienta con permisos amplios sí puede causar efectos. Pide que identifiquen qué falta cuando una tarea dice solamente «hazlo mejor». Normalmente faltan criterios observables y contexto del sistema. Ese hueco es lo que hará fallar la línea más adelante.`,
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
      notes: `Usa el artículo de Anthropic de diciembre de 2024 como referencia para distinguir workflows y agentes, no como clasificación universal de todos los productos. Un asistente puede sugerir un test mientras tú eliges ejecutarlo. Un workflow puede exigir validar entradas y después generar un borrador, siguiendo caminos diseñados por el programa. Un agente decide dinámicamente qué archivo consultar y qué prueba ejecutar al ver un fallo. En productos reales estas formas se mezclan. Pregunta quién elige el siguiente paso en cada ejemplo. Decidir no implica permiso ilimitado: un agente puede estar restringido a lectura y aun así elegir qué investigar. Esa distinción importa porque el siguiente capítulo reparte funciones entre varios agentes, y no todos necesitan la misma autonomía. Y un cálculo con reglas conocidas no necesita un agente.`,
    },
  ],
};
