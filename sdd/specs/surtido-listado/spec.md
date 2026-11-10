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

## Historial
- 2026-10-22 · map: inventario inicial como parte de `surtido-pedido`
- 2026-10-22 · map: división de `surtido-pedido` en `surtido-ronda` (V1) y `surtido-listado` (V2)
