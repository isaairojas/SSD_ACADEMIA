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

---

# Lote 2 · T020, T022, T030, T031, T040, T041 · 2026-11-11
- Aprobación del plan: «adelante», Juanito Alcachofaz (Product Engineer).

## Decisiones tomadas al aprobar el plan
| # | Decisión |
| --- | --- |
| P1 | `bxs-package.svg` es blanco al 15 % sobre la tarjeta blanca y no se veía. Se hace visible con `-webkit-filter: brightness(0); filter: brightness(0)`. No hay asset nuevo ni se toca el design system. |
| AP1 | Se tocan los archivos compartidos `escenarios.ts` y `EscenariosPanel.tsx`. |
| AP2 | `.miniatura` va debajo del comentario de la línea 26 de `ProductoRondaRow.module.css`, sin editarlo. |
| AP3 | Textos del panel de demo: «Imagen en los cuatro estados», «Producto sin imagen» e «Imagen que no carga». |
| AP4 | Códigos de demo: completo 1458000, parcial 0607006 y negado 6200404; sin imagen 1458000; imagen rota en 6200404 (`producto-inexistente.jpg`). |

## Archivos tocados
- `src/screens/surtido/ProductoRondaRow.tsx` y `ProductoRondaRow.module.css`: miniatura de 60×60 con los estados cargando, cargada y error. Si falla, no se reintenta. Con la bandera apagada no se dibuja nada.
- `src/screens/surtido/SurtidoRonda.tsx`: `resolverImagenListadoActiva(config)` se pasa a la fila como `mostrarImagen`.
- `src/navigation/escenarios.ts` y `EscenariosPanel.tsx`: escenarios `cuatro-estados`, `sin-imagen` e `imagen-rota`.

## Verificación (Node 22.23.5)
- `npm run typecheck`: verde.
- `npm run test:domain`: 33 de 33.
- `npm run build`: verde; el CSS conserva `-webkit-filter`.
- `npm run sdd:check`: 0 errores y la advertencia previa.
- El proyecto no tiene script de lint.

## Verificación manual pendiente (360 px; en dev y en preview)
1. T020 · `?escenario=inicial#/surtido`: la miniatura está a la izquierda y centrada; sin scroll horizontal. Riesgo: `.ubicacion` (`nowrap`) puede desbordar.
2. T022 · `?escenario=cuatro-estados#/surtido`: las imágenes no se atenúan y el estado se sigue leyendo.
3. T030 · `?escenario=sin-imagen#/surtido`: el icono gris claro es visible, sin texto, y se ven los datos.
4. T031 · `?escenario=imagen-rota#/surtido`: aparece el icono; el resto conserva su imagen; hay una sola petición a `producto-inexistente.jpg`; el detalle muestra la imagen rota (hallazgo).
5. T040 · Slow 3G y «Disable cache», entrando por `?escenario=tareas#/tareas`: el icono se ve hasta que carga la foto, las filas no se mueven y se puede abrir el detalle durante la carga.
6. T041 · Slow 3G: escanear la etiqueta de 0607006 (`CodigosCheatsheet`) valida igual y la fila sigue con el icono hasta que llega su foto.
7. Zebra (chrome ≥ 49): el icono se ve (`-webkit-filter`) y `object-fit` funciona.
8. Satisfechas por construcción, sin verificar: T060 y T061 (pulsar la miniatura o el icono abre el detalle) y T051/T070 (con la bandera apagada no hay caja).

## Desviaciones (no corregidas)
- CMP-01: manda el precedente del simulador.
- STY-03, UXE-01 y A11-03: decididas; quedan como hallazgo.
- Icono blanco resuelto con `filter`: queda como hallazgo para Diseño.
- STY-01 previo: hex `#343434` en `ProductSummary.module.css:65`.

## Observaciones no aplicadas (I1)
- Comentarios desactualizados en `SurtidoRonda.tsx:4` y en la línea 26 del CSS (los revisa T900).
- Ids duplicados entre `escenarios.ts` y `EscenariosPanel.tsx`.
- El estado de la miniatura no se reinicia si `imagen` cambia con la fila montada (en la demo no pasa).

