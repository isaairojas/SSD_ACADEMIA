# Capacidad: recepcion-mercancia

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al usuario registrar la mercancía de una orden/papeleta de recepción (traspaso): escanear el producto, contar piezas con el código del proveedor, confirmarlo con su etiqueta, corregir cantidades, pausar o terminar la tarea. Al terminar, si hay productos que requieren etiqueta, pasa a `etiquetado-recepcion`.
Deuda observada: la búsqueda del producto en la corrección usa `products[0]` para decidir la bandera de split; `handleBack` no maneja fallo de `stopTask`; `handleFinish` deja el loading activo si falla `endReceptionTask`. Quedó fuera: cómo se inicia la tarea (ver `asignacion-tarea`) y detalle visual de `ReceptionTasksScreen`.

## Requisitos

### Requirement: Inicio de la recepción
WHEN el usuario entra a la recepción (tomando la tarea con actividad de recepción, o abriendo `ReceptionMerch` en web), el sistema SHALL cargar los productos de la orden y papeleta con `start-reception-progress` y mostrar "Recepción de traspaso: " seguido del número de orden y la etiqueta "RETAIL".
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:110-127`, `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:358-394`, `src/services/ReceptionMerchServices.ts:30-35`, `src/i18n/es.ts:128-129` (OBSERVADA)
[NEEDS CLARIFICATION: en web `onRefresh` se ejecuta siempre al montar y también al jalar para refrescar; ¿es intencional reiniciar el progreso en cada refresco?]

#### Scenario: Entrada a la recepción
- GIVEN el usuario tiene asignada una tarea de recepción de la orden 123
- WHEN el sistema abre la pantalla de recepción
- THEN ve "Recepción de traspaso: 123" con los productos pendientes de confirmar

#### Scenario: Falla al cargar
- GIVEN el servicio responde con error al refrescar
- WHEN el usuario jala para refrescar
- THEN ve una alerta de error con el mensaje del servidor

### Requirement: Productos pendientes
El sistema SHALL listar solo los productos de la orden que aún no están confirmados.
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:93-95` (OBSERVADA)

#### Scenario: Producto confirmado sale de la lista
- GIVEN un producto fue confirmado
- WHEN se actualiza la lista
- THEN el producto ya no aparece en la tabla de pendientes

### Requirement: Escaneo del código APYMSA
WHEN el usuario escanea un código en "Escanear código", el sistema SHALL buscar el producto por código de producto o SKU del proveedor y consultar al servidor si ya fue confirmado; IF no está confirmado THEN SHALL cargar su detalle (imagen, ubicación, existencia, rack, nivel) usando el código equivalente devuelto.
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:46-60, 163-214`, `src/services/ReceptionMerchServices.ts:67-72`, `src/i18n/es.ts:130` (OBSERVADA)
[NEEDS CLARIFICATION: si `equivalentCode` no coincide con ningún producto de la lista, `findIndex` devuelve -1 y se accede a `products[-1]`; no hay manejo explícito. El mensaje `receptionApymsaSupplierNotFound` existe en es.ts:285 pero no se usa en este controlador.]

#### Scenario: Producto válido sin confirmar
- GIVEN el producto 1234567 está en la orden y no confirmado
- WHEN el usuario escanea 1234567
- THEN ve el detalle del producto y puede capturar el código del proveedor

### Requirement: Producto no encontrado o ya confirmado
IF el código escaneado no corresponde a ningún producto de la tarea THEN el sistema SHALL mostrar "Este producto no se encuentra en la tarea, por favor solicita apoyo en el corporativo APYMSA."; IF el servidor indica que el producto ya fue confirmado THEN SHALL mostrar el mensaje que devuelve el servidor.
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:186-190, 201-207`, `src/i18n/es.ts:283, 288` (OBSERVADA)
[NEEDS CLARIFICATION: es.ts:288 define `receptionConfirmed` ("El producto capturado ya ha sido ingresado y confirmado...") pero el controlador muestra `res.message`; ¿cuál es el texto vigente?]

#### Scenario: Código ajeno a la tarea
- GIVEN el código escaneado no está en la orden
- WHEN el usuario lo captura
- THEN ve el error con indicación de pedir apoyo al corporativo APYMSA

### Requirement: Validación por split del proveedor
WHILE la bandera `supplierSplitValidation` del primer producto esté activa, IF el código no coincide exactamente con producto ni SKU THEN el sistema SHALL buscar de nuevo usando solo los primeros 7 dígitos del código como producto.
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:39-60` (OBSERVADA)

#### Scenario: Código de proveedor largo
- GIVEN `supplierSplitValidation` activa y el producto 1234567 en la orden
- WHEN el usuario escanea 12345670001
- THEN el sistema reconoce el producto 1234567

### Requirement: Conteo por pieza con código del proveedor
WHEN el usuario escanea el código del proveedor del producto en curso, el sistema SHALL registrar una pieza recibida (`add-product-received`) con empleado, papeleta, sucursal, SKU y proveedor, incrementar el conteo local y reabrir el escáner para la siguiente pieza.
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:221-256`, `src/services/ReceptionMerchServices.ts:43-47` (OBSERVADA)

