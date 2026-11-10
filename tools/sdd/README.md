# tools/sdd

Copia de los scripts del kit `exodus-sdd` (v0.8.7), para que CI no dependa de la caché local del plugin.

- `sdd-validate.mjs`, `lib.mjs` y `sdd-change.mjs` vienen tal cual de `scripts/` del plugin; no se editan aquí.
- Validar en local: `npm run sdd:check` (o `node tools/sdd/sdd-validate.mjs --ci`).
- Registrar una compuerta (la marca una persona, nunca un agente): `node tools/sdd/sdd-change.mjs gate <id> <P|A|Q|D> --by <rol>`.
- CI: job `validar` de `.github/workflows/sdd-ci.yml`, en cada PR hacia `main`.
- Al actualizar el plugin, vuelve a copiar los tres archivos y actualiza la versión en este README.
