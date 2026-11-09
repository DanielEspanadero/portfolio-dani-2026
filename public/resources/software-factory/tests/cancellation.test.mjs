import test from 'node:test';
import assert from 'node:assert/strict';
import { cancelBooking } from '../src/cancellation.mjs';

const startUTC = '2030-06-02T12:00:00Z';
const booking = () => ({ id: 'B1', startUTC, amountCents: 10000, status: 'confirmed' });

for (const [label, nowUTC, refundCents] of [
  ['24h + 1s', '2030-06-01T11:59:59Z', 10000],
  ['exactamente 24h', '2030-06-01T12:00:00Z', 10000],
  ['24h - 1s', '2030-06-01T12:00:01Z', 0],
  ['un segundo antes', '2030-06-02T11:59:59Z', 0],
]) {
  test(label, () => {
    const input = booking();
    const original = structuredClone(input);
    const result = cancelBooking(input, nowUTC);
    const outcome = { refundCents, cancelledAtUTC: nowUTC };
    assert.deepEqual(result, {
      ok: true,
      booking: { ...input, status: 'cancelled', cancellation: outcome },
      outcome,
      events: refundCents ? [{ type: 'refund.requested', bookingId: 'B1', amountCents: refundCents }] : [],
    });
    assert.notEqual(result.booking, input);
    assert.deepEqual(input, original);
  });
}

for (const [label, mutate, nowUTC, error] of [
  ['inicio exacto', () => {}, startUTC, 'BOOKING_STARTED'],
  ['después del inicio', () => {}, '2030-06-02T12:00:01Z', 'BOOKING_STARTED'],
  ['ahora inválido', () => {}, 'mañana', 'INVALID_TIME'],
  ['ahora infinito', () => {}, Infinity, 'INVALID_TIME'],
  ['inicio inválido', b => { b.startUTC = 'no'; }, '2030-06-01T12:00:00Z', 'INVALID_TIME'],
  ['fecha imposible', b => { b.startUTC = '2030-02-30T12:00:00Z'; }, '2030-06-01T12:00:00Z', 'INVALID_TIME'],
  ['sin zona UTC', () => {}, '2030-06-01T12:00:00', 'INVALID_TIME'],
  ['importe negativo', b => { b.amountCents = -1; }, '2030-06-01T12:00:00Z', 'INVALID_AMOUNT'],
  ['importe infinito', b => { b.amountCents = Infinity; }, '2030-06-01T12:00:00Z', 'INVALID_AMOUNT'],
  ['importe fraccionario', b => { b.amountCents = 0.5; }, '2030-06-01T12:00:00Z', 'INVALID_AMOUNT'],
  ['importe inseguro', b => { b.amountCents = Number.MAX_SAFE_INTEGER + 1; }, '2030-06-01T12:00:00Z', 'INVALID_AMOUNT'],
  ['estado desconocido', b => { b.status = 'pending'; }, '2030-06-01T12:00:00Z', 'INVALID_BOOKING'],
]) {
  test(`rechaza: ${label}`, () => {
    const input = booking();
    mutate(input);
    const original = structuredClone(input);
    assert.deepEqual(cancelBooking(input, nowUTC), { ok: false, error, booking: input, events: [] });
    assert.deepEqual(input, original);
  });
}

test('repetir conserva outcome y no vuelve a emitir devolución, incluso tras el inicio', () => {
  const first = cancelBooking(booking(), '2030-06-01T12:00:00Z');
  const original = structuredClone(first.booking);
  const repeat = cancelBooking(first.booking, '2030-06-03T12:00:00Z');
  assert.deepEqual(repeat, { ok: true, booking: original, outcome: first.outcome, events: [] });
  assert.equal(repeat.booking, first.booking);
  assert.deepEqual(first.booking, original);
  assert.deepEqual(first.events, [{ type: 'refund.requested', bookingId: 'B1', amountCents: 10000 }]);
});

test('importe cero es válido y no genera eventos', () => {
  const input = { ...booking(), amountCents: 0 };
  assert.deepEqual(cancelBooking(input, '2030-06-01T12:00:00Z'), {
    ok: true, booking: { ...input, status: 'cancelled', cancellation: { refundCents: 0, cancelledAtUTC: '2030-06-01T12:00:00Z' } },
    outcome: { refundCents: 0, cancelledAtUTC: '2030-06-01T12:00:00Z' }, events: [],
  });
  assert.deepEqual(input, { ...booking(), amountCents: 0 });
});

test('rechaza forma ausente y cancelación almacenada inválida', () => {
  assert.deepEqual(cancelBooking(null, startUTC), { ok: false, error: 'INVALID_BOOKING', booking: null, events: [] });
  const input = { ...booking(), status: 'cancelled', cancellation: { refundCents: -1, cancelledAtUTC: 'no' } };
  const original = structuredClone(input);
  assert.deepEqual(cancelBooking(input, startUTC), { ok: false, error: 'INVALID_BOOKING', booking: input, events: [] });
  assert.deepEqual(input, original);
});
