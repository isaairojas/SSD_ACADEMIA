# Handoff · 2026-11-10-surtido-listado-imagen-producto · frontend (agente `dev-frontend`)

> Paquete para el agente `dev-frontend` (plugin `frontend-exodus`, skill obligatoria `estandares-frontend`). El agente emite un Sello de Conformidad, trabaja en modos RECONOCIMIENTO → PLAN → IMPLEMENTACIÓN con compuerta humana en cada salto, copia siempre un **precedente** del proyecto y **nunca inventa dominio**. Este paquete le da el dominio decidido y el precedente; lo estructural lo gobierna su skill. No parafrasea las fuentes: enlaza secciones, y el agente las lee al arrancar su plan.

## Repositorio y estándar
- Repo / ruta: este repositorio (`SSD_ACADEMIA`, simulador HH) · Stack según `package.json`: React 18.3 + Vite 5.4 + TypeScript 5.6 (SPA) → **anexo A2**.
- Skill `estandares-frontend`: versión **0.5 (provisional)**. El anexo A2 está en plantilla: **manda el precedente del simulador** (I2). Si el estándar choca con el patrón existente, se reporta como hallazgo y no se reescribe código existente (`CLAUDE.md`).
- Orden entre repos: no aplica (`repos = [frontend]`, sin back-end ni contratos).

## Qué construir
- Intención: `../intent.md` · Criterios de éxito: SC-001 (entradas al detalle solo para ver el producto) y SC-002 (medido fuera del sistema; sin requisito en este cambio).
- Requisitos y escenarios a satisfacer:
  - `../specs/surtido-listado/spec.md` → Imagen del producto en el listado; Producto sin imagen en el listado; Listado utilizable mientras cargan las imágenes; Orden y datos del listado sin cambios; Pulsar la imagen abre el detalle; Activación de la imagen por sucursal; Registro de entradas al detalle desde el listado.
  - `../specs/catalogo-bandera-sucursal/spec.md` → Bandera de imagen en el listado de surtido.
- Diseño visual: Figma "Handheld for Claude", frame 15:1528 · **Guía de interfaz** y nivel de acabado: `../design.md` §Guía de interfaz · Listado de surtido y §Detalle del producto (producto sin imagen o con imagen rota).
- **Licencia de diseño**: según `../design.md` (nivel de acabado), decides espaciados y alineación dentro de la guía y de los tokens `--color-*` sin preguntar; no añades funcionalidad.
- Contratos que consume: ninguno (mocks) · Diseño técnico: `../design.md` §Alcance por repositorio › frontend, §Modelo de datos y §Ciclo de vida de la entrada.
- Verificación visual a 360 px y con el navegador de las Zebra (chrome ≥ 49).

## Tareas asignadas (subconjunto de ../tasks.md)
Detalle, requisito/escenario y verificación de cada una: `../tasks.md` (todas son `frontend`). Precedente por tarea:

| Id | Tarea (resumen) | Precedente a copiar |
| --- | --- | --- |
| T001 | Línea base en verde | — (comandos del `CLAUDE.md`) |
| T010 | `imagen` opcional en el dominio (solo tipos) | `src/domain/ronda.ts:57,245,290` |
| T011 | `imagenListadoActiva` + `resolverImagenListadoActiva` | `src/domain/configMultiorden.ts:18-40` |
| T012 | `src/domain/entradasDetalle.ts` (funciones puras e idempotentes) | `src/domain/ronda.ts:514-556` |
| T013 | Mocks sin imagen + `SUCURSAL_DEMO` | `src/mocks/ronda.ts:61-81` |
| T014 | `AppStore`: config, sucursal, registro y acciones (**archivo compartido → PLAN**) | `src/store/AppStore.tsx:13,35,37` |
| T015 | Config por la semilla de los escenarios (**archivo compartido → PLAN**) | `src/navigation/escenarios.ts:9-18,78-108` |
| T020 | Miniatura de 60 px en la tarjeta con la bandera activa | `ProductSummary.module.css:27-41` (copiado, no importado); `ProductoRondaRow.module.css:1,26`; `SurtidoRonda.tsx:217` |
| T021 | `vista.imagen ?? ''` hacia `ProductSummary` | `DetalleProducto.tsx:152` |
| T022 | Escenario "cuatro estados a la vez" | `escenarios.ts:78-108`; `EscenariosPanel.tsx:17-116` |
| T030 | Icono genérico (sin imagen / `onError`, sin reintento) | `src/assets/illustrations/bxs-package.svg`; `ProductoRondaRow.module.css` |
| T031 | Escenarios "sin imagen" e "imagen rota" | `escenarios.ts:9-18` (`retocar`) |
| T040 | Icono mientras carga y misma caja al cargar | estado de carga de la miniatura (T020) |
| T041 | Escaneo no depende de la carga | verificación manual (Slow 3G) |
| T050 | Prueba de equivalencia con y sin imagen | `tests/domain/ronda.test.mjs:282-305` |
| T051 | Orden y datos con bandera encendida y apagada | comparación manual |
| T060 / T061 | Pulsar imagen / icono abre el detalle | `ProductoRondaRow.tsx` (el `<button>` existente) |
| T070 | Listado con imágenes solo con la bandera activa | `resolverImagenListadoActiva` (T011) |
| T071 | Escenario "bandera apagada" | `escenarios.ts` |
| T072 | Pruebas de `resolverImagenListadoActiva` | `tests/domain/ronda.test.mjs` |
| T073 | Escenario "bandera encendida" | `escenarios.ts` |
| T080 | Pruebas del registro | `tests/domain/ronda.test.mjs:282-305`; `tests/domain/loader.mjs:14-33` |
| T081 | Abrir entrada al pulsar la tarjeta (evento) | `SurtidoRonda.tsx:217` |
| T082 | Marcar captura y negación en el detalle | `DetalleProducto.tsx:79,86,104-140` |
| T083 | Cerrar por cambio de ruta (tolerante a `StrictMode`) | `src/main.tsx:13`; `AppStore.tsx:37` |
| T900 | Leyendas `SDD <id> · <Requirement>` y comentarios heredados solo si la tarea lo dice | `ProductoRondaRow.module.css:1,26`; `SurtidoRonda.tsx:4` |
| T901 | Revisión final: typecheck, test:domain, build, sdd:check | — |

