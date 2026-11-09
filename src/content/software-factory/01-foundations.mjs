export default {
 id: 'foundations',
 title: 'Qué es una fábrica de software',
 slides: [
 {
 id: 'factory-01', title: 'Fábrica de software con IA', kind: 'hero',
 alias: 'AI Software Factory',
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
 id: 'factory-02', title: 'Qué es, en una frase', kind: 'quote',
 lead: 'La definición completa, antes de entrar en detalle.',
 quote: 'Una fábrica de software con IA es un sistema de trabajo repetible: una petición se escribe como una orden con criterios comprobables, un equipo de agentes (programas de IA con un papel cada uno) la construye y la prueba, y el resultado solo entra en el producto cuando las comprobaciones pasan y una persona con criterio decide.',
 items: [
 { label: 'Misma entrada, mismo resultado', detail: 'Si repites la misma petición, el proceso se ejecuta igual: no depende del humor del día.' },
 { label: 'Máquina para lo mecánico, persona para decidir', detail: 'La IA escribe, prueba y comprueba; una persona elige cuando hay una decisión que tomar.' },
 { label: 'Todo deja registro', detail: 'Queda escrito qué se pidió, qué se hizo y qué se comprobó, para que cualquiera lo lea.' },
 ],
 notes: `Lee la frase entera una vez, sin prisa, y quédate con las tres claves del final. La palabra importante es "repetible": la fábrica no es un modelo brillante ni una herramienta concreta, es una forma de trabajar que se ejecuta igual la próxima vez. La orden con criterios comprobables es lo que separa una petición de un deseo. Los agentes construyen y prueban; las comprobaciones automáticas filtran; una persona con criterio decide qué entra en el producto. Si falta cualquiera de esas patas, lo que hay es una demostración. Esta definición sirve para cualquier equipo y para cualquier modelo, porque describe un sistema de trabajo y no una marca. Si alguien solo se lleva una idea de la charla, que sea esta frase.`,
 },
 {
 id: 'factory-03', title: 'No es un producto: es una organización', kind: 'comparison',
 lead: 'Comprar agentes no crea una fábrica; falta el flujo que los ordena.',
 items: [
 { label: 'Metáfora', detail: 'Entradas, estaciones, estándares, compuertas y recuperación.' },
 { label: 'Realidad', detail: 'Repositorio, herramientas, acuerdos explícitos y personas responsables.' },
 { label: 'Antipatrón', detail: 'Encadenar herramientas sin decidir qué problema resuelven.' },
 ],
 notes: `Compara una cocina organizada con comprar un horno más rápido: el horno acelera una operación, pero no decide el menú, las alergias ni cuándo retirar un plato defectuoso. En la fábrica, un modelo es una capacidad dentro de un sistema mayor. La palabra no identifica una certificación ni una arquitectura obligatoria; dos equipos pueden usar herramientas distintas y compartir los mismos controles. Pide a la audiencia que nombre una entrada ambigua de su trabajo cotidiano, como mejorar el rendimiento. Esa frase no permite comprobar un resultado. Convertirla en un objetivo observable y acotado es el primer paso real. Sin esa entrada, cualquier estación producirá algo que nadie puede aceptar ni rechazar con argumentos.`,
 },
 {
 id: 'factory-04', title: '1968: dos orígenes y una línea larga', kind: 'timeline',
 lead: 'Fabricar software con piezas reutilizables y comprobables es anterior a los agentes.',
 items: [
 { label: 'Bemer, General Electric, 1968', detail: 'Describió una "software factory" para organizar el desarrollo: procesos, especialización y control.' },
 { label: 'McIlroy, Garmisch, 1968', detail: 'Propuso componentes producidos en masa: piezas reutilizables en lugar de rehacerlo todo.' },
 { label: 'Ágil y CI, 2001 en adelante', detail: 'Colaborar, integrar pronto y comprobar siempre; los agentes aceleran la propuesta, no la integración.' },
 ],
 sources: ['https://mcilroy.cs.dartmouth.edu/pubs.html', 'http://homepages.cs.ncl.ac.uk/brian.randell/NATO/nato1968.PDF', 'https://agilemanifesto.org/', 'https://martinfowler.com/articles/continuousIntegration.html'],
 notes: `Un solo recorrido con tres paradas. Bemer describió en 1968, en General Electric, una "software factory" para organizar el desarrollo: procesos, especialización y control. Ese mismo año, en la conferencia de la OTAN en Garmisch, McIlroy presentó componentes producidos en masa: piezas reutilizables con interfaces conocidas. Dos ideas distintas que apuntan a lo mismo. Después llegaron la integración continua, que propone unir y comprobar con frecuencia, y el manifiesto ágil de 2001, que valora colaboración, software funcionando y respuesta al cambio. No asignamos fecha fundacional a la integración continua porque el término tiene varias. Citamos el catálogo y las actas de McIlroy sin añadir páginas ni fechas sin comprobar. Hoy los agentes generan propuestas deprisa, pero el ritmo lo marcan integrar y verificar. Analogía del tornillo: reutilizar exige interfaces y calidad conocidas.`,
 },
 {
 id: 'factory-05', title: 'Qué problema resuelve y qué no', kind: 'comparison',
 lead: 'Promete menos espera y más consistencia; no promete decidir el producto por ti.',
 items: [
 { label: 'Lo que mejora', detail: 'La espera entre pedir y ver, la consistencia entre tareas y el conocimiento que no se va con las personas.' },
 { label: 'Lo que no cambia', detail: 'No decide el producto por vos ni sustituye el criterio: sin criterios escritos produce rápido lo que nadie pidió.' },
 { label: 'Cuándo no vale la pena', detail: 'Un equipo sin criterios, una tarea que se hace una sola vez o un producto que aún se está tanteando.' },
 ],
 notes: `Esta diapositiva es para quien decide, no solo para quien programa. Una fábrica reduce la espera entre pedir algo y ver el resultado funcionando, mantiene la misma forma de trabajar entre tareas y deja el conocimiento en archivos en lugar de en la cabeza de una persona. Eso vale cuando el equipo cambia, cuando el producto crece y cuando la calidad no puede depender de la memoria de alguien. Lo que no hace: decidir qué construir ni priorizar por vos. Un equipo sin criterios escritos producirá rápido cosas que nadie pidió, y una tarea que se hace una sola vez no compensa montar la línea. Pide un ejemplo del público donde la espera o la rotación duelan de verdad, y compáralo con lo que la fábrica sí cambia.`,
 },
 {
 id: 'factory-06', title: 'Un vocabulario mínimo', kind: 'checklist',
 lead: 'Nombrar bien evita delegar cosas distintas con la misma palabra.',
 items: [
 { label: 'Modelo', detail: 'Genera respuestas a partir del contexto disponible; no equivale al sistema completo.' },
 { label: 'Herramienta', detail: 'Permite una acción concreta: leer, probar o modificar archivos.' },
 { label: 'Contexto', detail: 'Información suministrada para decidir; puede estar incompleta o ser maliciosa.' },
 { label: 'Especificación', detail: 'Acuerdo observable sobre el comportamiento esperado y sus límites.' },
 { label: 'Orden de trabajo', detail: 'Spec más criterios de aceptación, superficie autorizada y comando de verificación.' },
 ],
 notes: `Presenta el vocabulario con una biblioteca. El modelo propone una respuesta; la herramienta permite buscar un libro; el contexto incluye la pregunta y los documentos encontrados; la especificación dice qué respuesta necesitamos y cómo reconocerla. La orden de trabajo reúne spec, criterios, superficie y comando de verificación: es la unidad que entra en la fábrica. Son funciones diferentes aunque una interfaz las esconda tras una sola ventana. Un modelo sin permiso de escritura no cambia archivos por sugerir código; una herramienta con permisos amplios sí puede causar efectos. Pide que identifiquen qué falta cuando una tarea dice solamente "hazlo mejor". Normalmente faltan criterios observables y contexto del sistema. Ese hueco es lo que hará fallar la línea más adelante.`,
 },
 {
 id: 'factory-07', title: 'Asistente, workflow o agente', kind: 'comparison',
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
