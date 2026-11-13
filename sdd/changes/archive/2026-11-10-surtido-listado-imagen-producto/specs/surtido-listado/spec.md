# surtido-listado · delta del cambio 2026-11-10-surtido-listado-imagen-producto

## ADDED Requirements

### Requirement: Imagen del producto en el listado
The system SHALL mostrar en cada producto del listado de surtido la imagen registrada para su código, la misma que muestra el detalle de ese producto, junto a su código y descripción.
(Origen: HU-1)
(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)
#### Scenario: Listado con imágenes
- GIVEN la sucursal tiene activa `Bandera_ImagenListadoEnHH`, el usuario toma una tarea de un solo pedido con la bandera de listado activa y todos sus productos tienen imagen
- WHEN se abre el listado
- THEN cada producto muestra su imagen junto a su código y descripción
#### Scenario: Productos parecidos en el mismo pedido
- GIVEN el pedido incluye los códigos 2012000 (foco 1141), 2010000 (foco 1034/1157) y 1978000 (foco 158)
- WHEN el usuario ve el listado y después abre el detalle de cada uno
- THEN cada producto muestra en el listado la imagen registrada para su propio código, y es la misma imagen que muestra su detalle
#### Scenario: Producto en cualquier estado de surtido
- GIVEN el listado tiene un producto pendiente, uno surtido parcialmente, uno surtido completo y uno negado
- WHEN el usuario ve el listado
- THEN los cuatro muestran su imagen sin atenuarla ni ocultarla, y el estado de cada uno se sigue indicando con los datos que ya muestra el listado

### Requirement: Producto sin imagen en el listado
IF un producto no tiene imagen registrada o su imagen no se puede cargar THEN the system SHALL mostrar en el lugar de la imagen un icono genérico de producto, sin texto y distinto de cualquier foto de producto, manteniendo visibles el código, la descripción y los demás datos del producto.
(Origen: HU-1)
(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)
#### Scenario: Producto sin imagen registrada
- GIVEN un producto del pedido no tiene imagen registrada
- WHEN se abre el listado
- THEN ese producto muestra el icono genérico de producto en el lugar de la imagen, sin texto, con su código y descripción visibles
#### Scenario: Imagen que no se puede cargar
- GIVEN un producto tiene imagen registrada pero no se puede cargar (por ejemplo, sin red)
- WHEN el usuario ve el listado
- THEN ese producto muestra el mismo icono genérico de producto y el resto del listado sigue mostrando sus productos y sus imágenes

### Requirement: Listado utilizable mientras cargan las imágenes
WHILE la imagen de un producto se está cargando the system SHALL mostrar en su lugar el mismo icono genérico de producto, sin impedir escanear ni abrir el detalle.
(Origen: HU-1)
(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)
#### Scenario: Escaneo antes de que carguen las imágenes
- GIVEN se abrió el listado y las imágenes de sus productos aún no terminan de cargar
- WHEN el usuario escanea un código del pedido
- THEN el escaneo se valida y registra con las mismas reglas que en el listado sin imágenes, y el producto escaneado sigue mostrando el icono genérico hasta que su imagen carga
#### Scenario: La imagen termina de cargar
- GIVEN un producto muestra el icono genérico mientras su imagen se carga
- WHEN la imagen termina de cargar
- THEN la imagen ocupa el mismo espacio que ocupaba el icono, y ni el orden ni la posición de los productos del listado cambian

### Requirement: Orden y datos del listado sin cambios
The system SHALL mostrar los productos del listado en el mismo orden y con los mismos datos que antes del cambio, añadiendo únicamente su imagen o el icono genérico.
(Origen: HU-1)
(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)
#### Scenario: Orden y datos sin cambios
- GIVEN un pedido que en una sucursal sin `Bandera_ImagenListadoEnHH` se muestra con un orden y unos datos por producto
- WHEN el mismo pedido se abre en una sucursal con la bandera activa
- THEN los productos aparecen en el mismo orden y con los mismos datos, más su imagen o el icono genérico
#### Scenario: Guía por voz sin cambios
- GIVEN la sucursal tiene activa `Bandera_ImagenListadoEnHH`
- WHEN se abre el listado
- THEN la voz dice el mismo resumen de códigos surtidos, parciales y pendientes que sin imágenes

