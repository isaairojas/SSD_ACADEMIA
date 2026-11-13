# Capacidad: surtido-listado

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial; división de `surtido-pedido`). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al usuario surtir un solo pedido desde un listado de sus productos (pantalla V2, `AssortmentTaskV2`) con un detalle por producto (`ProductDetail`), sin capturar contenedores. Se abre desde `asignacion-tarea` cuando la bandera `BanderaListadoDeProductosEnHH` está activa y la tarea tiene un solo pedido ("Inicio de surtido y elección de versión"). La ronda multipedido (V1) está en `surtido-ronda`; con `Bandera_RevisionPedidoEnHH` el listado incluye revisión de piezas, cuyo detalle pertenece a `revision-surtido`.

Pendiente de especificar: "ofertas especiales" (promociones AxB), avisos por tiempo límite, detalle de producto (aumentar/disminuir cantidad, cantidad manual), surtido parcial. Deuda observada: varios textos están escritos en el controlador y no en `es.ts`.

## Requisitos

### Requirement: Vinculación del pedido al abrir
WHEN se abre el listado, el sistema SHALL vincular el pedido con el contenedor virtual de la tarea (`virtualContainerId`, o 0 si falta), cargar el catálogo de motivos de negación y consultar las banderas `Bandera_UbicacionesUDN` y `Bandera_RevisionPedidoEnHH` de la sucursal; el usuario no captura contenedor.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:245-271, 733-749` (OBSERVADA)
[NEEDS CLARIFICATION: ¿de dónde sale `virtualContainerId` y cuándo es 0?]

#### Scenario: Apertura del listado
- GIVEN el usuario toma una tarea de un solo pedido con la bandera de listado activa
- WHEN se abre el listado
- THEN el pedido queda vinculado a su contenedor virtual y se muestran sus productos

### Requirement: Validación de producto escaneado
WHEN el usuario escanea en el listado, el sistema SHALL conservar solo dígitos, "-", "F" y "C" (máximo 100 caracteres) y validar que el producto esté en el pedido, no esté negado ni ya surtido, que la cantidad sea positiva y que no exceda lo pendiente ni la existencia; IF el código no trae cantidad THEN SHALL abrir un modal para capturarla.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:354-361, 375-383, 435-450, 485-491, 574-647`, `src/i18n/es.ts:333` (OBSERVADA)

#### Scenario: Producto negado escaneado
- GIVEN el producto fue negado
- WHEN el usuario lo escanea en el listado
- THEN ve "Producto negado" y "El código escaneado fue negado y no es posible agregar unidades."

### Requirement: Validación de etiqueta única (EU)
WHEN la bandera `surtidoEtiquetaUnicaEnabled` de la tarea está activa y el producto requiere EU (`requiereEU`), el sistema SHALL validar el QR contra el servicio de etiqueta única antes de sumar cantidad y SHALL rechazar una etiqueta ya escaneada en el pedido ("tagAlreadyScannedInOrder").
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:453-483`, `src/services/AssortmentTaskServices.ts:216-270` (OBSERVADA)
[NEEDS CLARIFICATION: con QR sin bandera EU o sin `requiereEU` no se muestra el aviso de QR deshabilitado (V1 sí lo muestra) y el código sigue por la validación de cantidad; ¿es lo esperado?]

#### Scenario: Etiqueta repetida en el pedido
- GIVEN el usuario ya escaneó la etiqueta única E1 en este pedido
- WHEN vuelve a escanear E1
- THEN el sistema la rechaza y no suma cantidad

### Requirement: Caducidad más próxima en perecederos
IF el producto con EU es perecedero y existen etiquetas con caducidad más próxima THEN el sistema SHALL abrir el modal de "etiquetas más antiguas" y SHALL ofrecer "No existen etiquetas más antiguas" para continuar con la etiqueta escaneada.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:494-559`, `src/i18n/es.ts:351-354` (OBSERVADA)

#### Scenario: EU confirmada sin etiquetas más antiguas
- GIVEN el modal de etiquetas más antiguas está abierto
- WHEN el usuario pulsa "No existen etiquetas más antiguas"
- THEN se procesa la cantidad con la etiqueta escaneada

### Requirement: Negar producto desde el detalle
WHEN el usuario niega un producto en su detalle, el sistema SHALL pedir un motivo del catálogo de motivos de negación y registrar el producto con 0 piezas y ese motivo (`reasonID`) en el contenedor 0.
Evidencia: `src/views/HomeStack/ProductDetail/ProductDetailController.tsx:24-36, 318-341`, `src/services/AssortmentTaskServices.ts:192-197` (OBSERVADA)

#### Scenario: Negar con motivo
- GIVEN el producto tiene cantidad surtida 0
- WHEN el usuario elige negar, selecciona un motivo y confirma
- THEN el producto queda negado con 0 piezas y ese motivo

### Requirement: Restricciones para negar
IF el producto ya tiene cantidad surtida mayor que 0 THEN el sistema SHALL mostrar "Para poder negar un producto la cantidad surtida debe ser cero."; IF el pedido es corporativo con orden de compra THEN SHALL mostrar "Este pedido no permite negar productos. Para continuar, finaliza el surtido de forma manual y saca el pedido de la ronda."; IF el servicio falla THEN SHALL mostrar "Ocurrió un error al negar el producto, por favor intenta de nuevo."
Evidencia: `src/views/HomeStack/ProductDetail/ProductDetailController.tsx:201-210, 323-341`, `src/i18n/es.ts:346-350, 355` (OBSERVADA)

