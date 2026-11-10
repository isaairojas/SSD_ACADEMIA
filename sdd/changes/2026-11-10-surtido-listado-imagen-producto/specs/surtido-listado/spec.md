# surtido-listado · delta del cambio 2026-11-10-surtido-listado-imagen-producto

## ADDED Requirements

### Requirement: Imagen del producto en el listado
The system SHALL mostrar en cada producto del listado de surtido la imagen del producto junto a su código y descripción, siendo la misma imagen que muestra el detalle de ese producto.
(Origen: HU-1)
#### Scenario: Listado con imágenes
- GIVEN el usuario toma una tarea de un solo pedido con la bandera de listado activa y todos sus productos tienen imagen
- WHEN se abre el listado
- THEN cada producto muestra su imagen junto a su código y descripción
#### Scenario: Productos parecidos en el mismo pedido
- GIVEN el pedido incluye los códigos 1141, 1157 y 158
- WHEN el usuario ve el listado
- THEN cada uno de esos productos muestra la imagen que corresponde a su propio código, la misma que verá en su detalle
#### Scenario: Producto en cualquier estado de surtido
- GIVEN el listado tiene un producto pendiente, uno surtido parcialmente, uno surtido completo y uno negado
- WHEN el usuario ve el listado
- THEN los cuatro muestran su imagen de la misma forma, sin atenuarla ni ocultarla, y el estado de cada uno se sigue indicando con los datos que ya muestra el listado

### Requirement: Producto sin imagen en el listado
IF un producto no tiene imagen registrada o su imagen no se puede cargar THEN the system SHALL mostrar en su lugar un icono genérico de producto, sin texto, y conservar el código, la descripción y los demás datos del producto en el listado.
(Origen: HU-1)
#### Scenario: Producto sin imagen registrada
- GIVEN un producto del pedido no tiene imagen registrada
- WHEN se abre el listado
- THEN ese producto muestra el icono genérico de producto en el lugar de la imagen, sin texto, con su código y descripción visibles
#### Scenario: Imagen que no se puede cargar
- GIVEN un producto tiene imagen registrada pero no se puede cargar (por ejemplo, sin red)
- WHEN el usuario ve el listado
- THEN ese producto muestra el mismo icono genérico de producto y el resto del listado sigue mostrando sus productos y sus imágenes

### Requirement: Listado utilizable mientras cargan las imágenes
WHILE la imagen de un producto se está cargando the system SHALL mostrar en su lugar el icono genérico de producto y permitir escanear y abrir el detalle sin esperar a que la imagen termine de cargar.
(Origen: HU-1)
#### Scenario: Escaneo antes de que carguen las imágenes
- GIVEN se abrió el listado y las imágenes de sus productos aún no terminan de cargar
- WHEN el usuario escanea un código del pedido
- THEN el escaneo se valida y registra igual que sin imágenes, y el producto escaneado sigue mostrando el icono genérico de producto hasta que su imagen carga
#### Scenario: La imagen termina de cargar
- GIVEN un producto muestra el icono genérico mientras su imagen se carga
- WHEN la imagen termina de cargar
- THEN la imagen sustituye al icono en el mismo lugar, sin que cambie el orden ni la posición de los productos del listado

### Requirement: La imagen no cambia el comportamiento del listado
The system SHALL mantener en el listado el mismo orden de productos, los mismos datos y las mismas acciones que tenía antes de mostrar imágenes; pulsar la imagen SHALL no tener ningún efecto.
(Origen: HU-1)
#### Scenario: Pulsar la imagen de un producto
- GIVEN el listado muestra la imagen de un producto
- WHEN el usuario pulsa la imagen
- THEN no se abre el detalle, la imagen no se amplía y el listado no cambia
#### Scenario: Abrir el detalle desde el producto
- GIVEN el listado muestra la imagen de un producto
- WHEN el usuario pulsa el código o la descripción del producto
- THEN se abre el detalle de ese producto, igual que antes del cambio
#### Scenario: Orden y datos sin cambios
- GIVEN un pedido que antes del cambio se mostraba con un orden y unos datos por producto
- WHEN se abre el listado con imágenes
- THEN los productos aparecen en el mismo orden y con los mismos datos, más su imagen

### Requirement: Activación de la imagen por sucursal
WHERE la sucursal tiene activada la imagen en el listado the system SHALL mostrar las imágenes de los productos; en las demás sucursales SHALL mostrar el listado como hasta ahora, sin imágenes ni icono genérico.
(Origen: intent, criterios de éxito medidos en sucursales piloto)
#### Scenario: Sucursal piloto
- GIVEN la sucursal tiene activada la imagen en el listado
- WHEN el usuario abre el listado
- THEN cada producto muestra su imagen o el icono genérico de producto
#### Scenario: Sucursal sin activar
- GIVEN la sucursal no tiene activada la imagen en el listado
- WHEN el usuario abre el listado
- THEN el listado se ve como antes del cambio, sin imágenes ni icono genérico
