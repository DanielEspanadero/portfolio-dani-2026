# Practica una fábrica mínima sin contratar un modelo

Kit educativo local y aislado para construir y revisar una cancelación de reserva. Incluye una solución de referencia y pruebas ejecutables. No es una aplicación de producción ni implementa pagos, autenticación, autorización, persistencia o concurrencia.

## Camino rápido

1. Necesitas Node >=22 y un editor. No ejecutar `npm install`; no se necesita API key.
2. Obtén la carpeta completa conservando este árbol. Si tienes el repositorio, copia `public/resources/software-factory/` con tu gestor de archivos a una carpeta local de prácticas. No edites otros proyectos.
3. Desde esa copia, lee `AGENTS.md` y `specs/cancel-booking.md`.
4. Ejecuta:

```sh
node --version
node --test tests/cancellation.test.mjs
```

La salida depende de tus archivos: registra lo observado. Este README no sustituye la ejecución con un supuesto informe de éxito.

## Archivos para copiar o descargar

| Archivo relativo | Función |
|---|---|
| [README.md](./README.md) | Guía de inicio |
| [AGENTS.md](./AGENTS.md) | Alcance, comprobaciones y paradas |
| [specs/cancel-booking.md](./specs/cancel-booking.md) | Contrato y fronteras |
| [factory/worker.md](./factory/worker.md) | Implementación y práctica RED |
| [factory/reviewer.md](./factory/reviewer.md) | Revisión crítica |
| [factory/handoff.md](./factory/handoff.md) | Plantilla vacía de evidencia |
| [src/cancellation.mjs](./src/cancellation.mjs) | Solución de referencia |
| [tests/cancellation.test.mjs](./tests/cancellation.test.mjs) | Pruebas con node:test |

En una publicación estática de estos recursos, los archivos individuales estarán bajo `/resources/software-factory/` con los mismos nombres relativos. Guarda cada archivo como texto, preservando nombre y subcarpeta. No hay ZIP, botón de descarga múltiple ni un endpoint que copie toda la carpeta. Usamos `factory/` visible en vez de `.factory/` para evitar depender del servicio de directorios ocultos. La disponibilidad HTTP deberá comprobarse al integrar/publicar el sitio; aquí no se ha construido ni desplegado.

## Practicar RED → GREEN

La copia inicial tiene solución. Para empezar desde un fallo, duplica la carpeta en otra ubicación local con el gestor de archivos, autoriza esa copia y sigue `factory/worker.md`: sustituir allí la función por un stub TODO, observar el fallo real, implementar y volver a ejecutar. No borrar archivos ni modificar el original. La salida esperada del stub es un fallo por TODO; no es un resultado medido en tu equipo.

Puedes usar un asistente señalando explícitamente AGENTS, spec y rol; el soporte automático de AGENTS.md varía. También puedes realizar todos los pasos a mano. No hacen falta proveedor, clave ni herramientas de agentes.

## Regla que debes poder explicar

- >=24h antes del inicio: cancelar con devolución del 100%.
- <24h antes del inicio: cancelar sin devolución.
- Exactamente al inicio o después: BOOKING_STARTED, entrada intacta, sin eventos.
- Ya cancelada y válida: mismo outcome almacenado, cero eventos nuevos, incluso después del inicio.

Los tiempos son cadenas UTC canónicas y los importes enteros seguros de céntimos no negativos. Fechas o importes inválidos se rechazan sin efectos. Consulta la spec para forma de salida, precedencia de errores y todos los límites.

## Termina con una parada real

Rellena el handoff solo después de ejecutar. Una persona inspecciona contrato, diff y evidencia y decide si acepta, pide corrección o detiene. No integrar automáticamente por tener pruebas verdes. Publicar es una decisión distinta y no está autorizado por este kit. Un rollback de código no deshace dinero o mensajes; aquí los eventos son únicamente datos simulados.
