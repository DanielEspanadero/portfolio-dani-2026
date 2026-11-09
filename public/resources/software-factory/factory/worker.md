# Worker: entregar una cancelación comprobable

Tu salida es un cambio pequeño y evidencia real, no una aprobación ni un despliegue.

## Antes de editar

1. Lee `AGENTS.md` y `specs/cancel-booking.md`.
2. Confirma que esta es la copia local autorizada por el alumno. No trabajar sobre reservas reales.
3. Resume los límites: >=24h antes devuelve 100%; <24h antes devuelve 0%; inicio exacto o después rechaza intacta; repetición conserva outcome sin nuevos eventos.
4. Calcula los casos 24h±1s, exactamente 24h y exactamente al inicio antes de mirar el código.

## Reproducir RED de forma segura

El kit incluye solución de referencia. Para practicar desde cero, el alumno duplica **con su gestor de archivos** la carpeta completa en otra carpeta de prácticas y autoriza esa copia. No sobrescribir el original ni ejecutar comandos de borrado.

En `src/cancellation.mjs` de esa copia, sustituir manualmente el contenido por:

```js
export function cancelBooking() {
  throw new Error('TODO: implementar contrato de cancelación');
}
```

Ejecutar desde la raíz de la copia:

```sh
node --test tests/cancellation.test.mjs
```

**Resultado esperado, no informe de ejecución:** código de salida distinto de cero, pruebas de comportamiento fallidas por el mensaje TODO. Registrar la salida real. Un error de ruta o Node ausente no demuestra RED de comportamiento. No copiar una salida inventada en el handoff.

## Implementar y preservar

Implementar el contrato mínimo y volver a ejecutar el mismo comando. No añadir red, servicios ni dependencias. No eliminar pruebas para conseguir verde. Si se cambia una validación compartida, preservar un caso normal previo. Registrar comando, código, stdout y stderr reales. Revisar que rechazos y repeticiones no mutan entradas ni generan eventos nuevos.

Máximo dos correcciones basadas en evidencia tras el primer intento. Ante ambigüedad o agotamiento, detener y entregar estado parcial. Rellenar `factory/handoff.md` sin inventar resultados. STOP antes de integración: solo una persona puede decidir continuar, y publicar requiere otra autorización.
