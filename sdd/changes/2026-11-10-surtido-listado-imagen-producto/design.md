# Diseño técnico · 2026-11-10-surtido-listado-imagen-producto · Imagen del producto en el listado de surtido V2

## Resumen de la solución
Solo front-end, en el simulador (ADR-0001: el listado `#/surtido` representa la pantalla V2 de `surtido-listado`). La tarjeta del listado (`ProductoRondaRow`) gana una miniatura de 60 px con la imagen del producto, o la ilustración de paquete existente cuando no hay imagen, falla o está cargando. La miniatura vive dentro del `<button>` que ya es la tarjeta, así que pulsarla abre el detalle sin código extra. La imagen pasa a ser opcional en el dominio (solo cambian tipos, no lógica). La bandera `Bandera_ImagenListadoEnHH` se declara en `ConfigMultiorden` y llega a la pantalla por la semilla del escenario de demo a través de `AppStore`. El registro de entradas al detalle es lógica pura nueva en `src/domain/entradasDetalle.ts` con estado propio en `AppStore`, fuera de `RondaState`. Sin back-end, sin contratos y sin dependencias nuevas.

## Capacidades y requisitos cubiertos
| Capacidad | Requisitos (nombres) | Notas |
| --- | --- | --- |
| catalogo-bandera-sucursal | Bandera de imagen en el listado de surtido | La bandera se declara en `ConfigMultiorden`. Sin servicio de seguridad en el simulador: "habilitada" y "sin habilitar" se prueban con los escenarios de demo de bandera encendida y apagada (la semilla hace de respuesta del servicio); "Falla al consultar la bandera de imagen" queda en la tabla "Escenarios no reproducibles" junto con su gemelo de `surtido-listado` |
| surtido-listado | Imagen del producto en el listado; Producto sin imagen en el listado; Listado utilizable mientras cargan las imágenes; Orden y datos del listado sin cambios; Pulsar la imagen abre el detalle; Activación de la imagen por sucursal; Registro de entradas al detalle desde el listado | Escenarios no reproducibles en el simulador y desviaciones aceptadas: ver "Escenarios no reproducibles" y ADR-0001 §Ampliación 2026-11-11 |

## Alcance por repositorio
### backend (.NET · patrón de la plantilla `exodus-mcr10-api`)
- No aplica: `change.json.repos = [frontend]` (confirmado en `impact.md`). Sin decisiones §8.

### frontend (agente `dev-frontend` · skill `estandares-frontend`)
- Stack según `package.json`: React 18 + Vite 5 SPA → anexo A2 · Versión de la skill: 0.5 (provisional). El anexo A2 está en plantilla, así que **manda el precedente del simulador** (regla I2). Los choques con el estándar se reportan como hallazgo y no se reescribe código existente (CLAUDE.md).
- Módulos tocados y precedente a copiar:

| Módulo | Qué cambia | Precedente (ruta:línea) |
| --- | --- | --- |
| `src/domain/ronda.ts` | **Solo tipos**: `PartidaPedido.imagen` y `ProductoVista.imagen` pasan a opcionales (`imagen?: string`). `productosVista`, `rondaReducer` y el resto de funciones no cambian de comportamiento (ADR-0001: la lógica de ronda no se modifica) | Tipos actuales `ronda.ts:57`, `:245`, `:290` |
| `src/domain/configMultiorden.ts` | Campo `imagenListadoActiva: boolean` con JSDoc `Bandera_ImagenListadoEnHH`; por defecto `false`. Función pura `resolverImagenListadoActiva(config)` que devuelve `false` si la config no llegó (`null`/`undefined`) o no trae el campo | Declaración de banderas `configMultiorden.ts:18-40` |
| `src/domain/entradasDetalle.ts` (nuevo) | Tipos `EntradaDetalle` y `ResultadoEntrada`; funciones puras e idempotentes `abrirEntrada`, `marcarCaptura`, `marcarNegacion`, `cerrarEntrada` (la hora llega como parámetro). Ver "Modelo de datos" y "Ciclo de vida de la entrada" | Reducer puro `ronda.ts:514-556`; leyenda `SDD <id> · <Requirement>` |
| `src/mocks/ronda.ts` | Permitir partidas sin imagen; constante `SUCURSAL_DEMO` (valor fijo de la demo) | `p()` `mocks/ronda.ts:61-81` |
| `src/store/AppStore.tsx` | `Semilla` gana `config?: Partial<ConfigMultiorden>` y `sucursal?: string`. El store expone `config`, `sucursal` (por defecto `SUCURSAL_DEMO`), `entradasDetalle` y las acciones `abrirEntradaDetalle(codigo)`, `marcarEntradaDetalle('captura' \| 'negacion')` y `cerrarEntradaDetalle()`. El registro vive fuera de `RondaState`; `reiniciar` no lo borra | `ultimoEscaneo` fuera del reducer `AppStore.tsx:13,35`; `Date.now()` `:37` |
| `src/navigation/escenarios.ts` + `EscenariosPanel.tsx` | La semilla lleva la config. Escenarios nuevos: bandera encendida (inicial), bandera apagada, bandera encendida con los cuatro estados a la vez (pendiente, parcial, completo y negado), un producto sin imagen y otro con imagen rota (URL inexistente) | Semillas `escenarios.ts:78-108`, `retocar` `:9-18`; panel `EscenariosPanel.tsx:17-116` |
| `src/screens/surtido/ProductoRondaRow.tsx` + `.module.css` | Miniatura de 60 px a la izquierda del contenido, solo con la bandera activa | CSS de foto de `ProductSummary.module.css:27-41` (copiado, no importado); comentarios `ProductoRondaRow.module.css:1,26` (Figma 15:1528, D47) |
| `src/screens/surtido/SurtidoRonda.tsx` | Pasa la bandera a la fila; llama `abrirEntradaDetalle` al abrir el detalle | Navegación al detalle `SurtidoRonda.tsx:217` |
| `src/screens/surtido/DetalleProducto.tsx` | `marcarEntradaDetalle('captura')` en `fijarSurtido`/`surtirPorCodigo`, `marcarEntradaDetalle('negacion')` en `negar`; pasa `vista.imagen ?? ''` a `ProductSummary`. El cierre **no** va en el desmontaje del componente (ver "Ciclo de vida de la entrada") | `DetalleProducto.tsx:79,86,104-140,152` |
| `tests/domain/` | Archivo nuevo `entradasDetalle.test.mjs` (registro, idempotencia de abrir/cerrar, `resolverImagenListadoActiva` y evidencia sustituta); `package.json` `test:domain` lo incluye | `ronda.test.mjs` (`node:test`, bloques `SDD <id> · <Requirement>` `:282-305`), `loader.mjs:14-33` |

- No se toca: `src/design-system/` (incluido `ProductSummary`), `vite.config.ts`, `.github/workflows/`. Ninguna tarea introduce `sort`; si alguna ordena entradas del registro, usa desempate explícito (chrome ≥ 49).
- Contrato que consume: ninguno (mocks). Ruta nueva: ninguna.
- **Nivel de acabado**: producción, revisado a 360 px de ancho y con el navegador de las Zebra (chrome ≥ 49). **Licencia de diseño**: el agente decide espaciados y alineación dentro de la guía y de los tokens `--color-*` sin preguntar; no añade funcionalidad.

