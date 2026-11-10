# Capacidad: revision-surtido

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al usuario verificar las piezas surtidas de un pedido antes de embarcarlo: escanear o confirmar la cantidad revisada por producto, resolver las diferencias (negar o marcar parcialidad con motivo) y finalizar la revisión. La tarea de revisión se toma y se inicia desde `asignacion-tarea` (`src/views/HomeStack/TaskAssign/TaskAssignController.tsx:187-235`); aquí solo se especifica desde que se abre la pantalla "Revisión de pedido".

Deuda observada: si el servicio de retiro del pedido corporativo falla, no se muestra ningún aviso (`AssortmentCheckController.tsx:360-371`); el mensaje de éxito de finalización tiene un texto de respaldo escrito en el código y no en `es.ts` (`AssortmentCheckController.tsx:246`); el título "Revisión sin diferencias" aparece también cuando hay productos negados (`AssortmentCheckScreen.tsx:324`).

## Requisitos

### Requirement: Lista de productos y avance de la revisión
El sistema SHALL mostrar en "Revisión de pedido" el avance de la revisión en porcentaje (piezas revisadas entre piezas surtidas) y la lista de productos del pedido con su código, descripción, cantidad "Surtido" y cantidad "Revisado", ordenada así: primero los revisados parcialmente, después los no revisados y al final los revisados por completo; dentro de cada grupo, por código ascendente.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:70-76`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckScreen.tsx:76-96, 216-241`, `src/utils/assortmentCheck.ts:53-72`, `src/i18n/es.ts:387` (OBSERVADA)

#### Scenario: Orden de la lista
- GIVEN un pedido con el producto A sin revisar, el B revisado 2 de 5 y el C revisado 5 de 5
- WHEN el usuario abre la revisión
- THEN ve los productos en el orden B, A, C

#### Scenario: Avance
- GIVEN el pedido tiene 10 piezas surtidas y 4 revisadas
- WHEN el usuario ve la pantalla
- THEN el "Avance de la revisión" muestra 40% y el subtítulo "Pedido <número>"

### Requirement: Revisión por escaneo
WHEN el usuario escanea la etiqueta de un producto con revisión normal, el sistema SHALL sumar a su cantidad revisada la cantidad que trae el código y confirmarlo con sonido de acierto.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:276-280, 328-340`, `src/utils/assortmentCheck.ts:12-40`, `src/utils/formats.ts:151-154` (OBSERVADA)
[NEEDS CLARIFICATION: el código admite solo dígitos, "-", "F" y "C" (máximo 100 caracteres); ¿qué significan "F" y "C" en el formato de etiqueta?]

#### Scenario: Escaneo válido
- GIVEN el producto tiene 5 piezas surtidas y 1 revisada
- WHEN el usuario escanea una etiqueta del producto con cantidad 2
- THEN la cantidad revisada pasa a 3

### Requirement: Rechazo de escaneos inválidos
IF el código escaneado no se puede interpretar, no pertenece al pedido, no trae cantidad (captura manual en producto de revisión normal), trae cantidad cero o haría que lo revisado supere lo surtido THEN el sistema SHALL mostrar, respectivamente, "Código inválido", "Producto incorrecto", "Ingreso manual no permitido", "Cantidad inválida" o "Escaneo sobrante" con su mensaje de `es.ts`, y emitir sonido de error sin modificar la cantidad revisada.
Evidencia: `src/utils/assortmentCheck.ts:12-40`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:282-291, 334-337`, `src/i18n/es.ts:280, 332, 334-342` (OBSERVADA)

#### Scenario: Producto de otro pedido
- GIVEN el pedido no incluye el producto 1234567
- WHEN el usuario escanea una etiqueta de 1234567
- THEN ve "Producto incorrecto" y la revisión no cambia

