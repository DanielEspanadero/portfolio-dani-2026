export default {
  id: 'parallel', title: 'Paralelismo con límites',
  slides: [
    {
      id: 'factory-41', title: 'Paralelo solo si es separable', kind: 'parallel',
      lead: 'Más workers no arreglan una tarea mal dividida.',
      items: [
        { label: 'Independiente', detail: 'Un worker prepara documentación; otro implementa una función con contrato ya fijado.' },
        { label: 'Dependiente', detail: 'Dos workers cambian la misma respuesta pública con supuestos diferentes.' },
        { label: 'Frontera', detail: 'Estabiliza interfaces antes de repartir; serializa si las fronteras no están claras.' },
      ],
      notes: `Compara dos cocineros preparando platos distintos con dos personas corrigiendo simultáneamente la misma receta. El primer reparto puede funcionar; el segundo exige coordinación constante. En software las dependencias no siempre coinciden con archivos: dos módulos separados pueden compartir un contrato que está cambiando. Antes de lanzar workers, identifica qué entrada y salida necesita cada uno y qué decisión puede avanzar sin esperar al otro. Una buena opción en el taller es preparar la guía de uso mientras se implementa una interfaz ya acordada. Si todavía discutimos qué significa refundCents, primero resolvemos eso juntos. Hacer trabajo secuencial en una frontera inestable puede ser la opción más rápida y comprensible.`,
    },
    {
      id: 'factory-42', title: 'Un contrato antes de dos ramas', kind: 'table',
      lead: 'La coordinación empieza con una interfaz compartida y estable.',
      items: [
        { label: 'Nombres', detail: 'cancelBooking, amountCents, refundCents y events significan lo mismo para todos.' },
        { label: 'Semántica', detail: '>=24h devuelve 100%; inicio exacto rechaza; repetir no emite otro evento.' },
        { label: 'Cambio del contrato', detail: 'Detener consumidores afectados y acordar una versión, no improvisar adaptadores silenciosos.' },
      ],
      notes: `Imagina que el worker de documentación interpreta amount como euros y el de código lo interpreta como céntimos. No habrá necesariamente un conflicto textual al unir sus archivos, pero el producto enseñará algo incorrecto. Por eso compartimos nombres, unidades y ejemplos, no solamente una lista de funciones. La tabla de cancelaciones actúa como una referencia común. Si aparece una necesidad que exige cambiar la respuesta, se identifica quién consume ese contrato y se detiene la parte afectada hasta acordarlo. No pedimos a cada worker que invente su propia compatibilidad. El coste de coordinar es parte del trabajo paralelo y debe contarse al evaluar si compensa dividir la tarea.`,
    },
    {
      id: 'factory-43', title: 'Worktree: archivos separados', kind: 'code',
      lead: 'Aísla directorios y ramas; no crea una sandbox de seguridad.',
      items: [
        { label: 'Uso', detail: 'Ejemplo ilustrativo para un repositorio de prácticas limpio; requiere Git y autorización local.' },
        { label: 'No aísla', detail: 'Procesos, puertos, bases de datos, red ni credenciales del equipo.' },
      ],
      code: `# Ilustrativo; no se ejecuta en este taller
# Desde un repositorio de prácticas preparado:
git worktree add ../practice-docs -b practice/docs
# El directorio nuevo contiene otra copia de trabajo.
# Revisa permisos y estado antes de usarla.`,
      sources: ['https://git-scm.com/docs/git-worktree'],
      notes: `Explica qué problema resuelve Git worktree: mantener más de un árbol de trabajo asociado al mismo repositorio, con ramas que permiten separar cambios. Eso ayuda a no mezclar archivos editados por dos workers. No equivale a ejecutar código en una máquina aislada. Si ambos procesos utilizan el mismo puerto o apuntan a la misma base de datos, pueden interferir. También conservan los permisos del usuario que los ejecuta salvo controles adicionales. El comando de pantalla es ilustrativo, no una instrucción para modificar ahora el portfolio ni un resultado observado. Para practicarlo hace falta un repositorio limpio elegido por el alumno y un plan de integración. El kit básico no depende de worktrees.`,
    },
    {
      id: 'factory-44', title: 'Propiedad visible por tarea', kind: 'parallel',
      lead: 'Cada worker necesita superficie, salida y condición de parada.',
      items: [
        { label: 'Worker A', detail: 'Implementa src/cancellation.mjs con la spec estable y pruebas acordadas.' },
        { label: 'Worker B', detail: 'Redacta ejemplos de uso en documentación sin cambiar el contrato.' },
        { label: 'Coordinación', detail: 'Resuelve dudas compartidas y revisa que nadie invada la superficie del otro.' },
      ],
      notes: `Muestra dos carriles con una frontera clara. A implementa la función; B puede explicar cómo invocarla usando el contrato existente. No asignes a B la revisión automática del trabajo de A si quieres una mirada crítica: documentación y revisión tienen objetivos diferentes. Cada tarea necesita además una salida reconocible, como un archivo y una comprobación, y una parada si descubre un conflicto. La coordinación no debe convertirse en una cola infinita de preguntas triviales, pero sí resolver los cambios de contrato y alcance. Si los workers piden continuamente tocar los mismos archivos, la división probablemente no es independiente y conviene volver a una secuencia más pequeña.`,
    },
    {
      id: 'factory-45', title: 'La integración es otra estación', kind: 'flow',
      lead: 'Dos ramas verdes pueden formar un conjunto incorrecto.',
      items: [
        { label: 'Antes de unir', detail: 'Revisa contrato, cambios ajenos y evidencia de cada tarea.' },
        { label: 'Después de unir', detail: 'Ejecuta pruebas del conjunto y verifica ejemplos de documentación.' },
        { label: 'Si falla', detail: 'Identifica el defecto; no ocultes incompatibilidades con un parche sin acuerdo.' },
      ],
      notes: `Una prueba aislada puede pasar porque usa una copia antigua del contrato. Al juntar documentación y código, un ejemplo podría invocar now en vez de nowUTC, o asumir que siempre existe un evento. Son incompatibilidades semánticas aunque Git no marque conflictos. Por eso la integración tiene una comprobación propia y no consiste solo en fusionar texto. Pide revisar un ejemplo completo contra la función pública y confirmar que el resultado esperado se deriva de la política acordada. Si algo falla, localiza si cambió la interfaz, la explicación o la implementación. El objetivo no es conseguir otro verde a cualquier precio, sino recuperar un conjunto que enseñe y haga lo mismo.`,
    },
    {
      id: 'factory-46', title: 'Revisar también es una estación', kind: 'risk',
      lead: 'La capacidad de inspección marca el ritmo que conviene generar.',
      items: [
        { label: 'Cola', detail: 'Más propuestas simultáneas aumentan el material pendiente de entender.' },
        { label: 'Presupuesto de revisión', detail: 'Limita trabajo en curso y tamaño del lote según atención disponible.' },
        { label: 'Señal', detail: 'Si aumenta el tiempo hasta integrar un cambio, añadir workers empeora el flujo.' },
      ],
      notes: `Dibuja varios carriles llegando a una sola puerta. Aunque producir propuestas sea barato, alguien tiene que contrastarlas con requisitos y riesgos. Si esa persona dispone de media hora, generar diez cambios grandes no crea diez revisiones de calidad. Puede crear presión para integrar sin mirar, justo el fallo que queríamos evitar. Establece un presupuesto de revisión y limita el trabajo en curso. No damos una cifra universal de agentes por persona: depende de complejidad, herramientas y consecuencias. Observa el tiempo desde la propuesta hasta la integración y la cantidad de retrabajo. La velocidad del generador es una métrica parcial que puede ocultar una cola cada vez más costosa.`,
    },
    {
      id: 'factory-47', title: 'Cancelar una tarea también es progreso', kind: 'flow',
      lead: 'El coordinador debe poder reducir, detener o volver a trabajo manual.',
      items: [
        { label: 'Disparador', detail: 'Conflicto de contrato, presupuesto agotado o evidencia insuficiente.' },
        { label: 'Acción', detail: 'Pausa tareas dependientes y conserva cambios y resultados observados.' },
        { label: 'Reinicio', detail: 'Una persona redefine una unidad menor y autoriza cómo continuar.' },
      ],
      notes: `Cerrar una tarea sin integrar puede ser la decisión correcta si ha revelado una incompatibilidad importante. La información descubierta tiene valor aunque el código no se entregue. Lo peligroso es continuar silenciosamente para justificar el tiempo invertido. En un flujo paralelo, detén también los consumidores de un contrato que acaba de cambiar; no dejes que sigan generando trabajo sobre una suposición inválida. Conserva evidencia y explica qué falta. La persona puede elegir una unidad menor, reducir autonomía o continuar a mano. No interpretes un nuevo chat como permiso para reiniciar presupuestos agotados. La autoridad para reanudar debe ser explícita y corresponder al alcance que realmente queda pendiente.`,
    },
  ],
};
