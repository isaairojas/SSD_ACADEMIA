# Capacidad: reporte-incidencia-caja

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite reportar una incidencia sobre una caja ya escaneada en la validación de recepción, con un comentario y hasta 4 fotos de evidencia. Se entra desde `validacion-recepcion-caja`.
Deuda observada: la pantalla de incidencia exige comentario aunque el controlador acepta fotos sin comentario; varios textos están fijos en el código y no en `es.ts`; la cámara y la captura difieren entre web y Android; los errores al verificar si hay incidencia se tratan como "ya existe".

## Requisitos

### Requirement: Acceso al reporte desde la caja validada
WHEN hay una caja escaneada con su registro de escaneo y sin incidencia, el sistema SHALL habilitar el botón "Reportar Incidencia" y abrir el reporte con el pedido, el número de caja, la sucursal y el id de validación de la caja; IF la caja ya tiene incidencia (o no se pudo verificar) THEN el botón SHALL permanecer deshabilitado.
Evidencia: `src/views/HomeStack/ValidateReceivedGoods/ValidateReceivedGoodsController.tsx:262-268, 439-452, 470`, `src/services/ValidateReceivedGoodsServices.ts:76-90`, `src/i18n/es.ts:38` (OBSERVADA)

#### Scenario: Caja sin incidencia
- GIVEN el usuario escaneó una caja de su sucursal sin incidencia previa
- WHEN pulsa "Reportar Incidencia"
- THEN se abre "Reporte de Incidencia" con el número de la caja

#### Scenario: Caja con incidencia previa
- GIVEN la caja escaneada ya tiene una incidencia registrada
- WHEN el usuario ve la pantalla de validación
- THEN "Reportar Incidencia" está deshabilitado

#### Scenario: Falla la verificación
- GIVEN falla la consulta de si la caja tiene incidencia
- WHEN el usuario escanea la caja
- THEN el botón queda deshabilitado (se asume que existe incidencia)

### Requirement: Comentario de la incidencia
El sistema SHALL permitir un comentario de hasta 500 caracteres con el marcador "Agrega un comentario"; IF el comentario (sin espacios en los extremos) no está vacío y tiene menos de 5 o más de 500 caracteres THEN SHALL mostrar "Comentario inválido" con "El comentario debe tener entre 5 y 500 caracteres.".
Evidencia: `src/views/HomeStack/IncidenceReport/IncidenceReportController.tsx:138-152`, `src/views/HomeStack/IncidenceReport/IncidenceReportScreen.tsx:209-210, 256-260`, `src/i18n/es.ts:230-231, 235` (OBSERVADA)

#### Scenario: Comentario demasiado corto
- GIVEN el usuario escribe "ok"
- WHEN intenta guardar
- THEN el botón "Aceptar" está deshabilitado

#### Scenario: Comentario válido
- GIVEN el usuario escribe "Caja golpeada y abierta"
- WHEN pulsa "Aceptar"
- THEN se envía el reporte

### Requirement: Datos mínimos para guardar
IF no hay fotos y el comentario tiene menos de 5 caracteres THEN el sistema SHALL mostrar "Faltan datos" con "Debes proporcionar al menos una foto o un comentario válido." y no guardar; la pantalla SHALL habilitar "Aceptar" solo cuando el comentario tiene entre 5 y 500 caracteres y no se está guardando.
Evidencia: `src/views/HomeStack/IncidenceReport/IncidenceReportController.tsx:154-164`, `src/views/HomeStack/IncidenceReport/IncidenceReportScreen.tsx:209-210, 289` (OBSERVADA)
[NEEDS CLARIFICATION: el controlador permite guardar con solo fotos, pero el botón "Aceptar" lo impide sin comentario válido. ¿Cuál es la regla deseada?]

#### Scenario: Solo fotos
- GIVEN el usuario tiene dos fotos y ningún comentario
- WHEN mira el botón "Aceptar"
- THEN está deshabilitado

### Requirement: Permiso de cámara
WHEN el usuario pulsa agregar foto, el sistema SHALL solicitar el permiso de cámara y, IF se concede THEN SHALL abrir la captura de fotos; IF se niega permanentemente THEN SHALL mostrar "Sin permiso de cámara" con la indicación de habilitarlo (en web, desde el candado del navegador; en dispositivo, desde la configuración); IF se niega sin bloqueo THEN SHALL mostrar "Permiso denegado" con "No podrás tomar fotos de evidencia si no concedes el permiso de la cámara."; IF no hay cámara disponible THEN SHALL mostrar "Camara no disponible".
Evidencia: `src/views/HomeStack/IncidenceReport/IncidenceReportController.tsx:35-49, 55-136` (OBSERVADA)