Oleadas sugeridas: T001 → T010 → {T011, T012, T013} en paralelo → T014 → T015 → Fases 2 a 8 (las `[P]` según `../tasks.md`) → Polish. T014 y T015 fuerzan modo PLAN por ser archivos compartidos.

## Decisiones de dominio ya tomadas (el agente no las inventa)
Fuente: `../design.md` §Decisiones de dominio y vacíos del estándar (front-end).

| Tema | Decisión | Decidido por · fecha |
| --- | --- | --- |
| Estados de carga / error / vacío | Carga y error de la imagen → icono genérico; el listado vacío no cambia | Producto (clarificaciones #2 y #3) · 2026-11-10 |
| Origen del dato y fallo | Imagen importada en los mocks; la falla se simula con una URL inexistente; sin HTTP | Arquitectura (angel) · 2026-11-11 |
| Reintento tras error | No se reintenta mientras la fila siga montada | Arquitectura (angel) · 2026-11-11 |
| Permisos | Sin diferencias por rol: la ve todo surtidor con la bandera activa | Producto (spec) · 2026-11-11 |
| Textos de UI | Ninguno nuevo (el icono no lleva texto) | Producto (clarificación #2) · 2026-11-10 |
| Reglas de pantalla | Imagen igual en todos los estados del producto; pulsar abre el detalle | Producto (clarificaciones #4 y #6) |
| Descripción en la tarjeta | No se añade; desviación del simulador | Arquitectura (angel) · 2026-11-11; Producto (clarificación #11) · 2026-11-11 |
| Sucursal y pedido del registro | `SUCURSAL_DEMO` / semilla; pedido = destino de `proximaPartidaPara` o primera presencia | Arquitectura (angel) · 2026-11-11 |
| Ciclo de vida de la entrada | Cierre por cambio de ruta y funciones idempotentes | Arquitectura (angel) · 2026-11-11 |
| Detalle sin imagen / imagen rota | Sin cambios; imagen rota aceptada en demo; se reporta como hallazgo | Arquitectura (angel) · 2026-11-11 |
| Ruta nueva | Ninguna | `../design.md` |

## Decisiones estructurales no cubiertas por el estándar (skill 0.5, anexo A2 en plantilla)
Fuente: `../design.md` §Decisiones de dominio y vacíos del estándar. Cítalas como «criterio humano · angel · 2026-11-11».

| Punto estructural | Decisión | Decidido por · fecha |
| --- | --- | --- |
| Estilos (STY-03, `sx` de MUI) | CSS Module al lado de la pantalla, con tokens `--color-*` (precedente) | Arquitectura (angel) · 2026-11-11 |
| Carga con skeleton (UXE-01) | Icono genérico, por decisión de Producto | Producto / Arquitectura (angel) · 2026-11-11 |
| `alt` (A11-03) | `alt=""` como el resto del simulador; se reporta como hallazgo | Arquitectura (angel) · 2026-11-11 |
| Pruebas | Archivo nuevo `tests/domain/entradasDetalle.test.mjs`; `package.json` `test:domain` lo incluye | Arquitectura (angel) · 2026-11-11 |
| Estado del registro | Estado propio en `AppStore`, fuera de `RondaState`; `reiniciar` no lo borra | `../design.md` §Decisiones (ADR) |

## Dependencias
- Nuevas: **ninguna** (I5).

## Restricciones
- Constitución del proyecto (`../../../constitution.md`) con las equivalencias de `../../../decisions/ADR-0001-constitucion-en-simulador.md` (incluida su ampliación del 2026-11-11): P3 sin mejoras fuera de alcance, P4 escenario ↔ prueba, P11 lógica en `src/domain/`, P15 pruebas en `tests/domain/`.
- Invariantes del agente, tal cual: I1 prohibido mejorar · I2 el precedente manda · I3 cita o no existe · I4 estructural vs. dominio y núcleo vs. anexo (no cruzar stacks) · I5 sin dependencias nuevas · I6 no ampliar alcance · I7 compuerta humana.
- Prohibiciones permanentes ANT-00a…f (sin `any`/`@ts-ignore`/`catch` vacío; tres estados implementados; sin dependencias; precedente interno, no internet; sin tokens ni datos personales en consola; sin refactor ajeno).
- No se toca: `src/design-system/` (incluido `ProductSummary`), `vite.config.ts`, `.github/workflows/`, `sdd/specs/`, `sdd/constitution.md`.
- Chrome ≥ 49: ninguna tarea introduce `sort`; si se ordenan entradas del registro, con desempate explícito.
- Archivos compartidos (`AppStore.tsx`, `escenarios.ts`, `EscenariosPanel.tsx`): solo en T014, T015 y las tareas de escenarios (fuerzan modo PLAN).
- Escenarios sin prueba en el simulador (guía por voz y las dos fallas de la bandera): se cubren con la evidencia sustituta de T050 y T072 y quedan como deuda para la compuerta Q (`../design.md` §Escenarios no reproducibles). No los marques como cubiertos por P4.

## Restricción común a los dos agentes
- **Comentarios al mínimo**: el código se explica con nombres y estructura; un comentario solo para el porqué no evidente (regla de negocio con referencia, workaround con motivo, limitación externa). Nada de comentarios que repiten la línea, cabeceras decorativas, código comentado ni `TODO` sin ticket. La excepción es la leyenda `SDD <id> · <Requirement>` que el `CLAUDE.md` exige en cada punto de integración.

## Definición de terminado para esta rebanada
- `npm run typecheck` y `npm run test:domain` en verde sin reglas desactivadas; `npm run build` y `npm run sdd:check` en verde al cerrar (T901).
- Los tres estados (carga, error, vacío) cubiertos según las decisiones de dominio de arriba, y la guía de interfaz cumplida al nivel de acabado indicado (360 px, sin scroll horizontal, bandera apagada = tarjeta idéntica a la de hoy).
- Sin `any`, `@ts-ignore`, `catch` vacío ni `console.log` nuevos.
- Lista de reglas aplicadas (Sello) y verificación corrida declaradas en el informe; hallazgos reportados: `alt=""`, detalle con imagen rota, descripción ausente en la tarjeta.

## Protocolo de invocación
**Forma A (recomendada: cambio standard con archivos compartidos): sesión interactiva.** Abre `@agent-frontend-exodus:dev-frontend` con la ruta de este handoff; el agente emite el Sello, hace RECONOCIMIENTO y PLAN, dice «Plan listo. No escribo nada hasta tu aprobación explícita.», respondes «adelante» y pasa a IMPLEMENTACIÓN. Las preguntas (máx. 3) se responden en la misma conversación.

**Forma B (desde `/exodus-sdd:implement`): delegación en dos pasos.**
1. «Modo RECONOCIMIENTO y PLAN. Trabaja el handoff `sdd/changes/2026-11-10-surtido-listado-imagen-producto/handoff/frontend.md` para las tareas <ids>. Emite el Sello, el mapa de la zona, el precedente por tarea y el plan archivo por archivo con la regla que lo justifica. No escribas nada. Si te faltan decisiones de dominio, devuelve tus preguntas (máx. 3) con la opción recomendada.» → el kit guarda la salida en `frontend-plan.md`.
2. Aprobación humana del plan en la conversación principal.
3. «Modo IMPLEMENTACIÓN. Este es el plan aprobado (copiado íntegro abajo) y la aprobación explícita del humano: adelante. Ejecuta exactamente el plan; si descubres un paso que no está en él, para y repórtalo. Al terminar, corre la verificación mínima y devuelve: archivos tocados, resultado de la verificación, reglas aplicadas, observaciones no aplicadas (I1) y desviaciones del estándar encontradas.» → `frontend-report.md`; el kit marca `[x]` en `../tasks.md`.

El agente no toca `../tasks.md` ni `CLAUDE.md`, ni hace git.

## Qué hace el kit con la salida del agente
| Salida del agente | Destino en el cambio |
| --- | --- |
| Sello de Conformidad | `frontend-plan.md` / `frontend-report.md` |
| Plan archivo por archivo + precedentes + riesgos | `frontend-plan.md` (pendiente de aprobación) |
| Preguntas de dominio | tabla de decisiones de este handoff y relanzamiento |
| Archivos tocados + verificación + reglas aplicadas | `tasks.md` (`[x]`), `verify.md` |
| Observaciones no aplicadas (I1) | `retro.md` / nuevo cambio si merece la pena |
| Desviaciones del estándar y vacíos de la skill | `verify.md` + `harness-backlog.md` |
