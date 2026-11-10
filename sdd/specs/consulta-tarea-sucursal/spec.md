# Capacidad: consulta-tarea-sucursal

Creada 2026-10-19 por `/exodus-sdd:adoptar` (map, inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite al usuario consultar la carga de trabajo de su sucursal: cuántas tareas por actividad hay disponibles para asignar y cuántas ya están asignadas. Es solo de consulta; tomar una tarea se especifica en `asignacion-tarea`.

## Requisitos

### Requirement: Tareas disponibles por asignar
El sistema SHALL mostrar en "Tareas disponibles por asignar" las actividades de la sucursal que tienen al menos una tarea sin asignar, con su prioridad, nombre, cantidad sin asignar y documento.
Evidencia: `src/views/HomeStack/Task/TaskController.tsx:22-40`, `src/views/HomeStack/Task/TaskScreen.tsx:9-35, 98-100` (OBSERVADA)

#### Scenario: Actividad con tareas sin asignar
- GIVEN la sucursal tiene 5 tareas de surtido sin asignar
- WHEN el usuario abre "Consulta de tareas cargadas"
- THEN ve la actividad de surtido en "Tareas disponibles por asignar" con cantidad 5

#### Scenario: Actividad sin tareas por asignar
- GIVEN todas las tareas de inventario de la sucursal ya están asignadas
- WHEN el usuario abre la consulta
- THEN la actividad de inventario no aparece en "Tareas disponibles por asignar"

### Requirement: Tareas asignadas
El sistema SHALL mostrar en "Tareas asignadas" las actividades de la sucursal que tienen al menos una tarea asignada, con su prioridad, nombre, cantidad asignada y documento.
Evidencia: `src/views/HomeStack/Task/TaskController.tsx:29-31`, `src/views/HomeStack/Task/TaskScreen.tsx:37-62, 101-104` (OBSERVADA)

#### Scenario: Actividad con tareas asignadas
- GIVEN la sucursal tiene 3 tareas de recepción asignadas
- WHEN el usuario abre la consulta
- THEN ve la actividad de recepción en "Tareas asignadas" con cantidad 3

### Requirement: Alcance de la consulta
El sistema SHALL consultar las tareas de la sucursal de la sesión con el número de empleado y el rol del usuario.
Evidencia: `src/services/TaskService.ts:8-15`, `src/views/HomeStack/Task/TaskController.tsx:25` (OBSERVADA)
[NEEDS CLARIFICATION: el servidor recibe el empleado y el rol; ¿la consulta muestra toda la carga de la sucursal o solo las actividades que el rol del usuario puede ejecutar?]

#### Scenario: Usuario de otra sucursal
- GIVEN el usuario inició sesión en "Norte"
- WHEN abre la consulta
- THEN ve solo tareas de "Norte"

### Requirement: Falla al cargar la consulta
IF la consulta de tareas falla THEN el sistema SHALL mostrar "Error de conexión" con "Lo sentimos, no ha sido posible cargar la información necesaria. Por favor, regresa al menú principal." y un botón para salir al menú.
Evidencia: `src/views/HomeStack/Task/TaskController.tsx:35-36`, `src/views/HomeStack/Task/TaskScreen.tsx:106-124`, `src/i18n/es.ts:271-272` (OBSERVADA)

#### Scenario: Servicio no disponible
- GIVEN el servicio de tareas no responde
- WHEN el usuario abre la consulta
- THEN ve "Error de conexión" y al pulsar salir regresa al menú principal

### Requirement: Consulta sin tareas
WHEN la sucursal no tiene tareas, el sistema SHALL mostrar las dos secciones vacías.
Evidencia: `src/views/HomeStack/Task/TaskController.tsx:26-33` (OBSERVADA)
[NEEDS CLARIFICATION: no hay un mensaje de "sin tareas"; ¿se requiere uno?]

#### Scenario: Sucursal sin carga
- GIVEN la sucursal no tiene tareas
- WHEN el usuario abre la consulta
- THEN ve las secciones "Tareas disponibles por asignar" y "Tareas asignadas" sin filas

## Historial
- 2026-10-19 · map: inventario inicial (adopción del kit)
