# Capacidad: conteo-inventario

Creada 2026-10-22 por `/exodus-sdd:map` (inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al usuario contar, producto por producto, los códigos de una tarea de inventario: escanear o capturar la cantidad, posponer, pausar, corregir y confirmar, incluyendo tareas especiales (actividad 45 o 4) que exigen un motivo y, en caso de garantía, un folio. El inicio de la tarea está en `asignacion-tarea`. `ProductDetail` NO pertenece a esta capacidad: lo abre el surtido por listado, por lo que corresponde a `surtido-listado`. Deuda observada: el conteo reutiliza el servicio de detalle de producto en recepción/etiquetado (`inventoryCountService.getProductDetail`); el id de motivo de garantía (5) está duplicado como enum y como literal `'5'`; la bandera "piloto" (`esPiloto`) cambia el diseño de la pantalla sin documentar su origen; textos "Torre", "Folio", "Actividad", "Fecha inicio:" y "Hora inicio:" están codificados en la pantalla, no en `es.ts`.

## Requisitos

### Requirement: Producto actual del conteo
El sistema SHALL mostrar, uno a la vez, el primer producto pendiente de la lista con su código, imagen, descripción, ubicación, existencia (solo si la tarea tiene `showExistence`), rack y nivel (y pasillo y "Torre" en el diseño piloto), y una tabla con los productos de la tarea.
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:108-122`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:206-320`, `src/i18n/es.ts:97-103` (OBSERVADA)
[NEEDS CLARIFICATION: ¿qué define `esPiloto` y cuándo se retirará el diseño no piloto?]

#### Scenario: Con existencia habilitada
- GIVEN la tarea tiene showExistence verdadero y el producto trae existencia
- WHEN se muestra el producto
- THEN ve "Existencia" con el valor

#### Scenario: Sin existencia
- GIVEN la tarea tiene showExistence falso
- WHEN se muestra el producto
- THEN la existencia aparece vacía

### Requirement: Conteo por escaneo de etiqueta
WHEN el usuario captura un código de 13 dígitos, el sistema SHALL tomar los primeros 7 como producto y los últimos 6 como cantidad, y IF el producto coincide con el actual THEN SHALL registrar el conteo marcado como escaneado; IF no coincide THEN SHALL mostrar la alerta "Campo no válido" con "El código que capturaste está incompleto o no corresponde al producto, por favor captura nuevamente".
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:125-189`, `src/services/InventoryCountServices.ts:48-52`, `src/i18n/es.ts:275-276` (OBSERVADA)

#### Scenario: Escaneo correcto
- GIVEN el producto actual es 1234567
- WHEN escanea "1234567000012"
- THEN se registra una cantidad de 12 para el producto

#### Scenario: Escaneo de otro producto
- GIVEN el producto actual es 1234567
- WHEN escanea un código de 13 dígitos cuyo producto es distinto
- THEN ve "Campo no válido"

### Requirement: Conteo por captura manual de cantidad
WHEN el usuario captura el código del producto actual (solo dígitos), el sistema SHALL abrir "Ingresa cantidad" con el código y un campo numérico (máx. 9 dígitos) y, al guardar, registrar el conteo; IF el código no corresponde al producto actual THEN SHALL mostrar "Campo no válido"; IF el guardado falla THEN SHALL reabrir el modal de cantidad.
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:140-143, 190-223`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:338-395` (OBSERVADA)

#### Scenario: Captura manual
- GIVEN el producto actual es 1234567
- WHEN captura "1234567" y luego la cantidad 8
- THEN se registra 8 como conteo del producto

### Requirement: Posponer producto
WHEN el usuario pulsa "Posponer", el sistema SHALL marcar el producto como pendiente de conteo y pasar al siguiente; IF solo queda un producto THEN SHALL mostrar "Posponer producto" con "No puedes posponer el último código a contar".
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:226-245`, `src/services/InventoryCountServices.ts:61-66`, `src/i18n/es.ts:277-279` (OBSERVADA)

#### Scenario: Último código
- GIVEN queda un solo producto en la lista
- WHEN pulsa "Posponer"
- THEN ve "No puedes posponer el último código a contar"

### Requirement: Confirmar producto contado
WHEN el usuario pulsa "Confirmar" en una tarea normal, el sistema SHALL confirmar el conteo del producto actual y avanzar; IF el producto no se ha contado y su cantidad es 0 THEN SHALL mostrar "Error" con "El producto no puede ser confirmado porque no ha sido contado en la tarea solicitada."; IF es el último producto THEN SHALL mostrar antes "Terminar" con "No existen más códigos pendientes para esta tarea, ¿Deseas terminar?".
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:301-340`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:440-450`, `src/i18n/es.ts:108, 330` (OBSERVADA)
[NEEDS CLARIFICATION: una cantidad contada de 0 en un producto ya iniciado (`countStarted`) sí se puede confirmar; ¿es el comportamiento esperado?]

#### Scenario: Confirmar sin contar
- GIVEN el producto no tiene conteo iniciado
- WHEN pulsa "Confirmar"
- THEN ve que no puede confirmarse porque no ha sido contado

### Requirement: Terminar la tarea de inventario
WHEN el usuario acepta "Terminar" en el último producto, el sistema SHALL confirmar el conteo (incluyendo familia y, si existen, motivo y folio de garantía), limpiar el estado del conteo y regresar a "Home"; WHEN el usuario cancela el modal, SHALL abrir la corrección de conteo ("Corregir").
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:247-276`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:440-450`, `src/i18n/es.ts:8, 107` (OBSERVADA)

#### Scenario: Terminar
- GIVEN confirma el último producto
- WHEN acepta "Terminar"
- THEN la tarea se confirma y el usuario regresa al menú principal

### Requirement: Motivo especial en tareas 45 y 4
WHILE la actividad de la tarea es 45 o 4, el sistema SHALL solicitar al confirmar cada producto un motivo del catálogo en el modal "Motivo código negado" ("Elige algún motivo"), con el botón de confirmar deshabilitado hasta elegir uno, y enviarlo como `reasonId` al confirmar.
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:315-319, 342-385, 476-486`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:466-534`, `src/i18n/es.ts:67, 136` (OBSERVADA)
[NEEDS CLARIFICATION: el título reutiliza el texto de recepción "Motivo código negado"; ¿es el texto correcto para inventario?]

#### Scenario: Motivo requerido
- GIVEN la tarea es de actividad 45
- WHEN pulsa "Confirmar" sobre un producto contado
- THEN se abre "Motivo código negado" y no puede continuar sin elegir motivo

### Requirement: Catálogo de motivos no disponible
IF el catálogo de motivos especiales está vacío THEN el sistema SHALL mostrar el error "No se encontraron motivos de rechazo." en el campo de motivo.
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:488-503`, `src/i18n/es.ts:329` (OBSERVADA)

#### Scenario: Sin motivos
- GIVEN el catálogo llegó vacío
- WHEN se abre el modal de motivo
- THEN el campo muestra "No se encontraron motivos de rechazo."

### Requirement: Garantía con folio
WHEN el motivo elegido es garantía (reasonId 5), el sistema SHALL pedir un folio numérico de hasta 10 dígitos y deshabilitar la confirmación mientras esté vacío; IF es el último producto THEN SHALL validar el folio contra el producto y la sucursal antes de mostrar "Terminar", y IF no es el último THEN SHALL confirmar el producto enviando el folio como `warrantyFolioId`. IF el motivo cambia a uno distinto de garantía THEN SHALL borrar el folio.
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:342-385, 476-486, 505-507`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:474-514`, `src/services/InventoryCountServices.ts:122-135`, `src/types/services/CatalogServices.ts:12-15` (OBSERVADA)
[NEEDS CLARIFICATION: si la validación del folio falla no se muestra mensaje propio en este controlador; ¿lo resuelve el interceptor HTTP?]

#### Scenario: Garantía sin folio
- GIVEN eligió el motivo de garantía
- WHEN el campo "Folio" está vacío
- THEN el botón de confirmar permanece deshabilitado

#### Scenario: Folio inválido en el último producto
- GIVEN es el último producto y eligió garantía con un folio
- WHEN el servicio indica que el folio no es válido
- THEN no se muestra "Terminar" y el conteo no se confirma

### Requirement: Corregir conteo
WHEN el usuario pulsa "Corregir", el sistema SHALL abrir "Corregir conteo" para capturar un producto (máx. 7 dígitos); WHEN el producto existe en la tarea, SHALL cargar su cantidad contada y permitir editarla (máx. 9 dígitos), y al confirmar SHALL enviar la corrección con el empleado, la familia y si es el último producto de la lista.
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:400-465`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:398-436`, `src/services/InventoryCountServices.ts:93-120`, `src/i18n/es.ts:110-111` (OBSERVADA)
[NEEDS CLARIFICATION: si el producto no existe en la tarea el modal se reabre sin mensaje propio; ¿debe avisarse?]

#### Scenario: Corrección de cantidad
- GIVEN el producto 1234567 ya fue contado con 5
- WHEN lo captura en "Corregir conteo", cambia la cantidad a 7 y confirma
- THEN la corrección se registra con cantidad 7

### Requirement: Pausar la tarea y salida
WHEN el usuario pulsa "Pausar" o el botón de regreso (incluido el de hardware), el sistema SHALL mostrar "Pausar tarea" con "¿Deseas pausar la tarea?"; WHEN acepta, SHALL pausar la tarea en el servidor y regresar a "Home"; WHEN cancela, SHALL permanecer en el conteo.
Evidencia: `src/views/HomeStack/InventoryCount/InventoryCountController.tsx:72-81, 278-285, 387-398`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:453-464`, `src/services/InventoryCountServices.ts:68-78`, `src/i18n/es.ts:126-127` (OBSERVADA)

#### Scenario: Pausar
- GIVEN está contando
- WHEN pulsa "Pausar" y acepta
- THEN la tarea se pausa y regresa al menú principal

## Historial
- 2026-10-22 · map: inventario inicial
- 2026-10-22 · map: referencias actualizadas por la división de `surtido-pedido` en `surtido-ronda` y `surtido-listado`
