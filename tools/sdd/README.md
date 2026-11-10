# tools/sdd

Copia del validador del kit `exodus-sdd` (v0.8.2), para que CI no dependa de la caché local del plugin.

- `sdd-validate.mjs` y `lib.mjs` vienen tal cual de `scripts/` del plugin; no se editan aquí.
- Uso local: `npm run sdd:check` (o `node tools/sdd/sdd-validate.mjs --ci`).
- CI: job `sdd-validate` en `.gitlab-ci.yml`; corre cuando cambia `sdd/` o `tools/sdd/`.
- Al actualizar el plugin, vuelve a copiar ambos archivos y actualiza la versión en este README y en `.gitlab-ci.yml`.
