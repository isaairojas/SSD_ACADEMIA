# Informe del agente dev-frontend · Lote 1 (T001, T010–T015 + T021)

- Fecha: 2026-11-11 · Forma B (plan → aprobación → implementación)
- Aprobación del plan: «adelante», Juanito Alcachofaz (Product Engineer) · 2026-11-11

## Sello de Conformidad
`estandares-frontend` v0.5 (provisional). Stack React + Vite SPA, anexo A2. References: SKILL.md, A2-anexo-vite, 02-estructura, 04-datos-y-estado, 10-calidad, 12-antipatrones. Reglas: precedente antes que regla, estructural vs. dominio, ANT-00a, ANT-00c, ANT-00d y ANT-00f. Los vacíos EST, DAT, QAL y VIT se resuelven con el precedente del simulador y con «criterio humano · angel · 2026-11-11».

## Decisiones tomadas al aprobar el plan
| # | Decisión | Por qué |
| --- | --- | --- |
| A | T021 (`DetalleProducto.tsx:152`, `vista.imagen ?? ''`) se adelanta a este lote | Sin ese cambio, T010 rompe el typecheck |
| B | `pedidoDeEntrada` se añade como 5.ª función pura en `entradasDetalle.ts`; T080 gana un caso | P11: la regla del pedido es lógica de dominio |
| 1 | `SUCURSAL_DEMO = 'Centro'` | Coincide con el GIVEN de `catalogo-bandera-sucursal` |
| 2 | La bandera arranca encendida en toda la demo (`semillaDesdeUrl`); solo «bandera apagada» (T071) la apaga | Lectura de «escenario inicial» en T015 |
| 3 | Node ≥ 22.18 es requisito local de `test:domain`; queda como hallazgo para Arquitectura | `tests/domain/loader.mjs:10` usa `registerHooks` |

## Archivos tocados
- `src/domain/ronda.ts`: `imagen?: string` en `PartidaPedido` y `ProductoVista` (T010).
- `src/screens/surtido/DetalleProducto.tsx:152`: `foto={vista.imagen ?? ''}` (T021).
- `src/domain/configMultiorden.ts`: `imagenListadoActiva` (por defecto `false`) y `resolverImagenListadoActiva` (T011).
- `src/domain/entradasDetalle.ts` (nuevo): tipos y las funciones `pedidoDeEntrada`, `abrirEntrada`, `marcarCaptura`, `marcarNegacion` y `cerrarEntrada` (T012).
- `src/mocks/ronda.ts`: `imagen` opcional en `p()` y `SUCURSAL_DEMO` (T013).
- `src/store/AppStore.tsx`: config, sucursal, registro y las 3 acciones; `Date.now()` fuera del updater (T014).
- `src/navigation/escenarios.ts`: `BANDERA_ENCENDIDA`; `semillaDesdeUrl()` devuelve `Semilla` (T015).

## Verificación
| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | Verde. Lo confirmó el coordinador. |
| `npm run test:domain` | **Bloqueado.** Con Node v20.19.6 se ejecutan 0 de 33 pruebas, igual que en la línea base; hace falta Node ≥ 22.18. |
| `npm run sdd:check` | Verde: 0 errores y 1 advertencia previa (Constitution Check de `design.md`). |

Evidencia complementaria: transpilando `entradasDetalle.ts` fuera del repo pasaron 15 aserciones. **No sustituye a T072 ni a T080** (P15).

Comprobaciones manuales pendientes: T014 (`reiniciar` conserva el registro) y T015 (la demo arranca con la bandera encendida). No se pueden ver en pantalla hasta T020 y T081.

## Observaciones no aplicadas (I1) → retro
- La cabecera de `AppStore.tsx:1-3` está desactualizada.
- `EscenariosPanel.tsx:17-116` duplica los ids de `escenarios.ts`.
- El dominio depende de los mocks (`ronda.ts:29`).
- Hay que fijar Node ≥ 22.18 en CLAUDE.md o `.nvmrc`; la CI usa Node 20 y no corre `test:domain`.
- Riesgo para T901: `npm ci` no corrió el postinstall de `esbuild@0.21.5` ni el de `core-js`.

## Desviaciones del estándar (no corregidas) → verify / harness-backlog
- `EscenariosPanel.tsx:136-138,146-148`: `catch` que solo contienen un comentario (roza ANT-00a).
- Las references 02, 04, 10 y 12 y el anexo A2 siguen en plantilla: las decisiones estructurales de este lote se apoyan en precedente y criterio humano.

## Actualización · 2026-11-11 · línea base con Node 22
Instalé nvm-windows 1.2.2 y Node 22.23.5. Con ese Node, `npm run test:domain` pasa 33 de 33 pruebas, todas de antes de este cambio. El fallo era del entorno. T001 queda cerrada con 33 pruebas de dominio previas.
