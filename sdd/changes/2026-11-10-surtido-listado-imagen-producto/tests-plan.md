# Plan de pruebas · 2026-11-10-surtido-listado-imagen-producto

> Derivado de los escenarios de la spec (22 escenarios, 8 requisitos). Una fila por escenario. La generación del código de pruebas se delega a los agentes dev vía handoff. Elaborado a posteriori, con el cambio ya implementado: la columna Estado refleja lo que consta en `verify.md` (2026-11-11) y en su decisión de QA (2026-11-12).

Repo único: `frontend` (simulador web). Pruebas de dominio: `tests/domain/entradasDetalle.test.mjs` con `npm run test:domain` (`node --test`). «Manual» = verificación en `npm run dev` a 360 px con el escenario de demo indicado.

## surtido-listado
| Requisito | Escenario | Tipo | Repo | Datos / fixtures | Prueba (nombre o archivo) | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| Imagen del producto en el listado | Listado con imágenes | manual | frontend | Escenario `inicial` (bandera encendida, 3 pedidos) | Manual T020 | Con prueba (manual); el GIVEN «un solo pedido» se cubre por equivalencia (ADR-0001 §Ampliación p.4) |
| Imagen del producto en el listado | Productos parecidos en el mismo pedido | manual | frontend | Códigos 2012000, 2010000, 1978000 | Manual T021 | Con prueba (manual) |
| Imagen del producto en el listado | Producto en cualquier estado de surtido | manual + unit | frontend | Escenario `cuatro-estados` | Manual T022; `entradasDetalle.test.mjs:38-45` | Con prueba |
| Producto sin imagen en el listado | Producto sin imagen registrada | manual | frontend | Escenario `sin-imagen` | Manual T030 | Con prueba (manual) |
| Producto sin imagen en el listado | Imagen que no se puede cargar | manual | frontend | Escenario `imagen-rota` | Manual T031 | Con prueba (manual) |
| Listado utilizable mientras cargan las imágenes | Escaneo antes de que carguen las imágenes | manual | frontend | DevTools «Disable cache» + Slow 3G; escaneo de 0607006 | Manual T041 | Con prueba (manual) |
| Listado utilizable mientras cargan las imágenes | La imagen termina de cargar | manual | frontend | Slow 3G, bandera encendida | Manual T040 | Con prueba (manual) |
| Orden y datos del listado sin cambios | Orden y datos sin cambios | unit + manual | frontend | Misma ronda con y sin imagen en las partidas | `entradasDetalle.test.mjs:38-45`; manual T051 | Con prueba |
| Orden y datos del listado sin cambios | Guía por voz sin cambios | unit (sustituta) | frontend | `conteosRonda` con y sin imagen | `entradasDetalle.test.mjs:47-51` | **Sin prueba** (`decir()` no se llama en ninguna pantalla); deuda aceptada por QA |
| Pulsar la imagen abre el detalle | Pulsar la imagen de un producto | manual | frontend | Escenario `inicial` | Manual T060 | Con prueba (manual) |
| Pulsar la imagen abre el detalle | Pulsar el icono genérico | manual | frontend | Escenario `sin-imagen` | Manual T061 | Con prueba (manual) |
| Activación de la imagen por sucursal | Sucursal piloto | unit + manual | frontend | Semilla con bandera encendida, `SUCURSAL_DEMO` | `entradasDetalle.test.mjs:58-61`; manual T073 | Con prueba |
| Activación de la imagen por sucursal | Sucursal sin activar | unit + manual | frontend | Escenario `bandera-apagada` | `entradasDetalle.test.mjs:63-65`; manual T070/T071 | Con prueba |
| Activación de la imagen por sucursal | Falla al consultar la bandera | unit (sustituta) | frontend | `resolverImagenListadoActiva(null \| undefined \| {})` | `entradasDetalle.test.mjs:67-73` | **Sin prueba** (no hay consulta de bandera); deuda aceptada por QA |
| Registro de entradas al detalle desde el listado | Entrada solo para ver el producto | unit + manual | frontend | `abrirEntrada` → `cerrarEntrada` | `entradasDetalle.test.mjs:85-89`; manual T081/T083 | Con prueba |
| Registro de entradas al detalle desde el listado | Entrada con captura | unit + manual | frontend | `marcarCaptura` | `entradasDetalle.test.mjs:91-95`; manual T082 | Con prueba |
| Registro de entradas al detalle desde el listado | Entrada con negación | unit + manual | frontend | `marcarNegacion` | `entradasDetalle.test.mjs:97-101`; manual T082 | Con prueba |
| Registro de entradas al detalle desde el listado | Captura y negación en la misma entrada | unit + manual | frontend | Captura y luego negación | `entradasDetalle.test.mjs:103-107`; manual T082 | Con prueba |
| Registro de entradas al detalle desde el listado | Línea base en sucursales sin activar | unit + manual | frontend | Bandera apagada | `entradasDetalle.test.mjs:109-114`; manual `bandera-apagada` | Con prueba |

