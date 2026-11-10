# Capacidad: evidencia-embarque

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al usuario ver los embarques de su sucursal que requieren evidencia fotográfica de envío, consultar su detalle y registrar la foto del documento de embarque (con la cámara o, si la sucursal lo permite, desde la galería). El contador de evidencias pendientes del menú se especifica en `menu-inicio`.

Deuda observada: el mensaje `shipmentsCanNotBeLoaded` ("No se pudieron cargar los envíos pendientes de evidencia.") existe en `src/i18n/es.ts:331` pero no se usa en ninguna pantalla; la falla al cargar la lista es silenciosa. El procesamiento de imagen usa valores fijos (contraste 1.9, brillo -80) repetidos en dos controladores (`ShipmentDetailController.tsx:176-183`, `ShipmentEvidencePhotoController.tsx:51-58`). Los textos "Embarque", "Cliente:" y "Destino:" de la lista están escritos en el componente y no en `es.ts` (`src/components/molecules/ShipmentListItem/ShipmentListItem.tsx:44-49`).

## Requisitos

### Requirement: Lista de embarques pendientes
El sistema SHALL mostrar en "Gestión de evidencias" la lista "Embarques pendientes" ("Los siguientes embarques requieren evidencia fotográfica de envío:") de la sucursal de la sesión, con por cada embarque su número, cliente (clave y nombre), destino y paquetería.
Evidencia: `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceController.tsx:76-83`, `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceScreen.tsx:56-84`, `src/components/molecules/ShipmentListItem/ShipmentListItem.tsx:44-55`, `src/services/ShipmentEvidenceServices.ts:28-50`, `src/i18n/es.ts:181-183` (OBSERVADA)
[NEEDS CLARIFICATION: no hay mensaje de "sin pendientes"; ¿se requiere uno?]

#### Scenario: Sucursal con embarques pendientes
- GIVEN la sucursal tiene 3 embarques sin evidencia
- WHEN el usuario abre "Evidencias de envíos"
- THEN ve los 3 embarques en "Embarques pendientes"

#### Scenario: Sin embarques pendientes
- GIVEN la sucursal no tiene embarques sin evidencia
- WHEN el usuario abre la pantalla
- THEN ve la lista vacía sin mensaje

### Requirement: Paginación de la lista
WHEN el usuario llega al final de la lista, el sistema SHALL pedir la siguiente página de 15 embarques y agregarla sin repetir embarques ya mostrados, hasta que una página traiga menos de 15 elementos o ninguno.
Evidencia: `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceController.tsx:10, 76-116`, `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceScreen.tsx:76-80` (OBSERVADA)

#### Scenario: Más de una página
- GIVEN la sucursal tiene 20 embarques pendientes
- WHEN el usuario baja hasta el final de la lista
- THEN se cargan los 5 restantes y no se piden más páginas

### Requirement: Actualizar la lista
WHEN el usuario pulsa "Actualizar", desliza para refrescar o regresa de guardar una evidencia con éxito, el sistema SHALL volver a cargar la lista desde la primera página; mientras carga SHALL deshabilitar el botón "Actualizar".
Evidencia: `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceController.tsx:35-42, 76-81, 118-121`, `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceScreen.tsx:74-75, 86-88`, `src/i18n/es.ts:34` (OBSERVADA)

#### Scenario: Evidencia recién guardada
- GIVEN el usuario guardó la evidencia del embarque 100
- WHEN regresa a "Gestión de evidencias"
- THEN la lista se recarga y el embarque 100 deja de aparecer

### Requirement: Falla al cargar la lista
IF la consulta de embarques pendientes falla THEN el sistema SHALL tratarla como lista vacía y dejar de paginar, sin mostrar mensaje de error.
Evidencia: `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceController.tsx:83-112` (OBSERVADA)
[NEEDS CLARIFICATION: ¿debe avisarse al usuario? Existe `shipmentsCanNotBeLoaded` en `es.ts:331` sin uso.]

#### Scenario: Servicio no disponible
- GIVEN el servicio de evidencias no responde
- WHEN el usuario abre la pantalla
- THEN ve la lista vacía y puede reintentar con "Actualizar"

