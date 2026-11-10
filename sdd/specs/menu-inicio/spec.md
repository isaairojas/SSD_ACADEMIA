# Capacidad: menu-inicio

Creada 2026-10-19 por `/exodus-sdd:adoptar` (map, inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Es el punto de entrada tras iniciar sesión: da acceso a las funciones disponibles para el usuario y su sucursal, avisa cuántas evidencias de embarque quedan pendientes y retoma una recepción interrumpida en web. El cierre de sesión desde este menú se especifica en `autenticacion-sesion`.

Deuda observada: la carga de banderas no se espera antes de ocultar el indicador de carga (`src/views/HomeStack/Home/HomeController.tsx:44-57`), así que la opción condicionada puede aparecer unos instantes después de entrar.

## Requisitos

### Requirement: Opciones del menú principal
El sistema SHALL ofrecer en el menú principal, en este orden, las opciones "Tareas", "Consulta de tareas cargadas", "Validar mercancía recibida" (solo cuando aplica) y "Evidencias de envíos".
Evidencia: `src/views/HomeStack/Home/HomeScreen.tsx:24-62, 98-112`, `src/i18n/es.ts:81-85` (OBSERVADA)

#### Scenario: Menú de un usuario sin validación de mercancía
- GIVEN el usuario no tiene habilitada la validación de mercancía recibida
- WHEN entra al menú principal
- THEN ve "Tareas", "Consulta de tareas cargadas" y "Evidencias de envíos"

#### Scenario: Navegar a una opción
- WHEN el usuario pulsa "Consulta de tareas cargadas"
- THEN se abre la consulta de tareas de su sucursal

### Requirement: Acceso a validación de mercancía recibida
El sistema SHALL mostrar la opción "Validar mercancía recibida" solo si el rol del usuario es 2, 4, 6 o 9 y la sucursal tiene activa `Bandera_PackingListRecepcion`.
Evidencia: `src/views/HomeStack/Home/HomeController.tsx:28-30, 111` (OBSERVADA)
[NEEDS CLARIFICATION: ¿qué nombre de negocio tienen los roles 2, 4, 6 y 9 y quién decide esa lista?]

#### Scenario: Rol y bandera habilitados
- GIVEN el usuario tiene rol 4 y su sucursal tiene activa `Bandera_PackingListRecepcion`
- WHEN entra al menú principal
- THEN ve la opción "Validar mercancía recibida"

#### Scenario: Rol sin permiso
- GIVEN el usuario tiene rol 3 y su sucursal tiene activa `Bandera_PackingListRecepcion`
- WHEN entra al menú principal
- THEN no ve la opción "Validar mercancía recibida"

#### Scenario: Bandera inactiva
- GIVEN el usuario tiene rol 4 y su sucursal no tiene activa `Bandera_PackingListRecepcion`
- WHEN entra al menú principal
- THEN no ve la opción "Validar mercancía recibida"

### Requirement: Contador de evidencias pendientes
WHILE el menú principal está visible, el sistema SHALL mostrar en "Evidencias de envíos" el número de embarques de la sucursal con evidencia pendiente y actualizarlo con la frecuencia que indique el servidor (60 segundos mientras no lo indique). Si el número supera 99 se muestra "+99"; si supera 999, "+999".
Evidencia: `src/views/HomeStack/Home/HomeController.tsx:23, 35-42, 91-101`, `src/components/atoms/NotificationBadge/NotificationBadge.tsx:17` (OBSERVADA)
[NEEDS CLARIFICATION: el contador se muestra también cuando es 0; ¿debe ocultarse cuando no hay pendientes?]

#### Scenario: Evidencias pendientes
- GIVEN la sucursal tiene 7 embarques con evidencia pendiente
- WHEN el usuario entra al menú principal
- THEN ve "7" en la opción "Evidencias de envíos"

#### Scenario: Actualización periódica
- GIVEN el servidor indica una frecuencia de 30 segundos y el usuario permanece en el menú
- WHEN se registra una nueva evidencia pendiente
- THEN el contador se actualiza en un máximo de 30 segundos

#### Scenario: Fuera del menú
- WHEN el usuario sale del menú principal a otra pantalla
- THEN el contador deja de actualizarse hasta que regresa al menú

### Requirement: Reanudar recepción interrumpida en web
WHERE la app se usa en web, WHEN el usuario entra al menú principal con una recepción de mercancía guardada que aún no llegó a la impresión de etiquetas, el sistema SHALL llevarlo directamente a esa recepción para continuarla.
Evidencia: `src/views/HomeStack/Home/HomeController.tsx:79-86`, `src/rtk/store/store.ts:33` (OBSERVADA)
[NEEDS CLARIFICATION: en Android no se reanuda automáticamente aunque el avance también se guarda; ¿es intencional?]

#### Scenario: Recarga durante una recepción
- GIVEN el usuario estaba recibiendo mercancía en web y recargó la página antes de imprimir etiquetas
- WHEN vuelve al menú principal
- THEN se abre la recepción en curso con su avance

#### Scenario: Recepción en impresión de etiquetas
- GIVEN el usuario ya había pasado a imprimir etiquetas
- WHEN vuelve al menú principal en web
- THEN permanece en el menú principal

## Historial
- 2026-10-19 · map: inventario inicial (adopción del kit)
