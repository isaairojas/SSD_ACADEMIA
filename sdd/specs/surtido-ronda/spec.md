# Capacidad: surtido-ronda

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial; división de `surtido-pedido`). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al usuario surtir una ronda multipedido producto por producto (pantalla V1, `AssortmentTask`), depositando lo surtido en contenedores de 8 dígitos por pedido. Se abre desde `asignacion-tarea` cuando la tarea tiene varios pedidos o la bandera de listado no está activa ("Inicio de surtido y elección de versión"). El surtido de un solo pedido en listado (V2) está en `surtido-listado`; la revisión, en `revision-surtido`.

Dudas del enrutamiento (viven en `asignacion-tarea`): se considera "varios pedidos" cuando `orderId` contiene una coma; `getAssortmentProducts` usa la versión `v2` o `v1` del endpoint según `Bandera_UbicacionesUDN`, no según la bandera de listado. [NEEDS CLARIFICATION: ¿ambas reglas son intencionales?]

Pendiente de especificar: editar productos ya surtidos, enviar producto al final, surtido parcial, promociones AxB, consultar contenedor, avisos por tiempo límite (mitad, tres cuartos y vencimiento), aviso de apoyo HH cada 120 s (publicadores Rabbit/GraphQL), correo de promociones no procesadas. Deuda observada: se ejecuta `fetchMantenimientoUbicacionesFeatureFlag` y `getSucursalFlag` solo consulta `Bandera_UbicacionesUDN` aunque su nombre sugiere "es piloto"; varios textos están escritos en el controlador y no en `es.ts`.

## Requisitos

### Requirement: Contenedor de 8 dígitos
WHEN el usuario escanea o captura un contenedor, el sistema SHALL aceptarlo solo si tiene exactamente 8 dígitos; los 3 primeros son el id del contenedor y los 5 restantes su peso, y SHALL vincularlo al pedido del producto actual. IF no tiene 8 dígitos THEN el sistema SHALL mostrar "Por favor, escanea un contenedor válido". IF el id ya está en la lista de contenedores de la ronda THEN el sistema SHALL mostrar "El contenedor que intentas ingresar ya se encuentra asignado".
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:859-922, 933-935`, `src/services/AssortmentTaskServices.ts:53-58`, `src/i18n/es.ts:306, 317` (OBSERVADA)

#### Scenario: Contenedor válido
- GIVEN el producto actual pertenece al pedido 1001 y no hay contenedor para ese pedido
- WHEN el usuario escanea "12300450"
- THEN el contenedor 123 con peso 450 queda vinculado al pedido 1001 y el foco pasa al campo de producto

#### Scenario: Longitud incorrecta
- GIVEN el modal de contenedor está abierto
- WHEN el usuario captura "1234"
- THEN ve "Por favor, escanea un contenedor válido" y el campo se limpia

#### Scenario: Contenedor repetido
- GIVEN el contenedor 123 ya se usó en la ronda
- WHEN el usuario escanea "12300500"
- THEN ve "El contenedor que intentas ingresar ya se encuentra asignado"

### Requirement: Contenedor por cambio de pedido y confirmación
WHEN el siguiente producto pertenece a otro pedido, el sistema SHALL pedir un contenedor nuevo si el pedido no tiene uno abierto, o SHALL pedir confirmar el contenedor ya abierto de ese pedido. IF el contenedor confirmado no coincide en los 3 primeros dígitos con el actual THEN el sistema SHALL mostrar "El contenedor escaneado no coincide con el contenedor actual. Por favor, escanea otro contenedor".
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:1014-1022, 1140-1156`, `src/i18n/es.ts:316` (OBSERVADA)

#### Scenario: Cambio a un pedido sin contenedor
- GIVEN el siguiente producto es del pedido 1002 y este no tiene contenedor
- WHEN el usuario avanza al siguiente producto
- THEN se abre el modal para escanear contenedor

#### Scenario: Confirmación con contenedor distinto
- GIVEN el contenedor actual es 123
- WHEN el usuario confirma escaneando "45600100"
- THEN ve la advertencia de que no coincide con el contenedor actual

### Requirement: Formato del código de producto
WHEN el usuario escanea un producto, el sistema SHALL aceptar códigos de 7 dígitos (código manual: pide la cantidad), de 18 dígitos (7 de producto, 6 de cantidad, 5 de peso) o de 51 a 100 dígitos (QR de etiqueta única), con sufijos opcionales `-<n>` y `-FC<8 dígitos>`; IF el código no cumple el formato THEN SHALL mostrar "Por favor, captura un producto válido".
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:670-700, 937-974`, `src/i18n/es.ts:307` (OBSERVADA)
[NEEDS CLARIFICATION: `isValidProduct` usa `inputLength > 51` mientras el regex y la rama de QR usan `>= 51`; un código de exactamente 51 dígitos no se compara contra el producto actual. ¿Es intencional?]

#### Scenario: Código con formato inválido
- GIVEN el usuario está en un producto de la ronda
- WHEN captura "12345"
- THEN ve "Por favor, captura un producto válido"

### Requirement: Acumulación de cantidad surtida
IF el producto escaneado no es el actual THEN el sistema SHALL mostrar un error de producto; IF la cantidad acumulada supera lo solicitado o la existencia THEN SHALL rechazarla con "La cantidad que intentas ingresar es mayor a la solicitada..." o "...a la existencia actual..."; WHEN la cantidad acumulada alcanza la solicitada, SHALL registrar el surtido y pasar al siguiente producto.
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:700-829`, `src/i18n/es.ts:308-312` (OBSERVADA)
[NEEDS CLARIFICATION: el mensaje "No es posible surtir un producto con cantidad cero..." solo aparece si el QR/18 dígitos trae cantidad < 1; ¿se cubre también el modal manual?]

