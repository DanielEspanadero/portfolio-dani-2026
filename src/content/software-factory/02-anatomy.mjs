export default {
  id: 'anatomy', title: 'Anatomía: la maquinaria de la fábrica',
  slides: [
    {
      id: 'factory-09', title: 'De petición a orden de trabajo', kind: 'flow',
      lead: 'La fábrica arranca cuando la petición se vuelve comprobable.',
      items: [
        { label: 'Petición', detail: 'Frase inicial ambigua: mejorar algo, arreglar un fallo, añadir una función.' },
        { label: 'Spec', detail: 'Comportamiento observable, ejemplos frontera, errores y exclusiones explícitas.' },
        { label: 'Criterios', detail: 'Cómo se reconoce un resultado correcto y uno incorrecto, sin opinar.' },
        { label: 'Superficie', detail: 'Archivos y comandos que la estación puede usar, y los que no.' },
      ], steps: true,
      notes: `Sigue una tarjeta de trabajo sobre la mesa. La petición inicial suele ser una frase: cancelar reservas. La orden de trabajo la convierte en algo verificable: qué comportamiento se espera, qué ejemplo debe pasar, qué ejemplo debe fallar y qué archivos puede tocar la estación. La spec no describe tecnología, describe conducta observable. Los criterios de aceptación permiten aceptar o rechazar sin discutir gustos. La superficie evita que un cambio correcto toque archivos que otra persona está editando. Si falta un criterio, la estación inventará uno y el resultado parecerá razonable. Insiste en que esta entrada se escribe antes de generar código, porque es el contrato contra el que se medirá todo lo demás.`,
    },
    {
      id: 'factory-10', title: 'Estaciones especializadas', kind: 'table',
      lead: 'Cada estación tiene una función distinta y una salida revisable.',
      items: [
        { label: 'Implementador', detail: 'Escribe el cambio mínimo y la prueba que lo demuestra.' },
        { label: 'Tester', detail: 'Deriva casos del contrato y calcula los límites a mano.' },
        { label: 'Reviewer', detail: 'Busca contradicciones con la spec y cambios fuera de alcance.' },
        { label: 'Integrador', detail: 'Combina el trabajo y ejecuta las pruebas del conjunto.' },
      ],
      notes: `Cada estación existe porque hace una pregunta distinta. El implementador pregunta cómo conseguir el comportamiento con el cambio más pequeño. El tester pregunta qué casos podrían romperlo y calcula los límites a mano. El reviewer pregunta si el cambio contradice la especificación o se sale del alcance. El integrador pregunta si el conjunto sigue funcionando al unirse al resto. Una persona puede desempeñar varios papeles en un ejercicio pequeño, pero conviene no confundirlos. Dos agentes con el mismo modelo y el mismo resumen tienden a repetir el mismo supuesto. La especialización aporta preguntas distintas, no categorías de inteligencia: cada estación es responsable de una comprobación concreta.`,
    },
    {
      id: 'factory-11', title: 'Estándares y convenciones', kind: 'checklist',
      lead: 'Las reglas compartidas evitan renegociar lo mismo en cada tarea.',
      items: [
        { label: 'Contrato', detail: 'Nombres, unidades, formato de respuesta y códigos de error estables.' },
        { label: 'Estructura', detail: 'Dónde vive cada archivo, cómo se nombra y qué comando se ejecuta.' },
        { label: 'Definición de hecho', detail: 'Pruebas observadas, evidencia guardada y handoff completo.' },
        { label: 'Cambio de convención', detail: 'Modificar un estándar es una decisión explícita, no una excepción silenciosa.' },
      ],
      notes: `Los estándares hacen que la fábrica produzca piezas compatibles. Nombres, unidades y formato de respuesta se acuerdan una vez y se aplican en todas las tareas. La estructura de archivos evita decidir en cada encargo dónde vive cada cosa. La definición de hecho fija qué significa terminar: pruebas observadas, evidencia guardada y handoff completo. Cambiar una convención es una decisión explícita, no una excepción silenciosa que el siguiente descubrirá por sorpresa. Compara con una línea de montaje que cambia el tamaño de los tornillos a mitad de turno sin decírselo a nadie. Los estándares no garantizan calidad por sí mismos, pero eliminan discusiones repetidas y hacen visibles las desviaciones reales.`,
    },
    {
      id: 'factory-12', title: 'Activos reutilizables', kind: 'flow',
      lead: 'Cada tarea deja piezas que la siguiente reutiliza sin reescribir.',
      items: [
        { label: 'Plantillas', detail: 'Spec, orden de trabajo y handoff con la misma forma.' },
        { label: 'Utilidades', detail: 'Validación, datos de prueba y comandos listos para reutilizar.' },
        { label: 'Pruebas', detail: 'Un defecto encontrado se convierte en un caso permanente.' },
        { label: 'Lecciones', detail: 'Decisiones y tropiezos registrados donde el siguiente puede leerlos.' },
      ],
      notes: `Una fábrica madura reutiliza lo que ya construyó. Las plantillas de spec, orden y handoff reducen el tiempo de preparación y hacen comparables dos tareas distintas. Las utilidades de validación o los datos de prueba se copian en lugar de reinventarse. Cuando aparece un defecto, se convierte en un caso permanente: la siguiente tarea hereda la lección sin depender de la memoria de alguien. Los documentos de decisiones conservan el motivo de una regla, que es lo primero que se pierde al cambiar de herramienta. Pide a la audiencia que piense en un error repetido de su equipo y en la prueba que lo habría detenido antes. Ese es el activo real: no más código, sino menos incertidumbre repetida.`,
    },
    {
      id: 'factory-13', title: 'El ciclo de una estación', kind: 'loop',
      lead: 'Leer, cambiar, comprobar; repetir solo dentro de un presupuesto.',
      items: [
        { label: 'Leer', detail: 'Inspecciona estado, contrato y código relevante antes de escribir.' },
        { label: 'Cambiar', detail: 'Introduce la prueba y el cambio mínimo que explica el comportamiento.' },
        { label: 'Comprobar', detail: 'Ejecuta el comando autorizado y conserva la salida real.' },
        { label: 'Parar', detail: 'Entrega evidencia o escala una duda al alcanzar el límite.' },
      ], steps: true,
      notes: `Dibuja un ciclo con una salida visible, no una espiral infinita. Cuando una prueba falla, el siguiente paso depende de la evidencia: quizá falta implementación, quizá la expectativa contradice el contrato, quizá el entorno no tiene Node. Cambiar el test para que pase sin discutir esa diferencia destruye información. El presupuesto decide cuándo parar: un número limitado de correcciones y un comando de verificación fijo. Alcanzar el límite no es esconder el fallo, es entregar lo observado para que alguien decida con datos. Compara con un robot de almacén que nunca puede pedir ayuda: sin salida de emergencia, un obstáculo pequeño se convierte en un incidente grande. El ciclo no busca autonomía infinita, busca piezas terminadas y comprobables.`,
    },
    {
      id: 'factory-14', title: 'Compuertas automáticas', kind: 'flow',
      lead: 'Lo que no cumple el contrato se detiene antes de gastar atención.',
      items: [
        { label: 'Compilación y tipos', detail: 'Errores de estructura o de tipos no llegan a la integración.' },
        { label: 'Pruebas del contrato', detail: 'Cada criterio de aceptación tiene al menos un caso automático.' },
        { label: 'Integración continua', detail: 'El conjunto se compila y se prueba en cada cambio propuesto.' },
        { label: 'Bloqueo real', detail: 'Un fallo detiene la línea; saltarlo exige una decisión registrada.' },
      ],
      sources: ['https://martinfowler.com/articles/continuousIntegration.html'],
      notes: `Una compuerta automática aplica el contrato sin cansarse ni negociar. Compilación, tipos, pruebas y análisis de estilo se ejecutan en cada cambio y devuelven un resultado binario. Eso filtra trabajo mecánico antes de que consuma atención: nadie necesita leer un diff que ni siquiera compila. La integración continua añade el conjunto completo, donde aparecen incompatibilidades que una prueba aislada no ve. El bloqueo debe ser real: saltarse una compuerta es una decisión registrada con motivo, no una costumbre. Una revisión separada no garantiza razonamiento independiente, y una compuerta verde demuestra lo que esos casos observaron, no que el software sea correcto para siempre. Filtran el volumen que llega al final; no sustituyen el criterio del encargo.`,
    },
    {
      id: 'factory-15', title: 'El recibo de cada estación', kind: 'checklist',
      lead: 'Otra persona debe poder seguir el trabajo sin leer el chat completo.',
      items: [
        { label: 'Diff', detail: 'Qué archivos cambian y qué comportamiento cubren.' },
        { label: 'Salida real', detail: 'Comando exacto, salida observada y código de salida.' },
        { label: 'Límites', detail: 'Qué no se probó y qué supuestos siguen abiertos.' },
        { label: 'Pendiente', detail: 'Riesgos y acciones que nadie ejecutó todavía.' },
      ],
      notes: `Compara el handoff con un parte de mantenimiento. No basta escribir máquina arreglada: hace falta saber qué pieza cambió, qué comprobación se hizo y qué sigue sin revisar. En software, la salida de un test solo demuestra lo que ese test observó en ese entorno. Si el worker no pudo ejecutar un comando, debe decirlo. Un ejemplo de terminal preparado para explicar el formato se etiqueta como ilustrativo, no se presenta como resultado medido. La plantilla del kit estará vacía a propósito y cada estudiante la rellenará después de ejecutar sus comprobaciones. Esa disciplina convierte el trabajo en un artefacto inspeccionable: cualquiera puede reconstruir la decisión sin recuperar una conversación privada.`,
    },
    {
      id: 'factory-16', title: 'Lote pequeño, flujo visible', kind: 'table',
      lead: 'El tamaño del lote decide cuánto tarda en verse un error.',
      items: [
        { label: 'Lote', detail: 'Una conducta, una spec, un comando: cuanto más pequeño, menos espera.' },
        { label: 'Tiempo de ciclo', detail: 'Desde la orden hasta la integración, incluyendo revisión y corrección.' },
        { label: 'Trabajo en curso', detail: 'Demasiadas piezas abiertas esconden atascos y multiplican conflictos.' },
        { label: 'Aceptación', detail: 'Una persona decide sobre lotes ya filtrados, no sobre todo el volumen.' },
      ],
      notes: `El tamaño del lote es la decisión de flujo más importante. Un cambio pequeño se entiende, se prueba y se integra antes de que aparezcan conflictos. Un lote grande oculta errores, multiplica conflictos y convierte cualquier aceptación en una firma a ciegas. Mide tiempo de ciclo completo: desde la orden hasta la integración, incluyendo revisión y corrección, no solo la generación. Vigila el trabajo en curso: demasiadas piezas abiertas producen atascos que la velocidad de generación disimula. La aceptación humana existe una sola vez por lote, sobre material ya filtrado por estándares, pruebas y compuertas. Si alguien debe revisar todo el volumen producido, el problema no se resuelve añadiendo estaciones, se resuelve reduciendo el lote.`,
    },
  ],
};
