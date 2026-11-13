# catalogo-bandera-sucursal · delta del cambio 2026-11-10-surtido-listado-imagen-producto

> Limitación conocida: `sdd-sync` solo fusiona requisitos, así que la tabla de banderas del Propósito de la canónica no recibirá la fila `Bandera_ImagenListadoEnHH`. La bandera queda documentada en el requisito ADDED; la tabla se actualiza en el siguiente cambio que modifique esta canónica.

## ADDED Requirements

### Requirement: Bandera de imagen en el listado de surtido
The system SHALL ofrecer `Bandera_ImagenListadoEnHH` (bandera nueva, nombre propuesto) como bandera por sucursal que gobierna la imagen del producto en el listado de surtido V2 (`surtido-listado`), activa solo para las sucursales donde el servicio de seguridad la reporta habilitada.
(Origen: clarificaciones #8 y #15)
(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)
#### Scenario: Sucursal con la bandera habilitada
- GIVEN la sucursal "Centro" tiene habilitada `Bandera_ImagenListadoEnHH`
- WHEN la app consulta esa bandera para "Centro"
- THEN la considera activa
#### Scenario: Sucursal sin la bandera habilitada
- GIVEN la sucursal "Centro" no tiene habilitada `Bandera_ImagenListadoEnHH`
- WHEN la app consulta esa bandera para "Centro"
- THEN la considera inactiva
#### Scenario: Falla al consultar la bandera de imagen
- GIVEN el servicio de seguridad no responde
- WHEN la app consulta `Bandera_ImagenListadoEnHH`
- THEN la considera inactiva y el flujo continúa sin imágenes en el listado
