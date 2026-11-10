# Checklist de calidad de requisitos · 2026-11-10-surtido-listado-imagen-producto · imagen en el listado de surtido V2

> Propiedad del revisor humano. `[x]` significa "el revisor verificó este criterio sobre la spec", NO que la implementación esté hecha. El agente puede proponer ítems y evidencias, nunca marcarlos.

## Completitud
- [ ] Todos los flujos del intent tienen al menos un requisito.
- [ ] Cada requisito tiene escenario principal y al menos un escenario de error/borde relevante.
- [ ] Están definidos los estados vacíos, límites y permisos por rol.

## Claridad
- [ ] Cada requisito es una sola afirmación con SHALL/MUST, sin "y/o" ambiguos.
- [ ] No hay adjetivos no medibles (rápido, fácil, intuitivo) sin número.
- [ ] El vocabulario coincide con `steering/product.md`.

## Consistencia
- [ ] No contradice specs canónicas de otras capacidades.
- [ ] Los no-objetivos del intent no aparecen como requisitos.
- [ ] Los criterios de éxito (SC-xxx) tienen al menos un requisito que los soporta.

## Experiencia (pantallas)
- [ ] La funcionalidad de apoyo (búsqueda, filtros, orden, paginación, exportación…) está decidida sí/no, no omitida.
- [ ] El nivel de acabado esperado está declarado y hay diseño visual o guía de interfaz.

## Verificabilidad
- [ ] Cada escenario se puede convertir en una prueba automatizable o manual concreta.
- [ ] Datos de ejemplo o fixtures necesarios están identificados.

## Específicos de este cambio
- [ ] La imagen del listado es la misma que la del detalle para cada código (incluidos los focos 1141, 1157 y 158).
- [ ] El comportamiento sin imagen y con imagen que no carga está decidido y el texto "Sin imagen" está confirmado por Producto.
- [ ] El escaneo, el orden y los datos del listado no cambian por mostrar imágenes (ningún requisito existente de `surtido-listado` se ve alterado).
- [ ] Está decidido si la imagen se activa por sucursal (piloto) o para todas, en coherencia con cómo se miden SC-001 y SC-002.

Revisado por: <nombre> · Fecha: <fecha>
