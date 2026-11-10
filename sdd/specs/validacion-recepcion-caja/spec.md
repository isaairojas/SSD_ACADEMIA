# Capacidad: validacion-recepcion-caja

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al personal con rol autorizado validar las cajas que llegan a la sucursal (packing list) escaneando la etiqueta de envío, registrar las cajas descargadas, evaluar al proveedor/paquetería y confirmar la descarga. El reporte de la incidencia de una caja se especifica en `reporte-incidencia-caja`.
Deuda observada: los errores de red al registrar un escaneo se descartan en silencio (la pantalla queda sin pintar); la confirmación de descarga no maneja errores; el alta automática de traspasos rezagados ocurre al abrir el modal de evaluación y sus fallos se ignoran; varios textos del modal de evaluación ("Evaluación de proveedor", "Cargando formulario...", "Agrega un comentario sobre tu experiencia con la paquetería", "Máx 500 caracteres", "No se pudieron cargar las preguntas de evaluación", "Cancelar", "Guardando...", "Aceptar") están fijos en el código y no en `es.ts`.

## Requisitos

### Requirement: Acceso a la opción de validar mercancía
WHEN el usuario tiene `roleId` 2, 4, 6 o 9 y la sucursal tiene activa la bandera `Bandera_PackingListRecepcion`, el sistema SHALL mostrar en el menú principal la opción "Validar mercancía recibida".
Evidencia: `src/views/HomeStack/Home/HomeController.tsx:28-30, 111`, `src/views/HomeStack/Home/HomeScreen.tsx:43-48`, `src/i18n/es.ts:92` (OBSERVADA)
[NEEDS CLARIFICATION: el código solo oculta la opción en el menú; no se vio una validación de rol/bandera en la propia ruta. ¿Es suficiente? Nombre funcional de cada rol por definir.]

#### Scenario: Rol autorizado con bandera activa
- GIVEN el usuario tiene `roleId` 4 y la sucursal tiene activa `Bandera_PackingListRecepcion`
- WHEN abre el menú principal
- THEN ve la opción "Validar mercancía recibida"

#### Scenario: Rol no autorizado
- GIVEN el usuario tiene `roleId` 3
- WHEN abre el menú principal
- THEN no ve la opción "Validar mercancía recibida"

#### Scenario: Bandera inactiva
- GIVEN el usuario tiene `roleId` 2 y la bandera `Bandera_PackingListRecepcion` no está activa en su sucursal
- WHEN abre el menú principal
- THEN no ve la opción

### Requirement: Formato de la etiqueta de caja
WHEN el usuario escanea un código en la pantalla de validación, el sistema SHALL conservar solo los dígitos y, al terminar el escaneo, aceptarlo únicamente si tiene 14 dígitos: 8 de pedido, 3 de número de caja y 3 de total de cajas, todos distintos de cero; IF no cumple THEN SHALL mostrar "Error de escaneo" con "El código de barras escaneado no corresponde a una caja." y limpiar el campo.
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:134-137, 299-341, 353-360`, `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsScreen.tsx:288` (OBSERVADA)

#### Scenario: Código con longitud incorrecta
- GIVEN el usuario está en "Validar mercancía recibida"
- WHEN escanea un código de 12 dígitos
- THEN ve la advertencia "Error de escaneo" con "El código de barras escaneado no corresponde a una caja." y el campo se limpia

#### Scenario: Código con segmento en cero
- GIVEN el usuario está en la pantalla de validación
- WHEN escanea un código de 14 dígitos cuyo número de caja es 000
- THEN ve la misma advertencia y no se consulta el pedido

### Requirement: Consulta y registro de la caja escaneada
WHEN se escanea una etiqueta válida, el sistema SHALL consultar la caja por pedido, número de caja y sucursal, registrar la validación y el escaneo de la caja en el servidor y mostrar pedido, número de caja, no. de papeleta, peso, no. de guía y "Cajas descargadas" con formato "descargadas / total".
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:139-297, 454-459`, `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsScreen.tsx:183-193, 239-267`, `src/services/ValidateReceivedGoodsServices.ts:18-110`, `src/i18n/es.ts:74-80` (OBSERVADA)
[NEEDS CLARIFICATION: si falla el registro de la validación o del escaneo no se muestra nada ni se avisa; ¿debe avisarse al usuario?]