#### Scenario: Surtido completo con código de 18 dígitos
- GIVEN el producto pide 3 piezas y ya se surtieron 2
- WHEN el usuario escanea un código de 18 dígitos con cantidad 1 del mismo producto
- THEN se registra el surtido de 3 piezas y se muestra el siguiente producto

#### Scenario: Cantidad mayor a la existencia
- GIVEN la existencia es 2 y el pedido pide 5
- WHEN el usuario intenta acumular 3 piezas
- THEN ve "La cantidad que intentas ingresar es mayor a la existencia actual. Por favor, ingresa una cantidad igual o menor"

### Requirement: Validación de etiqueta única (EU)
WHEN la bandera `surtidoEtiquetaUnicaEnabled` de la tarea está activa y el producto requiere EU (`requiereEU`), el sistema SHALL validar el QR contra el servicio de etiqueta única antes de sumar cantidad; IF no aplican y se escanea un QR THEN SHALL mostrar "La lectura del QR esta deshabilitada. Escanea el codigo de barras".
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:705-734`, `src/services/AssortmentTaskServices.ts:216-270`, `src/i18n/es.ts:32` (OBSERVADA)

#### Scenario: QR con EU deshabilitada
- GIVEN el producto no requiere EU
- WHEN el usuario escanea un QR de más de 51 dígitos
- THEN ve "La lectura del QR esta deshabilitada. Escanea el codigo de barras"

### Requirement: Caducidad más próxima en perecederos
IF el producto con EU es perecedero y existen etiquetas con caducidad más próxima THEN el sistema SHALL avisar "Por favor escanea un producto con la fecha de caducidad más próxima." sin sumar la cantidad, y SHALL ofrecer "Etiqueta inexistente" para continuar, que envía la etiqueta al subalmacén con el mensaje "Se envio la etiqueta al subalmacen, por favor escane nuevamente otra etiqueta".
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:1540-1701`, `src/i18n/es.ts:351-354` (OBSERVADA)
[NEEDS CLARIFICATION: ¿qué ocurre con la etiqueta enviada al subalmacén (`enviarproductosubalmacenx`) en el sistema de etiquetas?]

#### Scenario: Perecedero con etiqueta más antigua disponible
- GIVEN el producto es perecedero, requiere EU y existe una etiqueta con caducidad más próxima
- WHEN el usuario escanea el QR de una etiqueta más reciente
- THEN ve "Por favor escanea un producto con la fecha de caducidad más próxima." y no se suma la cantidad

### Requirement: Negar producto con motivo
WHEN el usuario elige "Negar producto", el sistema SHALL pedir confirmación ("El producto será surtido en 0 y será retirado de la orden") y un motivo del catálogo `denialreasons` ("Selección de motivo negado") antes de registrar el producto con 0 piezas y ese motivo; IF el producto es una promoción gratis AxB THEN SHALL negarlo con motivo fijo 6 sin pedir motivo.
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:561-564, 1297-1307, 1414-1443, 1495-1501`, `src/services/AssortmentTaskServices.ts:192-197`, `src/i18n/es.ts:26, 160-161` (OBSERVADA)
[NEEDS CLARIFICATION: el motivo se parsea con `parseInt(negationReason?.value)`; ¿se bloquea la confirmación sin motivo? Negar en edición usa `Quantity/Edit`; ¿mismas reglas?]

#### Scenario: Negar con motivo
- GIVEN el usuario está en un producto sin existencia
- WHEN elige "Negar producto", confirma y selecciona un motivo
- THEN el producto se registra con 0 piezas y el motivo, y se pasa al siguiente

### Requirement: Guía por voz en la ronda
WHILE el usuario surte, el sistema SHALL leer "Ronda: {taskId}, Código: {producto}, Ubicación..." con la plantilla de zona/rack/nivel, o de pasillo/torre/nivel cuando `Bandera_UbicacionesUDN` está activa, seguida de "Iniciar escaneando contenedor.", "Escanear producto a surtir." o "Escanear QR del producto a surtir", y "Ronda finalizada." al terminar; WHEN se cumple un hito de tiempo límite SHALL decir "Por favor revise su equipo."; SHALL detener la voz al salir.
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:184-241, 1090, 1215-1243`, `src/i18n/es.ts:25, 391-399` (OBSERVADA)
[NEEDS CLARIFICATION: ¿la bandera de pasillo/torre es la misma que la de "piloto" de la versión de API?]