---

## Hallazgos para retro

### H-01 · Botones del modal alineados a la derecha
- **Severidad:** WARNING (visual, no bloquea el flujo)
- **Dónde:** modal que aparece al escanear un código en el listado de surtido (`#/surtido`). Se vio durante la verificación manual de T041 (Juanito Alcachofaz, 2026-11-11).
- **Evidencia:**
  - Los modales del surtido se arman en `src/screens/surtido/overlays/SurtidoModals.tsx` sobre `src/design-system/components/organisms/ModalSheet/` (`ModalSheet.module.css`, contenedores flex en columna en las líneas 30 y 65).
  - Falta confirmar qué regla CSS alinea los botones a la derecha.
  - La referencia del borrador a `src/components/ConfirmDialog/ConfirmDialog.tsx:42` no existe en este repo: no hay carpeta `src/components/` ni componente `ConfirmDialog`.
- **Esperado:** Cancelar a la izquierda y Aceptar a la derecha, como acción de diálogo según el estándar front-end. Está pendiente citar el ID de la regla.
- **Actual:** ambos botones están alineados a la derecha.
- **Alcance:** probablemente todos los modales que usan `ModalSheet`. No lo introdujo este cambio: ningún commit del cambio toca `SurtidoModals.tsx` ni `ModalSheet`, así que el problema ya existía.
- **Clasificación tentativa:**
  - Implementación, si el estándar define la alineación y no se aplicó.
  - *Spec gap*, si la regla no está escrita ni en la spec ni en el estándar.
- **Estado:** no se corrige (P3: fuera de alcance; `src/design-system/` no se toca). Queda registrado para la retro.
- **Mejora propuesta:** añadir a la checklist de UI una verificación de la alineación de las acciones en los diálogos.

---

# Lote 3 · T050, T051, T060, T061, T070–T073 · 2026-11-11
- Aprobación del plan: «adelante», Juanito Alcachofaz (Product Engineer). Decisiones: el escenario «bandera apagada» usa la ronda inicial; los textos del panel son los propuestos; no se añade escenario de bandera encendida (T073 se cubre con `inicial`).

## Archivos tocados
- `tests/domain/entradasDetalle.test.mjs` (nuevo): 5 pruebas.
  - T050: `productosVista` y `conteosRonda` dan lo mismo con y sin imagen.
  - T072: `resolverImagenListadoActiva` devuelve `true` con la bandera activa y `false` con la config por defecto, `null`, `undefined` y `{}`.
- `package.json`: `test:domain` incluye el archivo nuevo.
- `src/navigation/escenarios.ts` y `EscenariosPanel.tsx`: escenario `bandera-apagada` (T071).
- T051, T060, T061, T070 y T073 se cumplen por construcción, sin código.

## Verificación (Node 22.23.5)
- `npm run typecheck`: verde.
- `npm run test:domain`: **38/38**.
- `npm run build`: verde.
- `npm run sdd:check`: 0 errores.

## Cobertura P4
«Guía por voz sin cambios», «Falla al consultar la bandera» y «Falla al consultar la bandera de imagen» quedan **sin prueba**. T050 y T072 son evidencia sustituta; es deuda para Q.

## Verificación manual pendiente (360 px)
- T060 · `?escenario=inicial#/surtido`: tocar la miniatura de 2012000 abre su detalle y la imagen no se amplía.
- T061 · `?escenario=sin-imagen#/surtido` (1458000) y `?escenario=imagen-rota#/surtido` (6200404): tocar el icono abre el detalle.
- T070 / T071 · `?escenario=bandera-apagada#/surtido`: no hay imagen, recuadro ni icono.
- T051 · comparar `bandera-apagada` con `inicial` y con GitHub Pages (`origin/main`, anterior al cambio): mismo orden y mismos datos.
- T073 · `?escenario=inicial#/surtido`: se ven las imágenes, con sucursal `'Centro'`.

