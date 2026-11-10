# Capacidad: autenticacion-sesion

Creada 2026-10-19 por `/exodus-sdd:adoptar` (map, inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Permite que el personal de una sucursal entre a la app eligiendo una sucursal cercana a su ubicación y sus credenciales, mantiene la sesión activa mientras trabaja y la cierra de forma segura (por decisión del usuario o por expiración).

Deuda observada (no son requisitos; ver `sdd/adopcion.md`):
- El secreto de cliente OAuth viaja dentro de la app (`src/services/AuthServices.ts:26`).
- Los tokens se guardan en el almacenamiento local del dispositivo o navegador (`src/rtk/store/store.ts:30-35`).
- El cierre de sesión del cliente de identidad hace GET en lugar de DELETE (`src/http/apiIdentity.ts:55-57`).

## Requisitos

### Requirement: Sucursales cercanas por ubicación
El sistema SHALL obtener la ubicación del dispositivo al abrir el inicio de sesión y ofrecer para elegir solo las sucursales cercanas a esa ubicación.
Evidencia: `src/views/AuthStack/Login/LoginController.tsx:40-85` (OBSERVADA)
[NEEDS CLARIFICATION: el criterio de "cercana" (radio en km) lo decide el servidor; ¿cuál es y quién lo define?]

#### Scenario: Ubicación concedida
- GIVEN el usuario concede el permiso de ubicación
- WHEN se abre la pantalla de inicio de sesión
- THEN ve la lista de sucursales cercanas a su ubicación para elegir una

#### Scenario: Permiso de ubicación negado
- GIVEN el usuario negó el permiso de ubicación
- WHEN se abre la pantalla de inicio de sesión
- THEN ve el error "No se pudo obtener tu ubicación" y no puede iniciar sesión

#### Scenario: Sin sucursales cercanas
- GIVEN no hay sucursales cercanas a la ubicación del usuario o la consulta falla
- WHEN se abre la pantalla de inicio de sesión
- THEN ve el error "No se encontró ninguna sucursal en tu localización" y no puede iniciar sesión

### Requirement: Búsqueda de sucursal por nombre
El sistema SHALL filtrar la lista de sucursales cercanas por el texto que escribe el usuario, sin distinguir mayúsculas de minúsculas.
Evidencia: `src/views/AuthStack/Login/LoginController.tsx:99-104` (OBSERVADA)

#### Scenario: Filtrar por parte del nombre
- GIVEN hay sucursales cercanas "Centro" y "Norte"
- WHEN el usuario escribe "cen"
- THEN la lista muestra solo "Centro"

### Requirement: Habilitación del inicio de sesión
El sistema SHALL permitir iniciar sesión solo cuando el usuario capturó usuario, contraseña y sucursal y no hay un error de ubicación o de sucursales.
Evidencia: `src/views/AuthStack/Login/LoginController.tsx:32-38` (OBSERVADA)

#### Scenario: Datos incompletos
- GIVEN el usuario capturó usuario y contraseña pero no eligió sucursal
- WHEN observa el botón de iniciar sesión
- THEN el botón está deshabilitado

#### Scenario: Datos completos
- GIVEN el usuario capturó usuario, contraseña y eligió sucursal sin errores
- WHEN observa el botón de iniciar sesión
- THEN el botón está habilitado

### Requirement: Normalización del número de usuario
El sistema SHALL quitar los ceros a la izquierda del usuario capturado y usarlo como número de empleado de la sesión.
Evidencia: `src/views/AuthStack/Login/LoginController.tsx:122, 134-136` (OBSERVADA)

#### Scenario: Usuario con ceros a la izquierda
- WHEN el usuario captura "00123"
- THEN el campo queda como "123" y la sesión se abre con el número de empleado 123

### Requirement: Inicio de sesión por sucursal
WHEN el usuario envía credenciales válidas para la sucursal elegida, el sistema SHALL abrir la sesión en esa sucursal con su rol y nombre, y mostrar el menú principal.
Evidencia: `src/views/AuthStack/Login/LoginController.tsx:106-128` (OBSERVADA)

#### Scenario: Credenciales válidas
- GIVEN el usuario eligió la sucursal "Centro"
- WHEN inicia sesión con credenciales válidas
- THEN ve el menú principal y todas sus tareas se consultan para la sucursal "Centro"

#### Scenario: Credenciales inválidas
- WHEN el usuario inicia sesión con credenciales rechazadas
- THEN ve una alerta de error con la descripción que devuelve el servidor de identidad y permanece en el inicio de sesión
- Evidencia: `src/http/apiIdentity.ts:59-72` (OBSERVADA)

### Requirement: Renovación automática de la sesión
WHILE la sesión está activa y el usuario hace operaciones, el sistema SHALL renovar la sesión 15 segundos antes de que expire, sin pedir de nuevo las credenciales.
Evidencia: `src/utils/services.tsx:54-78`, `src/http/apiApymsa.ts:24-29` (OBSERVADA)
[NEEDS CLARIFICATION: la renovación solo se programa después de una operación exitosa; ¿debe renovarse también si el usuario no ha operado desde que abrió la app?]

#### Scenario: Renovación antes de expirar
- GIVEN una sesión que expira en 10 minutos y el usuario completó una operación
- WHEN faltan 15 segundos para la expiración
- THEN la sesión se renueva y el usuario sigue trabajando sin volver a iniciar sesión

### Requirement: Expiración de la sesión
IF el servidor rechaza una operación por sesión no autorizada THEN el sistema SHALL cerrar la sesión, descartar el avance local de recepción, volver al inicio de sesión y avisar "Tu sesión ha expirado, por favor inicia sesión nuevamente".
Evidencia: `src/utils/services.tsx:11-23` (OBSERVADA)

#### Scenario: Operación con sesión vencida
- GIVEN la sesión del usuario ya no es válida en el servidor
- WHEN el usuario hace cualquier operación
- THEN regresa al inicio de sesión con la alerta "Tu sesión ha expirado" y el avance local de recepción se descarta

### Requirement: Reanudación de la sesión al abrir la app
WHEN la app se abre con una sesión guardada, el sistema SHALL mostrar directamente el menú principal y verificar la sesión con el servidor.
Evidencia: `src/navigation/AppNavigator.tsx:31-41`, `src/rtk/store/store.ts:30-35` (OBSERVADA); que la verificación invalide la sesión depende de que el servidor exija autorización en la consulta de salud (INFERIDA: el cliente adjunta el token en `src/http/apiApymsa.ts:18-21`)

#### Scenario: Sesión guardada vigente
- GIVEN el usuario cerró la app sin cerrar sesión y su sesión sigue vigente
- WHEN vuelve a abrir la app
- THEN ve el menú principal sin volver a iniciar sesión

#### Scenario: Sesión guardada vencida
- GIVEN el usuario cerró la app sin cerrar sesión y su sesión ya venció
- WHEN vuelve a abrir la app
- THEN regresa al inicio de sesión con la alerta "Tu sesión ha expirado"

### Requirement: Cierre de sesión con confirmación
WHEN el usuario confirma "¿Deseas cerrar sesión?", el sistema SHALL invalidar la sesión en el servidor, borrar la sesión, los datos del usuario y las banderas de sucursal guardadas, y volver al inicio de sesión.
Evidencia: `src/views/HomeStack/Home/HomeController.tsx:66-73`, `src/views/HomeStack/Home/HomeScreen.tsx:115-128` (OBSERVADA)
[NEEDS CLARIFICATION: al expirar la sesión se descarta el avance local de recepción, pero al cerrar sesión no; ¿debe descartarse también al cerrar sesión?]

#### Scenario: Confirmar cierre
- GIVEN el usuario está en el menú principal
- WHEN pulsa cerrar sesión y confirma
- THEN regresa al inicio de sesión y al volver a abrir la app no hay sesión guardada

#### Scenario: Cancelar cierre
- WHEN el usuario pulsa cerrar sesión y cancela
- THEN permanece en el menú principal con la sesión activa

### Requirement: Avisos de error de comunicación
IF una operación falla por comunicación o por error del servidor THEN el sistema SHALL mostrar una alerta de error con el mensaje que devuelve el servidor o, si no hay mensaje, "No se logró comunicar con los servicios. Favor de revisar su conexión a internet".
Evidencia: `src/utils/services.tsx:24-51, 102-112`, `src/http/apiErrors.ts:8-29` (OBSERVADA)
[NEEDS CLARIFICATION: cuando una operación excede el tiempo de espera (3 minutos) no se muestra ningún aviso (`src/http/apiApymsa.ts:70-77`); ¿es intencional?]

#### Scenario: Error con mensaje del servidor
- WHEN el servidor rechaza una operación con el mensaje "Pedido no encontrado"
- THEN el usuario ve una alerta "Error" con el texto "Pedido no encontrado"

#### Scenario: Sin conexión
- WHEN una operación falla sin respuesta del servidor
- THEN el usuario ve una alerta "Error" con "No se logró comunicar con los servicios. Favor de revisar su conexión a internet"

## Historial
- 2026-10-19 · map: inventario inicial (adopción del kit)