#### Guía de interfaz · Listado de surtido (`#/surtido`)
- Diseño visual: Figma "Handheld for Claude", frame 15:1528 (miniatura de 60 px, gap 15, sin borde ni fondo, D47).
- Estructura de la tarjeta, de izquierda a derecha: miniatura de 60 × 60 px a la izquierda y centrada en vertical, seguida del contenido actual sin cambios (código, chip de avance, ubicación, desglose por contenedor, "Mismo cliente", aviso de negado).
- **Desviación del simulador (descripción):** la tarjeta del simulador no muestra la descripción del producto, que sí muestra la pantalla V2. No se añade, porque "Orden y datos del listado sin cambios" prohíbe agregar datos distintos de la imagen. Propuesta: en el simulador, "junto a su código y descripción" se verifica como "junto a su código y los datos que ya muestra la tarjeta"; en la app real aplica literal. Aceptada por Producto (clarificación #11), como pide ADR-0001 §Ampliación 2026-11-11, punto 5.
- Jerarquía: la miniatura ayuda a reconocer el producto; el código sigue siendo lo primero que se lee.
- Imagen: `object-fit: contain`, sin borde ni fondo (D47), `alt=""` como el resto del simulador (ver hallazgos).
- Icono genérico: `src/assets/illustrations/bxs-package.svg` escalado dentro del mismo recuadro de 60 px. Su opacidad de 0.15 lo distingue de una foto. El mismo icono se usa para sin imagen, falla de carga y carga en curso.
- Interacciones: pulsar cualquier punto de la tarjeta, miniatura incluida, abre el detalle (el `<button>` existente). La imagen no se amplía.
- Estados: cargando → icono; cargada → la imagen ocupa el mismo recuadro sin mover la fila; error (`onError`) → icono y no se reintenta mientras la fila siga montada (decisión de Arquitectura, para no generar tráfico en red móvil). Sin textos nuevos.
- Bandera apagada: la tarjeta se ve exactamente como hoy, sin recuadro.
- Responsive y accesibilidad: a 360 px el contenido no se recorta ni genera scroll horizontal; el área táctil de la tarjeta no cambia.
- Funcionalidad de apoyo: búsqueda, filtros, orden, zoom y galería **no** (no-objetivos).

#### Detalle del producto (`#/detalle/:codigo`) · producto sin imagen o con imagen rota
- Resultado aceptado: el detalle se queda como hoy. Con imagen ausente o rota, `ProductSummary` muestra el recuadro sin foto (imagen rota del navegador en el caso de URL inexistente). Especificar la foto del detalle es no-objetivo (`intent.md:26`) y `src/design-system/` no se toca. Solo ocurre en los escenarios de demo sin imagen o con imagen rota; se reporta como hallazgo para un cambio futuro.

## Contratos
- No hay contratos: sin back-end en el simulador (principio 12 no aplica según ADR-0001).
- **Destino del registro en la app real:** fuera del alcance de este cambio. Este cambio solo implementa el registro en memoria en el simulador. Llevarlo a `exodus-gtm-pwa` exige un cambio nuevo que decida el destino (endpoint en assortment-task, servicio de analítica o logs del cliente); si es contrato entre servicios, ese cambio será intensidad full con ADR. Con esto se cierra la duda que `impact.md:40` dejaba para `design`.
- **Sync a la canónica (decidido antes del gate A):** los 8 requisitos (7 de `surtido-listado` y 1 de `catalogo-bandera-sucursal`) llevan en el delta, debajo de su línea `(Origen: …)`, la marca `(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)`. `sync` la copia tal cual, así que la canónica sigue distinguiendo lo observado en la app real de lo especificado. La marca se quita cuando un cambio lo implemente en `exodus-gtm-pwa`. La fila de la tabla de banderas del Propósito de `catalogo-bandera-sucursal` no entra por `sync` (limitación anotada en ese delta). Decidido por Arquitectura (angel) · 2026-11-11.

## Modelo de datos
- `imagen` opcional en `PartidaPedido` y `ProductoVista` (cambio interno del simulador, no expuesto).
- `EntradaDetalle` (en memoria, en `AppStore`):

| Campo | Tipo | Origen |
| --- | --- | --- |
| `sucursal` | `string` | `sucursal` del store: valor de la semilla del escenario o `SUCURSAL_DEMO`. El simulador no maneja sucursales reales; el valor fijo no condiciona ninguna lógica (P14) |
| `pedido` | `string` | Id del pedido destino al abrir la entrada: el de `proximaPartidaPara(ronda, codigo)`; si no hay destino (código ya resuelto), el primer pedido de `presencias` de `productoVista`. En V2 (un solo pedido) coincide con el pedido de la tarea. Una entrada cuenta una sola vez |
| `codigo` | `string` | Código del producto |
| `entrada` / `salida` | `number` (ms epoch) | Fecha y hora de entrada y salida; la hora llega como parámetro a las funciones puras |
| `imagenListadoActiva` | `boolean` | Valor de la bandera al abrir ("sin imagen en el listado" cuando es `false`) |
| `resultado` | `'captura' \| 'negacion' \| 'ninguna'` | Ver regla de precedencia |

- Regla de precedencia: si en la misma entrada hubo negación, el resultado es `negacion` aunque antes se haya capturado (negar cierra el detalle en `DetalleProducto.tsx:134-139`); si solo hubo captura, `captura`; si nada, `ninguna`. Confirmada por Producto (clarificación #12) y codificada en el delta.
- Una entrada abierta que no se cerró (recarga de página) se pierde con el resto del registro. No hay migración.
- `pedidoDeEntrada(...)` (`entradasDetalle.ts:31-35`, 5.ª función pura del registro): devuelve el pedido al que se asigna la entrada: el destino de las siguientes piezas del producto o, si ya no hay destino, el pedido de su primera presencia en la ronda. Es la regla del campo `pedido` de la tabla anterior. Aprobada en el plan del lote 1.

### Ciclo de vida de la entrada (tolerante a `StrictMode`)
`main.tsx:13` monta la app con `<StrictMode>`, que en desarrollo monta, desmonta y vuelve a montar los efectos. Por eso el cierre no se ata al desmontaje de `DetalleProducto`:
- **Abrir:** al pulsar la tarjeta en el listado (evento, no efecto). Si ya hay una entrada abierta del mismo código, `abrirEntrada` la conserva (idempotente); si hay una abierta de otro código, la cierra antes de abrir la nueva.
- **Marcar:** `marcarCaptura` y `marcarNegacion` sin entrada abierta no hacen nada; repetirlas no cambia el resultado.
- **Cerrar:** cuando la ruta sale de `#/detalle/:codigo` (botón volver, `replace`, atrás del navegador o cualquier otra ruta). El store observa el cambio de ruta; cerrar una entrada ya cerrada no hace nada.
- Pruebas de dominio: "abrir dos veces el mismo código", "cerrar dos veces" y "marcar sin entrada abierta".

## Decisiones (ADR)
| Decisión | Alternativas descartadas | ADR |
| --- | --- | --- |
| La imagen es opcional en el dominio | `''` como "sin imagen" (ausencia implícita) | No requiere (decisión interna, sin contrato público) |
| La bandera llega a la pantalla por la semilla del escenario y `AppStore` | Solo valor por defecto en `CONFIG_MULTIORDEN_DEFAULT` (no se podría demostrar "sucursal sin activar") | No requiere |
| La bandera de imagen está encendida en todos los escenarios de demo (`BANDERA_ENCENDIDA`, `escenarios.ts:162-171`), salvo `bandera-apagada` | Encenderla solo en el escenario inicial | No requiere; plan del lote 1, decisión 2 |
| El registro de entradas tiene estado propio en `AppStore`, fuera de `RondaState` | Campo en `RondaState` (rompe `retocar` y pruebas, y se borra con `reiniciar`) | No requiere |
| Cómo se documentan los escenarios no reproducibles y las desviaciones del simulador (sin cambiar P4 ni Q) | Eximir esos escenarios de P4 por ADR (requiere cambiar la constitución); implementar en el simulador lo que no tiene (revisión, voz, consulta de bandera) | ADR-0001 §Ampliación 2026-11-11 (propuesta, se acepta con el gate A) |

## Decisiones de dominio y vacíos del estándar (front-end)
| Tema | Decisión | Decidido por · fecha |
| --- | --- | --- |
| Estados carga / error / vacío | Carga y error de la imagen → icono genérico; el listado vacío no cambia | Producto (clarificaciones #2 y #3) · 2026-11-10 |
| Reintento tras error | No se reintenta mientras la fila siga montada | Arquitectura (angel) · 2026-11-11 |
| Origen del dato y fallo | Imagen importada en los mocks; la falla se simula con una URL inexistente; sin HTTP | Arquitectura (angel) · 2026-11-11 |
| Permisos | Sin diferencias por rol: la ve todo surtidor con la bandera activa | Producto (spec) · 2026-11-11 |
| Textos de UI | Ninguno nuevo (el icono no lleva texto) | Producto (clarificación #2) · 2026-11-10 |
| Reglas de pantalla | Imagen igual en todos los estados del producto; pulsar abre el detalle | Producto (clarificaciones #4 y #6) |
| Descripción en la tarjeta | No se añade; desviación del simulador | Arquitectura (angel) · 2026-11-11; Producto (clarificación #11) · 2026-11-11 |
| Sucursal del registro | Valor fijo de la semilla / `SUCURSAL_DEMO` | Arquitectura (angel) · 2026-11-11 |
| Pedido del registro | `pedido` = destino de `proximaPartidaPara` o, si no hay, primera presencia | Arquitectura (angel) · 2026-11-11 |
| Ciclo de vida de la entrada | Cierre por cambio de ruta y funciones idempotentes (tolerante a `StrictMode`) | Arquitectura (angel) · 2026-11-11 |
| Detalle sin imagen | Sin cambios; imagen rota aceptada en demo | Arquitectura (angel) · 2026-11-11 |
| Vacío del estándar: estilos (STY-03 `sx` de MUI) | CSS Module al lado de la pantalla, con tokens `--color-*` (precedente) | Arquitectura (angel) · 2026-11-11 |
| Vacío del estándar: carga con skeleton (UXE-01) | Icono genérico, por decisión de Producto | Producto / Arquitectura (angel) · 2026-11-11 |
| Vacío del estándar: `alt` (A11-03) | `alt=""` como el resto del simulador; se reporta como hallazgo | Arquitectura (angel) · 2026-11-11 |
| Pruebas | Archivo nuevo en `tests/domain/`, con `test:domain` actualizado en `package.json` | Arquitectura (angel) · 2026-11-11 |

## Escenarios no reproducibles en el simulador (ADR-0001 §Ampliación 2026-11-11)
Los escenarios marcados "sin prueba" **no cumplen el principio 4** en este cambio. La evidencia sustituta no lo cambia. En la compuerta Q, QA decide si los acepta como deuda explícita o si salen a un cambio de la app real.

| Escenario (requisito) | Por qué no se reproduce | Prueba / evidencia en el simulador | Situación P4 |
| --- | --- | --- | --- |
| Guía por voz sin cambios (Orden y datos del listado sin cambios) | `decir()` (`sonidos.ts:74`) no se llama en ninguna pantalla | Evidencia sustituta de dominio: con la misma ronda con y sin imagen en las partidas, `productosVista` devuelve los mismos productos en el mismo orden y con los mismos datos salvo `imagen`, y `conteosRonda` (base del resumen de voz) es igual | Sin prueba → deuda para Q |
| Falla al consultar la bandera (Activación de la imagen por sucursal) y Falla al consultar la bandera de imagen (`catalogo-bandera-sucursal`) | No hay consulta de bandera | Evidencia sustituta de dominio: `resolverImagenListadoActiva(null \| undefined \| {})` devuelve `false` | Sin prueba → deuda para Q |
| Sucursal con / sin la bandera habilitada (`catalogo-bandera-sucursal`) | No hay servicio de seguridad ni sucursal "Centro" | Se prueban con los escenarios de demo de bandera encendida y apagada: la semilla hace de respuesta del servicio y la sucursal es `SUCURSAL_DEMO` (§Ampliación punto 4) | Con prueba (equivalencia) |
| ~~Bandera de imagen activa sin listado V2~~ y ~~Listado con revisión de piezas~~ | Fuera del simulador | Salieron del delta (clarificación #17); pendientes de un cambio sobre `exodus-gtm-pwa` | No aplica a este cambio |
| GIVEN "tarea de un solo pedido" (Listado con imágenes) | La ronda siempre trae 3 pedidos (`mocks/ronda.ts:120-123`) | Se prueba en la ronda de 3 pedidos (ADR-0001: el listado del simulador representa V2; §Ampliación punto 4) | Con prueba |
| Escaneo antes de que carguen / La imagen termina de cargar (Listado utilizable mientras cargan) | Las imágenes son assets empaquetados y cargan casi al instante | Verificación manual documentada en `verify`: Chrome DevTools, "Disable cache" + throttling "Slow 3G", escenario con bandera encendida | Con prueba (manual) |

## Riesgos y mitigaciones
| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| Filas más altas a 360 px: más scroll y peor lectura | Media | Medio | 60 px según Figma; revisar a 360 px en `verify` |
| Navegador de las Zebra (chrome ≥ 49) con `object-fit` | Baja | Bajo | `object-fit` existe desde chrome 32; ya se usa en `ProductSummary` |
| La salida del detalle por el botón atrás del navegador no pasa por `volver()` | Media | Medio (entrada sin cerrar) | Cierre por cambio de ruta, no por `volver()` (ver "Ciclo de vida de la entrada") |
| `StrictMode` en desarrollo cierra la entrada al montar el detalle | Alta si se cierra al desmontar | Medio (registro falso en la demo) | Cierre por cambio de ruta y funciones idempotentes, con pruebas de dominio |
| Escenarios sin prueba en el simulador (3) | Alta | Bajo (WARNING en `verify`, no bloquea Q) | Tabla anterior: evidencia sustituta de dominio; QA decide en Q si los acepta como deuda |
| Los requisitos entran a la canónica sin estar en la app real | Media | Medio | Marca de estado en cada requisito al hacer `sync` (sección Contratos) |

## Observabilidad y operación
- Registro de entradas al detalle (requisito de SC-001) en memoria, visible para pruebas; sin envío a ningún servicio.
- Feature flag: `Bandera_ImagenListadoEnHH` (`imagenListadoActiva`), apagada por defecto.

## Pendientes fuera de design (dueño: specify/clarify)
- Resueltos en clarify (#11 a #16): desviación de la descripción, regla de precedencia, SC-002 medido fuera del sistema, falla de la bandera fijada en el delta, delta de `catalogo-bandera-sucursal` y validación de la canónica `surtido-listado`.
- Pendiente del revisor humano: checklist de requisitos sin firma y con ítems "no cumple", a reevaluar contra la spec vigente.
- Capacidades: `catalogo-bandera-sucursal` entra con un requisito ADDED; en el simulador se cubre con `imagenListadoActiva` en `ConfigMultiorden` y `resolverImagenListadoActiva` (evidencia sustituta de la falla).

## Constitution Check
> Principios 11–15 según las equivalencias de ADR-0001 (incluida su ampliación del 2026-11-11).

- [x] P1 Spec antes de código: P registrada; **A pendiente**. Se marca al registrar el gate A.
- [x] P2 Solo agentes dev escriben código: implementa `frontend-exodus:dev-frontend`.
- [x] P3 Prohibido mejorar fuera del alcance: no se toca el design system; los comentarios viejos (`ProductoRondaRow.module.css:1,26`, `SurtidoRonda.tsx:4`) solo se actualizan si la tarea lo dice.
- [x] P4 Escenario ↔ prueba: **no se cumple.** 3 escenarios no tienen prueba en el simulador (guía por voz y las dos fallas de consulta de la bandera; ver "Escenarios no reproducibles"); la evidencia sustituta no los cubre. Los tres están implementados (el comportamiento no cambia o lo resuelve `resolverImagenListadoActiva`), así que en `verify` son WARNING. El resto se cubre con `node --test` y verificación manual. QA decide en la compuerta Q si los acepta como deuda; ni este diseño ni ADR-0001 la eximen.
- [x] P5 Canónicas solo por `sync`.
- [x] P6 Contratos con ADR: no hay contratos.
- [x] P7 Proporcionalidad: standard justificada en el intent (dos capacidades, ≤ 2; un repo; la bandera es configuración, no seguridad).
- [x] P8 Specs revisables: 8 requisitos en dos deltas (7 y 1, cada uno ≤ 12).
- [x] P9 Cero marcadores: verificado por el validador.
- [x] P11 (ADR-0001) La lógica vive en `src/domain/`: el registro y la resolución de la bandera son funciones puras y la pantalla solo presenta.
- [x] P12 (ADR-0001) No aplica: sin HTTP.
- [x] P13 (ADR-0001) Textos en el componente: no hay textos nuevos.
- [x] P14 Banderas por sucursal: `Bandera_ImagenListadoEnHH` en `ConfigMultiorden`; la sucursal del registro es un dato de la demo y no condiciona lógica.
- [x] P15 (ADR-0001) Pruebas en `tests/domain/` para toda la lógica nueva de `src/domain/`.
- [x] Intensidad correcta: ningún disparador de "full" (el destino real del registro queda para otro cambio).

- [x] cambio del Node 20 al 22.18: Se actualizo el node por la version y dependencia en el PR y se aprobo por angel el arquitecto

Decisiones de Arquitectura: angel · 2026-11-11
Aprobado por Arquitectura: angel  · 2026-11-12  
