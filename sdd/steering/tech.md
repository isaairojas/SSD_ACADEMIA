# Steering · Tecnología · Exodus GTM

> Stack, versiones y convenciones. Este archivo NO duplica las skills de back y front: las referencia. Dueño: Arquitectura.
>
> Redactado en la adopción (2026-10-19) desde `package.json`, `Dockerfile`, `nginx.conf`, `docker-compose/`, `.gitlab-ci.yml`; pendiente de confirmación de Arquitectura.

## Stack
| Capa | Tecnología / versión | Notas |
| --- | --- | --- |
| Back-end | .NET (repos separados, detrás de `api-gateway-rb` / Ocelot) | Generación de plantilla por repo `<por definir>`; ver `servicios.md` |
| Front-end | Expo ~50.0.21, React Native 0.73.6, react-native-web ~0.19.10, React 18.2, TypeScript ^5.3 | Android (EAS build local, perfil `preview2`, paquete `com.exodusgtm.app`) + PWA web (`expo export -p web` + workbox 6.5.4) |
| Estado | @reduxjs/toolkit ^2.2.7, react-redux ^9.1.2, redux-persist ^6 (AsyncStorage, key `root-v1`) | Persisten: user, session, appStatus, receptionMerch, catalogs |
| HTTP | axios 1.16.1 | Clientes singleton en `src/http/` |
| Navegación | @react-navigation/native ^6, stack ^6 | |
| Dispositivo | expo-camera, expo-image-picker, expo-location, expo-speech, expo-av, expo-file-system, react-native-fast-opencv 0.4.6 | Escáner HandHeld en modo teclado |
| Datos | Sin base de datos propia; persistencia local de estado | |
| Nube / infraestructura | Docker (node 20.16 → nginx:stable-alpine), Traefik, `docker-compose/{development,testing,staging,production}.yml`; `env.sh` sustituye `REACT_APP_*` al arrancar | On-premise `<inferido>` |
| CI/CD | GitLab CI, plantilla `exodus/cicd-templates/react-template@v1.1` (override para `hotfix/*` y `release/*`) | Job `sdd-validate` (stage `.pre`, `tools/sdd/`) en MR y en `main`/`release/*`/`hotfix/*` cuando cambia `sdd/` |

## Convenciones que las specs deben respetar
- Nombres de capacidades: kebab-case, singular, en español (p. ej. `conteo-inventario`).
- Contratos: OpenAPI 3.x en `contracts/`; los servicios se consumen por los paths del gateway (`<servicio>/api/v<n>/...`).
- Pruebas: Jest 29 + jest-expo 50 + @testing-library/react-native en `__test__/`; Storybook 7.6 para componentes. Una prueba por escenario como mínimo.
- Lint: ESLint 8 + Prettier (pre-commit de husky hoy desactivado).

## Referencias a skills obligatorias
- Back-end: skill del agente `backend-net` (Skill `backend-net-pattern`).
- Front-end: skill `estandares-frontend` (plugin `frontend-exodus`). `<por definir: aplicabilidad a Expo / React Native; decide Arquitectura>`.

## Observabilidad y operación
- Logs, métricas, trazas: `<por definir>` (no se observa instrumentación en el cliente).
- Entornos: development, test, staging, uat (sin configurar: `.env.uat` comentado), production. Health web en `/` (nginx y `App.tsx`).