#### Scenario: Negar con piezas ya surtidas
- GIVEN el usuario surtió 1 pieza del producto
- WHEN pulsa negar producto en el detalle
- THEN ve "No es posible negar el producto" y "Para poder negar un producto la cantidad surtida debe ser cero."

#### Scenario: Pedido corporativo con orden de compra
- GIVEN el pedido es corporativo con orden de compra y cantidad surtida cero
- WHEN pulsa negar producto
- THEN ve "Pedido corporativo" y el mensaje que indica finalizar manualmente y sacar el pedido de la ronda

### Requirement: Guía por voz en el listado
El sistema SHALL leer el resumen "Pedido {n}, {completados} códigos surtidos, {parciales} surtidos parcialmente y {pendientes} pendientes de surtir" al abrir el listado, al completar un producto y con "Repetir audio"; en el detalle de producto SHALL leer código, ubicación, rack, nivel (y pasillo con `Bandera_UbicacionesUDN`); SHALL detener la voz al salir o perder foco.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:286-309, 669-675`, `src/views/HomeStack/ProductDetail/ProductDetailController.tsx:60-94` (OBSERVADA)

#### Scenario: Resumen al abrir
- GIVEN el usuario toma la tarea con el listado
- WHEN se abre el listado
- THEN la voz dice cuántos códigos están surtidos, parciales y pendientes

### Requirement: Finalizar el surtido del pedido
WHEN todos los productos están surtidos o negados (sin promociones AxB ni productos sin revisar pendientes), o el usuario elige "Finalizar surtido", el sistema SHALL mostrar "Haz surtido el total de productos solicitados ¿Deseas finalizar la ronda?" (o "Haz surtido y revisado..." con revisión activa) y, al confirmar, SHALL registrar el pedido completo (`FillOrderFull`), guardar la ronda con `monitoringID` 3, guardar y relacionar las etiquetas surtidas, mostrar "¡Se completó la ronda de surtido exitosamente!" y regresar.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:677-811`, `src/services/AssortmentTaskServices.ts:276-280`, `src/i18n/es.ts:203-208` (OBSERVADA)

#### Scenario: Finalizar con todos los códigos surtidos
- GIVEN todos los productos del pedido están surtidos
- WHEN el usuario confirma "Finalizar surtido"
- THEN se guarda el pedido y la ronda, ve "¡Se completó la ronda de surtido exitosamente!" y regresa

### Requirement: Bloqueos y fallas al finalizar
IF el usuario finaliza manualmente con códigos en cero THEN el sistema SHALL mostrar "Tienes códigos sin surtir, para finalizar el surtido primero deberás negarlos entrando al detalle del producto."; IF hay productos parciales THEN SHALL pedir confirmación; IF el guardado falla THEN SHALL ofrecer reintentar o cancelar, y cancelar SHALL desvincular el pedido y volver al inicio.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:317-329, 819-854`, `src/i18n/es.ts:223-225` (OBSERVADA)

#### Scenario: Códigos sin surtir
- GIVEN un producto tiene cantidad surtida 0 y no está negado
- WHEN el usuario elige finalizar manualmente
- THEN ve el modal que pide negar primero los códigos sin surtir

### Requirement: Salir del listado deshace el vínculo
WHEN el usuario sale de la pantalla (botón o gesto de regreso), el sistema SHALL pedir confirmación ("Si sales ahora perderás los cambios hechos. ¿Deseas continuar?") y, al confirmar, SHALL desvincular el pedido del contenedor y volver; IF la desvinculación falla THEN SHALL permanecer en la pantalla.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:273-284, 331-341, 561-572`, `src/services/AssortmentTaskServices.ts:89-96`, `src/i18n/es.ts:199` (OBSERVADA)

#### Scenario: Falla al desvincular
- GIVEN el servicio de desvinculación no responde
- WHEN el usuario confirma la salida
- THEN permanece en el listado

### Requirement: Sacar el pedido de la ronda
WHEN el pedido es corporativo con orden de compra, hay productos incompletos y el usuario elige sacar el pedido de la ronda, el sistema SHALL llamar a `RemoveFromRound`, mostrar "Pedido retirado de la ronda" ("Aparta la mercancía ya surtida y repórtalo para su validación.") y regresar.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:819-826, 856-878`, `src/i18n/es.ts:211-216` (OBSERVADA)

#### Scenario: Retirar pedido
- GIVEN el pedido es corporativo con orden de compra y quedan productos incompletos
- WHEN el usuario elige finalizar manualmente y confirma sacar el pedido
- THEN ve "Pedido retirado de la ronda" y regresa

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

## Historial
- 2026-10-22 · map: inventario inicial como parte de `surtido-pedido`
- 2026-10-22 · map: división de `surtido-pedido` en `surtido-ronda` (V1) y `surtido-listado` (V2)
- 2026-11-13 · 2026-11-10-surtido-listado-imagen-producto: ADDED "Imagen del producto en el listado"; ADDED "Producto sin imagen en el listado"; ADDED "Listado utilizable mientras cargan las imágenes"; ADDED "Orden y datos del listado sin cambios"; ADDED "Pulsar la imagen abre el detalle"; ADDED "Activación de la imagen por sucursal"; ADDED "Registro de entradas al detalle desde el listado"
