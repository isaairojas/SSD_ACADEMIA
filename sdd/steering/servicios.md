# Steering · Catálogo de servicios · Exodus GTM

> Mapa de los microservicios y frentes que componen el sistema: qué capacidad posee cada uno, en qué repositorio vive, qué contrato expone y quién lo mantiene. Es lo que `/exodus-sdd:impact` consulta para saber qué repos toca un cambio. Dueño: Arquitectura.
>
> Redactado en la adopción (2026-10-19) recorriendo `C:\Repositorios` en solo lectura. Todas las rutas del front pasan por **api-gateway-rb** (`/gt/v1/`, `api-gateway-rb/src/ApiGatewayRB.Api/ocelot.ProductionExpose.json`). Las capacidades back-end aún no tienen specs en sus repos: la columna indica a qué capacidad del front sirven.

| Servicio / frente | Capacidades que sirve / posee | Repositorio | Contrato que expone | Consumido por | Agente | Dueño |
| --- | --- | --- | --- | --- | --- | --- |
| exodus-gtm-pwa | todas las de `steering/product.md` (experiencia) | `C:\Repositorios\exodus-gtm-pwa` | — (consumidor) | — | dev-frontend `<por definir>` | `<por definir>` |
| api-gateway-rb | enrutamiento `/gt/v1/*` | `C:\Repositorios\api-gateway-rb` | Ocelot `ocelot.ProductionExpose.json` | exodus-gtm-pwa | backend-net | `<por definir>` |
| Identity (HH) | autenticacion-sesion (`token`, `revocation`) | `C:\Repositorios\idenityserver` `<inferido; existe también OPS4/Back/indentity-server-4>` | OAuth2 / IdentityServer | exodus-gtm-pwa | backend-net | `<por definir>` |
| general-task | autenticacion-sesion (sucursales cercanas, health), consulta-tarea-sucursal, asignacion-tarea | `C:\Repositorios\general-task` (OBS) | `generalTask/api/v1/{session,task}` | exodus-gtm-pwa | backend-net | `<por definir>` |
| inventory-task | conteo-inventario, catálogo de motivos especiales, garantía; pausa usada también por recepción | `C:\Repositorios\OPS4\Back\inventory-task` (OBS) | `InventoryTask/api/v1,v2/{tasks,catalogs,warranty}` | exodus-gtm-pwa | backend-net | `<por definir>` |
| reception-task | recepcion-mercancia, etiquetado-recepcion | `C:\Repositorios\reception-task` (OBS; copia en `OPS4/Back/reception-task`) | `receptiontask/api/v1/{tasks,orders,tags}` | exodus-gtm-pwa | backend-net | `<por definir>` |
| assortment-task | surtido-ronda, surtido-listado (+ motivos de negación) | `C:\Repositorios\assortment-task` (OBS) | `assortmentTask/api/v1,v2/{Orders,AssortmentTasks,Product}` | exodus-gtm-pwa | backend-net | `<por definir>` |
| revision-surtido | revision-surtido | `C:\Repositorios\revision-surtido` (OBS) | `revisionsurtido/api/v1/TareaRevision/{Iniciar,Finalizar}` | exodus-gtm-pwa | backend-net | `<por definir>` |
| evidencias-logisticas | evidencia-embarque, contador de menu-inicio | `C:\Repositorios\evidencias-logisticas` (OBS) | `logisticsevidence/api/v1/branch-offices/...` | exodus-gtm-pwa | backend-net | `<por definir>` |
| operaciones-api (EtiquetaUnica) | etiqueta única en surtido-ronda, surtido-listado y etiquetado-recepcion | `C:\Repositorios\operaciones-api` (OBS) | `etiquetaunica/api/etiquetaunica/*` | exodus-gtm-pwa | backend-net | `<por definir>` |
| SeguridadService (Objeto) | catalogo-bandera-sucursal | `<por definir: sin repo local>` | `api/Objeto/{sucursal}` → `/api/v2/Objeto/Sucursal/{id}` | exodus-gtm-pwa | — | `<por definir>` |
| SupportAssortmentRound | apoyo de ronda en surtido-ronda | `<inferido: generacion-rondas-surtido, ruta no encontrada>` | `supportassortment/validateroundsupport/{sucursal}` | exodus-gtm-pwa | — | `<por definir>` |
| AxBPromotion | promociones AxB en surtido-ronda y surtido-listado | `<por definir: sin repo local>` | `axbpromotion/api/v1/Promotion/*` | exodus-gtm-pwa | — | `<por definir>` |
| PackingListValidationsApi | validacion-recepcion-caja, reporte-incidencia-caja | `<por definir: sin repo local>` | `pkgl/validations/{Validation,Incidence}` | exodus-gtm-pwa | — | `<por definir>` |
| ApiTraspasosRezagos | traspasos en validacion-recepcion-caja | `<por definir: sin repo local>` | `traspasosrezagados/Traspasos/Resagados/*` | exodus-gtm-pwa | — | `<por definir>` |
| AssessmentsConfigApi | evaluación de proveedor en validacion-recepcion-caja | `<por definir: sin repo local>` | `assessments/assessment/evaluacionproveedor` | exodus-gtm-pwa | — | `<por definir>` |
| Message publishers (Rabbit / GraphQL) | notificación de apoyo de ronda en surtido-ronda | `<por definir: sin repo local>` | `rabbitmqmessagepublisher/rabbit/message/publish`, `graphqlmessagepublisher/graphrequest` | exodus-gtm-pwa | — | `<por definir>` |
| surtido-api-gateway | (antes) rutas de TareaRevision | `C:\Repositorios\surtido-api-gateway` | Ocelot | — (sustituido por api-gateway-rb en el hotfix `997716fc`, "temporal") | — | `<por definir: ¿se retira?>` |

## Convenciones
- Una capacidad vive en un solo servicio; si dos servicios parecen poseer la misma, es una decisión pendiente de Arquitectura.
- Los contratos públicos entre servicios se versionan y solo cambian con ADR (constitución).
- Cómo llamar a un servicio desde otro: `<por definir: referencia al patrón backend-net>`.

## Dependencias conocidas entre servicios
- La recepción (reception-task) usa la pausa de inventory-task desde el front (`ReceptionTasksController.tsx:496`): acoplamiento a revisar.
- La recepción consulta el detalle de producto de inventory-task (`ReceptionTasksController.tsx:165`).
