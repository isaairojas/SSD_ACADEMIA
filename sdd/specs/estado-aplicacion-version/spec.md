# Capacidad: estado-aplicacion-version

Creada 2026-10-19 por `/exodus-sdd:adoptar` (map, inventario inicial). Esta es la verdad actual de la capacidad; se modifica solo mediante deltas fusionados con `/exodus-sdd:sync`.

> **Spec observada**: describe lo que el sistema hace hoy, no lo que debería hacer. Producto debe validarla antes de que un cambio la modifique.

## Propósito
Mantiene a los usuarios en la versión vigente de la app (Android y web), informa del estado general de la app (carga en curso, errores) y permite a operación verificar que la versión web está en línea.

Deuda observada (no son requisitos; ver `sdd/adopcion.md`):
- La versión de la app vive en cuatro lugares distintos: número interno 38 (`src/i18n/es.ts:410`), etiqueta "v2.12.1" (`src/i18n/es.ts:71`), `package.json` 2.12.1 y `app.config.js` 1.0.0.
- El estado de carga y la alerta se guardan junto con la sesión (`src/rtk/store/store.ts:33`); INFERIDA: pueden reaparecer tras recargar.

## Requisitos

### Requirement: Aviso de versión desactualizada
WHEN el usuario elige una sucursal cuya versión mínima es mayor que la versión de la app, el sistema SHALL mostrar el aviso "Versión desactualizada" con instrucciones según la plataforma: en web, refrescar la página; en Android, descargar e instalar desde un enlace.
Evidencia: `src/views/AuthStack/Login/LoginController.tsx:87-97`, `src/views/AuthStack/Login/LoginScreen.tsx:136-142`, `src/i18n/es.ts:174-176, 409-411` (OBSERVADA)
[NEEDS CLARIFICATION: hoy el aviso no impide iniciar sesión con la versión desactualizada; ¿debe bloquear el inicio de sesión?]

#### Scenario: Versión al día
- GIVEN la app tiene la versión 38 y la sucursal "Centro" exige la versión 38
- WHEN el usuario elige "Centro"
- THEN no ve ningún aviso de versión

#### Scenario: Versión desactualizada en Android
- GIVEN la app Android tiene la versión 38 y la sucursal "Centro" exige la versión 39
- WHEN el usuario elige "Centro"
- THEN ve "Versión desactualizada" con el mensaje para descargar e instalar desde el enlace

#### Scenario: Versión desactualizada en web
- GIVEN la app web tiene la versión 38 y la sucursal "Centro" exige la versión 39
- WHEN el usuario elige "Centro"
- THEN ve "Versión desactualizada" con el mensaje "refresca la página para continuar"

### Requirement: Descarga de la nueva versión
WHEN el usuario pulsa la acción del aviso de versión desactualizada, el sistema SHALL abrir el enlace de descarga del instalador Android vigente.
Evidencia: `src/views/AuthStack/Login/LoginController.tsx:130-132`, `nginx.conf` (`/downloadapk/`) (OBSERVADA)
[NEEDS CLARIFICATION: en web la acción también abre el enlace del instalador Android aunque el mensaje pide refrescar la página; ¿qué debe hacer en web?]

#### Scenario: Descargar instalador
- GIVEN el aviso de versión desactualizada está visible
- WHEN el usuario pulsa la acción del aviso
- THEN se abre la descarga del instalador Android vigente

### Requirement: Verificación de disponibilidad de la versión web
WHEN se consulta la raíz del sitio web, el sistema SHALL responder con el texto "Running" seguido de la fecha y hora, sin requerir sesión.
Evidencia: `nginx.conf` (`location = /`), `App.tsx:14-35` (OBSERVADA)

#### Scenario: Consulta de salud
- WHEN un monitor consulta la raíz del sitio web
- THEN recibe "Running <fecha y hora>"

### Requirement: Indicador de operación en curso
WHILE una operación con el servidor está en curso, el sistema SHALL mostrar un indicador de carga global.
Evidencia: `src/navigation/AppNavigator.tsx:49`, `src/rtk/slices/appStatus.ts:29-31` (OBSERVADA)

#### Scenario: Consulta en curso
- WHEN el usuario abre la consulta de tareas y la respuesta aún no llega
- THEN ve el indicador de carga hasta que llega la respuesta

### Requirement: Alerta global descartable
WHEN ocurre un error o un aviso general, el sistema SHALL mostrar una alerta con título y mensaje sobre cualquier pantalla, que el usuario puede cerrar.
Evidencia: `src/navigation/AppNavigator.tsx:27-29, 46-48` (OBSERVADA)

#### Scenario: Cerrar alerta
- GIVEN se muestra una alerta de error
- WHEN el usuario la cierra
- THEN la alerta desaparece y la pantalla anterior sigue igual

### Requirement: Recarga de la versión web con conexión
WHERE la app se usa en web, el sistema SHALL cargar siempre la versión publicada más reciente cuando hay conexión y usar la última versión cargada (de hasta un día de antigüedad) cuando no hay conexión.
Evidencia: `workbox-config.js` (estrategia NetworkFirst, 1 día, 50 entradas), `public/index.html:35-38` (OBSERVADA); el comportamiento sin conexión es INFERIDA (configuración, no probado)

#### Scenario: Nueva versión publicada
- GIVEN se publicó una nueva versión web
- WHEN el usuario recarga la página con conexión
- THEN usa la nueva versión

#### Scenario: Sin conexión
- GIVEN el usuario abrió la app web hace menos de un día
- WHEN recarga la página sin conexión
- THEN la app vuelve a mostrarse con la última versión cargada

## Historial
- 2026-10-19 · map: inventario inicial (adopción del kit)
