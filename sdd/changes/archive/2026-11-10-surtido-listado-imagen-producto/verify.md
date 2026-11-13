# Verificación · 2026-11-10-surtido-listado-imagen-producto · 2026-11-11

Ejecutado por: `/exodus-sdd:verify`. Fuentes:
- `exodus-sdd:sdd-analyst`, en solo lectura.
- Una segunda opinión de conformidad de `frontend-exodus:dev-frontend`, en modo auditoría (equivalente a `auditar-ui`).

Revisado por QA: isaai (QA), 2026-11-12. Gate Q registrado antes de converge; ver «Re-verificación 2026-11-12».

Base `20ab48f` · HEAD `15af1a9`. Node v22.23.5.

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | verde |
| `npm run test:domain` | **48/48** |
| `npm run build` | verde (lote 4) |
| `npm run sdd:check` | 0 errores |
| lint | no hay script |

## Resumen
| Dimensión | Resultado | CRITICAL | WARNING | SUGGESTION |
| --- | --- | --- | --- | --- |
| Completitud | con hallazgos | 0 | 4 | 0 |
| Corrección | ok | 0 | 1 | 4 |
| Coherencia | con hallazgos | 0 | 5 | 9 |
| **Total** | | **0** | **10** | **13** |

Completitud: 28 de 28 tareas `[x]`. Los 8 requisitos tienen código. De los 22 escenarios, 19 tienen prueba (automática, manual o de equivalencia) y 3 no tienen prueba (P4 no se cumple; decide QA en Q).

## Verificación manual registrada
Las hizo Juanito Alcachofaz (Product Engineer) el 2026-11-11 con `npm run dev`, a 360 px de ancho, siguiendo las URLs de `frontend-report.md`. Esta tabla resuelve el hallazgo W-b del analista.

| Tareas | Escenarios de demo | Resultado |
| --- | --- | --- |
| T020, T021, T022 | `inicial`, `cuatro-estados`, detalle de 2012000, 2010000 y 1978000 | OK |
| T030, T031 | `sin-imagen`, `imagen-rota` | OK |
| T040, T041 | Slow 3G con «Disable cache»; escaneo de 0607006 | OK. Hallazgo H-01, anterior al cambio: los botones del modal quedan alineados a la derecha. |
| T051, T060, T061, T070, T071, T073 | `inicial`, `sin-imagen`, `bandera-apagada` | OK |
| T014, T081, T082, T083 | React DevTools: estado `entradasDetalle` de `AppStoreProvider`; volver, atrás del navegador, stepper, negar, `bandera-apagada` | OK |
| T901 (Zebra, chrome ≥ 49) | — | Validada junto con el lote 4 según la persona. Sin evidencia separada del dispositivo. |

## Completitud (requisitos y escenarios)
**surtido-listado**