### Requirement: Pulsar la imagen abre el detalle
WHEN el usuario pulsa la imagen o el icono genérico de un producto del listado the system SHALL abrir el detalle de ese producto, igual que al pulsar cualquier otra parte del producto, sin ampliar la imagen.
(Origen: HU-1)
(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)
#### Scenario: Pulsar la imagen de un producto
- GIVEN el listado muestra la imagen de un producto
- WHEN el usuario pulsa la imagen
- THEN se abre el detalle de ese producto y la imagen no se amplía
#### Scenario: Pulsar el icono genérico
- GIVEN un producto muestra el icono genérico porque no tiene imagen
- WHEN el usuario pulsa el icono
- THEN se abre el detalle de ese producto

### Requirement: Activación de la imagen por sucursal
WHERE la sucursal tiene activa `Bandera_ImagenListadoEnHH` (bandera nueva, nombre propuesto) the system SHALL mostrar las imágenes en el listado de surtido V2; en cualquier otro caso, incluida una falla al consultar la bandera, el listado se muestra como antes del cambio, sin imágenes ni icono genérico.
(Origen: intent, criterios de éxito medidos en sucursales piloto; clarificaciones #1, #8 y #14)
(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)
#### Scenario: Sucursal piloto
- GIVEN la sucursal tiene activa `Bandera_ImagenListadoEnHH`
- WHEN el usuario abre el listado
- THEN cada producto muestra la imagen registrada para su código o, si no la tiene, el icono genérico
#### Scenario: Sucursal sin activar
- GIVEN la sucursal no tiene activa `Bandera_ImagenListadoEnHH`
- WHEN el usuario abre el listado
- THEN el listado se ve como antes del cambio, sin imágenes ni icono genérico
#### Scenario: Falla al consultar la bandera
- GIVEN la consulta de `Bandera_ImagenListadoEnHH` falla
- WHEN se abre el listado
- THEN la bandera se trata como inactiva y el listado se ve sin imágenes ni icono genérico, igual que en una sucursal sin activar

### Requirement: Registro de entradas al detalle desde el listado
WHEN el usuario sale del detalle de un producto al que entró desde el listado the system SHALL registrar la entrada con sucursal, pedido, código, fecha y hora, si la sucursal tenía activa `Bandera_ImagenListadoEnHH`, y si en esa entrada capturó cantidad, negó el producto o no hizo ninguna de las dos; si en la misma entrada capturó y negó, la entrada se marca como "con negación".
(Origen: intent, SC-001; clarificaciones #9 y #12)
(Estado: especificado · implementado solo en el simulador SSD_ACADEMIA · pendiente en exodus-gtm-pwa)
#### Scenario: Entrada solo para ver el producto
- GIVEN el usuario está en el listado
- WHEN abre el detalle de un producto y vuelve al listado sin capturar cantidad ni negar
- THEN queda registrada una entrada de ese producto marcada como "sin captura ni negación"
#### Scenario: Entrada con captura
- GIVEN el usuario está en el listado
- WHEN abre el detalle de un producto, captura cantidad y vuelve al listado
- THEN queda registrada una entrada de ese producto marcada como "con captura"
#### Scenario: Entrada con negación
- GIVEN el usuario está en el listado
- WHEN abre el detalle de un producto, lo niega y vuelve al listado
- THEN queda registrada una entrada de ese producto marcada como "con negación"
#### Scenario: Captura y negación en la misma entrada
- GIVEN el usuario abrió el detalle de un producto desde el listado
- WHEN captura cantidad, después niega el producto y vuelve al listado
- THEN queda registrada una sola entrada de ese producto, marcada como "con negación"
#### Scenario: Línea base en sucursales sin activar
- GIVEN la sucursal no tiene activa `Bandera_ImagenListadoEnHH`
- WHEN el usuario entra y sale del detalle de un producto desde el listado
- THEN la entrada también se registra, marcada como "sin imagen en el listado", para servir de línea base
