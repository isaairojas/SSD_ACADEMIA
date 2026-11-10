# SSD_ACADEMIA

Repositorio simulado para el taller **Demo SDD · Imágenes y agrupación por familia en el surtido HH**. El Product Engineer agrega y modifica aquí el código durante el taller.

`main` es el punto de partida: el simulador HH-Surtido-Multiorden (commit `070ce91`) **sin** la imagen en la fila del listado ni la agrupación por familia, con 33 pruebas del dominio en verde. Eso es lo que el equipo construye siguiendo el flujo SDD.

| Ruta | Qué es |
| --- | --- |
| `src/`, `tests/` | Simulador web de la HH (React 18 + Vite 5 + TypeScript) |
| `sdd/` | Canónica de `exodus-gtm-pwa`: constitución, steering y 15 specs observadas |
| `tools/sdd/` | Scripts del kit `exodus-sdd` v0.8.7: validador y registro de compuertas |
| `.github/workflows/sdd-ci.yml` | Validación de cada PR: specs, tipos, pruebas y build |
| `.github/workflows/deploy.yml` | Push a `main` → GitHub Pages y rama `demo` |
| `CLAUDE.md` | Contexto del proyecto para Claude Code |

## Arrancar

```
npm ci
npm run dev            # http://localhost:5181/#/surtido
npm run typecheck
npm run test:domain    # 33 pruebas
npm run sdd:check
```

## Hoja de respuestas del código

El simulador completo, con la funcionalidad ya hecha, está en el repositorio original:

```
git remote add respuestas https://github.com/isaairojas/HH-Surtido-Multiorden.git
git fetch respuestas
git diff respuestas/main -- src tests
```

## Pendientes del facilitador (Fase 0)

- [ ] Crear la canónica `multiorden-surtido-listado` con `/exodus-sdd:map src/screens/surtido` y registrar la compuerta A del mapa. No existe en `sdd/specs/`, y la más cercana (`surtido-listado`) no tiene el requisito "Lista agregada por código" que modifica el delta de la guía.
- [ ] Configurar el plugin (`/plugin`): `frontend_path: .`, intensidad por defecto `standard`, sin `backend_path`.
- [ ] Proteger `main`: merge solo por PR con revisión y el job `validar` obligatorio.
- [ ] Activar GitHub Pages con origen "GitHub Actions" (Settings → Pages). En un repositorio privado, Pages requiere plan Team o Enterprise.
- [ ] Entregar la hoja de respuestas de `clarify` solo al Product Designer.
