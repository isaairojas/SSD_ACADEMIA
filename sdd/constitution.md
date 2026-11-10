# Constitución · Exodus GTM

Versión 1.1 · Creada 2026-10-20 · Actualizada 2026-10-22 (principios 11–15 del proyecto) · Dueño: Arquitectura · Se modifica solo con `/exodus-sdd:constitution` (gate A)

> Reglas: máximo 15 principios; cada principio lleva un **Check** que una persona, el validador o CI pueden responder con sí/no. Lo que no sea verificable va a `steering/` o a las skills, no aquí.

## Principios

1. **Spec antes de código.** Todo cambio de intensidad *standard* o *full* tiene intención, delta de specs y diseño aprobados antes de implementar.
   Check: `change.json` registra gates P y A antes del estado `implementing`.

2. **Los agentes de desarrollo son los únicos que escriben código de producto.** Las skills SDD producen y verifican artefactos; `backend-net` (back-end .NET) y el agente de front-end implementan.
   Check: ningún diff en código fuente proviene de una skill `/exodus-sdd:*`.

3. **Prohibido mejorar fuera del alcance.** Se implementa lo que dicen las tareas; lo demás se reporta como hallazgo.
   Check: `/exodus-sdd:verify` no encuentra cambios sin tarea asociada.

4. **Cada requisito tiene escenario y cada escenario tiene prueba.** Un requisito sin escenario no se acepta; un escenario sin prueba no se da por terminado.
   Check: `sdd-validate` sin errores; plan de pruebas cubre todos los escenarios.

5. **La verdad vive en `sdd/specs/`.** Los deltas se fusionan con `sync` al cerrar; las specs canónicas no se editan a mano.
   Check: el hook `sdd-guard` bloquea escrituras directas; `synced=true` antes de archivar.

6. **Contratos públicos solo cambian con ADR.** API, eventos, esquemas compartidos y modelos de datos expuestos requieren una decisión registrada.
   Check: diff en `contracts/` o modelo de datos ⇒ existe `decisions/ADR-*.md` nuevo o actualizado.

7. **Proporcionalidad.** La intensidad SDD se elige por riesgo y ambigüedad, no por costumbre.
   Check: `intent.md` justifica la intensidad; cambios que tocan seguridad, datos, pagos, contratos públicos o más de dos capacidades son *full*.

8. **Specs revisables por humanos.** Un delta que no cabe en una revisión de 20 minutos se divide en cambios más pequeños.
   Check: ningún requisito supera 120 palabras; ningún delta supera 12 requisitos.

9. **Ambigüedad marcada, no inventada.** Lo que no se sabe se marca `[NEEDS CLARIFICATION]` y se resuelve con `/exodus-sdd:clarify`.
   Check: cero marcadores pendientes al pasar a `designed`.

10. **Los bugs corrigen la fuente.** Cada defecto se clasifica como *intent gap* o *spec gap* y produce un cambio en el harness (skill, checklist o principio), no solo en el código.
    Check: `retro.md` clasifica cada defecto y `harness-backlog.md` recibe la mejora.

11. **Controller / Screen.** La lógica y las llamadas a servicios viven en `*Controller.tsx`; `*Screen.tsx` solo presenta. Excepción heredada: `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx`.
    Check: ningún `*Screen.tsx` añadido o modificado en el cambio importa de `services`, salvo la excepción heredada.

12. **HTTP solo por los clientes de `src/http/`.** Headers (`Authorization`, `X-ExodusDev`) y manejo de 401/499 son únicos para toda la app.
    Check: fuera de `src/http/` no se crea un cliente axios ni se llama a una API con `fetch` (se permite el `fetch` HEAD de imágenes existente en `AssortmentTaskController.tsx`).

13. **Textos de usuario solo en `src/i18n/es.ts`.**
    Check: `/exodus-sdd:verify` no encuentra literales de texto de usuario nuevos en `src/views` ni en `src/components`.

14. **Lo que varía por sucursal se decide con banderas.** Se usa el catálogo de banderas (`catalogo-bandera-sucursal`), nunca un id de sucursal fijo.
    Check: el diff no compara `branchOfficeId` contra literales distintos de 0.

15. **Pruebas espejo.** Toda lógica nueva o modificada en `services`, `utils`, `hooks`, `rtk` o `*Controller.tsx` tiene su prueba Jest en `__test__/` con la misma ruta relativa.
    Check: por cada archivo de lógica tocado, el diff incluye su archivo en `__test__/`.

## Intensidad obligatoria "full"
- Cambios en autenticación, autorización, datos personales, pagos o facturación.
- Cambios en contratos públicos (API externa, eventos compartidos, esquemas de integración).
- Cambios que tocan más de dos capacidades o más de un repositorio con dependencia de orden.
- Migraciones que transforman o mueven datos existentes.

## Gobernanza
- Cambios a esta constitución: `/exodus-sdd:constitution`, aprobados por Arquitectura, con versión y fecha.
- Las plantillas y skills del kit se actualizan para reflejar cualquier principio nuevo (feedforward).
- Los checks automatizables se implementan en `sdd-validate` o en CI (feedback).
