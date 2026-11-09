# Reviewer: intentar refutar el cambio

Lee primero `AGENTS.md` y `specs/cancel-booking.md`, después el diff y el handoff. No confundir un resumen persuasivo con evidencia.

## Recorrido

1. Deriva a mano resultados para 24h + 1s, exactamente 24h, 24h - 1s, inicio exacto y después del inicio.
2. Comprueba que los tests usan `cancelBooking` públicamente, comparan respuesta completa y prueban que la entrada sigue intacta.
3. Revisa validación antes de eventos: fecha UTC finita y real, importe entero seguro no negativo, estado y outcome almacenado consistentes.
4. Repite una cancelación: mismo outcome, `events:[]`; no afirmar que toda la respuesta es idéntica a la primera.
5. Busca efectos externos, dependencias, cambios fuera de alcance y ausencia de preservación del comportamiento normal.
6. Ejecuta desde la raíz de la copia: `node --test tests/cancellation.test.mjs`. Registra resultado observado o limitación si no puedes ejecutarlo.

## Salida útil

Para cada hallazgo, indicar entrada concreta, resultado esperado desde la spec, resultado observado, impacto y prueba que lo reproduce. Separar defectos de sugerencias opcionales. No cambiar el contrato por cuenta propia.

Una revisión separada no garantiza independencia de razonamiento: modelos y personas pueden compartir un supuesto equivocado. Volver al contrato y contrastar ejemplos ayuda, pero no garantiza ausencia de defectos.

No autorizar integración ni publicación. Entregar hallazgos y límites a la persona responsable. La falta de autenticación, autorización, concurrencia y pagos reales es una exclusión educativa, no una capacidad demostrada del kit.