#### Scenario: Caja válida de la sucursal
- GIVEN el usuario escanea una caja del pedido 12345678 que pertenece a su sucursal
- WHEN el servidor registra la validación y el escaneo
- THEN ve el pedido, la caja, la papeleta, el peso (o "--- kg" si es 0) y "Cajas descargadas" con el contador, y se muestra "Hora de inicio" con la hora actual

#### Scenario: Falla el registro
- GIVEN el servidor rechaza el registro de la validación o del escaneo
- WHEN el usuario escanea la caja
- THEN no se muestra nada y el campo se limpia, sin mensaje de error

### Requirement: Pedido no activo
IF el servidor responde con `orderId` 0 al consultar la caja THEN el sistema SHALL mostrar el error "Error de escaneo" con "La caja no pertenece a ningún pedido activo.." y limpiar la información mostrada.
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:148-166`, `src/i18n/es.ts:360, 362` (OBSERVADA)

#### Scenario: Caja de pedido inexistente
- GIVEN la caja escaneada no pertenece a un pedido activo
- WHEN el usuario la escanea
- THEN ve "La caja no pertenece a ningún pedido activo.." y los datos de la caja se vacían

### Requirement: Caja de otra sucursal
IF la caja escaneada pertenece a una sucursal distinta a la del usuario THEN el sistema SHALL mostrar la advertencia "Caja errónea" con "La caja escaneada no pertenece a esta sucursal ni a los pedidos vigentes." y no mostrar sus datos, pero SHALL conservarla en la lista de escaneadas para el resumen.
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:204-243`, `src/i18n/es.ts:366-367` (OBSERVADA)
[NEEDS CLARIFICATION: la caja errónea ya queda registrada en el servidor (validación y escaneo) antes de la advertencia; ¿es intencional?]

#### Scenario: Caja errónea
- GIVEN el usuario de la sucursal "Norte" escanea una caja de la sucursal "Sur"
- WHEN termina el escaneo
- THEN ve "Caja errónea" y la pantalla no muestra los datos de la caja

### Requirement: Contador de cajas descargadas
WHILE se escanean cajas del mismo pedido, el sistema SHALL incrementar en uno "Cajas descargadas" por cada escaneo; WHEN la caja es de otro pedido, SHALL iniciar el conteo en el número de cajas escaneadas de ese pedido en la sesión más uno.
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:249, 343-346`, `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsScreen.tsx:183-193` (OBSERVADA)
[NEEDS CLARIFICATION: el contador se incrementa también al re-escanear la misma caja (el servidor lo refleja en `IsNew` pero no el contador mostrado); ¿es el comportamiento deseado?]

#### Scenario: Segunda caja del mismo pedido
- GIVEN se escaneó la caja 1 de 3 del pedido 12345678 y se muestra "1 / 3"
- WHEN el usuario escanea la caja 2 de ese pedido
- THEN ve "2 / 3"

### Requirement: Botones y bloqueo de navegación durante la validación
WHILE hay una caja en validación (o un código de 14 dígitos válido en el campo), el sistema SHALL deshabilitar el botón de regresar; el botón "Finalizar" SHALL permanecer deshabilitado hasta que se haya escaneado al menos una caja; el campo de escaneo SHALL recuperar el foco automáticamente salvo que haya un modal abierto.
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:58-68, 270-274, 362-364, 469-478`, `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsScreen.tsx:296-308` (OBSERVADA)

#### Scenario: Finalizar sin escaneos
- GIVEN el usuario no ha escaneado ninguna caja
- WHEN mira la pantalla
- THEN el botón "Finalizar" está deshabilitado