#### Scenario: Excede lo surtido
- GIVEN el producto tiene 5 surtidas y 4 revisadas
- WHEN el usuario escanea una etiqueta con cantidad 2
- THEN ve "Escaneo sobrante" ("La cantidad ingresada es mayor a la cantidad surtida. Por favor, ingresa una cantidad menor.") y lo revisado sigue en 4

#### Scenario: Captura manual en producto normal
- GIVEN el producto es de revisión normal
- WHEN el usuario teclea solo el código del producto, sin cantidad
- THEN ve "Ingreso manual no permitido" ("Ingreso manual no permitido para este producto. Escanea la etiqueta.")

### Requirement: Revisión simplificada de producto
WHEN el usuario escanea un producto marcado con revisión simplificada, el sistema SHALL abrir "Revisión simplificada de producto" con un contador cuyo valor inicial es la cantidad ya revisada (o la surtida si aún no hay revisión), acotado entre 0 y la cantidad surtida, y SHALL guardar esa cantidad como revisada al confirmar.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:293-326, 342-348`, `src/utils/assortmentCheck.ts:23-25, 49-51`, `src/i18n/es.ts:239` (OBSERVADA)
[NEEDS CLARIFICATION: el modal permite confirmar con cantidad 0 (el detalle del producto lo bloquea con menos de 1); ¿es intencional?]

#### Scenario: Primera revisión simplificada
- GIVEN un producto simplificado con 6 piezas surtidas y ninguna revisada
- WHEN el usuario lo escanea
- THEN el contador inicia en 6

#### Scenario: Cantidad mayor a lo surtido al teclear
- GIVEN el modal está abierto para un producto con 6 surtidas
- WHEN el usuario teclea 8 y confirma
- THEN ve "Escaneo sobrante" y la cantidad revisada no se guarda

### Requirement: Detalle de producto en revisión
WHEN el usuario pulsa un producto de la lista, el sistema SHALL mostrar su detalle con imagen, código, descripción, cantidad "Surtido" y "Revisado". En un producto simplificado SHALL permitir ajustar la cantidad con el contador y pulsar "Confirmar revisión" (habilitado con cantidad de 1 o más), que la guarda como revisión manual; en cualquier producto, "Cancelar revisión" (habilitado si ya hay revisión) SHALL regresar lo revisado a cero, o reabrir el contador si el producto es simplificado.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:272-274`, `src/views/HomeStack/AssortmentCheckProductDetail/AssortmentCheckProductDetailController.tsx:17-68`, `src/views/HomeStack/AssortmentCheckProductDetail/AssortmentCheckProductDetailScreen.tsx:106-182`, `src/i18n/es.ts:48-49` (OBSERVADA)
[NEEDS CLARIFICATION: al cancelar la revisión de un producto simplificado el contador se reinicia pero no se borra lo guardado hasta que se vuelva a confirmar; ¿es intencional?]

#### Scenario: Confirmar revisión simplificada desde el detalle
- GIVEN el detalle de un producto simplificado con 6 surtidas y contador en 6
- WHEN el usuario pulsa "Confirmar revisión"
- THEN lo revisado es 6 y el botón cambia a "Cancelar revisión"

#### Scenario: Cancelar revisión de un producto normal
- GIVEN un producto normal con 3 piezas revisadas
- WHEN el usuario pulsa "Cancelar revisión"
- THEN lo revisado vuelve a 0

### Requirement: Finalizar revisión desde el menú
WHEN el usuario elige "Finalizar revisión" en el menú de la pantalla, el sistema SHALL evaluar en este orden: pedido corporativo incompleto, promociones con diferencias, productos con diferencias (gestor de discrepancias) y, si no hay nada que resolver, SHALL pedir confirmación con "Finalizar revisión" / "¿Deseas finalizar la revisión?". WHEN todos los productos están revisados por completo y no hay promociones pendientes, el sistema SHALL abrir esa confirmación por sí mismo.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:160-208`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckScreen.tsx:274-289, 312-329`, `src/i18n/es.ts:50, 246-248` (OBSERVADA)

