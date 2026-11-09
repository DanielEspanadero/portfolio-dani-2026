export default {
 id: 'parallel', title: 'Ejemplo y paralelismo',
 slides: [
 {
 id: 'factory-29', title: 'Las fronteras de la cancelación', kind: 'table',
 lead: 'Inicio: 2 de junio de 2030, 12:00:00Z; importe: 10000 céntimos.',
 items: [
 { label: '1 junio, 11:59:59Z', detail: '24h + 1s: aceptar con refundCents 10000, el 100%, y un evento.' },
 { label: '1 junio, 12:00:00Z', detail: 'Exactamente 24h: aceptar con refundCents 10000; >=24h devuelve el 100%.' },
 { label: '1 junio, 12:00:01Z', detail: '24h - 1s: aceptar con refundCents 0; <24h no devuelve nada.' },
 { label: '2 junio, 12:00:00Z', detail: 'Inicio exacto: BOOKING_STARTED, reserva intacta y ningún evento.' },
 { label: 'Ya cancelada', detail: 'Repetir devuelve el outcome guardado y ningún evento nuevo.' },
 ],
 notes: `Calcula estas filas con la audiencia antes de enseñar la condición de código. El inicio es el 2 de junio de 2030 a las 12:00:00Z y el importe son 10000 céntimos. La primera fila está un segundo más lejos del inicio que veinticuatro horas; la tercera está un segundo más cerca. La segunda evita el error frecuente de escribir mayor que donde necesitamos mayor o igual. La cuarta muestra que no basta decidir un porcentaje: existe un punto donde ya no se permite cancelar. Añade verbalmente que un segundo después del inicio también se rechaza. La quinta fila separa estado de acción: se conserva el outcome y no se emite otro evento. Cada fila comprueba estado, outcome, eventos y preservación de la entrada.`,
 },
 {
 id: 'factory-30', title: 'RED antes de la solución', kind: 'code',
 lead: 'Un fallo esperado solo es evidencia cuando realmente se observa.',
 items: [
 { label: 'Copia desechable', detail: 'Sustituye la función solo en una copia; el kit original conserva la solución.' },
 { label: 'Esperado, no medido', detail: 'El runner debería fallar con TODO; registra tu salida real.' },
 ],
 code: `export function cancelBooking() {
 throw new Error('TODO: implementar contrato de cancelación');
}
// En una copia desechable del kit:
// node --test tests/cancellation.test.mjs`,
 notes: `La solución descargable ya incluye una implementación, así que ejecutar sus pruebas no demuestra por sí solo que los tests detecten la ausencia de comportamiento. Para practicar, crea otra copia con tu gestor de archivos y sustituye allí la función por este stub. No modifiques el original ni otros proyectos. Ejecuta el comando y observa el fallo: debería aparecer el mensaje TODO, pero debes anotar lo que realmente ocurra en tu entorno. Si falla porque no encuentra un archivo, eso no es el RED de comportamiento que buscamos. No vamos a inventar un informe de pruebas del alumno. Después restaura el comportamiento implementándolo, no borrando los casos incómodos.`,
 },
 {
 id: 'factory-31', title: 'El lote aterriza integrado', kind: 'gate',
 lead: 'El lote entra con diff, evidencia y vuelta atrás; la compuerta aplica el estándar y devuelve lo que no cumple.',
 figure: { src: '05-evidencia.png', mode: 'feature', alt: 'Tarjeta de informe con líneas de datos, un sello ámbar y una lupa grande apoyada encima.' },
 items: [
 { label: 'Conjunto', detail: 'La función y el resto del sistema compilan y pasan sus pruebas juntos.' },
 { label: 'Fuera de alcance', detail: 'Autenticación, autorización, persistencia, concurrencia y pagos reales quedan fuera.' },
 { label: 'Vuelta atrás', detail: 'Cómo revertir el código y qué efectos externos no se deshacen.' },
 ],
 notes: `Este es el final de la línea, no un juicio final. El cambio entra al conjunto con tres cosas: el diff completo, la evidencia de las pruebas ejecutadas y un plan de vuelta atrás que distingue código de efectos externos. Aquí, y solo aquí, la compuerta aplica el estándar escrito y devuelve, con un defecto concreto, lo que no cumple. Lo que no encaja se escala con una pregunta concreta, no se revisa a mano por costumbre. El núcleo no incluye autenticación, autorización, persistencia, concurrencia ni pagos: integrarlo en un producto exige trabajo adicional. Integrar tampoco es desplegar. Publicar añade usuarios reales, observabilidad y un plan de recuperación probado. Y repetir el ejemplo de la devolución ya enviada: restaurar una versión de código no recupera automáticamente ese efecto externo.`,
 },
 {
 id: 'factory-32', title: 'Worktrees y contrato compartido', kind: 'parallel',
 plain: 'Separar carpetas de trabajo evita pisarse archivos; no aísla la máquina.',
 lead: 'Divide archivos y acuerda interfaces; el aislamiento de archivos no es una sandbox.',
 figure: { src: '06-carriles.png', mode: 'feature', alt: 'Tres carriles paralelos con cajas en movimiento que convergen en una compuerta vertical ámbar.' },
 items: [
 { label: 'Independiente', detail: 'Dos tareas separables avanzan; dos cambios sobre la misma respuesta no.' },
 { label: 'Contrato', detail: 'Nombres, unidades y ejemplos acordados antes de repartir el trabajo.' },
 { label: 'Worktree', detail: 'Separa directorios y ramas con Git; no aísla procesos, puertos, bases de datos ni credenciales.' },
 ],
 sources: ['https://git-scm.com/docs/git-worktree'],
 notes: `Explica qué problema resuelve Git worktree: mantener más de un árbol de trabajo asociado al mismo repositorio, con ramas que separan cambios. Eso ayuda a no mezclar archivos editados por dos workers. No equivale a ejecutar código en una máquina aislada. Si dos procesos usan el mismo puerto o apuntan a la misma base de datos, interfieren; también conservan los permisos del usuario salvo controles adicionales. Antes de repartir trabajo, acuerda el contrato: nombres, unidades y ejemplos. Dos ramas verdes pueden formar un conjunto incorrecto si una asumió euros y la otra céntimos. La integración tiene su propia comprobación, no solo fusionar texto. Un worktree es comodidad de archivos, no una frontera de seguridad.`,
 },
 ],
};
