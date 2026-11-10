# Capacidad: etiquetado-recepcion

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Tras finalizar la recepción, permite imprimir etiquetas únicas por producto (con fecha de caducidad o de fabricación según el tipo), validarlas escaneándolas con la HandHeld, reimprimirlas o editar su fecha, y registrar el kardex de las etiquetas. Es la continuación de `recepcion-mercancia`.
Deuda observada: `handleKardex` arma las etiquetas con el producto de `currentIndex` para todas; el servicio `validateKey` (`skip-printing`) existe pero ningún controlador lo invoca; el mensaje de exceso de etiquetas está literal en el código y no en `es.ts`; el temporizador de escaneo en `handleInputChange` lee `tagScan` desactualizado. Quedó fuera: detalle visual de las pantallas y los reducers `receptionMerch`.

## Requisitos

### Requirement: Selección del siguiente producto a etiquetar
WHEN se abre "Impresión de etiquetas del traspaso " con el número de orden, el sistema SHALL tomar el primer producto con conteo mayor a 0, no validado y cuyo tipo de impresión no sea "no imprimir", y mostrar su detalle; IF no queda ninguno THEN SHALL limpiar la recepción y volver a Inicio con "Tarea finalizada" / "Tarea de etiquetado finalizada".
Evidencia: `src/views/HomeStack/PrintReceptionTask/PrintReceptionTaskController.tsx:46-80, 164-177`, `src/i18n/es.ts:140, 292-293` (OBSERVADA)

#### Scenario: Quedan productos por etiquetar
- GIVEN dos productos perecederos recibidos y ninguno validado
- WHEN el usuario abre la impresión
- THEN ve el primero con "Cantidad de etiquetas disponibles: " igual a su conteo

#### Scenario: Todo etiquetado
- GIVEN todos los productos con etiqueta ya fueron validados
- WHEN se evalúa el siguiente producto
- THEN regresa a Inicio con "Tarea de etiquetado finalizada"

### Requirement: Tipo de impresión por producto
El sistema SHALL determinar el tipo de impresión del producto con sus banderas: misceláneo o sin ninguna bandera (perecedero, batería, requiere etiqueta) no imprime; batería con o sin perecedero (si no es solo batería) es BATERÍA; perecedero (con o sin etiqueta) es PERECEDERO; solo "requiere etiqueta" es NO PERECEDERO; solo batería no imprime.
Evidencia: `src/utils/services.tsx:80-100` (OBSERVADA)

#### Scenario: Producto solo con etiqueta
- GIVEN un producto con `needTag` verdadero y las demás banderas falsas
- WHEN se calcula su tipo
- THEN el tipo es NO PERECEDERO y no pide fecha

### Requirement: Cantidad de etiquetas a imprimir
El sistema SHALL proponer como cantidad inicial el conteo recibido menos las etiquetas ya impresas; IF el usuario captura más que lo pendiente THEN SHALL mostrar "La cantidad etiquetas a imprimir no puede ser mayor a la cantidad de productos recibidos"; IF deja el campo vacío al terminar de editar THEN SHALL usar 1.
Evidencia: `src/views/HomeStack/PrintReceptionTask/PrintReceptionTaskController.tsx:88-94, 217-245`, `src/i18n/es.ts:145-147` (OBSERVADA)
[NEEDS CLARIFICATION: el spinner (`handleSpinnerInput`) no valida límites mínimo ni máximo; ¿se debe impedir 0, negativos o exceder lo pendiente con los botones?]

#### Scenario: Cantidad excedida
- GIVEN quedan 3 etiquetas pendientes
- WHEN el usuario teclea 5
- THEN ve el error de cantidad y el valor no se cambia

### Requirement: Fecha de caducidad de perecederos
WHEN el producto es perecedero, el sistema SHALL pedir "Por favor ingresa la fecha de caducidad del producto:" con día, mes y año, y SHALL aceptar imprimir solo si la fecha es válida; IF no lo es THEN SHALL mostrar "Por favor ingresa una fecha válida".
Evidencia: `src/views/HomeStack/PrintReceptionTask/PrintReceptionTaskController.tsx:134-148, 263-274`, `src/i18n/es.ts:142, 291` (OBSERVADA)
[NEEDS CLARIFICATION: `validateDate` (src/utils/calendar) no se leyó; ¿una fecha pasada es válida para un perecedero?]

