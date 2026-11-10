# Exodus GTM (exodus-gtm-pwa)

App operativa para el personal de sucursal: Android (HandHeld con escáner en modo teclado) y PWA web, con Expo ~50 / React Native 0.73 / TypeScript. Consume los servicios .NET a través de `api-gateway-rb`. Solo en español (es-MX).

## Trabajo con SDD (kit `exodus-sdd`)
- La verdad funcional vive en `sdd/specs/<capacidad>/spec.md` (15 capacidades; ver `sdd/steering/product.md`). Lee la spec de la capacidad antes de tocar su código.
- Hoy todas son **specs observadas** (describen lo que el código hace, no lo que debería): no las tomes como requisito validado hasta que Producto las valide. Estado de la adopción y pendientes: `sdd/adopcion.md`.
- Todo cambio funcional empieza con `/exodus-sdd:intent` y se modifica mediante deltas en `sdd/changes/<id>/`. No edites `sdd/specs/`, `sdd/constitution.md` ni `sdd/changes/archive/` a mano: el hook `sdd-guard` lo bloquea; usa `/exodus-sdd:sync`.
- Principios del proyecto: `sdd/constitution.md`. Contexto estable: `sdd/steering/{product,structure,tech,servicios}.md`.
- Implementa el agente de front-end `frontend-exodus:dev-frontend`. Su estándar está escrito para Next.js / React + Vite; hasta que Arquitectura decida cómo aplica a Expo / React Native, el patrón de este repo (abajo) manda sobre el estándar.
- Valida antes de abrir un MR: `npm run sdd:check` (mismo validador que el job `sdd-validate` de GitLab CI; copia en `tools/sdd/`).

## Estructura y reglas del código
Las reglas siguientes son los principios 11–15 de `sdd/constitution.md`; si difieren, manda la constitución.
- `src/views/{AuthStack,HomeStack}/<Pantalla>/`: patrón **Controller / Screen**. La lógica y las llamadas a servicios van en `*Controller.tsx`; `*Screen.tsx` solo presenta. (Excepción heredada: `InventoryCountScreen.tsx`.)
- `src/services/`: un módulo por dominio sobre los clientes de `src/http/`. Toda llamada HTTP pasa por esos clientes (headers `Authorization` y `X-ExodusDev`, manejo de 401/499 en `src/utils/services.tsx`).
- `src/components/{atoms,molecules,organisms,templates,icons}`: atomic design.
- `src/rtk/`: Redux Toolkit + redux-persist (AsyncStorage). `src/hooks/`, `src/utils/`, `src/theme/`, `src/types/`.
- Textos de usuario en `src/i18n/es.ts`; no agregues literales nuevos en pantallas ni componentes.
- Lo que varía por sucursal se decide con banderas (`catalogo-bandera-sucursal`), no con ids de sucursal fijos.

## Comandos
- Dependencias: `npm install` (el repo versiona `package-lock.json`; el README aún menciona Yarn).
- Web: `npm run web` · Android: `npm run android` · Dev server: `npm start`.
- Pruebas: `npm test` (Jest + jest-expo; corre `--onlyChanged`). Las pruebas van en `__test__/`, espejo de `src/`.
- Lint: `npm run lint` (ESLint + Prettier; el pre-commit de husky está desactivado).
- Validación SDD: `npm run sdd:check`.