#### Scenario: Instrucción al llegar a un producto
- GIVEN el contenedor actual pertenece al pedido del producto y el producto no requiere EU
- WHEN se muestra el producto
- THEN la voz dice la ronda, el código, la ubicación y "Escanear producto a surtir."

### Requirement: Contenedor virtual
WHEN el usuario elige "Contenedor virtual", el sistema SHALL preguntar "¿Deseas generar un contenedor virtual?" y, al confirmar, SHALL surtir la cantidad completa solicitada del producto actual en un contenedor virtual y mostrar "Se generó el contenedor virtual: {vcontainerId}".
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:556-559, 1245-1274`, `src/services/AssortmentTaskServices.ts:181-186`, `src/i18n/es.ts:20, 159, 165` (OBSERVADA)

#### Scenario: Surtir con contenedor virtual
- GIVEN el usuario está en un producto de 4 piezas
- WHEN elige "Contenedor virtual" y confirma
- THEN el producto se surte completo, ve "Se generó el contenedor virtual: {id}" y avanza

### Requirement: Guardado de la ronda
WHEN el usuario surte o niega el último producto de la ronda, el sistema SHALL guardar la ronda (`round/save`), enviar el correo de promociones no procesadas si las hay, guardar las etiquetas surtidas, decir "Ronda finalizada." y navegar a la asignación de tareas; IF se negó el último producto y era el último pendiente THEN SHALL navegar al inicio; IF el servidor devuelve pedidos retenidos THEN SHALL mostrar el modal de tarea retenida antes de volver a asignación.
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:976-1110, 1276-1287, 1712-1715` (OBSERVADA)
[NEEDS CLARIFICATION: navegar a `Home` usa `negatedProduct === true && isLastProduct`; ¿significa "ronda cerrada por falta de producto"?]

#### Scenario: Ronda completada
- GIVEN el usuario surte el último producto
- WHEN termina el guardado
- THEN se dice "Ronda finalizada." y se abre la asignación de tareas

### Requirement: Falla al guardar la ronda
IF el guardado de la ronda falla THEN el sistema SHALL mostrar el modal de tarea incompleta ("Hubo un error de red al finalizar el surtido. Por favor, acércate a un access point y vuelve a intentarlo.") con las opciones de reintentar o regresar al inicio.
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:318-332`, `src/i18n/es.ts:327` (OBSERVADA)

#### Scenario: Falla de red al guardar
- GIVEN el servicio de guardar ronda no responde
- WHEN el usuario surtió el último producto
- THEN ve el modal de tarea incompleta con las opciones de reintentar o volver al inicio

### Requirement: Salir de la ronda deshace los vínculos
WHEN el usuario sale de la pantalla (botón o gesto de regreso), el sistema SHALL pedir confirmación ("Si sales ahora perderás los cambios hechos. ¿Deseas continuar?") y, al confirmar, SHALL desvincular los contenedores de la tarea (`unlinkordercontainer`) y volver.
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:172-175, 334-352`, `src/services/AssortmentTaskServices.ts:89-96`, `src/i18n/es.ts:199` (OBSERVADA)
[NEEDS CLARIFICATION: si `deleteAssortmentProducts` no es exitoso no se navega y no se muestra mensaje; ¿se requiere uno?]

#### Scenario: Salir a media ronda
- GIVEN el usuario ya surtió algunos productos
- WHEN confirma la salida
- THEN se desvinculan los contenedores y regresa a la pantalla anterior

### Requirement: Retirar un pedido corporativo de la ronda
WHEN el usuario cancela un pedido corporativo, el sistema SHALL llamar a `RemoveFromRound` y mostrar "Pedido retirado" con "El pedido ha sido retirado de la orden"; IF no quedan más productos THEN SHALL mostrar "...(Orden de surtido cerrada por falta de productos)" y navegar al inicio; IF el servicio no tiene éxito THEN SHALL mostrar "Ocurrió un error al tratar de retirar el pedido de la orden".
Evidencia: `src/views/HomeStack/AssortmentTask/AssortmentTaskController.tsx:566-639`, `src/services/AssortmentTaskServices.ts:204-209`, `src/i18n/es.ts:320-323` (OBSERVADA)
[NEEDS CLARIFICATION: en el error se usa `corporateCancellationMessage` ("El pedido ha sido retirado de la orden"); parece un texto incorrecto, ¿cuál debe mostrarse?]

#### Scenario: Retirar pedido corporativo
- GIVEN la ronda incluye un pedido corporativo
- WHEN el usuario cancela ese pedido
- THEN ve "Pedido retirado" con "El pedido ha sido retirado de la orden"

## Historial
- 2026-10-22 · map: inventario inicial como parte de `surtido-pedido`
- 2026-10-22 · map: división de `surtido-pedido` en `surtido-ronda` (V1) y `surtido-listado` (V2)
