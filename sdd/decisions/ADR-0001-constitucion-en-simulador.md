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
