# Steering · Estructura · Exodus GTM

> Dónde vive cada cosa y qué límites no se cruzan. Dueño: Arquitectura.
>
> Redactado en la adopción (2026-10-19) por inferencia del repositorio; pendiente de confirmación de Arquitectura.

## Repositorios y responsabilidades
| Repo / carpeta | Responsabilidad | Agente que implementa | Dueño |
| --- | --- | --- | --- |
| `exodus-gtm-pwa` (este repo) | UI y estado de cliente de la app operativa (Android + PWA web). Consume APIs vía `api-gateway-rb`. | `frontend-exodus:dev-frontend` `<por definir: el estándar cubre Next.js / React + Vite; este repo es Expo / React Native — Arquitectura decide si aplica o hay anexo>` | `<por definir>` |
| Servicios back-end (repos separados en `C:\Repositorios`) | APIs de tareas, inventario, recepción, surtido, revisión, evidencias, etc. | `backend-net` (por repo, con su mapeo en su `CLAUDE.md`) | `<por definir>` |

Detalle de servicios en `servicios.md`.

## Mapa de módulos (`src/`)
- `views/{AuthStack,HomeStack}/<Pantalla>/`: patrón **Controller / Screen** por pantalla (lógica en `*Controller.tsx`, presentación en `*Screen.tsx`).
- `navigation/`: `AppNavigator` decide el stack (`Auth` / `Home`) por `appStatus.stack`; `AuthStack`, `HomeStack`.
- `components/{atoms,molecules,organisms,templates,icons}`: atomic design.
- `services/`: una clase/módulo por dominio sobre clientes axios de `http/` (`ApymsaApi`, `SurtidoApi`, `IdentityApi`).
- `rtk/{slices,store}`: Redux Toolkit + redux-persist (AsyncStorage).
- `hooks/`, `utils/`, `theme/`, `i18n/es.ts`, `types/` (espejo por carpeta).

## Límites y reglas de dependencia
- Screens no llaman a `services/` (hoy hay una excepción observada: `InventoryCountScreen.tsx:189-196`).
- Toda llamada HTTP pasa por los clientes de `src/http/` (headers `Authorization` y `X-ExodusDev`, manejo 401/499 en `utils/services.tsx`).
- Textos de usuario en `i18n/es.ts` (hay textos hardcodeados como deuda).

## Dónde van las cosas
| Tipo de artefacto | Ubicación |
| --- | --- |
| Specs canónicas | `sdd/specs/<capacidad>/spec.md` |
| Cambios activos | `sdd/changes/<id>/` |
| Decisiones (ADR) | `sdd/decisions/` |
| Contratos (OpenAPI, eventos) | `sdd/changes/<id>/contracts/` → al repo del servicio al implementar |
| Pruebas | `__test__/` (espejo de `src/`) |
| Stories | junto al componente / `.storybook`, `.ondevice` |

## Cómo se descomponen los cambios multi-repo
- La carpeta del cambio vive en `<por definir: este repo (dueño de la experiencia) o un repo coordinador>` — decide Arquitectura.
- `tasks.md` y `handoff/` llevan secciones por repositorio; orden: contrato del servicio primero, front contra el contrato (stub) después.
