# Checklist de calidad de requisitos · 2026-11-10-surtido-listado-imagen-producto · imagen en el listado de surtido V2

> Propiedad del revisor humano. `[x]` significa "el revisor verificó este criterio sobre la spec", NO que la implementación esté hecha. El agente puede proponer ítems y evidencias, nunca marcarlos.
>
> Evidencias propuestas el 2026-11-10 por `exodus-sdd:sdd-reviewer` (veredicto propuesto entre corchetes; no es aprobación).

## Completitud
- [x] Todos los flujos del intent tienen al menos un requisito. — evidencia [parcial]: imagen, sin imagen y carga cubiertos (Req 1–3). — falta: listado con revisión de piezas (`Bandera_RevisionPedidoEnHH`) y la medición de SC-001/SC-002.
- [x] Cada requisito tiene escenario principal y al menos un escenario de error/borde relevante. — evidencia [cumple]: los 5 requisitos tienen ambos. — falta (menor): el THEN de "Sucursal piloto" es disyuntivo ("imagen o icono").
- [x] Están definidos los estados vacíos, límites y permisos por rol. — evidencia [parcial]: sin imagen, fallo y carga definidos. — falta: cuándo "cargando" pasa a "no se puede cargar", qué pasa si la imagen llega después de fallar, y declarar que no hay diferencias por rol.

## Claridad
- [x] Cada requisito es una sola afirmación con SHALL/MUST, sin "y/o" ambiguos. — evidencia [no cumple]: Req 4 y Req 5 tienen dos SHALL; Req 1–3 juntan dos o tres comportamientos en una frase.
- [x] No hay adjetivos no medibles (rápido, fácil, intuitivo) sin número. — evidencia [parcial]: sin adjetivos de rapidez. — falta: definir "icono genérico", "junto a" y "de la misma forma".
- [x] El vocabulario coincide con `steering/product.md`. — evidencia [parcial]: "surtido", "pedido" y "sucursal" coinciden. — falta: nombrar la activación como bandera y unificar "foto"/"imagen" y "surtidor"/"usuario" entre intent y spec.

## Consistencia
- [x] No contradice specs canónicas de otras capacidades. — evidencia [parcial]: no se encontró contradicción directa. — falta: frontera con `revision-surtido` sin definir; `constitution.md:43` cita un `fetch` HEAD de imágenes existente en `AssortmentTaskController.tsx` (V2), así que hay que confirmar si la app real ya maneja imágenes en el listado (¿ADDED o MODIFIED?).
- [x] Los no-objetivos del intent no aparecen como requisitos. — evidencia [parcial]: "sin zoom" y "orden sin cambios" están como no-regresión (Req 4), lo cual es válido. — falta: Req 1 usa la foto del detalle como referencia, aunque especificar esa foto es un no-objetivo.
- [x] Los criterios de éxito (SC-xxx) tienen al menos un requisito que los soporta. — evidencia [parcial]: Req 5 permite el piloto. — falta: nada permite distinguir "entradas al detalle solo para ver" (SC-001) ni obtener los errores de revisión (SC-002).

## Experiencia (pantallas)
- [x] La funcionalidad de apoyo (búsqueda, filtros, orden, paginación, exportación…) está decidida sí/no, no omitida. — evidencia [cumple]: orden sin cambios y sin zoom (Req 4, no-objetivos).
- [x] El nivel de acabado esperado está declarado y hay diseño visual o guía de interfaz. — evidencia [parcial]: se cita Figma 15:1528. — falta: nivel de acabado y guía visual de tamaño, posición e icono (va a `design`).

## Verificabilidad
- [x] Cada escenario se puede convertir en una prueba automatizable o manual concreta. — evidencia [parcial]: la mayoría son observables. — falta: criterio para "misma imagen que el detalle"; "sin que cambie la posición" exige que icono e imagen ocupen el mismo espacio y eso no está escrito.
- [x] Datos de ejemplo o fixtures necesarios están identificados. — evidencia [no cumple]: el escenario "Productos parecidos" usa 1141, 1157 y 158, que son modelos de foco; los códigos son `2012000`, `2010000` y `1978000` (`src/mocks/ronda.ts:56-58`). — falta: fixtures sin imagen, con imagen que falla, con carga lenta y con la bandera apagada.

## Específicos de este cambio
- [x] La imagen del listado es la misma que la del detalle para cada código (incluidos los focos 1141, 1157 y 158). — evidencia [parcial]: Req 1. — falta: corregir los códigos y decidir qué muestra el detalle cuando el listado muestra el icono.
- [x] El comportamiento sin imagen y con imagen que no carga está decidido y el texto "Sin imagen" está confirmado por Producto. — evidencia [cumple en comportamiento]: Req 2 y clarificación #2 (icono sin texto). — falta: este ítem quedó desactualizado; ya no hay texto "Sin imagen" que confirmar.
- [x] El escaneo, el orden y los datos del listado no cambian por mostrar imágenes (ningún requisito existente de `surtido-listado` se ve alterado). — evidencia [parcial]: Req 3 y Req 4. — falta: si hoy toda la fila abre el detalle, una imagen que no responde cambia esa acción; tampoco se dice nada de la guía por voz.
- [x] Está decidido si la imagen se activa por sucursal (piloto) o para todas, en coherencia con cómo se miden SC-001 y SC-002. — evidencia [cumple]: Req 5 y clarificación #1.
- [x] Está definido si la imagen se muestra cuando el listado incluye revisión de piezas (`Bandera_RevisionPedidoEnHH`, frontera con `revision-surtido`). — evidencia [no cumple]: ningún requisito ni escenario lo trata.
- [x] La activación de la imagen por sucursal es coherente con la bandera que ya abre el listado V2 (sin imagen donde el listado V2 no aplica). — evidencia [parcial]: el escenario principal de Req 1 parte de la bandera de listado activa. — falta: un escenario con la bandera de imagen activa y el listado V2 apagado, y el nombre de la bandera (si es nueva, toca `catalogo-bandera-sucursal`).
- [x] El icono genérico (sin imagen, imagen que no carga, imagen cargando) es el mismo en los tres casos y se distingue de una imagen real de producto. — evidencia [parcial]: que es el mismo se deduce de Req 2 y Req 3. — falta: escribir que se distingue de una foto real.
- [x] Existe una forma acordada de obtener la línea base y medir SC-001 (entradas al detalle solo para ver el producto). — evidencia [no cumple]: el intent dice que no hay línea base medida.

Revisado por: <nombre> · Fecha: <fecha>