### Requirement: Evaluación de proveedor
WHEN el usuario pulsa "Finalizar", el sistema SHALL cargar el formulario de evaluación de proveedor y mostrarlo en un modal con la pregunta y sus opciones de calificación; SHALL habilitar "Aceptar" solo si hay una calificación seleccionada y, IF la calificación es 1 o 2 THEN SHALL exigir además un comentario no vacío de hasta 500 caracteres. IF el formulario no carga THEN SHALL mostrar el error general con "No se pudo cargar el formulario de evaluación".
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:76-126`, `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsScreen.tsx:195-205, 311-403`, `src/services/ValidateReceivedGoodsServices.ts:116-134` (OBSERVADA)
[NEEDS CLARIFICATION: confirmar el literal de `errorsText.errorGeneral`, no consultado.]

#### Scenario: Calificación baja sin comentario
- GIVEN el modal de evaluación está abierto y el usuario elige la calificación 2
- WHEN no escribe comentario
- THEN el botón "Aceptar" permanece deshabilitado

#### Scenario: Calificación alta
- GIVEN el usuario elige la calificación 5
- WHEN revisa el modal
- THEN "Aceptar" está habilitado y no se pide comentario

#### Scenario: Falla al cargar el formulario
- GIVEN el servicio del formulario falla
- WHEN el usuario pulsa "Finalizar"
- THEN ve el error general con "No se pudo cargar el formulario de evaluación"

### Requirement: Traspaso rezagado automático al evaluar
WHEN se abre el modal de evaluación, el sistema SHALL verificar, por cada pedido escaneado, si existe el traspaso rezagado en la sucursal y, IF no existe THEN SHALL registrarlo con fechas de elaboración y recepción iguales a la actual, 0 días de rezago y la justificación "Traspaso registrado automáticamente por validación de recepción".
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:85-114`, `src/services/ValidateReceivedGoodsServices.ts:136-198` (OBSERVADA)
[NEEDS CLARIFICATION: los fallos de esta verificación/registro se ignoran en silencio y no bloquean la evaluación; también ocurre si luego el usuario cancela el modal. ¿Es intencional?]

#### Scenario: Pedido sin traspaso
- GIVEN se escaneó una caja del pedido 12345678 que no tiene traspaso rezagado
- WHEN el usuario abre el modal de evaluación
- THEN se registra el traspaso automático para ese pedido

### Requirement: Guardado de la evaluación al finalizar
WHEN el usuario acepta el modal con una calificación, el sistema SHALL guardar la evaluación (calificación y comentario) de cada pedido escaneado; IF alguna falla THEN SHALL mostrar "Error al guardar evaluación" con "Ocurrió un error al tratar de guardar la evaluación del proveedor" y no avanzar.
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:370-420`, `src/services/ValidateReceivedGoodsServices.ts:139-156`, `src/i18n/es.ts:363-364` (OBSERVADA)

#### Scenario: Evaluación guardada
- GIVEN el usuario escaneó cajas de dos pedidos y eligió la calificación 4
- WHEN pulsa "Aceptar"
- THEN se guarda la evaluación de ambos pedidos y navega al resumen de descarga

#### Scenario: Falla al guardar
- GIVEN el servicio rechaza la evaluación de un pedido
- WHEN el usuario pulsa "Aceptar"
- THEN ve "Error al guardar evaluación" y permanece en la pantalla

### Requirement: Resumen de cajas recibidas
WHEN el usuario finaliza, el sistema SHALL mostrar "Resumen de cajas recibidas" con las cajas descargadas por pedido de su sucursal y, IF hay cajas de otra sucursal THEN SHALL listarlas aparte en "Cajas erróneas recibidas".
Evidencia: `src/views/HomeStack/ConfirmDownloadValidation/ConfirmDownloadValidationScreen.tsx:100-147`, `src/i18n/es.ts:4, 233-234` (OBSERVADA)
[NEEDS CLARIFICATION: la evaluación de proveedor se guarda antes de confirmar; si el usuario cancela en el resumen, la evaluación ya quedó guardada.]

#### Scenario: Con cajas erróneas
- GIVEN entre lo escaneado hay una caja de otra sucursal
- WHEN el usuario ve el resumen
- THEN la caja aparece bajo "Cajas erróneas recibidas" y no se envía en la confirmación

### Requirement: Confirmación de la descarga
WHEN el usuario pulsa "Continuar" en el resumen, el sistema SHALL completar la validación de cada pedido de su sucursal enviando solo las cajas nuevas (`NewBoxes`) y regresar a una pantalla de validación limpia.
Evidencia: `src/views/HomeStack/ConfirmDownloadValidation/ConfirmDownloadValidationController.tsx:19-44`, `src/services/ValidateReceivedGoodsServices.ts:96-106` (OBSERVADA)
[NEEDS CLARIFICATION: IF no hay cajas de la sucursal del usuario, "Continuar" no hace nada (no navega ni avisa); IF falla la finalización no se maneja el error. ¿Qué debe ocurrir?]

#### Scenario: Confirmación con cajas correctas
- GIVEN el usuario finalizó con cajas de su sucursal
- WHEN pulsa "Continuar" en "Resumen de cajas recibidas"
- THEN se completa la validación de cada pedido y vuelve a "Validar mercancía recibida" vacía, con Inicio debajo en la pila

## Historial
- 2026-10-22 · map: inventario inicial
- 2026-10-22 · map: división de requisitos de más de 120 palabras (principio 8)
