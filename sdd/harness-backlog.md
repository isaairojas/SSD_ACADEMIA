# Harness backlog · mejoras al proceso

> Cada defecto clasificado en una retro produce una entrada aquí. Arquitectura y QA las priorizan y aplican en el plugin `exodus-sdd`, en la constitución o en las checklists.

| Fecha | Cambio origen | Tipo de gap (intent / spec / implementación) | Mejora propuesta | Dónde (skill / checklist / principio / CI) | Estado |
| --- | --- | --- | --- | --- | --- |
| 2026-10-22 | adopción | spec | El estándar `estandares-frontend` cubre Next.js / React + Vite, no Expo / React Native: el agente de front-end no tiene reglas para este repo. Añadir un anexo Expo/RN o declarar el estándar no aplicable. | skill (`frontend-exodus`) | abierto |
| 2026-10-22 | adopción | spec | `map` no detecta requisitos repetidos entre capacidades (la elección de pantalla V1/V2 estaba en `asignacion-tarea` y en `surtido-pedido`). Añadir a `sdd-validate` un aviso por títulos o evidencias repetidos entre specs. | CI (`sdd-validate`) | abierto |
| 2026-10-22 | adopción | spec | Los exploradores redactaron requisitos de más de 120 palabras (principio 8) que hubo que partir a mano. Que `map` valide cada spec al escribirla y parta los largos antes de entregarla. | skill (`map`) | abierto |
| 2026-10-22 | adopción | spec | Muchos `[NEEDS CLARIFICATION]` dependen de si el interceptor HTTP muestra alertas globales. Que el inventario de `map` revise primero la capa HTTP compartida en front-ends. | skill (`map`, `sdd-explorer`) | abierto |
| 2026-10-22 | adopción | implementación | `sdd-validate` no está en el pipeline GitLab del repo; el hook local es la única barrera para las specs canónicas. | CI (`.gitlab-ci.yml`) | aplicado 2026-10-22: job `sdd-validate` + `tools/sdd/` |
| 2026-10-22 | adopción | spec | Las specs observadas no ligan escenarios a pruebas existentes; QA parte de cero (201 escenarios). Que `map` proponga la prueba existente más cercana por escenario cuando la haya. | skill (`map`, `tests`) | abierto |
