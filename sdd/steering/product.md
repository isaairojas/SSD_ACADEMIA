# Steering · Producto · Exodus GTM

> Conocimiento estable que todo agente debe tener antes de especificar. Mantener corto (1–2 páginas). Dueño: Producto.
>
> Estado: redactado en la adopción del kit (2026-10-19) a partir de la descripción del equipo y del inventario del código. Lo marcado `<inferido>` debe confirmarlo Producto.

## Qué es el producto
- Propósito en una frase: app móvil (Android, HandHeld) y PWA web con la que el personal de las unidades de negocio (sucursales) ejecuta las tareas operativas que se le asignan.
- Usuarios y roles principales: personal operativo de sucursal que ejecuta tareas; roles con permiso de validar mercancía recibida (`roleId` 2, 4, 6, 9) `<inferido: nombre de cada rol por definir>`.
- Procesos de negocio que soporta: surtido de pedidos, revisión de surtido, embarque y evidencia de embarque, recepción de mercancía, impresión y validación de etiquetas, conteo de inventarios, validación de cajas recibidas (packing list) e incidencias de caja.
- Qué NO es / fuera de alcance permanente: `<por definir>` (p. ej. la asignación y priorización de tareas la decide el back-end, no la app `<inferido>`).

## Vocabulario del dominio (ubiquitous language)
| Término | Significado | Sinónimos a evitar |
| --- | --- | --- |
| Sucursal / unidad de negocio | Punto donde opera el usuario; se elige al iniciar sesión (`branchOfficeId`). | `<por definir>` |
| Tarea | Trabajo asignado al usuario; su `activityId` determina el flujo (inventario, recepción, surtido, revisión). | actividad (como sinónimo de tarea) `<inferido>` |
| Surtido | Recolectar los productos de uno o varios pedidos en contenedores. | assortment |
| Ronda | Agrupación de pedidos que se surten juntos en una tarea. | `<por definir>` |
| Revisión de surtido | Verificar las piezas surtidas de un pedido antes de embarcarlo. | assortment check |
| Contenedor | Recipiente (físico o virtual) donde se deposita lo surtido; código de 8 dígitos. | `<por definir>` |
| Negar | Declarar que un producto del pedido no se surte, con motivo. | denial |
| Etiqueta única (EU) | QR por pieza con caducidad; se valida al surtir perecederos. | `<por definir>` |
| Recepción | Registrar la mercancía que llega a la sucursal contra una orden y papeleta. | `<por definir>` |
| Papeleta | Documento de la recepción (`ballot`). | ballot |
| Bandera | Feature flag activado por sucursal. | flag |
| Evidencia de embarque | Foto que prueba la entrega/salida de un embarque. | `<por definir>` |
| HH / HandHeld | Dispositivo con escáner en modo teclado en el que corre la app. | `<por definir>` |

## Capacidades (mapa de alto nivel)
Propuesta del inventario de adopción (`sdd/adopcion.md`). Las 15 capacidades tienen spec canónica observada en `sdd/specs/` (las 5 primeras desde 2026-10-19, las demás desde 2026-10-22 vía `map`; `surtido-pedido` se dividió en `surtido-ronda` y `surtido-listado`); Producto debe validarlas.

| Capacidad (carpeta en `specs/`) | Qué cubre | Dueño funcional |
| --- | --- | --- |
| autenticacion-sesion | Login por sucursal cercana, sesión, refresco y expiración de token, logout | `<por definir>` |
| estado-aplicacion-version | Aviso de versión/APK, salud, alertas y carga globales | `<por definir>` |
| catalogo-bandera-sucursal | Banderas por sucursal y catálogos de motivos | `<por definir>` |
| menu-inicio | Menú principal y contador de evidencias pendientes | `<por definir>` |
| consulta-tarea-sucursal | Tareas asignadas / sin asignar de la sucursal | `<por definir>` |
| asignacion-tarea | Tomar la siguiente tarea y enrutar al flujo según actividad | `<por definir>` |
| conteo-inventario | Conteo de productos, motivos especiales, garantía, correcciones | `<por definir>` |
| recepcion-mercancia | Recepción de productos de una orden/papeleta | `<por definir>` |
| etiquetado-recepcion | Impresión, caducidad y validación de etiquetas de recepción | `<por definir>` |
| surtido-ronda | Surtido de una ronda multipedido producto por producto, con contenedores (V1) | `<por definir>` |
| surtido-listado | Surtido de un solo pedido desde el listado de productos y su detalle (V2) | `<por definir>` |
| revision-surtido | Revisión de piezas surtidas y gestión de discrepancias | `<por definir>` |
| evidencia-embarque | Fotos de evidencia de embarques pendientes | `<por definir>` |
| validacion-recepcion-caja | Validación de cajas recibidas (packing list), descarga y evaluación de proveedor | `<por definir>` |
| reporte-incidencia-caja | Incidencias de caja con fotos y comentario | `<por definir>` |

## Restricciones de producto
- Regulatorias / legales: `<por definir>`
- Accesibilidad, idiomas, dispositivos: solo español (es-MX); HandHeld Android con escáner en modo teclado y navegador web (PWA); voz TTS en surtido.
- Integraciones externas obligatorias: todas vía `api-gateway-rb` (ver `servicios.md`).

## Fuentes de verdad externas
- Diseño: `<por definir>`
- Analítica / indicadores: `<por definir>`
