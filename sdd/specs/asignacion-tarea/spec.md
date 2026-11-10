# Capacidad: asignacion-tarea

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al usuario ver la siguiente tarea que el back-end le asigna y, al confirmarla, entrar al flujo que corresponde a su `activityId` (conteo de inventario, recepción, surtido o revisión de surtido). La consulta de carga de la sucursal está en `consulta-tarea-sucursal`. Deuda observada: los `activityId` están codificados en el controlador (4, 31, 34, 35, 45, 58, 59, 60) y en `src/types/services/TaskServices.ts:62-66`; el enrutamiento ignora silenciosamente actividades no listadas (p. ej. 59, 60 solo afectan etiquetas de pantalla). Los flujos destino se especifican en sus propias capacidades (`conteo-inventario`, `recepcion-mercancia`, `surtido-ronda`, `surtido-listado`, `revision-surtido`).

## Requisitos

### Requirement: Obtener la siguiente tarea al entrar
WHEN la pantalla "Asignación de tareas" recibe el foco, el sistema SHALL solicitar la tarea asignada al usuario con su `userId`, `roleId`, `employeeId`, `branchOfficeId` y `folioActivityId` en 0, mostrando el indicador de carga mientras espera.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:49-73` (OBSERVADA)

#### Scenario: Entrada a la pantalla
- GIVEN el usuario inició sesión en una sucursal
- WHEN abre "Asignación de tareas"
- THEN se consulta la tarea asignada y se muestra la carga hasta recibir respuesta

### Requirement: Mostrar la tarea asignada
WHEN existe una tarea asignada, el sistema SHALL mostrar el empleado (número y nombre), la actividad, la fecha y hora de inicio y el documento, con las etiquetas "Empleado", "Tarea asignada", "Fecha" y "DocumentoID".
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssingScreen.tsx:75-104`, `src/i18n/es.ts:93-96` (OBSERVADA)

#### Scenario: Tarea disponible
- GIVEN el servicio devuelve una tarea de surtido
- WHEN termina la carga
- THEN ve su número y nombre de empleado, la actividad, "Fecha inicio" y "Hora inicio" en formato "hh:mm a.m./p.m."

### Requirement: Documento y nombre de actividad según tipo
El sistema SHALL mostrar como documento el `orderId` (o "0" si es nulo) cuando la actividad es 31, 34, 35, 58, 59 o 60, y el `folioActivityId` en cualquier otra actividad; en esas mismas actividades SHALL mostrar el nombre de la actividad en mayúsculas sin la palabra "CLIENTE".
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:294-328` (OBSERVADA)

#### Scenario: Actividad de surtido
- GIVEN la tarea tiene activityId 31 y orderId 1234
- WHEN el usuario ve la tarea
- THEN el documento es "1234"

#### Scenario: Actividad de recepción
- GIVEN la tarea tiene activityId 2 y folioActivityId 987
- WHEN el usuario ve la tarea
- THEN el documento es "987"

### Requirement: Sin tareas por realizar
IF no hay tarea asignada o la consulta no tiene éxito THEN el sistema SHALL mostrar "Sin tareas" y "No existen tareas por realizar." y un botón "Salir" que regresa a la pantalla anterior.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:66-72`, `src/views/HomeStack/TaskAssign/TaskAssingScreen.tsx:105-124`, `src/i18n/es.ts:273-274` (OBSERVADA)
[NEEDS CLARIFICATION: una falla de red y la ausencia de tareas se muestran igual; ¿deben distinguirse?]

#### Scenario: Usuario sin tarea
- GIVEN el servicio no devuelve tarea
- WHEN termina la carga
- THEN ve "Sin tareas" y "No existen tareas por realizar." y al pulsar "Salir" regresa

### Requirement: Cancelar la asignación
WHEN el usuario pulsa cancelar (cruz) o el botón de regreso, el sistema SHALL volver a la pantalla anterior sin iniciar la tarea.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:75-77`, `src/views/HomeStack/TaskAssign/TaskAssingScreen.tsx:125` (OBSERVADA)

#### Scenario: Cancelar
- GIVEN hay una tarea asignada visible
- WHEN el usuario pulsa la cruz
- THEN regresa sin iniciar el flujo

### Requirement: Enrutar al flujo según actividad
WHEN el usuario confirma una tarea que no es de revisión, el sistema SHALL abrir el flujo según su `activityId`: conteo de inventario para {3, 4, 5, 6, 7, 45, 46, 48-57, 61, 62}, recepción de mercancía para {2}, surtido para {31, 58}, y revisión de surtido para {34}; IF el `activityId` no está en ninguna lista THEN no SHALL ocurrir navegación alguna.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:254-259, 280-292`, `src/types/services/TaskServices.ts:62-66` (OBSERVADA)
[NEEDS CLARIFICATION: el usuario no recibe aviso si el activityId no se enruta (p. ej. 35 fuera de revisión, 59, 60); ¿es intencional?]

#### Scenario: Tarea de recepción
- GIVEN la tarea tiene activityId 2
- WHEN el usuario confirma
- THEN el sistema inicia la recepción y abre la pantalla de recepción

#### Scenario: Actividad no enrutable
- GIVEN la tarea tiene un activityId fuera de las listas
- WHEN el usuario confirma
- THEN no ocurre nada visible

