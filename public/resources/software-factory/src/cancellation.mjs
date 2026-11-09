// Núcleo educativo puro: ningún evento se envía a un servicio externo.
function parseUTC(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)) return NaN;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return NaN;
  const canonical = value.includes('.') ? value : value.replace('Z', '.000Z');
  return new Date(time).toISOString() === canonical ? time : NaN;
}

function validAmount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

export function cancelBooking(booking, nowUTC) {
  const reject = error => ({ ok: false, error, booking, events: [] });
  if (!booking || typeof booking !== 'object' || Array.isArray(booking)
      || typeof booking.id !== 'string' || !booking.id.trim()
      || !['confirmed', 'cancelled'].includes(booking.status)) {
    return reject('INVALID_BOOKING');
  }
  const start = parseUTC(booking.startUTC);
  const now = parseUTC(nowUTC);
  if (!Number.isFinite(start) || !Number.isFinite(now)) return reject('INVALID_TIME');
  if (!validAmount(booking.amountCents)) return reject('INVALID_AMOUNT');

  if (booking.status === 'cancelled') {
    const outcome = booking.cancellation;
    const cancelledAt = parseUTC(outcome?.cancelledAtUTC);
    const expectedRefund = start - cancelledAt >= 86400000 ? booking.amountCents : 0;
    if (!outcome || !Number.isFinite(cancelledAt) || cancelledAt >= start
        || !validAmount(outcome.refundCents) || outcome.refundCents !== expectedRefund) {
      return reject('INVALID_BOOKING');
    }
    return { ok: true, booking, outcome, events: [] };
  }

  if (now >= start) return reject('BOOKING_STARTED');
  const refundCents = start - now >= 86400000 ? booking.amountCents : 0;
  const outcome = { refundCents, cancelledAtUTC: nowUTC };
  const events = refundCents > 0
    ? [{ type: 'refund.requested', bookingId: booking.id, amountCents: refundCents }]
    : [];
  return {
    ok: true,
    booking: { ...booking, status: 'cancelled', cancellation: outcome },
    outcome,
    events,
  };
}
