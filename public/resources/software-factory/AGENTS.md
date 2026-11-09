# Reglas para trabajar en esta copia educativa

Lee este archivo, `specs/cancel-booking.md` y el documento del rol en `factory/` antes de trabajar. La compatibilidad de AGENTS.md depende de la herramienta: la persona debe señalar estos archivos explícitamente; no asumir descubrimiento automático.

## Alcance

- Ejercicio local aislado con Node >=22; no es una aplicación de producción.
- Solo editar `src/cancellation.mjs` y `tests/cancellation.test.mjs` dentro de la copia de prácticas autorizada por el alumno.
- `factory/handoff.md` puede rellenarse para entregar evidencia real.
- No cambiar spec ni expectativas para ocultar un fallo; pedir decisión si la política resulta ambigua.
- Preservar datos y cambios ajenos. No leer secretos, `.env`, credenciales ni información personal.
- No red, instalaciones, dependencias, pagos, base de datos, comandos destructivos, commits ni despliegues.

## Comprobación exacta

Desde la raíz de esta copia:

```sh
node --test tests/cancellation.test.mjs
```

Usar `node:test` y `node:assert/strict`, solo API pública. Comprobar salidas completas, eventos y entradas intactas. Ninguna prueba necesita reloj real ni API key. No informar GREEN si no se ejecutó con éxito.

## Paradas y autoridad humana

1. Antes de escribir: confirmar archivos autorizados, contrato y casos frontera.
2. Si faltan herramientas, hay un conflicto, se necesita otro archivo o una acción no autorizada: detener la parte afectada y entregar la duda concreta.
3. Máximo dos correcciones basadas en evidencia después del primer intento. Al agotarlas, entregar estado parcial, comando, salida y trabajo restante; no reiniciar el límite en otro chat.
4. Después del handoff: la compuerta de integración aplica el estándar escrito y devuelve lo que no cumple. La escalada llega con una pregunta concreta. Una revisión de otro agente no garantiza razonamiento independiente.
5. Aceptar código no autoriza integrarlo; integrar no autoriza publicar. Ninguna publicación forma parte del ejercicio. En una aplicación real hay que acordar controles operativos y recuperación por separado.

Sin proveedor de IA, realizar el mismo proceso manualmente con editor y runner. No existe obligación de usar agentes.
