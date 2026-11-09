export default {
  id: 'execute', title: 'Ejecutar: de la orden al cambio integrado',
  slides: [
    {
      id: 'factory-33', title: 'Una función, no una aplicación de reservas', kind: 'flow',
      lead: 'Entrada conocida → decisión determinista → estado y eventos simulados.',
      items: [
        { label: 'Entrada', detail: 'booking con id, startUTC, amountCents y status; nowUTC explícito.' },
        { label: 'Salida aceptada', detail: '{ok:true, booking, outcome, events}; nueva reserva al cancelar por primera vez.' },
        { label: 'Salida rechazada', detail: '{ok:false, error, booking, events:[]}; conserva la entrada original.' },
        { label: 'Fuera de alcance', detail: 'Autenticación, autorización, persistencia, concurrencia y pagos reales.' },
      ],
      notes: `Separa el núcleo de dominio de cualquier pantalla o servidor. La función recibe el tiempo actual como argumento para que la prueba no dependa del reloj del ordenador. Devuelve datos y no llama a una red. amountCents expresa enteros de céntimos para evitar cálculos monetarios decimales en esta política sencilla. El resultado aceptado incluye el estado resultante, el resultado de cancelación almacenado y los eventos nuevos. El rechazo incluye un código estable, la reserva original y ningún evento. No comprueba que quien llama sea propietario de la reserva: autenticación y autorización quedan explícitamente fuera de alcance. Por eso este núcleo educativo no puede publicarse como endpoint seguro sin trabajo adicional.`,
    },
    {
      id: 'factory-34', title: 'Validar antes de producir efectos', kind: 'table',
      lead: 'Datos inválidos no deben generar una devolución simulada.',
      items: [
        { label: 'Forma', detail: 'id no vacío, estado conocido y cancelación almacenada válida si existe.' },
        { label: 'Tiempo', detail: 'Cadenas UTC canónicas con segundos, opcionalmente milisegundos; fechas finitas y reales.' },
        { label: 'Importe', detail: 'Entero seguro no negativo; errores INVALID_AMOUNT o INVALID_TIME según corresponda.' },
        { label: 'Rechazo', detail: 'INVALID_BOOKING para forma o estado inválidos; no cambia datos ni emite eventos.' },
      ],
      notes: `No dejes que el parser de fechas decida silenciosamente qué significa mañana o una fecha imposible. El kit acepta un formato UTC explícito con Z y comprueba que la fecha se puede representar sin normalizar un día inexistente. También rechaza importes negativos, infinitos, fraccionarios o fuera del rango entero seguro. La forma básica y el estado se validan antes del tiempo; después se valida el importe y, si ya estaba cancelada, su resultado almacenado. Ese orden fija qué error aparece cuando hay varios defectos. Todos los rechazos conservan la entrada y devuelven events vacío. No usamos errores internos de una base de datos porque no existe ninguna en el ejercicio.`,
    },
    {
      id: 'factory-35', title: 'RED: comprobar que falta comportamiento', kind: 'code',
      lead: 'Un fallo esperado solo es evidencia cuando realmente se observa.',
      items: [
        { label: 'Copia desechable', detail: 'Sustituye la función únicamente en una copia del kit preparada para practicar.' },
        { label: 'Esperado, no medido aquí', detail: 'El runner debería fallar con TODO; registra tu salida real.' },
      ],
      code: `export function cancelBooking() {
  throw new Error('TODO: implementar contrato de cancelación');
}
// Ejecutar en la copia:
// node --test tests/cancellation.test.mjs`,
      notes: `La solución descargable ya incluye una implementación, así que ejecutar sus pruebas no demuestra por sí solo que los tests detecten la ausencia de comportamiento. Para practicar, crea otra copia con tu gestor de archivos y sustituye allí la función por este stub. No modifiques el original ni otros proyectos. Ejecuta el comando y observa el fallo: debería aparecer el mensaje TODO, pero debes anotar lo que realmente ocurra en tu entorno. Si falla porque no encuentra un archivo, eso no es el RED de comportamiento que buscamos. No vamos a inventar un informe de pruebas del alumno. Después restaura el comportamiento implementándolo, no borrando los casos que resulten incómodos.`,
    },
    {
      id: 'factory-36', title: 'Los cuatro segundos decisivos', kind: 'table',
      lead: 'Inicio: 2 de junio de 2030, 12:00:00Z; importe: 10000 céntimos.',
      items: [
        { label: '1 junio, 11:59:59Z', detail: '24h + 1s: aceptar, refundCents 10000 y un evento de devolución.' },
        { label: '1 junio, 12:00:00Z', detail: 'Exactamente 24h: aceptar, refundCents 10000 y un evento de devolución.' },
        { label: '1 junio, 12:00:01Z', detail: '24h - 1s: aceptar, refundCents 0 y ningún evento.' },
        { label: '2 junio, 12:00:00Z', detail: 'Inicio exacto: BOOKING_STARTED, reserva intacta y ningún evento.' },
      ],
      notes: `Calcula estas cuatro filas con la audiencia antes de enseñar la condición de código. La primera está un segundo más lejos del inicio que veinticuatro horas; la tercera está un segundo más cerca. La segunda evita el error frecuente de escribir mayor que donde necesitamos mayor o igual. La cuarta muestra que no basta decidir un porcentaje: existe un punto donde ya no se permite cancelar. Añade verbalmente que un segundo después del inicio también se rechaza y un segundo antes todavía se acepta sin devolución. Los tests incluyen esos casos. Cada fila comprueba estado, outcome, eventos y preservación de la entrada, no solo el campo ok.`,
    },
    {
      id: 'factory-37', title: 'Repetir sin devolver dos veces', kind: 'comparison',
      lead: 'Mismo outcome almacenado no significa respuesta completa idéntica.',
      items: [
        { label: 'Primera llamada', detail: 'Crea cancellation y, si refundCents >0, un evento refund.requested.' },
        { label: 'Segunda llamada válida', detail: 'Devuelve booking y outcome almacenados, con events:[] incluso después del inicio.' },
        { label: 'Límite', detail: 'Esta simulación no resuelve dos solicitudes concurrentes ni garantiza pagos idempotentes.' },
      ],
      notes: `Distingue un recibo guardado de una orden nueva. El outcome dice lo que se decidió al cancelar: importe y momento original. Los eventos indican acciones nuevas solicitadas por esta llamada. Si repetimos una reserva ya cancelada y válida, conservamos el recibo pero no volvemos a solicitar una devolución. La respuesta completa cambia en events, de modo que no debemos decir que es idéntica a la primera. Podemos usar un nowUTC posterior al inicio para demostrar que no recalculamos la política de una cancelación ya realizada. Seguimos validando datos primero. En producción harían falta persistencia atómica, controles de concurrencia e idempotencia del proveedor; no los simula esta función pura.`,
    },
    {
      id: 'factory-38', title: 'GREEN con evidencia observable', kind: 'checklist',
      lead: 'El verde vale por los casos observados, no por la confianza del autor.',
      items: [
        { label: 'Ejecutar', detail: 'node --test tests/cancellation.test.mjs en la copia del alumno.' },
        { label: 'Inspeccionar', detail: 'Comprueba límites, errores, eventos, repetición y datos intactos.' },
        { label: 'Registrar', detail: 'Guarda salida real y limitaciones en factory/handoff.md.' },
      ],
      notes: `Después de implementar, vuelve a ejecutar el mismo comando. No cambies expectativas para acomodarlas a la salida sin revisar primero la especificación. Si aparece un fallo, usa el caso concreto para identificar si el problema está en el cálculo, la forma de respuesta o la validación. Cuando pase, registra el resultado observado y revisa el diff. El verde no demuestra autenticación ni resistencia frente a concurrencia, porque esos aspectos no se implementaron. Tampoco mide ahorro económico de usar IA. Pide a un participante que explique una fila fronteriza sin leer la función. Si puede hacerlo, tenemos una señal de comprensión que complementa la evidencia automática.`,
    },
    {
      id: 'factory-39', title: 'La funcionalidad aterriza integrada', kind: 'gate',
      lead: 'El lote entra integrado con evidencia y vuelta atrás; una persona acepta o devuelve el defecto.',
      items: [
        { label: 'Conjunto', detail: 'La función y el resto del sistema compilan y pasan sus pruebas juntos.' },
        { label: 'Evidencia', detail: 'Comandos ejecutados, resultados observados y límites conocidos.' },
        { label: 'Vuelta atrás', detail: 'Cómo revertir el código y qué efectos externos no se deshacen.' },
      ],
      notes: `Este es el final de la línea, no un juicio final. El cambio entra al conjunto con tres cosas: el diff completo, la evidencia de las pruebas ejecutadas y un plan de vuelta atrás que distingue código de efectos externos. Solo aquí aparece una decisión humana explícita, y se toma una vez: aceptar el lote para integrarlo o devolver un defecto concreto. Describirla una sola vez evita convertir la presentación en un curso de aprobaciones. Si el lote se entiende en minutos, la decisión es real; si nadie puede leerlo, se reduce el lote. La vuelta atrás incluye qué se restaura y qué no: revertir código no cancela una devolución ya enviada.`,
    },
    {
      id: 'factory-40', title: 'Integrar no es desplegar', kind: 'flow',
      lead: 'Cada frontera añade contexto y necesita sus propias comprobaciones.',
      items: [
        { label: 'Integración', detail: 'Combinar con otros cambios y comprobar contratos compartidos.' },
        { label: 'Despliegue', detail: 'Autorización separada, observabilidad y plan de recuperación probado.' },
        { label: 'Rollback limitado', detail: 'Volver al código anterior no deshace pagos, mensajes ni migraciones.' },
      ], steps: true,
      notes: `El ejercicio termina antes de cualquier despliegue. Podemos aceptar una función y aun así necesitar trabajo para conectarla al resto de una aplicación. Una integración debe probar que los consumidores interpretan la respuesta igual y que no se introdujeron incompatibilidades. Publicar implica usuarios reales, estado y operación; necesita autorización y controles propios. Repite el ejemplo de una devolución ya enviada: restaurar una versión de código no recupera automáticamente ese efecto externo. La documentación debe describir esos límites en vez de prometer un botón mágico de rollback. Este taller ofrece un núcleo local comprobable, no una vía rápida para saltarse las responsabilidades operativas de un producto de reservas.`,
    },
  ],
};
