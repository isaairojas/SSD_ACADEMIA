# SSD_ACADEMIA · simulador HH de surtido multi-orden

Repositorio simulado para el taller de `exodus-sdd`. El código es un simulador web (React 18 + Vite 5 + TypeScript) del flujo de surtido multi-orden de la HH de Exodus GTM. No hay back-end: los datos son mocks. Solo en español (es-MX).

## Trabajo con SDD (kit `exodus-sdd`)
- `sdd/` es la canónica de la app real `exodus-gtm-pwa`: constitución, steering y 15 specs **observadas** (describen lo que hace la app hoy, sin validar por Producto). El simulador reproduce en web su flujo de surtido.
- Todo cambio funcional empieza con `/exodus-sdd:intent` y se modifica mediante deltas en `sdd/changes/<id>/`. No edites `sdd/specs/`, `sdd/constitution.md` ni `sdd/changes/archive/` a mano: entran por `/exodus-sdd:sync`.
- Las compuertas las registra una persona con `node tools/sdd/sdd-change.mjs gate <id> <P|A|Q|D> --by <rol>`; los agentes las piden y se detienen.
- Implementa el agente `frontend-exodus:dev-frontend`. Si su estándar choca con el patrón existente del simulador (abajo), se reporta como hallazgo; no se reescribe el código existente.
- Los principios 11–15 de la constitución y `steering/tech.md` y `steering/structure.md` describen la app real (Expo / React Native: Controller / Screen, `src/http/`, `src/i18n/es.ts`, Jest en `__test__/`). Este simulador no tiene esa estructura; cómo aplican aquí lo decide Arquitectura.
- Valida antes de abrir un PR: `npm run sdd:check` (mismo validador que el job `validar` de `.github/workflows/sdd-ci.yml`).

## Estructura del código
- `src/domain/`: lógica pura sin React. `ronda.ts` (reducer de la ronda y vista agregada por código: `productosVista`), `configMultiorden.ts` (parámetros y banderas de la sucursal), `codigos.ts`, `sonidos.ts`. Se prueba en Node, sin montar React.
- `src/screens/surtido/` y `src/screens/tareas/`: pantallas, con su CSS Module al lado. Rutas en el hash (`HashRouter`): `#/tareas` → `#/ronda` → `#/surtido` → `#/detalle/:codigo` → `#/ronda-terminada`.
- `src/design-system/`: design system heredado (atoms, molecules, organisms, tokens), con alias `@ds`. Precedente de foto de producto: `ProductSummary` en `DetalleProducto.tsx`.
- `src/store/AppStore.tsx`: estado de la ronda (Context + `useReducer` con `rondaReducer`).
- `src/mocks/ronda.ts`: datos de la demo (3 pedidos, 8 códigos reales; imágenes en `src/assets/productos/`).
- `src/navigation/`: ayudas de demo que no tocan la lógica (`EscenariosPanel`, `CodigosCheatsheet`, `escenarios.ts`, `ToastHost`).
- `tests/domain/`: pruebas del dominio con `node --test`; `loader.mjs` resuelve lo que normalmente resuelve Vite (imágenes importadas e imports sin extensión).
- El código marca cada punto de integración con la leyenda `SDD <id-del-cambio> · <Requirement>`.

Restricciones del taller: sin dependencias nuevas; ninguna tarea toca `vite.config.ts`, `.github/workflows/` ni `src/design-system/` salvo que el diseño lo diga.

## Comandos
- Dependencias: `npm ci`.
- Desarrollo: `npm run dev` (http://localhost:5181; para la HH revisa a 360 px de ancho).
- Tipos: `npm run typecheck` · Pruebas del dominio: `npm run test:domain` · Build: `npm run build`.
- Validación SDD: `npm run sdd:check`.

## Publicación
Cada push a `main` corre `.github/workflows/deploy.yml`: publica el build en GitHub Pages y en la rama `demo` (para abrirla con githack en datos móviles). El build usa rutas relativas (`base: './'`) y `@vitejs/plugin-legacy` genera la versión para el navegador de las HH Zebra (chrome ≥ 49): no garantiza un `sort` estable, así que al ordenar usa desempate explícito.