#### Scenario: Fecha inválida
- GIVEN un producto perecedero
- WHEN el usuario elige 31 de febrero y pulsa imprimir
- THEN ve "Por favor ingresa una fecha válida" y no se imprime

### Requirement: Fecha de fabricación de baterías
WHEN el producto es batería, el sistema SHALL pedir "Por favor ingresa la fecha de fabricación de la batería:" con mes y año, fijar el día en 01 y SHALL aceptar imprimir solo si la fecha es menor a la actual; IF no lo es THEN SHALL mostrar "Ingresa una fecha menor a la actual".
Evidencia: `src/views/HomeStack/PrintReceptionTask/PrintReceptionTaskController.tsx:118-133, 248-262`, `src/i18n/es.ts:143, 290` (OBSERVADA)

#### Scenario: Batería con fecha futura
- GIVEN un producto batería
- WHEN el usuario elige un mes y año posteriores al actual
- THEN ve "Ingresa una fecha menor a la actual" y no se imprime

### Requirement: Solicitud de impresión
WHEN el usuario confirma la impresión, el sistema SHALL enviar a `print-tag` empleado, fecha (nula si no requiere), proveedor, número de etiquetas y banderas del producto; IF tiene éxito THEN SHALL actualizar las etiquetas impresas, guardar las etiquetas devueltas y mostrar "Acción realizada" / "Se ha enviado la solicitud de impresión de etiquetas de manera exitosa."; IF falla THEN SHALL mostrar el mensaje del servidor. IF la cantidad está vacía THEN SHALL mostrar "Por favor ingresa una cantidad válida".
Evidencia: `src/views/HomeStack/PrintReceptionTask/PrintReceptionTaskController.tsx:280-324`, `src/services/ReceptionMerchServices.ts:147-161`, `src/i18n/es.ts:295-297` (OBSERVADA)

#### Scenario: Impresión exitosa
- GIVEN un producto no perecedero con 3 etiquetas pendientes
- WHEN el usuario confirma imprimir 3
- THEN ve "Se ha enviado la solicitud de impresión de etiquetas de manera exitosa."

### Requirement: Paso a validación de etiquetas
WHEN las etiquetas impresas del producto igualan su conteo recibido, el sistema SHALL navegar a "Validación de etiquetas" (`ValidatePrintReception`) con ese producto.
Evidencia: `src/views/HomeStack/PrintReceptionTask/PrintReceptionTaskController.tsx:100-106`, `src/i18n/es.ts:65` (OBSERVADA)

#### Scenario: Todas impresas
- GIVEN se imprimió el total de etiquetas del producto
- WHEN se actualiza el estado
- THEN se abre la validación de etiquetas de ese producto

### Requirement: Validación de etiqueta por escaneo
WHEN el usuario escanea con la HandHeld una etiqueta (QR de al menos 49 caracteres) de la lista, el sistema SHALL confirmarla con `ConfirmarImpresionEtiqueta` y marcarla validada; IF tiene menos de 49 caracteres o no está en la lista THEN SHALL mostrar "La etiqueta no coincide"; IF ya estaba validada THEN SHALL mostrar el aviso "Etiqueta validada" / "Esta etiqueta ya fue validada, por favor escanea la etiqueta correcta"; IF el servidor rechaza THEN SHALL mostrar su mensaje.
Evidencia: `src/views/HomeStack/ValidatePrintReceptionTask/ValidatePrintReceptionTaskController.tsx:336-389`, `src/services/ReceptionMerchServices.ts:196-206`, `src/i18n/es.ts:303-305` (OBSERVADA)
[NEEDS CLARIFICATION: la longitud 49 está fija en código; ¿corresponde al formato vigente del QR?]

#### Scenario: Etiqueta correcta
- GIVEN hay una etiqueta pendiente de validar
- WHEN el usuario escanea su QR
- THEN la etiqueta queda marcada como validada

#### Scenario: Etiqueta ya validada
- GIVEN la etiqueta ya fue validada
- WHEN el usuario la vuelve a escanear
- THEN ve "Esta etiqueta ya fue validada, por favor escanea la etiqueta correcta"