### Requirement: Abrir el detalle de un embarque
WHEN el usuario pulsa un embarque de la lista, el sistema SHALL consultar su detalle y, si la consulta tiene éxito, abrir "Documento de embarque"; IF la consulta falla THEN SHALL recargar la lista.
Evidencia: `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceController.tsx:49-74` (OBSERVADA)
[NEEDS CLARIFICATION: si el servidor responde sin éxito (sin excepción) no ocurre nada ni se avisa; ¿es intencional?]

#### Scenario: Detalle disponible
- GIVEN el embarque 100 está en la lista
- WHEN el usuario lo pulsa
- THEN se abre "Documento de embarque" con los datos del embarque 100

### Requirement: Datos del embarque
El sistema SHALL mostrar en "Documento de embarque" ("Asegúrate que el documento esté completamente visible y enfocado") un acordeón "Detalles del embarque" con embarque, cliente, paquetería y destino (calle, número, colonia, código postal, ciudad y estado; "-" si no hay), y un acordeón "Pedidos del embarque" con los números de pedido ("-" si no hay).
Evidencia: `src/views/HomeStack/ShipmentDetail/ShipmentDetailScreen.tsx:54-128, 160-191`, `src/i18n/es.ts:54-55, 184-189` (OBSERVADA)

#### Scenario: Embarque con varios pedidos
- GIVEN el embarque incluye los pedidos 11 y 12
- WHEN el usuario abre el acordeón "Pedidos del embarque"
- THEN ve 11 y 12

### Requirement: Captura de la foto con cámara
WHEN el usuario pulsa "Agregar foto" y elige "Cámara", el sistema SHALL solicitar permiso de cámara si no lo tiene, abrir la vista de cámara y, al pulsar el obturador, tomar la foto, regresar a "Documento de embarque" y mostrar la vista previa; el usuario SHALL poder ampliarla al tocarla y cambiarla con "Cambiar foto". En Android/HandHeld la foto se reduce a un ancho máximo de 1280 px y se procesa (corrección de perspectiva, nitidez, contraste, brillo y saturación) antes de mostrarse.
Evidencia: `src/views/HomeStack/ShipmentEvidencePhoto/ShipmentEvidencePhotoController.tsx:18-66`, `src/views/HomeStack/ShipmentEvidencePhoto/ShipmentEvidencePhotoScreen.tsx:33-47`, `src/views/HomeStack/ShipmentDetail/ShipmentDetailController.tsx:60-68, 104-108`, `src/views/HomeStack/ShipmentDetail/ShipmentDetailScreen.tsx:167-209`, `src/i18n/es.ts:43-47` (OBSERVADA)
[NEEDS CLARIFICATION: si el usuario niega el permiso de cámara no hay aviso; ¿qué debe ocurrir?]

#### Scenario: Foto tomada
- GIVEN el usuario está en "Documento de embarque" sin foto
- WHEN pulsa "Agregar foto", elige "Cámara" y toma la foto
- THEN regresa al documento con la vista previa y los botones "Cambiar foto" y "Guardar"

### Requirement: Falla al procesar la foto de la cámara
IF la captura o el procesamiento de la foto falla THEN el sistema SHALL mostrar "Error" con "Lo sentimos, no ha sido posible cargar la información necesaria. Por favor, regresa al menú principal." y permanecer en la cámara.
Evidencia: `src/views/HomeStack/ShipmentEvidencePhoto/ShipmentEvidencePhotoController.tsx:67-77`, `src/i18n/es.ts:269, 272` (OBSERVADA)
[NEEDS CLARIFICATION: se reutiliza el mensaje de error de conexión de la consulta de tareas; existe `processImageError` ("Error al procesar la foto. Por favor intenta de nuevo.") que no se usa aquí.]

#### Scenario: Falla de captura
- GIVEN el usuario está en la cámara
- WHEN la captura falla
- THEN ve el error y puede intentar de nuevo

### Requirement: Opción de subir foto según bandera
WHERE la sucursal tiene activa `BanderaSubirFotoEvidenciasEmbarquesHH`, el sistema SHALL ofrecer "Subir foto" además de "Cámara" al agregar la foto. La bandera SHALL consultarse al abrir la lista (código 113) y retirarse al salir de ella; IF la consulta falla THEN SHALL considerarse inactiva.
Evidencia: `src/views/HomeStack/ShipmentEvidence/ShipmentEvidenceController.tsx:44-58`, `src/views/HomeStack/ShipmentDetail/ShipmentDetailScreen.tsx:268-279`, `src/i18n/es.ts:45` (OBSERVADA)
[NEEDS CLARIFICATION: el significado del parámetro 113 en la consulta de la bandera; ¿es el identificador de actividad o de submódulo?]

