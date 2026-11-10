# SSD_ACADEMIA

Material SDD para practicar el flujo de `exodus-sdd` en el taller. Contiene solo los artefactos SDD de la app Exodus GTM (`exodus-gtm-pwa`); el código de la app no está incluido.

| Ruta | Qué es |
| --- | --- |
| `sdd/constitution.md` | Principios del proyecto |
| `sdd/steering/` | Contexto estable: producto, estructura, tecnología y servicios |
| `sdd/specs/` | 15 specs canónicas **observadas** (describen lo que hace el código hoy, sin validar por Producto) |
| `sdd/adopcion.md` | Estado de la adopción SDD y pendientes |
| `tools/sdd/` | Copia del validador del kit `exodus-sdd` (v0.8.2); solo usa Node |
| `CLAUDE.md` | Contexto del proyecto para Claude Code |

## Validar

```
npm run sdd:check
```

o, sin npm: `node tools/sdd/sdd-validate.mjs --ci`.