| Requisito · Escenario | Evidencia | Estado |
| --- | --- | --- |
| **Imagen del producto en el listado** | `ProductoRondaRow.tsx:44-60,78`; `SurtidoRonda.tsx:74,220` | Implementado |
| · Listado con imágenes | Manual T020. El GIVEN «un solo pedido» se cubre por equivalencia (ADR-0001 §Ampliación p.4). La descripción no se añade (clarificación #11). | Con prueba (manual) |
| · Productos parecidos en el mismo pedido | Manual T021. El listado y el detalle toman la imagen de la misma fuente (`ronda.ts:306-308`). | Con prueba (manual) |
| · Producto en cualquier estado de surtido | Manual T022 (`cuatro-estados`, `escenarios.ts:83-92`) y `entradasDetalle.test.mjs:38-45` | Con prueba |
| **Producto sin imagen en el listado** | `ProductoRondaRow.tsx:48-56`; `ronda.ts:60,248` | Implementado |
| · Producto sin imagen registrada | Manual T030 (`sin-imagen`) | Con prueba (manual) |
| · Imagen que no se puede cargar | Manual T031 (`imagen-rota`). Sin reintento: `ProductoRondaRow.tsx:49,55`. | Con prueba (manual) |
| **Listado utilizable mientras cargan las imágenes** | `ProductoRondaRow.tsx:48-54`; `ProductoRondaRow.module.css:36-48` | Implementado |
| · Escaneo antes de que carguen las imágenes | Manual T041 (Slow 3G) | Con prueba (manual) |
| · La imagen termina de cargar | Manual T040; la caja es fija de 60 px | Con prueba (manual) |
| **Orden y datos del listado sin cambios** | `ProductoRondaRow.tsx:78`: con la bandera apagada no se pinta nada nuevo | Implementado |
| · Orden y datos sin cambios | `entradasDetalle.test.mjs:38-45` y manual T051 | Con prueba |
| · Guía por voz sin cambios | Solo evidencia sustituta: `entradasDetalle.test.mjs:47-51` (`conteosRonda`) | **Sin prueba** (WARNING · P4) |
| **Pulsar la imagen abre el detalle** | Miniatura dentro del `<button>` (`ProductoRondaRow.tsx:70-78`) | Implementado |
| · Pulsar la imagen de un producto | Manual T060 | Con prueba (manual) |
| · Pulsar el icono genérico | Manual T061 | Con prueba (manual) |
| **Activación de la imagen por sucursal** | `configMultiorden.ts:36,45,52-54`; `AppStore.tsx:66`; `SurtidoRonda.tsx:74` | Implementado |
| · Sucursal piloto | Manual T073 y `entradasDetalle.test.mjs:58-61` | Con prueba |
| · Sucursal sin activar | Manual T070/T071 (`bandera-apagada`) y `entradasDetalle.test.mjs:63-65` | Con prueba |
| · Falla al consultar la bandera | Solo evidencia sustituta: `entradasDetalle.test.mjs:67-73` | **Sin prueba** (WARNING · P4) |
| **Registro de entradas al detalle desde el listado** | `entradasDetalle.ts:31-74`; `AppStore.tsx:76-100`; `SurtidoRonda.tsx:221-224`; `DetalleProducto.tsx:117,127,146` | Implementado |
| · Entrada solo para ver el producto | `entradasDetalle.test.mjs:85-89` y manual T081/T083 | Con prueba |
| · Entrada con captura | `entradasDetalle.test.mjs:91-95` y manual T082 | Con prueba |
| · Entrada con negación | `entradasDetalle.test.mjs:97-101` y manual T082 | Con prueba |
| · Captura y negación en la misma entrada | `entradasDetalle.test.mjs:103-107` y manual T082 | Con prueba |
| · Línea base en sucursales sin activar | `entradasDetalle.test.mjs:109-114` y manual (`bandera-apagada`) | Con prueba |

**catalogo-bandera-sucursal**

| Requisito · Escenario | Evidencia | Estado |
| --- | --- | --- |
| **Bandera de imagen en el listado de surtido** | `configMultiorden.ts:32-36,45`; `SUCURSAL_DEMO = 'Centro'` (`mocks/ronda.ts:131`) | Implementado |
| · Sucursal con la bandera habilitada | Equivalencia (design.md §Escenarios no reproducibles): `inicial` con `Centro`, manual T073 y `entradasDetalle.test.mjs:58-61` | Con prueba |
| · Sucursal sin la bandera habilitada | Manual T071 y `entradasDetalle.test.mjs:63-65` | Con prueba |
| · Falla al consultar la bandera de imagen | Solo evidencia sustituta: `entradasDetalle.test.mjs:67-73` | **Sin prueba** (WARNING · P4) |

Hallazgos de completitud:
- [WARNING] «Guía por voz sin cambios» no tiene prueba.
  - evidencia: design.md §Escenarios no reproducibles; `entradasDetalle.test.mjs:47-51`
  - dueño: implement (deuda para el gate Q)
  - propuesta: QA la acepta como deuda explícita o la saca a un cambio de `exodus-gtm-pwa`.
- [WARNING] «Falla al consultar la bandera» (surtido-listado) no tiene prueba.
  - evidencia: `entradasDetalle.test.mjs:67-73`
  - dueño: implement (deuda para Q)
  - propuesta: igual que la anterior.
- [WARNING] «Falla al consultar la bandera de imagen» (catalogo-bandera-sucursal) no tiene prueba.
  - evidencia: igual que la anterior
  - dueño: implement (deuda para Q)
  - propuesta: igual que la anterior.
- [WARNING] W-b · Las verificaciones manuales no constaban en ningún artefacto.
  - evidencia: `frontend-report.md` las lista como «pendientes».
  - dueño: implement
  - **resuelto en este documento**: ver la sección «Verificación manual registrada». Se mantiene en el conteo para la retro.

## Corrección (intención, bordes, errores)
- [WARNING] M1 (auditoría) · La integración UI ↔ store del registro (abrir, marcar y cerrar por ruta) no tiene prueba automática. Solo hay pruebas de las funciones puras y la verificación manual con DevTools.
  - evidencia: `SurtidoRonda.tsx:221-225`; `DetalleProducto.tsx:117,127,146`; `AppStore.tsx:97-100`
  - dueño: design (decidir el tipo de prueba en el simulador)
  - propuesta: extraer un predicado de ruta de detalle a `src/domain/` con su prueba, y decidir si se muestra el registro en `EscenariosPanel`.
- [SUGGESTION] Si se pasa de `/detalle/A` a `/detalle/B` editando la URL, la entrada de A no se cierra. La interfaz no permite llegar ahí.
  - evidencia: `AppStore.tsx:97-100`
  - dueño: design (próximo cambio)
  - propuesta: cerrar también cuando cambia `:codigo`.
- [SUGGESTION] La `Miniatura` no reinicia su estado si cambia `imagen` con la fila montada.
  - evidencia: `ProductoRondaRow.tsx:45`
  - dueño: implement
  - propuesta: `key={v.imagen}`.
- [SUGGESTION] (conocido) El detalle sin imagen o con imagen rota muestra el recuadro vacío o roto.
  - evidencia: `DetalleProducto.tsx:163`
  - dueño: specify (cambio futuro; hoy es no-objetivo)
- [SUGGESTION] m10 · Bajar la cantidad con el stepper, incluso a 0, cuenta como «captura» (decisión de Producto, lote 4). Puede inflar la medición de SC-001.
  - evidencia: `DetalleProducto.tsx:117`
  - dueño: specify
  - propuesta: confirmarlo con Producto antes de llevar el registro a `exodus-gtm-pwa`.

## Coherencia (diseño, patrones, nombres)
- [WARNING] W-a · Los bloques de evidencia sustituta no usan la leyenda de ADR-0001 §Ampliación p.2 (`SDD <id> · <Requirement> · sustituta de <Scenario>`).
  - evidencia: `tests/domain/entradasDetalle.test.mjs:24,27,55-59`
  - dueño: implement
  - propuesta: T902 en converge.
- [WARNING] W-c · La §Ampliación de ADR-0001 sigue como «propuesta», aunque el gate A ya está registrado (angel, 2026-11-11T18:23:46Z).
  - evidencia: `sdd/decisions/ADR-0001-constitucion-en-simulador.md:21`
  - dueño: design
- [WARNING] W-d · `pedidoDeEntrada` (5.ª función, aprobada en el plan del lote 1) y la bandera encendida en toda la demo (lote 1, decisión 2) no se reflejaron en design.md.
  - evidencia: `entradasDetalle.ts:31-35`; `escenarios.ts:162-171`
  - dueño: design
- [WARNING] El Constitution Check de design.md tiene P1 sin marcar y la firma «<pendiente gate A>».
  - evidencia: design.md §Constitution Check; `sdd:check`
  - dueño: design
  - nota: P4 queda sin marcar hasta el gate Q, y así es correcto.
- [WARNING] No está documentado que `test:domain` requiere Node ≥ 22.18. La CI usa Node 20 y no corre `test:domain`.
  - evidencia: `tests/domain/loader.mjs:10`
  - dueño: design (Arquitectura, cambio de tooling)
- [SUGGESTION] m1 · La ruta `'/detalle/'` está repetida a mano en `App.tsx:27`, `SurtidoRonda.tsx:224` y `AppStore.tsx:99`. Si cambia, las entradas se cierran solas sin error. Dueño: implement (cambio futuro).
- [SUGGESTION] m2 · `semillaDesdeUrl` reemplaza `config` en lugar de combinarla (`escenarios.ts:170`). Dueño: implement.
- [SUGGESTION] m3 · Cada abrir, marcar o cerrar rerenderiza todos los consumidores de `useStore()` (`AppStore.tsx:115,129`). Dueño: design.
- [SUGGESTION] m6 · El color del icono genérico sale de `filter: brightness(0)` y no de un token (`ProductoRondaRow.module.css:50-55`). Es deuda formal que valida Diseño. Dueño: design.
- [SUGGESTION] La leyenda de `DetalleProducto` solo está en la cabecera y no en cada punto de integración (`DetalleProducto.tsx:24-30`). Dueño: implement.
- [SUGGESTION] H-02 / m5 · `<div>` dentro de `<button>`: HTML no válido. Ya existía y la `Miniatura` lo repite (`ProductoRondaRow.tsx:47,79`). Dueño: implement (retro).
- [SUGGESTION] m8 · La cabecera de `AppStore.tsx:1-3` está desactualizada. Dueño: implement.
- [SUGGESTION] H-01 · Los botones del modal están alineados a la derecha. Ya existía y ninguna regla de la skill v0.5 lo fija. Dueño: specify (fuera de este cambio).
- [SUGGESTION] El proyecto no tiene script de lint. Dueño: design (tooling).

Deuda aceptada, que no se cuenta como hallazgo:
- STY-03/STY-04 (CSS Module)
- UXE-01 (icono en vez de skeleton)
- A11-03 (`alt=""`)
- CMP-01 (precedente del simulador)
- Descripción ausente en la tarjeta (clarificación #11)

Todas están decididas en design.md §Decisiones de dominio y vacíos del estándar.

## Auditoría de interfaz (segunda opinión, `dev-frontend`)
- Bloqueantes: 0.
- Mayor: 1 (M1, contado arriba como WARNING).
- Menores: 10 (m1–m10, contados arriba como SUGGESTION). m4, m7 y m9 coinciden con hallazgos ya registrados.
- Guía de interfaz cumplida:
  - 60 × 60 px;
  - sin borde ni fondo;
  - `object-fit: contain`;
  - miniatura a la izquierda y centrada;
  - con la bandera apagada, la tarjeta queda igual;
  - `inset` convertido para chrome 49.
- Restricciones cumplidas:
  - sin `sort`, `any`, `@ts-ignore`, `console.log` ni `catch` vacío;
  - sin tocar `src/design-system/`, `vite.config.ts` ni `.github/`;
  - sin dependencias nuevas;
  - leyendas presentes.
- Los vacíos del estándar quedaron registrados en `sdd/harness-backlog.md`.

## Fuera de alcance detectado
- Ningún cambio de código sin tarea que afecte el comportamiento. Todo se corresponde con T010–T083 y T900.
- Ampliaciones aprobadas en los planes pero no reflejadas en design.md: `pedidoDeEntrada` y la bandera encendida en toda la demo (ver W-d).

## Veredicto
- **CRITICAL: 0.** Se cumple el requisito del gate Q. P4 no se cumple para 3 escenarios: la decisión es de QA.
- **Listo para converge: sí.** Tarea propuesta T902 (leyendas de evidencia sustituta).
- **Listo para PR: sí, con pendientes de documentación:**
  - design.md: P1, firma y W-d.
  - ADR-0001: estado de la §Ampliación.
  - Decisión de QA en Q sobre la deuda P4.

## Decisión de QA (gate Q)
Registrada por isaai (QA) el 2026-11-12.

| Punto | Decisión |
| --- | --- |
| P4 · «Guía por voz sin cambios» sin prueba | Aceptado como deuda explícita. |
| P4 · «Falla al consultar la bandera» (surtido-listado) sin prueba | Aceptado como deuda explícita. |
| P4 · «Falla al consultar la bandera de imagen» (catalogo-bandera-sucursal) sin prueba | Aceptado como deuda explícita. |
| T901 · Revisión en el navegador de la Zebra (chrome ≥ 49) | Aceptado. QA indica que la evidencia está registrada (referencia `T901-20.png` en tasks.md). |
| M1 · Integración UI ↔ store del registro sin prueba automática | Aceptado; queda cubierto por la verificación manual con DevTools. |

## Re-verificación 2026-11-12
Ejecutada por `/exodus-sdd:verify` con `exodus-sdd:sdd-analyst` y una segunda opinión de `frontend-exodus:dev-frontend` (modo auditoría). El código no cambió: HEAD `15af1a9`, sin cambios en `src/`, `tests/` ni `package.json`.

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | verde |
| `npm run test:domain` | 48/48 (Node v22.23.5) |
| `npm run build` | verde |
| `npm run sdd:check` | 0 errores · 1 advertencia (Constitution Check) |

**Totales: CRITICAL 0 · WARNING 14 · SUGGESTION 17** (línea base: 0 · 10 · 13). Resuelto: W-b. Siguen: los demás hallazgos de arriba, incluidos los aceptados en Q. Los 22 escenarios mantienen el mismo estado (19 con prueba, 3 sin prueba aceptados).

### Hallazgos nuevos
- [WARNING] **Tareas desmarcadas con trabajo hecho.** T050, T072, T080, T081, T082, T083 y T900 pasaron a `[ ]` en el working tree (21/28), aunque su código y pruebas existen (`entradasDetalle.test.mjs:40-152`, `SurtidoRonda.tsx:221-225`, `DetalleProducto.tsx:117,127,146`, `AppStore.tsx:97-100`). Impide converge. Dueño: implement / la persona que editó tasks.md.
- [WARNING] **Sufijos `-N.png` en 20 IDs de tasks.md** (`T001-1.png` … `T901-20.png`) que apuntan a archivos inexistentes; numeración incoherente. `sdd:check` no falla, pero rompe la trazabilidad. Dueño: tasks.
- [WARNING] **La aceptación de T901 cita evidencia inexistente** (`T901-20.png` no está en el repo ni en las carpetas del usuario). La revisión en Zebra sigue sin evidencia comprobable. Dueño: implement (aportar evidencia); QA revalida.
- [WARNING] **Gate Q fuera de secuencia.** Se registró antes de converge, con `by: "QA"` en lugar de `isaai`, y tasks.md cambió después. gates.md prevé revocarlo con `--clear` y registrarlo de nuevo tras converge. Dueño: QA.
- [WARNING] **La CI sí corre `test:domain` con Node 20** (`.github/workflows/sdd-ci.yml:11,15`) y `loader.mjs:10` requiere `registerHooks` (Node ≥ 22.18): es previsible que el job `validar` falle en el PR. Corrige la afirmación de arriba («la CI no corre `test:domain`»). Ya pasaba antes del cambio. Dueño: design (Arquitectura).
- [WARNING] (auditoría UI) **N1 · `gap` en flexbox no existe en Chrome < 84** (`ProductoRondaRow.module.css:4`): en una Zebra con WebView antiguo la miniatura queda pegada al texto. Depende de la versión de Chrome del dispositivo. Dueño: design.
- [SUGGESTION] (auditoría UI) **N2 · A 360 px la ubicación más larga queda al límite** (`.ubicacion` con `nowrap`, ~231 px disponibles); riesgo de recorte o scroll horizontal en Chrome < 90. Dueño: design.
- [SUGGESTION] tests-plan.md hecho a posteriori; rango de idempotencia es `:117-143`.
- [SUGGESTION] verify.md y tests-plan.md sin versionar.
- [SUGGESTION] CLAUDE.md pide `--by <rol>` y el kit `--by <nombre>`: unificar.
- [SUGGESTION] Registrar en harness-backlog que la sobrescritura de tasks.md se repitió.

Corregido durante esta verificación: la sección «Pruebas a generar» estaba duplicada en `handoff/frontend.md`.

### Veredicto
- **CRITICAL: 0.**
- **Listo para converge: no.** Antes hay que restaurar los `[x]` de T050, T072, T080–T083 y T900 y quitar los sufijos `-N.png`. Después, converge añadirá T902.
- **Listo para PR: no.** Falta converge, regularizar el gate Q, evidencia real de T901, commit de verify.md y tests-plan.md, resolver la CI con Node 20 y los pendientes de design (P1 y firma, W-c, W-d).

## Cierre 2026-11-12 (tras converge)
- **Converge:** 2 pasadas. La pasada 1 añadió T902 (leyendas «sustituta de» en `tests/domain/entradasDetalle.test.mjs:47,67,68`); la pasada 2 dio **Converged**. `npm run test:domain` 48/48. Estado `converged`.
- **Gate Q:** revocado y registrado de nuevo después de converge, `by: isaai` (2026-11-12T17:59Z). P4 marcado en el Constitution Check con la deuda de los 3 escenarios sin prueba.
- **Resueltos:** W-a (T902); W-c (ADR-0001 §Ampliación aceptada); W-d (`pedidoDeEntrada` y bandera encendida en toda la demo documentadas en design.md); Constitution Check (P1, P4 y firma); CI con Node 20 (workflows a Node 22.18, decisión registrada en design.md con su aprobador); sección duplicada del handoff; T950 renumerada como T902.
- **Evidencia de T901:** QA indica que las evidencias (`T00x-N.png`) están en otro repositorio; no se versionan aquí.
- **Siguen como deuda o fuera de este cambio:** M1, N1, N2 y las SUGGESTION listadas arriba.