#### Scenario: Revisión completa
- GIVEN todos los productos tienen revisado igual a surtido
- WHEN el usuario está en la pantalla de revisión
- THEN se abre la confirmación "Finalizar revisión"

#### Scenario: Productos con diferencias sin negar
- GIVEN un producto tiene menos revisado que surtido
- WHEN el usuario elige "Finalizar revisión" en el menú
- THEN se abre el "Gestor discrepancias" para ese producto

### Requirement: Bloqueo por diferencias en promociones
IF algún producto de una promoción de tipo mayor a 1 tiene menos revisado que surtido THEN el sistema SHALL impedir finalizar y mostrar "No es posible finalizar este pedido" con "Existen diferencias respecto a las promociones surtidas, mientras que estas diferencias permanezcan no se podrá finalizar la revisión." y los códigos de la promoción.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:111-136, 167-172`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckScreen.tsx:290-311`, `src/i18n/es.ts:243-245` (OBSERVADA)
[NEEDS CLARIFICATION: el bloqueo se evalúa antes que el gestor de discrepancias, por lo que una promoción con diferencias no se puede negar; ¿es el comportamiento esperado?]

#### Scenario: Promoción incompleta
- GIVEN una promoción de dos productos y uno de ellos tiene piezas sin revisar
- WHEN el usuario elige "Finalizar revisión"
- THEN ve el bloqueo con los códigos de la promoción y no puede finalizar

### Requirement: Pedido corporativo incompleto
IF el pedido es corporativo, tiene orden de compra válida y existen productos con menos revisado que surtido THEN el sistema SHALL mostrar "No es posible finalizar este pedido" con el aviso de pedido corporativo y ofrecer sacar el pedido de la ronda ("¿Deseas sacar el pedido de la ronda?"); al confirmar SHALL retirarlo, mostrar "Pedido retirado de la ronda" ("Aparta la mercancía ya revisada y repórtalo para su validación.") y regresar a la pantalla anterior.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:162-166, 352-376`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckScreen.tsx:330-352`, `src/services/AssortmentTaskServices.ts` (`postRemovePurchaseFromRound`), `src/i18n/es.ts:211, 216, 249-251` (OBSERVADA)
[NEEDS CLARIFICATION: si el pedido es corporativo pero sin orden de compra válida, sigue el flujo normal de discrepancias; ¿qué significa "orden de compra válida" y por qué cambia la regla?]

#### Scenario: Retirar pedido corporativo
- GIVEN un pedido corporativo con orden de compra válida y una pieza sin revisar
- WHEN el usuario elige "Finalizar revisión" y confirma sacar el pedido de la ronda
- THEN se retira el pedido, ve "Pedido retirado de la ronda" y regresa a la pantalla anterior

### Requirement: Gestión de discrepancias (negar o marcar parcialidad)
WHEN existen productos con menos revisado que surtido, el sistema SHALL presentar uno por uno, en orden de código ascendente, el "Gestor discrepancias" con su cantidad surtida, revisada y la diferencia, y SHALL permitir "Regresar" o negarlo ("Negar", o "Marcar parcialidad" si ya tiene piezas revisadas) eligiendo un motivo del catálogo en "Selección de motivo negado" / "Selección de motivo parcialidad"; "Confirmar" requiere un motivo elegido. Al resolver el último producto SHALL abrir la confirmación de finalizar.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:185-192, 417-464`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckScreen.tsx:353-358, 374-420`, `src/components/organisms/DiscrepancyManagerModal/DiscrepancyManagerModal.tsx:81-157`, `src/utils/assortmentCheck.ts:74-78`, `src/i18n/es.ts:27-28, 201-202, 253-255` (OBSERVADA)

#### Scenario: Negar un producto sin revisar
- GIVEN un producto con 5 surtidas y 0 revisadas en el gestor de discrepancias
- WHEN el usuario pulsa "Negar", elige un motivo y confirma
- THEN el producto queda con negación pendiente y se muestra el siguiente producto con diferencia o la confirmación de finalizar

