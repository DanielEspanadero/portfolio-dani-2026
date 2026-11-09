export default {
  id: 'create', title: 'Crear una fábrica mínima',
  slides: [
    {
      id: 'factory-25', title: 'Una mesa de trabajo suficiente', kind: 'checklist',
      lead: 'Empieza local, aislado y sin credenciales.',
      items: [
        { label: 'Necesario', detail: 'Node >=22, editor y una copia local del kit.' },
        { label: 'Opcional', detail: 'Git y un asistente que permita delimitar archivos y acciones.' },
        { label: 'No necesario', detail: 'npm install, API key, cuenta de pago ni servicio desplegado.' },
      ],
      notes: `Antes de abrir un agente, comprueba que el público puede participar manualmente. El ejercicio consiste en archivos de texto y pruebas con módulos incorporados en Node. Un editor y Node de versión veintidós o superior bastan para el camino mínimo. Git resulta útil para ver diferencias, pero el cálculo de cancelaciones no depende de él. Si alguien ya dispone de un agente, puede usarlo con las instrucciones del kit y sin conceder permisos adicionales. No vamos a instalar herramientas durante esta explicación. Quien no tenga el entorno preparado puede seguir la tabla de casos en papel y ejecutar más tarde. El objetivo es aprender un proceso, no completar un registro comercial.`,
    },
    {
      id: 'factory-26', title: 'El árbol es el mapa', kind: 'code',
      lead: 'Cada archivo tiene una responsabilidad fácil de localizar.',
      items: [
        { label: 'Acuerdo', detail: 'AGENTS.md y specs fijan reglas y comportamiento.' },
        { label: 'Trabajo', detail: 'factory contiene instrucciones de roles y un handoff sin rellenar.' },
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
      notes: `Recorre el árbol de arriba abajo y pide que no memoricen nombres todavía. README explica cómo empezar. AGENTS contiene reglas para trabajar en esta copia. La especificación define la cancelación. Los documentos de factory describen roles y entrega. La función vive en src y las comprobaciones en tests. Usamos una carpeta visible llamada factory, no una carpeta oculta, para facilitar las descargas individuales desde un sitio estático. Las plantillas largas permanecen en el kit y no en la pantalla del directo. Esta estructura es una propuesta educativa, no un estándar obligatorio. Lo importante es que quien continúa encuentre las decisiones sin tener que recuperar una conversación privada.`,
    },
    {
      id: 'factory-27', title: 'Instrucciones que realmente se leen', kind: 'gate',
      lead: 'AGENTS.md no es magia: indica explícitamente que debe leerse.',
      items: [
        { label: 'Compatibilidad', detail: 'El soporte de AGENTS.md varía entre herramientas y configuraciones.' },
        { label: 'Petición', detail: 'Lee AGENTS.md, la spec y factory/worker.md antes de proponer cambios.' },
        { label: 'Confirmación', detail: 'Pide resumir alcance, comando de pruebas y puntos de parada.' },
      ],
      notes: `No presupongas que un archivo con un nombre conocido se carga siempre. Distintas herramientas descubren instrucciones de formas diferentes y pueden tener reglas de precedencia propias. En el taller señalaremos explícitamente los documentos que debe leer el asistente. Pedir un resumen del alcance no demuestra obediencia futura, pero permite detectar malentendidos antes de escribir. Comprueba que menciona la función local, el comando exacto de pruebas y la prohibición de publicar o usar servicios externos. Si propone instalar una dependencia para restar fechas, vuelve al objetivo mínimo. Las instrucciones reducen ambigüedad; los permisos y la supervisión siguen siendo necesarios. Conserva esa distinción durante toda la demostración.`,
    },
    {
      id: 'factory-28', title: 'La spec convierte palabras en casos', kind: 'table',
      lead: 'El límite exacto debe escribirse antes de codificar.',
      items: [
        { label: '>=24h antes', detail: 'Cancelar con refundCents igual al importe: devolución del 100%.' },
        { label: '<24h antes', detail: 'Cancelar con refundCents igual a 0: sin devolución.' },
        { label: 'Exactamente al inicio o después', detail: 'Rechazar con BOOKING_STARTED; reserva intacta y events vacío.' },
        { label: 'Ya cancelada', detail: 'Conservar outcome almacenado y emitir cero eventos nuevos.' },
      ],
      notes: `Lee la tabla con un ejemplo de cien euros representados como diez mil céntimos. A las veinticuatro horas exactas corresponde devolver todo. Un segundo más tarde, todavía antes del inicio, corresponde cancelar sin devolución. En el instante exacto del inicio la operación se rechaza. El signo de comparación no es un detalle de implementación: expresa la decisión que hemos tomado para este ejemplo educativo. Una reserva ya cancelada devuelve el resultado almacenado, aunque la nueva consulta llegue después del inicio, siempre que los datos sean válidos. Los eventos nuevos se separan de ese resultado para evitar una segunda devolución. No estamos reproduciendo una política comercial universal de reservas.`,
    },
    {
      id: 'factory-29', title: 'Un worker con alcance', kind: 'checklist',
      lead: 'Delegar incluye decir qué no hacer.',
      items: [
        { label: 'Superficie', detail: 'Solo src/cancellation.mjs y tests/cancellation.test.mjs en la copia del alumno.' },
        { label: 'Método', detail: 'Observar RED con un stub, implementar y registrar GREEN real.' },
        { label: 'Parada', detail: 'Si cambia la política, falta una herramienta o se agota el límite, consultar.' },
      ],
      notes: `Abre factory/worker.md y destaca que no es un prompt heroico de varias páginas. Es un encargo acotado con entradas, superficie y condiciones de salida. El worker no cambia la especificación para justificar su código ni instala algo para evitar pedir ayuda. Para practicar RED se modifica únicamente una copia desechable preparada por el alumno; el kit original conserva una solución de referencia. Reemplazar allí la función por un stub permite comprobar que las pruebas detectan la ausencia de comportamiento. Después se implementa la regla. Si el agente no puede ejecutar el comando, debe entregar esa limitación en lugar de inventar una salida o decir que probablemente pasa.`,
    },
    {
      id: 'factory-30', title: 'Un reviewer con preguntas distintas', kind: 'checklist',
      lead: 'Revisar es buscar una contradicción concreta.',
      items: [
        { label: 'Derivar', detail: 'Calcula 24h±1s, inicio exacto y repetición desde la spec.' },
        { label: 'Inspeccionar', detail: 'Comprueba validación, inmutabilidad y ausencia de efectos externos.' },
        { label: 'Informar', detail: 'Describe entrada, defecto, impacto y prueba; no autorices despliegue.' },
      ],
      notes: `Dale al revisor el requisito y el cambio, no solamente la narrativa del worker. Puede empezar escribiendo su propia tabla de resultados esperados. Luego inspecciona si los tests comprueban toda la respuesta y si un rechazo deja intacta la entrada. Una revisión útil también detecta ampliaciones de alcance, como añadir una llamada a pagos que nadie pidió. No esperamos independencia perfecta por usar otro rol o modelo: los mismos datos ambiguos pueden inducir el mismo error. El contraste con la regla escrita y el cálculo manual ayuda a romper esa dependencia. La persona final necesita hallazgos concretos y límites conocidos, no un sello de aprobado generado por otra máquina.`,
    },
    {
      id: 'factory-31', title: 'El handoff sigue vacío hasta ejecutar', kind: 'code',
      lead: 'No rellenes resultados futuros como si ya hubieran ocurrido.',
      items: [
        { label: 'Campos', detail: 'Comando, código de salida, stdout, stderr y riesgos pendientes.' },
        { label: 'Estado', detail: 'No ejecutado es una respuesta válida; aprobado requiere una decisión aparte.' },
      ],
      code: `Estado: [pendiente]
Archivos: [rellenar]
Comando: [exacto]
Código de salida: [observado]
stdout / stderr: [observados]
Riesgos: [rellenar]
Decisión humana: [pendiente]`,
      notes: `Muestra los corchetes y déjalos sin rellenar. La plantilla descargable no afirma que una prueba haya pasado ni que alguien haya revisado el código. Durante una ejecución real copiaremos el comando utilizado y su salida, incluyendo los fallos. Un ejemplo de terminal en una charla puede ser útil para explicar el formato, pero debe etiquetarse como ilustrativo si no procede de una ejecución observada. El recibo necesita también decir qué no se probó: no hay autenticación, base de datos ni pagos. Esa información evita que la siguiente persona interprete el ejercicio como una aplicación lista para desplegar. La decisión humana se registra después de leer la evidencia, no antes.`,
    },
    {
      id: 'factory-32', title: 'Arranque sin proveedor', kind: 'code',
      lead: 'La misma prueba sirve con agente o trabajando a mano.',
      items: [
        { label: 'Comando local', detail: 'Ejecuta desde la raíz de la copia del kit.' },
        { label: 'Alternativa manual', detail: 'Lee la tabla, escribe una prueba y modifica la función con tu editor.' },
      ],
      code: `node --version
node --test tests/cancellation.test.mjs`,
      notes: `Aclara desde qué directorio se ejecuta el comando: la carpeta que contiene README, src y tests de la copia del kit, no necesariamente la raíz del portfolio. Node incluye el runner, de modo que no existe un paso de npm install. Si el comando no está disponible, no ejecutes un instalador improvisado en medio de la práctica. Quien ya tenga el entorno podrá observar el resultado; los demás pueden revisar la regla y preparar casos. No mostramos aquí una salida de éxito pregrabada como si fuera de su máquina. El resultado real depende de los archivos que tenga cada alumno. El proceso sigue siendo válido sin contratar acceso a ningún modelo.`,
    },
  ],
};
