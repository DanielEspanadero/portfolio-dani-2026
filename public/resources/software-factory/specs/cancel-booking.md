# Cancelar una reserva: contrato educativo

Implementar `cancelBooking(booking, nowUTC)` como función pura exportada desde `src/cancellation.mjs`. Es un ejercicio local aislado, no una aplicación de producción. No enviar dinero, red, mensajes ni escribir en base de datos. Autenticación y autorización están fuera de alcance; no exponer esta función directamente como API pública.

## Entrada y orden de validación

1. `booking` es un objeto no array; `id` es una cadena no vacía tras trim; `status` es `confirmed` o `cancelled`. Error: `INVALID_BOOKING`.
2. `booking.startUTC` y `nowUTC` son cadenas UTC canónicas `YYYY-MM-DDTHH:mm:ssZ` o `YYYY-MM-DDTHH:mm:ss.sssZ`. Deben representar fechas reales y finitas; no aceptar fechas normalizadas como 30 de febrero, números, zonas implícitas ni infinitos. Error: `INVALID_TIME`.
3. `booking.amountCents` es un entero seguro no negativo; cero es válido. Error: `INVALID_AMOUNT`.
4. Para `cancelled`, `booking.cancellation` contiene `refundCents` entero seguro no negativo y `cancelledAtUTC` válido anterior al inicio. El importe debe coincidir con la política aplicada a ese instante almacenado. Error: `INVALID_BOOKING`.

Esta precedencia define el error si hay varios defectos. No se exige formato de UUID ni se implementa un catálogo de reservas. Los campos adicionales se conservan; este kit usa datos planos y no modifica objetos anidados recibidos.

## Política acordada para el taller

| Reserva válida | Resultado |
|---|---|
| `confirmed`, >=24h antes del inicio | Aceptar; refundCents = amountCents (100%) |
| `confirmed`, <24h antes del inicio | Aceptar; refundCents = 0 |
| `confirmed`, exactamente al inicio o después | Rechazar: `BOOKING_STARTED` |
| `cancelled` válida | Devolver booking y outcome almacenados; ningún evento nuevo, incluso si nowUTC es posterior al inicio |

La repetición sigue validando tiempos e importe antes de devolver el resultado almacenado. No recalcula usando el nuevo nowUTC. Un resultado almacenado inconsistente no se acepta como una cancelación válida.

## Salidas exactas

Primera cancelación aceptada:

```js
{
  ok: true,
  booking: { ...booking, status: 'cancelled', cancellation: outcome },
  outcome: { refundCents, cancelledAtUTC: nowUTC },
  events: refundCents > 0
    ? [{ type: 'refund.requested', bookingId: booking.id, amountCents: refundCents }]
    : []
}
```

`outcome` es el mismo objeto almacenado en `booking.cancellation`. La reserva resultante es nueva; la entrada queda intacta. Los eventos son datos simulados, no pagos ejecutados. Para importe cero no hay evento, aunque el porcentaje aplicable sea 100%.

Repetición aceptada: `{ ok: true, booking, outcome: booking.cancellation, events: [] }`. Conserva las referencias de booking y outcome recibidas. **Mismo outcome no significa respuesta completa idéntica:** la primera llamada puede tener un evento; la repetida no.

Cualquier rechazo: `{ ok: false, error, booking, events: [] }`, donde `error` es uno de los códigos anteriores y `booking` es la entrada original sin modificar (incluso si es null). No lanzar una excepción para estos errores de dominio.

## Ejemplos comprobables

Inicio `2030-06-02T12:00:00Z`, importe 10000 céntimos:

| nowUTC | Esperado |
|---|---|
| `2030-06-01T11:59:59Z` (24h + 1s) | 10000; un evento |
| `2030-06-01T12:00:00Z` (exactamente 24h) | 10000; un evento |
| `2030-06-01T12:00:01Z` (24h - 1s) | 0; sin evento |
| `2030-06-02T11:59:59Z` | 0; sin evento |
| `2030-06-02T12:00:00Z` | BOOKING_STARTED; sin evento; intacta |
| `2030-06-02T12:00:01Z` | BOOKING_STARTED; sin evento; intacta |

Las pruebas públicas deben comparar toda la salida y la entrada antes/después. También cubren tiempos e importes inválidos y repetición sin segunda devolución.

## Límites de producción

Sin autenticación, autorización, concurrencia, persistencia atómica, idempotencia de proveedor, divisas, impuestos ni integración de pagos. Dos procesos con copias de la misma reserva no quedan coordinados por esta función. Un rollback de código no deshace efectos externos. Cualquier extensión requiere otra especificación, permisos y revisión.