#### Scenario: Marcar parcialidad
- GIVEN un producto con 5 surtidas y 3 revisadas
- WHEN el usuario abre el gestor
- THEN el botón dice "Marcar parcialidad" y la diferencia mostrada es -2

### Requirement: Motivos de negación del catálogo
WHEN se abre la pantalla de revisión sin motivos de negación cargados, el sistema SHALL consultarlos; IF la consulta falla THEN SHALL mostrar el error "Error al cargar los motivos de rechazo, intente más tarde."; IF el usuario intenta negar sin motivos disponibles THEN SHALL mostrar "No se encontraron motivos de rechazo.".
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:78-98, 173-184, 417-429`, `src/i18n/es.ts:328-329` (OBSERVADA)

#### Scenario: Catálogo no disponible
- GIVEN el servicio de motivos no responde
- WHEN el usuario abre la revisión
- THEN ve "Error al cargar los motivos de rechazo, intente más tarde."

### Requirement: Regresar a revisión descarta negaciones pendientes
IF el usuario regresa a la revisión desde el gestor o desde la confirmación de finalizar habiendo negaciones pendientes THEN el sistema SHALL preguntar "¿Regresar a revisión?" ("Al regresar a la pantalla de revisión, se restablecerán los productos que se negaron como faltantes." / "Tendrás que volver a negarlos al terminar."); al confirmar SHALL borrar todas las negaciones pendientes y al cancelar SHALL volver al modal de origen. Al salir de la pantalla se descarta todo el estado de revisión.
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:100-109, 150-158, 386-415, 466-469`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckScreen.tsx:359-373`, `src/rtk/slices/assortmentCheck.ts:54-59`, `src/rtk/store/store.ts:34`, `src/i18n/es.ts:256-258` (OBSERVADA)
[NEEDS CLARIFICATION: salir no pide confirmación ni guarda el avance; ¿es intencional?]

#### Scenario: Regresar con negaciones
- GIVEN el usuario negó un producto y está en la confirmación de finalizar
- WHEN pulsa cancelar y confirma "¿Regresar a revisión?"
- THEN la negación se borra y vuelve a la lista

#### Scenario: Salir de la revisión
- GIVEN el usuario tiene revisión parcial
- WHEN sale de la pantalla
- THEN el avance se pierde y no se conserva al reabrir

### Requirement: Envío de la revisión y manejo de fallas
WHEN el usuario confirma finalizar, el sistema SHALL enviar la tarea, el usuario, el pedido, la sucursal y, por producto, la cantidad surtida, la revisada, el motivo de negación (0 si no hay) y el método de revisión (simplificada, 100% escaneo; se omite en captura manual o negado sin revisión); IF el envío tiene éxito THEN SHALL mostrar "Revisión finalizada" con el mensaje del servidor y regresar; IF el servidor responde con error THEN SHALL mostrar ese mensaje; IF falla la comunicación THEN SHALL mostrar "Tarea incompleta" con "Hubo un error de red al finalizar la revisión. Por favor, acércate a un access point y vuelve a intentarlo." y "Reintentar".
Evidencia: `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:215-270`, `src/utils/formats.ts:156-179`, `src/services/AssortmentCheckServices.ts:16-21`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckScreen.tsx:421-437`, `src/i18n/es.ts:36, 177, 259, 369` (OBSERVADA)

#### Scenario: Finalización exitosa
- GIVEN el usuario confirma "Finalizar revisión" con conexión
- WHEN el servidor responde con éxito
- THEN ve "Revisión finalizada" y regresa a la pantalla anterior

#### Scenario: Sin red
- GIVEN el dispositivo pierde la conexión
- WHEN el usuario confirma finalizar
- THEN ve "Tarea incompleta" con el aviso de red y puede pulsar "Reintentar"

## Historial
- 2026-10-22 · map: inventario inicial
- 2026-10-22 · map: división de requisitos de más de 120 palabras (principio 8)
