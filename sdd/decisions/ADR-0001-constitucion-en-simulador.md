# ADR-0001 · Aplicación de la constitución en el simulador web

- **Estado:** aceptada
- **Fecha:** 2026-11-10
- **Decide:** Arquitectura

## Contexto
La constitución v1.1 describe la app Expo (Controller/Screen, `src/http/`, `src/i18n/es.ts`, Jest en `__test__/`). SSD_ACADEMIA es un simulador React + Vite sin esa estructura. Para el taller, el listado de códigos a surtir del simulador (`src/screens/surtido/`) representa la pantalla V2 de la capacidad `surtido-listado`; la lógica de ronda multi-orden del simulador no se modifica.

## Decisión
- **11** → la lógica vive en `src/domain/` y las pantallas solo presentan.
- **12** → no aplica (sin back-end ni HTTP).
- **13** → los textos viven en el componente de la pantalla; no hay i18n.
- **14** → aplica igual: lo que varía por sucursal va en `ConfigMultiorden` como bandera.
- **15** → toda lógica nueva o modificada en `src/domain/` tiene prueba en `tests/domain/` con `node --test`.

## Consecuencias
`verify` revisa estas equivalencias en lugar del texto literal de los principios 11 a 15. Cuando el cambio se lleve a la app real, aplican los principios originales.

## Ampliación 2026-11-11 · Escenarios no reproducibles y desviaciones del simulador
- **Estado:** propuesta (se acepta con el gate A de `2026-11-10-surtido-listado-imagen-producto`)
- **Fecha:** 2026-11-11
- **Decide:** Arquitectura (angel)
- **Origen:** `sdd/changes/2026-11-10-surtido-listado-imagen-producto/design.md`, secciones "Escenarios no reproducibles en el simulador" y "Modelo de datos".
- **Límite:** esta ampliación **no modifica** el principio 4 ni el criterio de la compuerta Q de la constitución. Solo fija cómo se documenta en el simulador lo que no se puede probar.

### Contexto
El principio 4 pide una prueba por escenario. Algunos escenarios de las specs dependen de cosas que el simulador no tiene (consulta de banderas, guía por voz, revisión de piezas, tareas de un solo pedido, `BanderaListadoDeProductosEnHH`), y la tarjeta del listado no muestra todos los datos de la pantalla V2.

### Decisión
1. **Escenario no reproducible.** Un escenario se declara no reproducible en el simulador solo si el diseño del cambio lo lista con el motivo concreto (qué falta en el simulador, con ruta). La lista la revisa Arquitectura en el gate A.
2. **Evidencia sustituta.** Si el comportamiento del escenario tiene un equivalente en lógica pura (`src/domain/`), se prueba ese equivalente en `tests/domain/` con la leyenda `SDD <id> · <Requirement> · sustituta de <Scenario>`. Es evidencia; no sustituye la prueba del escenario a efectos del principio 4.
3. **Escenario sin prueba.** Un escenario no reproducible sigue sin prueba y se trata como dice la constitución. Esta ampliación no cambia su severidad en `verify` ni el criterio de Q: en Q, QA decide si lo acepta como deuda explícita o si el escenario sale a un cambio de la app real.
4. **Equivalencia de GIVEN.** Un GIVEN que el simulador no puede montar literalmente (p. ej. "tarea de un solo pedido") se verifica en la ronda multi-orden del simulador, que representa la pantalla V2. Es una prueba del escenario, no una exención.
5. **Desviaciones de datos.** Si el simulador no muestra un dato de la pantalla real (p. ej. la descripción en la tarjeta del listado), el diseño lo declara. Cambiar lo que verifica un THEN de la spec requiere además que Producto lo acepte en una clarificación del cambio.
6. Cuando el cambio se lleve a la app real, todos los escenarios se prueban literalmente.

### Consecuencias
`verify` sigue la rúbrica del kit sin excepciones; la lista aprobada y la evidencia sustituta le sirven de contexto. Los escenarios sin prueba quedan visibles como deuda hasta que QA decida en Q.