#### Scenario: Bandera inactiva
- GIVEN la sucursal no tiene activa la bandera
- WHEN el usuario pulsa "Agregar foto"
- THEN solo ve la opción "Cámara"

### Requirement: Validación de la imagen de galería
WHEN el usuario elige una imagen de la galería, el sistema SHALL aceptarla solo si es JPG de 1 MB o menos con firma de archivo JPEG válida; IF no cumple THEN SHALL mostrar "Error" con "Solo se permiten imágenes JPG menores a 1 MB."; IF falla el procesamiento THEN SHALL mostrar "Error al procesar la foto. Por favor intenta de nuevo.".
Evidencia: `src/views/HomeStack/ShipmentDetail/ShipmentDetailController.tsx:34, 125-201`, `src/utils/imageValidation.ts:3-16`, `src/i18n/es.ts:358-359` (OBSERVADA)

#### Scenario: Bandera activa e imagen válida
- GIVEN la sucursal tiene activa la bandera y el usuario elige un JPG de 500 KB
- WHEN pulsa "Subir foto"
- THEN ve la imagen como vista previa

#### Scenario: Imagen no permitida
- GIVEN la bandera está activa
- WHEN el usuario elige un PNG o un JPG de 2 MB
- THEN ve "Solo se permiten imágenes JPG menores a 1 MB." y no se agrega la foto

### Requirement: Guardar la evidencia
WHEN el usuario pulsa "Guardar" con una foto presente, el sistema SHALL pedir confirmación ("¿Desea terminar de guardar la evidencia tomada? Esta ya no podrá revertirse una vez guardada."); al confirmar SHALL enviar la foto con el usuario y las facturas (serie, factura y cliente vendedor) de los pedidos del embarque y, si el servidor responde con éxito (204), limpiar el detalle y regresar a la lista recargándola.
Evidencia: `src/views/HomeStack/ShipmentDetail/ShipmentDetailController.tsx:70-102`, `src/services/ShipmentEvidenceServices.ts:76-87`, `src/views/HomeStack/ShipmentDetail/ShipmentDetailScreen.tsx:239-247`, `src/i18n/es.ts:46, 192-193` (OBSERVADA)
[NEEDS CLARIFICATION: si el guardado falla con respuesta sin éxito no se muestra aviso y la foto se conserva; ¿es intencional?]

#### Scenario: Guardado exitoso
- GIVEN el usuario tiene una foto en el embarque 100
- WHEN pulsa "Guardar" y confirma
- THEN la evidencia se envía y regresa a la lista sin el embarque 100

#### Scenario: Cancelar el guardado
- GIVEN aparece la confirmación de guardado
- WHEN el usuario cancela
- THEN permanece en el documento con la foto

### Requirement: Salir sin guardar la evidencia
IF el usuario intenta salir de "Documento de embarque" con una foto sin guardar THEN el sistema SHALL mostrar "Cerrar captura del embarque" ("¿Desea cancelar el guardado de la evidencia? Se perderá la imagen ya capturada."); al confirmar SHALL descartar la foto y regresar a la lista. Sin foto, SHALL regresar directamente.
Evidencia: `src/views/HomeStack/ShipmentDetail/ShipmentDetailController.tsx:42-58, 114-123`, `src/views/HomeStack/ShipmentDetail/ShipmentDetailScreen.tsx:227-236`, `src/i18n/es.ts:190-191` (OBSERVADA)

#### Scenario: Salir con foto
- GIVEN el usuario tiene una foto sin guardar
- WHEN pulsa regresar y confirma
- THEN la foto se descarta y vuelve a la lista

#### Scenario: Salir sin foto
- GIVEN el usuario no ha tomado foto
- WHEN pulsa regresar
- THEN vuelve a la lista sin confirmación

## Historial
- 2026-10-22 · map: inventario inicial
- 2026-10-22 · map: división de requisitos de más de 120 palabras (principio 8)