### Requirement: Inicio de conteo de inventario
WHEN se enruta a conteo de inventario, el sistema SHALL iniciar el conteo (rol, actividad y sucursal), guardar productos, tarea, actividad, familia y `showExistence` y abrir "InventoryCount"; IF la actividad es 45 o 4 THEN SHALL cargar antes el catálogo de motivos especiales.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:79-108`, `src/services/InventoryCountServices.ts:20-25` (OBSERVADA)
[NEEDS CLARIFICATION: si el inicio falla no se muestra alerta ni se apaga el indicador de carga en este controlador; ¿lo resuelve el interceptor HTTP?]

#### Scenario: Inventario normal
- GIVEN la tarea es de actividad 3
- WHEN el usuario confirma
- THEN abre el conteo sin cargar motivos especiales

#### Scenario: Inventario especial
- GIVEN la tarea es de actividad 45
- WHEN el usuario confirma
- THEN se carga el catálogo de motivos y abre el conteo

### Requirement: Inicio de recepción de mercancía
WHEN se enruta a recepción, el sistema SHALL iniciar el progreso de recepción con la orden (`folioActivityId`), la papeleta y la sucursal, guardar los productos y abrir "ReceptionMerch"; IF el inicio falla THEN SHALL mostrar una alerta "Error" con el mensaje del servicio.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:110-138`, `src/i18n/es.ts:269` (OBSERVADA)

#### Scenario: Recepción con error
- GIVEN el servicio rechaza el inicio de la recepción
- WHEN el usuario confirma
- THEN ve la alerta "Error" con el mensaje devuelto

### Requirement: Inicio de surtido y elección de versión
WHEN se enruta a surtido, el sistema SHALL consultar los productos de la tarea y abrir "AssortmentTaskV2" si la bandera `BanderaListadoDeProductosEnHH` (submódulo 113) está activa y la tarea no tiene varios pedidos (`orderId` con coma); en cualquier otro caso SHALL abrir "AssortmentTask". IF la tarea no trae productos THEN SHALL mostrar la alerta "Error" con "Lo sentimos, no ha sido posible cargar la información necesaria. Por favor, regresa al menú principal." y no navegar.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:140-185, 246-252`, `src/i18n/es.ts:272` (OBSERVADA)
[NEEDS CLARIFICATION: si la consulta de la bandera falla se usa la versión anterior sin avisar; ¿es el comportamiento deseado?]

#### Scenario: Ronda multipedido
- GIVEN la tarea tiene orderId "101,102" y la bandera activa
- WHEN el usuario confirma
- THEN abre "AssortmentTask" (versión anterior)

#### Scenario: Pedido único con bandera
- GIVEN la tarea tiene un solo pedido y la bandera activa
- WHEN el usuario confirma
- THEN abre "AssortmentTaskV2" con reproducción del resumen en audio

### Requirement: Refresco de la tarea de revisión
WHEN la tarea es de revisión (34 o 35), el sistema SHALL volver a consultar la tarea asignada antes de enrutar: IF ya no hay tarea THEN SHALL ir a "Home"; IF la nueva tarea es 35, o es la misma actividad y la bandera `Bandera_RevisionIndependienteEnHH` no está activa, THEN SHALL mostrar el modal de tarea incompleta; en otro caso SHALL enrutar la tarea refrescada.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:38-40, 254-278` (OBSERVADA)
[NEEDS CLARIFICATION: el significado de negocio de 34 vs 35 no está documentado.]

#### Scenario: Revisión pendiente en Exodus Sucursales
- GIVEN la tarea es 34 y tras refrescar sigue siendo 35
- WHEN el usuario confirma
- THEN ve "Tarea incompleta" y al pulsar "Cerrar" regresa

### Requirement: Modal de tarea incompleta
El modal de tarea incompleta SHALL mostrar "Tarea incompleta" con "Esta tarea aún no ha sido finalizada en Exodus Sucursales. Por favor, conclúyela desde ese sistema para poder continuar." y un botón "Cerrar" que sale de la pantalla; IF la tarea 34 es de varios pedidos THEN el sistema SHALL mostrar este modal sin abrir la revisión.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:187-192`, `src/views/HomeStack/TaskAssign/TaskAssingScreen.tsx:129-145`, `src/i18n/es.ts:177, 326` (OBSERVADA)
[NEEDS CLARIFICATION: "Cerrar" usa `onPressBack` y sale de la pantalla en lugar de solo cerrar el modal; ¿es intencional?]

#### Scenario: Pedido multi-orden
- GIVEN la tarea 34 tiene orderId "5,6"
- WHEN el usuario confirma y se llega a enrutar
- THEN ve "Tarea incompleta"

### Requirement: Orden no surtida al iniciar revisión
IF la consulta de productos de la revisión falla y trae mensaje THEN el sistema SHALL mostrar el modal "No es posible iniciar esta tarea" con ese mensaje y un botón "Cerrar"; IF tiene éxito THEN SHALL cargar productos, indicadores de orden corporativa y orden de compra válida, y abrir "AssortmentCheck".
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:193-243`, `src/views/HomeStack/TaskAssign/TaskAssingScreen.tsx:147-164`, `src/i18n/es.ts:242` (OBSERVADA)

#### Scenario: Pedido no surtido
- GIVEN el servicio responde que el pedido no está surtido
- WHEN el usuario confirma una revisión
- THEN ve "No es posible iniciar esta tarea" con el mensaje del servicio

## Historial
- 2026-10-22 · map: inventario inicial
- 2026-10-22 · map: división de requisitos de más de 120 palabras (principio 8)
- 2026-10-22 · map: referencias actualizadas por la división de `surtido-pedido` en `surtido-ronda` y `surtido-listado`
