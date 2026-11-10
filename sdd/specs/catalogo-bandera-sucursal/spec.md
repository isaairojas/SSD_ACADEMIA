# Capacidad: catalogo-bandera-sucursal

Creada 2026-10-19 por `/exodus-sdd:adoptar` (map, inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite activar funciones por sucursal (banderas) sin publicar una nueva versión de la app, y pone a disposición de los flujos operativos los catálogos de motivos que necesitan.

Banderas observadas y la capacidad que gobiernan (el efecto de cada una se especifica en esa capacidad):

| Bandera | Capacidad que gobierna |
| --- | --- |
| `Bandera_PackingListRecepcion` | menu-inicio (opción "Validar mercancía recibida") |
| `Bandera_RevisionIndependienteEnHH` | asignacion-tarea (revisión) |
| `BanderaListadoDeProductosEnHH` | asignacion-tarea / surtido-listado |
| `Bandera_UbicacionesUDN` | surtido-ronda, surtido-listado, conteo-inventario (formato de ubicación) |
| `Bandera_RevisionPedidoEnHH` | surtido-listado (revisión de piezas) |
| `BanderaSubirFotoEvidenciasEmbarquesHH` | evidencia-embarque (subir desde galería) |

Deuda observada: la misma consulta de bandera está implementada de tres formas (`src/services/CatalogServices.ts:22-35`, `src/services/TaskService.ts:28-50`, `src/views/HomeStack/InventoryCount/InventoryCountScreen.tsx:189-196`) y el submódulo 113 está fijo en código.

## Requisitos

### Requirement: Bandera activa por sucursal
El sistema SHALL considerar activa una bandera para la sucursal de la sesión solo si el servicio de seguridad la reporta como habilitada para esa sucursal.
Evidencia: `src/services/CatalogServices.ts:22-35` (OBSERVADA)

#### Scenario: Bandera habilitada
- GIVEN la sucursal "Centro" tiene habilitada `Bandera_PackingListRecepcion`
- WHEN la app consulta esa bandera para "Centro"
- THEN la considera activa

#### Scenario: Bandera no habilitada
- GIVEN la sucursal "Centro" no tiene habilitada `Bandera_PackingListRecepcion`
- WHEN la app consulta esa bandera para "Centro"
- THEN la considera inactiva

### Requirement: Bandera inactiva ante falla
IF la consulta de una bandera falla THEN el sistema SHALL considerarla inactiva y continuar el flujo.
Evidencia: `src/services/TaskService.ts:44-49` (OBSERVADA); en `src/services/CatalogServices.ts:29-30` la falla se propaga al flujo que consulta (OBSERVADA)
[NEEDS CLARIFICATION: dos implementaciones se comportan distinto ante una falla (una devuelve inactiva y otra propaga el error); ¿cuál es el comportamiento esperado?]

#### Scenario: Servicio de seguridad no disponible
- GIVEN el servicio de seguridad no responde
- WHEN la app consulta `Bandera_UbicacionesUDN`
- THEN la trata como inactiva y el usuario continúa con el comportamiento sin bandera

### Requirement: Banderas del menú al entrar
WHEN el usuario entra al menú principal con una sucursal, el sistema SHALL consultar `Bandera_PackingListRecepcion` y `Bandera_RevisionIndependienteEnHH` para esa sucursal y conservar el resultado durante la sesión.
Evidencia: `src/views/HomeStack/Home/HomeController.tsx:44-60`, `src/rtk/slices/catalogs.ts:23-30` (OBSERVADA)

#### Scenario: Entrada al menú
- GIVEN el usuario inició sesión en "Centro"
- WHEN entra al menú principal
- THEN las dos banderas quedan disponibles para el resto de los flujos de la sesión

### Requirement: Banderas limitadas a la sesión
WHEN el usuario cierra sesión, el sistema SHALL descartar las banderas y catálogos guardados para que la siguiente sesión los consulte de nuevo.
Evidencia: `src/views/HomeStack/Home/HomeController.tsx:70`, `src/rtk/slices/catalogs.ts:37-41` (OBSERVADA)

#### Scenario: Cambio de sucursal
- GIVEN el usuario tenía activa `Bandera_PackingListRecepcion` en "Centro"
- WHEN cierra sesión e inicia en "Norte", que no la tiene
- THEN la bandera queda inactiva para "Norte"

### Requirement: Catálogo de motivos de tarea especial
WHEN el usuario va a iniciar una tarea de inventario de las actividades 4 o 45, el sistema SHALL cargar el catálogo de motivos de tarea especial antes de abrir el conteo.
Evidencia: `src/views/HomeStack/TaskAssign/TaskAssignController.tsx:79-88` (OBSERVADA)
[NEEDS CLARIFICATION: si la carga del catálogo falla, el conteo se abre igual y el usuario no podrá elegir motivo; ¿debe impedirse el inicio?]

#### Scenario: Tarea con motivo especial
- GIVEN al usuario se le asignó una tarea de la actividad 45
- WHEN confirma iniciarla
- THEN el conteo se abre con los motivos de tarea especial disponibles

### Requirement: Catálogo de motivos de negación
WHEN el usuario abre un surtido por pedido o una revisión de surtido, el sistema SHALL cargar el catálogo de motivos de negación y descartarlo al salir del flujo.
Evidencia: `src/views/HomeStack/AssortmentTaskV2/AssortmentTaskController.tsx:262, 345`, `src/views/HomeStack/AssortmentCheck/AssortmentCheckController.tsx:84, 468` (OBSERVADA)

#### Scenario: Negar en revisión
- GIVEN el usuario abrió una revisión de surtido
- WHEN debe negar un producto con diferencia
- THEN puede elegir un motivo del catálogo de negación

## Historial
- 2026-10-19 · map: inventario inicial (adopción del kit)
- 2026-10-22 · map: referencias actualizadas por la división de `surtido-pedido` en `surtido-ronda` y `surtido-listado`