## catalogo-bandera-sucursal
| Requisito | Escenario | Tipo | Repo | Datos / fixtures | Prueba (nombre o archivo) | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| Bandera de imagen en el listado de surtido | Sucursal con la bandera habilitada | equivalencia + unit | frontend | Escenario `inicial` con `Centro` (`SUCURSAL_DEMO`) | Manual T073; `entradasDetalle.test.mjs:58-61` | Con prueba (equivalencia, design.md §Escenarios no reproducibles) |
| Bandera de imagen en el listado de surtido | Sucursal sin la bandera habilitada | manual + unit | frontend | Escenario `bandera-apagada` | Manual T071; `entradasDetalle.test.mjs:63-65` | Con prueba |
| Bandera de imagen en el listado de surtido | Falla al consultar la bandera de imagen | unit (sustituta) | frontend | `resolverImagenListadoActiva(null \| undefined \| {})` | `entradasDetalle.test.mjs:67-73` | **Sin prueba** (no hay consulta de bandera); deuda aceptada por QA |

Cobertura: 22 de 22 escenarios con fila. 19 con prueba, 3 sin prueba (deuda P4 aceptada por QA).

## Pruebas no derivadas de escenarios (riesgo, regresión, rendimiento, seguridad)
- **Regresión del dominio:** `npm run test:domain` completo (48/48 en verify) incluye `ronda.test.mjs`; debe seguir en verde.
- **Idempotencia del registro:** abrir dos veces, cerrar dos veces, marcar sin entrada y abrir otro código (`entradasDetalle.test.mjs:116-142`).
- **`pedidoDeEntrada`:** destino de las siguientes piezas o, sin destino, la primera presencia (`entradasDetalle.test.mjs:144`).
- **Riesgo M1 (verify):** la integración UI ↔ store (abrir, marcar y cerrar por ruta) solo tiene verificación manual con React DevTools; sin prueba automática. Aceptado por QA. Propuesta: extraer el predicado de ruta de detalle a `src/domain/`.
- **Rendimiento:** con Slow 3G el listado y el escaneo no se bloquean (manual T040/T041).
- **Compatibilidad Zebra:** revisión en chrome ≥ 49 (T901); sin `sort` inestable ni sintaxis no soportada por `plugin-legacy`.
- **Portabilidad de la prueba:** `test:domain` requiere Node ≥ 22.18 (`loader.mjs`); la CI corre `test:domain`; ahora usa Node 22.18 (resuelto el 2026-11-12, ver design.md).
- **Seguridad:** no aplica (sin datos sensibles; imágenes empaquetadas).

## Pruebas exploratorias (humanas)
- Navegar entre `#/detalle/A` y `#/detalle/B` editando la URL: la entrada de A no se cierra (verify, SUGGESTION). Explorar qué queda en `entradasDetalle`.
- `Miniatura` con la fila montada y `imagen` cambiando (sin `key`).
- Atrás del navegador, volver y stepper en secuencias rápidas, con `StrictMode`.
- Bajar la cantidad con el stepper hasta 0: cuenta como «captura» (m10); confirmar con Producto antes de llevar la medición a `exodus-gtm-pwa`.
- Detalle de un producto sin imagen o con imagen rota: hoy muestra el recuadro vacío o roto (no-objetivo).
- Dispositivo Zebra real: legibilidad de la miniatura de 60 px e icono genérico (opacidad 0.15).