#### Scenario: Pieza contada
- GIVEN el producto en curso es 1234567 con conteo 2
- WHEN el usuario escanea su código de proveedor
- THEN el conteo pasa a 3 y el escáner queda listo para otra pieza

### Requirement: Código de proveedor inválido
IF el código del proveedor está vacío THEN el sistema SHALL mostrar "Por favor, captura un código para poder continuar."; IF excede 30 caracteres THEN SHALL mostrar el error de código inválido; IF corresponde a otro producto THEN SHALL mostrar "El código que intentas escanear es distinto al que estás recibiendo, escanea otro código o confirma el actual."
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:249-253, 312-324`, `src/i18n/es.ts:284, 286` (OBSERVADA)

#### Scenario: Código de otro producto
- GIVEN el producto en curso es A
- WHEN el usuario escanea el código del proveedor de B
- THEN ve "El código que intentas escanear es distinto al que estás recibiendo..." y no se cuenta la pieza

### Requirement: Confirmación del producto
WHEN el usuario pulsa "Confirmar" con un producto en curso y escanea su etiqueta en "Escanear etiqueta", el sistema SHALL confirmar el producto (`confirm-product-received`) y retirarlo de la lista de pendientes; IF el código es de otro producto THEN SHALL mostrar el mismo error de código distinto.
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:268-304, 337-343`, `src/services/ReceptionMerchServices.ts:55-59`, `src/i18n/es.ts:132` (OBSERVADA)

#### Scenario: Confirmación exitosa
- GIVEN el producto en curso tiene piezas contadas
- WHEN el usuario escanea su etiqueta
- THEN el producto queda confirmado y desaparece de pendientes

### Requirement: Edición de cantidad recibida
WHEN el usuario pulsa "Editar" y captura un producto, el sistema SHALL consultar la cantidad esperada y la contada y permitir capturar una cantidad numérica; IF la cantidad difiere de la esperada THEN SHALL mostrar un aviso de diferencia antes de enviar la corrección (`count-correction`).
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:159-161, 396-489`, `src/services/ReceptionMerchServices.ts:82-113`, `src/i18n/es.ts:133, 289` (OBSERVADA)
[NEEDS CLARIFICATION: el texto del aviso de diferencia vive en la pantalla (modal de advertencia); no se verificó su literal. Si el producto no existe se muestra "Este producto no existe en el cátalogo actual de APYMSA."]

#### Scenario: Cantidad distinta a la esperada
- GIVEN la cantidad esperada es 10
- WHEN el usuario captura 8 y confirma
- THEN ve el aviso de diferencia y, al aceptar, se envía la corrección con 8

### Requirement: Pausar la recepción
WHEN el usuario intenta salir (botón o retroceso del dispositivo), el sistema SHALL preguntar "¿Realmente deseas salir de la tarea de recepción?" y, al confirmar, detener la tarea (`stopTask`), limpiar la recepción y volver a Inicio.
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:97-106, 491-502`, `src/i18n/es.ts:134` (OBSERVADA)

#### Scenario: Salir de la tarea
- GIVEN el usuario tiene la recepción abierta
- WHEN pulsa retroceso y confirma
- THEN la tarea se detiene y regresa al menú principal

### Requirement: Terminar la recepción
WHEN el usuario pulsa "Finalizar" y confirma "¿Deseas terminar con la descarga del traspaso?", el sistema SHALL enviar `end-reception` con orden, papeleta, sucursal, empleado y almacén del primer producto; IF algún producto con conteo mayor a 0 requiere impresión THEN SHALL navegar a `PrintReception`, y si no THEN SHALL volver a Inicio con "Tarea de traspaso finalizada" / "Se ha finalizado la tarea exitosamente."
Evidencia: `src/views/HomeStack/ReceptionTasks/ReceptionTasksController.tsx:504-538`, `src/services/ReceptionMerchServices.ts:121-125`, `src/i18n/es.ts:135, 138-139` (OBSERVADA)
[NEEDS CLARIFICATION: se puede finalizar sin haber confirmado todos los productos; ¿la validación es del servidor? La tabla vacía solo avisa "Ya has ingresado todos los productos correspondientes a este traspaso." al intentar escanear.]

#### Scenario: Finalizar sin productos con etiqueta
- GIVEN ningún producto recibido requiere etiqueta
- WHEN el usuario confirma la finalización
- THEN regresa a Inicio y ve "Tarea de traspaso finalizada"

#### Scenario: Finalizar con productos con etiqueta
- GIVEN un producto perecedero con conteo mayor a 0
- WHEN el usuario confirma la finalización
- THEN pasa a la impresión de etiquetas

## Historial
- 2026-10-22 · map: inventario inicial