## Hallazgos para retro
- **H-02:** en `ProductoRondaRow.tsx:79` hay un `<div>` dentro de un `<button>`, que es HTML no válido. Ya existía antes del cambio y la `Miniatura` repite el patrón. Severidad: SUGGESTION.
- **I1:** la `<img>` dentro del botón se puede arrastrar con ratón de escritorio. No aplica en la HH.

---

# Lote 4 · T080–T083, T900, T901 · 2026-11-11
- Aprobación del plan: «adelante», Juanito Alcachofaz (Product Engineer).
- Decisiones:
  - Toda cantidad aceptada cuenta como captura; los rechazos no.
  - La verificación del registro se hace con React DevTools, sin código nuevo.
  - Se reescribe `SurtidoRonda.tsx:4`.
  - `EscenariosPanel.tsx` no lleva leyendas.
  - Se añade la prueba «abrir otro código cierra el anterior».

## Archivos tocados
- `tests/domain/entradasDetalle.test.mjs` (T080): 10 pruebas del registro, más `pedidoDeEntrada`.
- `src/screens/surtido/SurtidoRonda.tsx`:
  - T081: la entrada se abre en el clic de la tarjeta.
  - T900: se reescribe el comentario de la línea 4.
- `src/screens/surtido/DetalleProducto.tsx`:
  - T082: marca la captura en las cantidades aceptadas y la negación al negar.
  - T900: se añaden las leyendas.
- `src/store/AppStore.tsx` (T083): cierra la entrada al salir de `/detalle/` según `pathname`, por `StrictMode`.

## Verificación (Node 22.23.5)
- `npm run typecheck`: verde.
- `npm run test:domain`: **48/48**.
- `npm run build`: verde.
- `npm run sdd:check`: 0 errores.
- grep de la leyenda: presente.
- Sin `any`, `@ts-ignore`, `console.log` ni `catch {}`.
- No hay script de lint.

## Verificación manual pendiente (React DevTools → `AppStoreProvider` → `entradasDetalle`)
- **T081:** al tocar 1394010 en `inicial` se abre una entrada con `Centro`, el pedido `100001` e `imagenListadoActiva: true`.
- **T083:** salir con «Regresar» o con atrás del navegador deja una sola entrada cerrada; recargar dentro del detalle no crea ninguna.
- **T082:** con stepper la entrada queda en `captura`; con captura y después negación, en `negacion`; con un escaneo rechazado, en `ninguna`.
- **Línea base:** en `bandera-apagada` la entrada registra `imagenListadoActiva: false`.
- **T014:** `reiniciar` sin recargar conserva el registro.
- **T901:** revisión en Zebra (chrome ≥ 49): `-webkit-filter` y `object-fit`.

## Hallazgos finales para verify y retro
1. A11-03: `alt=""` en la miniatura (`ProductoRondaRow.tsx:48,52`); decidido por Arquitectura.
2. El detalle con imagen ausente o rota muestra el recuadro vacío o roto (`DetalleProducto.tsx:160`); aceptado para la demo.
3. La tarjeta no muestra la descripción; desviación del simulador (clarificación #11).
4. H-01: los botones del modal están alineados a la derecha; ya existía. Es un vacío del estándar o de la spec, no un fallo de implementación (ninguna regla v0.5 fija la alineación).
5. H-02: `<div>` dentro de `<button>`; HTML inválido que ya existía; SUGGESTION.
6. Del proceso:
   - T081 se marcó `[x]` sin estar implementada; VS Code sobrescribió `tasks.md` con una copia vieja. Ya se corrigió.
   - El registro no tiene interfaz.
   - No hay script de lint.
   - Hay que fijar Node ≥ 22.18 para `test:domain`.
7. I1:
   - `ProductoRondaRow.module.css:1` dice «8 px»: es un comentario desactualizado.
   - La cabecera de `AppStore.tsx:1-3` está desactualizada.
   - Al pasar de `/detalle/A` a `/detalle/B` por URL, A no se cierra.
   - Los ids están duplicados en `EscenariosPanel`.