#### Scenario: Permiso concedido
- GIVEN el usuario aún no ha dado permiso de cámara
- WHEN pulsa el botón de agregar foto y concede el permiso
- THEN se abre la pantalla de captura

#### Scenario: Cámara no disponible
- GIVEN el dispositivo no tiene cámara o está bloqueada
- WHEN el usuario pulsa agregar foto
- THEN ve "Camara no disponible" con "No se pudo acceder a la cámara. Verifica que el dispositivo cuente con una camara o que no esté bloqueado por el sistema."

### Requirement: Captura de fotos de evidencia
WHILE hay menos de 4 fotos, el sistema SHALL permitir capturar fotos con la cámara; el botón de captura SHALL deshabilitarse mientras se captura o al llegar a 4 fotos; en Android SHALL reducir la imagen a 1280 px de ancho máximo y aplicar afilado antes de conservarla.
Evidencia: `src/views/HomeStack/IncidenceReportPhotos/IncidenceReportPhotosController.tsx:24, 41-84`, `src/views/HomeStack/IncidenceReportPhotos/IncidenceReportPhotosScreen.tsx:261-267` (OBSERVADA)
[NEEDS CLARIFICATION: en `IncidenceReportPhotosController.tsx:78-80` un fallo de captura se rechaza sin avisar al usuario.]

#### Scenario: Límite de fotos
- GIVEN el usuario ya tomó 4 fotos
- WHEN está en la captura
- THEN el botón de captura está deshabilitado

#### Scenario: Foto en dispositivo
- GIVEN el usuario toma una foto de 4000 px de ancho en Android
- WHEN se procesa
- THEN se conserva reducida a 1280 px de ancho

### Requirement: Gestión de fotos antes de guardar
El sistema SHALL permitir al usuario eliminar una foto con "×" en la captura y en el reporte; WHEN pulsa "Guardar" en la captura, SHALL regresar al reporte con las fotos tomadas; WHEN pulsa "Cancelar", SHALL volver sin pasar las fotos nuevas; el botón de agregar foto SHALL ocultarse al llegar a 4 fotos.
Evidencia: `src/views/HomeStack/IncidenceReportPhotos/IncidenceReportPhotosController.tsx:32-35, 86-99`, `src/views/HomeStack/IncidenceReportPhotos/IncidenceReportPhotosScreen.tsx:237-271`, `src/views/HomeStack/IncidenceReport/IncidenceReportController.tsx:228-236`, `src/views/HomeStack/IncidenceReport/IncidenceReportScreen.tsx:221-235, 263-278` (OBSERVADA)

#### Scenario: Eliminar una foto
- GIVEN el reporte tiene 3 fotos
- WHEN el usuario pulsa "×" en la segunda
- THEN el reporte queda con 2 fotos

#### Scenario: Máximo de fotos
- GIVEN el reporte tiene 4 fotos
- WHEN el usuario ve la sección "Fotos"
- THEN no aparece el botón de agregar

### Requirement: Envío de la incidencia
WHEN el usuario pulsa "Aceptar" con datos válidos, el sistema SHALL enviar al servidor el id de empleado, la sucursal, el id de validación de la caja, el comentario y las fotos en base64 (nombradas `evidencia_<n>.png`; sin fotos se envía `null`) y, IF tiene éxito THEN SHALL mostrar "Éxito" con "La incidencia fue reportada exitosamente." y volver a la validación con la incidencia marcada; IF falla THEN SHALL mostrar "Error" con "No se pudo guardar la incidencia." y permanecer.
Evidencia: `src/views/HomeStack/IncidenceReport/IncidenceReportController.tsx:166-226`, `src/services/IncidenceReportServices.ts:10-23` (OBSERVADA)
[NEEDS CLARIFICATION: las fotos web se capturan como JPEG pero se nombran .png; ¿es intencional?]

#### Scenario: Envío exitoso
- GIVEN el usuario escribió un comentario válido y agregó 2 fotos
- WHEN pulsa "Aceptar"
- THEN ve "La incidencia fue reportada exitosamente." y regresa a la validación con "Reportar Incidencia" deshabilitado

#### Scenario: Falla el envío
- GIVEN el servidor no responde
- WHEN el usuario pulsa "Aceptar"
- THEN ve "No se pudo guardar la incidencia." y conserva el comentario y las fotos

## Historial
- 2026-10-22 · map: inventario inicial
