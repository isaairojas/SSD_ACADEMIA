# Intención · Imagen del producto en el listado de surtido V2

- Cambio: `2026-11-10-surtido-listado-imagen-producto` · Creado: 2026-11-10 · Intensidad: **standard** · Dueño: carlos.marquez
- Capacidades afectadas: surtido-listado, catalogo-bandera-sucursal
- Repositorios afectados: frontend
- Origen: historia HU-1 ("Como surtidor de almacén, quiero ver la foto de cada producto en el listado de códigos a surtir, para reconocerlo a simple vista sin entrar al detalle."), clasificada por `triage` como ADDED en `surtido-listado`.

## Problema
En el listado de surtido V2 el surtidor ve todos los códigos a surtir, pero solo con código y descripción. Para saber cómo es un producto tiene que entrar a su detalle, y los productos parecidos (por ejemplo, los focos 1141, 1157 y 158) se confunden.

Evidencia: observación de Producto recogida en HU-1. No hay todavía una línea base medida de entradas al detalle ni de errores de producto equivocado.

## Objetivo / resultado esperado
Que el surtidor reconozca cada producto a simple vista desde el listado, sin entrar al detalle.

## Usuarios afectados
Surtidor de almacén con HH Zebra, en las sucursales donde se usa el listado de surtido V2 (un solo pedido).

## Criterios de éxito (medibles, sin tecnología)
Valores de ejemplo para el taller; se miden en las sucursales piloto durante las 4 semanas posteriores a la liberación, contra una línea base de las 4 semanas previas.
- SC-001 (principal): las entradas al detalle de producto hechas solo para ver el producto (sin capturar ni negar) bajan al menos 50 %.
- SC-002: los errores de producto equivocado detectados en revisión de surtido bajan al menos 30 %. Se mide fuera del sistema, con los reportes de revisión que ya existen; este cambio no añade requisito para medirlo (clarificación #13).

## No-objetivos
- Fuera de este cambio (clarificación #17), pendientes de un cambio sobre `exodus-gtm-pwa`: la imagen con revisión de piezas (`Bandera_RevisionPedidoEnHH`) y el comportamiento con la bandera de imagen activa pero sin listado V2 o con varios pedidos.
- No se cambia el orden del listado ni los datos que ya muestra.
- No se especifica ni se cambia la foto que ya muestra el detalle de producto.
- No se agrega zoom, visor ni galería de imágenes: tocar la foto no la amplía.
- No se administra el catálogo de imágenes (cargar, editar o corregir fotos).
- No se toca el surtido multi-orden (ronda V1, `surtido-ronda`) ni su lógica.
- No se cambia el servicio que entrega los productos.

## Contexto y referencias
- Diseño / prototipo: referencia Figma "Handheld for Claude", frame 15:1528 (citada en el estilo de la tarjeta del listado).
- Specs canónicas relacionadas: `specs/surtido-listado/spec.md` (ningún requisito actual describe qué muestra cada producto del listado); `specs/revision-surtido/spec.md` (precedente de detalle con imagen).
- Decisiones: `decisions/ADR-0001-constitucion-en-simulador.md` (el listado del simulador representa la pantalla V2 de `surtido-listado`).
- Restricciones conocidas: HH Zebra con pantalla de 360 px de ancho y navegador antiguo; red móvil en piso.
- Supuestos: la foto del producto ya existe y se muestra en el detalle; este cambio la lleva al listado.
- Resuelto en clarify (#2 y #3): sin foto, con foto que no carga o mientras carga se ve un icono genérico de producto.

## Justificación de la intensidad
Por riesgo bastaría **light**: dos capacidades (≤ 2; la segunda solo registra la bandera nueva, que es configuración y no seguridad), un repositorio, cambio visual, sin contratos públicos, datos personales ni migraciones (ningún disparador de "full" de la constitución). Se usa **standard** a propósito en el taller para recorrer diseño y la compuerta de Arquitectura.

## Revisores
- P (Producto): carlos.marquez · 
- A (Arquitectura): angel · 
- Q (QA): isaai
