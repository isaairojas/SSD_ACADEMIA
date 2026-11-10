# sdd/ · Spec-Driven Development

Carpeta gestionada con el kit `exodus-sdd` (Claude Code). Resumen:

| Carpeta / archivo | Qué es | Quién la edita |
| --- | --- | --- |
| `constitution.md` | Principios verificables del proyecto | Arquitectura, vía `/exodus-sdd:constitution` |
| `steering/` | Contexto estable: producto, estructura, tecnología | Producto / Arquitectura |
| `specs/<capacidad>/spec.md` | **Verdad actual** del sistema por capacidad | Solo `/exodus-sdd:sync` (hook de protección) |
| `changes/<id>/` | Un cambio en curso: intención, deltas, diseño, tareas, handoffs, verificación | El equipo, con las skills por fase |
| `changes/archive/` | Historial inmutable de cambios cerrados | Nadie (solo `/exodus-sdd:archive`) |
| `decisions/` | ADRs | Arquitectura |
| `harness-backlog.md` | Mejoras pendientes al propio proceso (skills, checklists, principios) | Retro |

Flujo: `/exodus-sdd:intent` → `specify` → `clarify` → `checklist` → `design` → `analyze` → `tasks` → `handoff` → `implement` → `verify` → `converge` → `pr` → `sync` → `archive` → `retro`. Ayuda: `/exodus-sdd:guia`.