### Requirement: Entrada solo por escáner
WHILE no haya un modal abierto, el sistema SHALL mantener el foco en el campo de escaneo; IF el texto capturado permanece incompleto 3 segundos THEN SHALL mostrar "Por favor utiliza el escaner de la HandHeld para validar las etiquetas".
Evidencia: `src/views/HomeStack/ValidatePrintReceptionTask/ValidatePrintReceptionTaskController.tsx:213-231, 402-413`, `src/i18n/es.ts:298` (OBSERVADA)
[NEEDS CLARIFICATION: el temporizador compara con el valor previo de `tagScan` (cierre desactualizado); su efecto real es dudoso.]

#### Scenario: Captura manual
- GIVEN el usuario teclea en lugar de escanear
- WHEN pasan 3 segundos con texto incompleto
- THEN ve el aviso de usar el escáner de la HandHeld

### Requirement: Reimpresión y edición de etiqueta
WHEN el usuario reimprime una etiqueta, el sistema SHALL llamar `reprint-tag` y mostrar "Etiqueta reimpresa" / "Se reimprimió correctamente"; WHEN edita la fecha de una etiqueta (con las mismas reglas de fecha de perecedero o batería), SHALL actualizar la fecha (`expiration-date`), reimprimirla y mostrar "Etiqueta editada" / "Se editó y reimprimió correctamente"; IF la reimpresión falla THEN SHALL mostrar "Error al re-imprimir la etiqueta, espere unos minutos e intente de nuevo".
Evidencia: `src/views/HomeStack/ValidatePrintReceptionTask/ValidatePrintReceptionTaskController.tsx:240-334`, `src/services/ReceptionMerchServices.ts:170-187`, `src/i18n/es.ts:299-302, 325` (OBSERVADA)
[NEEDS CLARIFICATION: si `editTag` no tiene éxito, `editTagProcess` no desactiva el indicador de carga ni avisa al usuario.]

#### Scenario: Cambio de caducidad
- GIVEN una etiqueta de perecedero impresa con fecha errónea
- WHEN el usuario edita la fecha a una válida
- THEN la etiqueta se actualiza, se reimprime y ve "Se editó y reimprimió correctamente"

### Requirement: Cierre del producto y kardex
WHEN todas las etiquetas del producto están validadas, el sistema SHALL enviar el kardex de etiquetas (`kardex-tags`), limpiar las etiquetas, marcar el producto como validado y volver a "Impresión de etiquetas" para el siguiente producto.
Evidencia: `src/views/HomeStack/ValidatePrintReceptionTask/ValidatePrintReceptionTaskController.tsx:110-124, 136-159`, `src/services/ReceptionMerchServices.ts:216-223` (OBSERVADA)

#### Scenario: Última etiqueta validada
- GIVEN queda una etiqueta por validar
- WHEN el usuario la escanea
- THEN se registra el kardex y se pasa al siguiente producto o se termina la tarea

### Requirement: Omitir impresión y validación
WHEN el usuario pulsa "No puedo imprimir etiquetas" y confirma "¿Estás seguro que deseas omitir el proceso de impresión y validación de etiquetas?", el sistema SHALL enviar el kardex de las etiquetas existentes, limpiar la recepción y volver a Inicio con "Tarea finalizada" / "Tarea de etiquetado finalizada".
Evidencia: `src/views/HomeStack/PrintReceptionTask/PrintReceptionTaskController.tsx:179-184`, `src/views/HomeStack/PrintReceptionTask/PrintReceptionTaskScreen.tsx:356-359, 412-418`, `src/views/HomeStack/ValidatePrintReceptionTask/ValidatePrintReceptionTaskController.tsx:233-238`, `src/i18n/es.ts:19, 144` (OBSERVADA)
[NEEDS CLARIFICATION: el servicio `skip-printing` (`validateKey`) no se invoca; la confirmación no pide clave aunque el estado se llame `validateKeyModal`. ¿Debe pedirse clave o autorización de un rol (`roleId` 2, 4, 6, 9)? Además, los productos sin etiquetas impresas no quedan registrados en el kardex.]

#### Scenario: Omitir el proceso
- GIVEN el usuario no puede imprimir
- WHEN confirma omitir
- THEN regresa a Inicio con "Tarea de etiquetado finalizada"

## Historial
- 2026-10-22 · map: inventario inicial
