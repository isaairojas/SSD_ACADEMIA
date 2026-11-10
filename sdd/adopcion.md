# Informe de adopción SDD · Exodus GTM

> Foto de lo que `exodus-gtm-pwa` hace hoy, obtenida del código con evidencia. **No describe lo que debería hacer**: Producto valida las specs observadas, Arquitectura confirma steering y constitución, y QA revisa la cobertura. Generado con `/exodus-sdd:adoptar` (2026-10-19 → 2026-10-22).

## Estado por paso
| Paso | Estado | Artefacto |
| --- | --- | --- |
| Fundar (`init`) | Hecho | `sdd/README.md`, `constitution.md`, `harness-backlog.md` |
| Steering técnico | Hecho, con `<por definir>` pendientes de Arquitectura | `steering/{product,structure,tech,servicios}.md` |
| Inventario y `map` | Hecho: 15 capacidades (`surtido-pedido` dividida en `surtido-ronda` y `surtido-listado`) | `specs/<capacidad>/spec.md` |
| Catálogo de servicios | Hecho, 18 servicios o frentes; 8 sin repositorio local | `steering/servicios.md` |
| Constitución | v1.1: 10 principios base del kit + 11–15 propios del proyecto; **sin aprobación de Arquitectura registrada** | `constitution.md` |
| Validación | `sdd-validate`: 0 errores, 0 advertencias | — |

## Capacidades mapeadas
Todas son **specs observadas** (cada requisito cita `archivo:línea`). Dejan de serlo con el `sync` del primer cambio que las toque.

| Capacidad | Requisitos | OBSERVADA | INFERIDA | Escenarios | `[NEEDS CLARIFICATION]` |
| --- | --- | --- | --- | --- | --- |
| autenticacion-sesion | 10 | 11 | 1 | 17 | 4 |
| estado-aplicacion-version | 6 | 6 | 0 | 9 | 2 |
| catalogo-bandera-sucursal | 6 | 6 | 0 | 7 | 2 |
| menu-inicio | 4 | 4 | 0 | 10 | 3 |
| consulta-tarea-sucursal | 5 | 5 | 0 | 6 | 2 |
| asignacion-tarea | 12 | 12 | 0 | 16 | 6 |
| conteo-inventario | 11 | 11 | 0 | 14 | 5 |
| recepcion-mercancia | 11 | 11 | 0 | 13 | 5 |
| etiquetado-recepcion | 12 | 12 | 0 | 14 | 6 |
| surtido-ronda | 13 | 13 | 0 | 17 | 9 |
| surtido-listado | 11 | 11 | 0 | 12 | 2 |
| revision-surtido | 12 | 12 | 0 | 21 | 6 |
| evidencia-embarque | 12 | 12 | 0 | 16 | 7 |
| validacion-recepcion-caja | 12 | 12 | 0 | 19 | 8 |
| reporte-incidencia-caja | 7 | 7 | 0 | 14 | 3 |
| **Total** | **144** | | **1** | **205** | **70** |

Notas:
- `surtido-pedido` (19 requisitos, dos pantallas) se dividió el 2026-10-22 en `surtido-ronda` (V1, `AssortmentTask`) y `surtido-listado` (V2, `AssortmentTaskV2` + `ProductDetail`). Los comportamientos comunes (etiqueta única, caducidad, negar, voz, salir) quedan especificados en cada una con su variante.
- La elección de pantalla V1/V2 vive solo en `asignacion-tarea`; las dos capacidades de surtido la referencian.

## Detectado pero no mapeado
Comportamiento visto en el código que no tiene requisitos todavía (anotado en el `## Propósito` de su capacidad):
- **surtido-ronda:** edición de productos ya surtidos, enviar producto al final, surtido parcial, promociones AxB, consulta de contenedor, avisos por tiempo límite (mitad, tres cuartos, vencimiento), aviso de apoyo HH cada 120 s (`SupportAssortmentRound` + publicadores Rabbit/GraphQL), correo de promociones no procesadas.
- **surtido-listado:** "ofertas especiales" (AxB), avisos por tiempo límite, detalle de producto (aumentar/disminuir/cantidad manual), surtido parcial.
- **recepcion-mercancia:** literal del aviso de diferencia en la edición de cantidad.
- **etiquetado-recepcion:** servicio `skip-printing` (`validateKey`) implementado y sin uso.

## Reglas de negocio sin dueño claro
Valores fijos en el código cuyo significado de negocio nadie ha confirmado. Cada uno debería tener dueño y, si cambia por sucursal, vivir en configuración.

| Regla | Dónde | Capacidad |
| --- | --- | --- |
| Listas de `activityId` por flujo (inventario {3–7, 45, 46, 48–57, 61, 62}, recepción {2}, surtido {31, 58}, revisión {34, 35}; 59 y 60 sin enrutar) | `TaskAssignController.tsx:254-292`, `types/services/TaskServices.ts:62-66` | asignacion-tarea |
| `roleId` 2, 4, 6, 9 pueden validar mercancía (nombres de rol desconocidos) | `HomeController.tsx:28` | validacion-recepcion-caja |
| Actividades 45 y 4 exigen motivo especial; garantía es `reasonId` 5 (duplicado como enum y literal) | `InventoryCountController.tsx` | conteo-inventario |
| Motivo fijo 6 al negar promociones AxB; `monitoringID` 3 al guardar V2 | `AssortmentTaskController.tsx` (V1 y V2) | surtido-ronda, surtido-listado |
| Formatos: contenedor 8 dígitos (3 id + 5 peso), producto 7/18/51–100 dígitos, QR de recepción ≥ 49, etiqueta de caja 14 (8+3+3), conteo 13 (7+6) | varios controladores | surtido, revisión, etiquetado, validación de caja, conteo |
| Banderas por sucursal: `BanderaListadoDeProductosEnHH` (113), `Bandera_RevisionIndependienteEnHH`, `Bandera_RevisionPedidoEnHH`, `Bandera_UbicacionesUDN`, `Bandera_PackingListRecepcion`, `BanderaSubirFotoEvidenciasEmbarquesHH`, `surtidoEtiquetaUnicaEnabled`, `supplierSplitValidation`, `esPiloto` | `catalogo-bandera-sucursal` + controladores | varias |
| Parámetros técnicos: página de 15 embarques, imágenes 1 MB / 1280 px, contraste 1.9 y brillo −80, comentario 5–500, máximo 4 fotos | evidencias e incidencias | evidencia-embarque, reporte-incidencia-caja |

## Deuda transversal observada
- **Fallas silenciosas:** varias llamadas que fallan no avisan al usuario (inicio de conteo, lista y guardado de evidencias, registro de escaneo de cajas, confirmación de descarga, traspasos rezagados). No se revisó si el interceptor de `src/http/` muestra una alerta global; confirmarlo resolvería varios `[NEEDS CLARIFICATION]` de una vez.
- **Textos fuera de `i18n/es.ts`:** modal de evaluación de proveedor, lista de embarques, conteo ("Torre", "Folio", "Fecha inicio:"), exceso de etiquetas y controladores de surtido.
- **Límites de capas:** `InventoryCountScreen.tsx:10, 192` es la única Screen que importa `services` directamente; recepción usa la pausa y el detalle de producto de `inventory-task`.
- **Gateway temporal:** el hotfix `997716fc` cambió la revisión de surtido a `api-gateway-rb` "temporalmente"; `surtido-api-gateway` queda sin decisión de retiro.

## Discrepancias con la documentación existente
- `README.md` pide Node v20.15.0 y Yarn; el `Dockerfile` usa node 20.16 y el repo versiona `package-lock.json` (npm). Hay que decidir un gestor de paquetes y una versión de Node.
- `steering/product.md` decía "confirmar nombres antes de mapear"; los nombres se usaron tal cual se propusieron (ya actualizado).

## Principios propios del proyecto (constitución v1.1)
Incorporados el 2026-10-22 con `/exodus-sdd:constitution`; la constitución queda en 15 de 15 principios. Las reglas ya las cumple el código (con las excepciones indicadas) y se comprueban con sí/no. **Pendiente: aprobación de Arquitectura (gate A).** Redacción vigente en `constitution.md`; resumen:

11. **Controller / Screen.** La lógica y las llamadas a servicios viven en `*Controller.tsx`; `*Screen.tsx` solo presenta.
    Check: ningún `*Screen.tsx` importa de `services` (hoy 1 excepción: `InventoryCountScreen.tsx`).
12. **HTTP solo por los clientes de `src/http/`.** Headers (`Authorization`, `X-ExodusDev`) y el manejo de 401/499 son únicos.
    Check: fuera de `src/http/` no se crea cliente axios ni se llama a una API con `fetch` (hoy solo hay un `fetch` HEAD a imágenes de producto, `AssortmentTaskController.tsx:245`).
13. **Textos de usuario en `i18n/es.ts`.**
    Check: `/exodus-sdd:verify` no encuentra literales de texto de usuario nuevos en `src/views` ni `src/components`.
14. **Comportamiento por sucursal vía banderas.** Lo que varía por sucursal se decide con una bandera del catálogo (`catalogo-bandera-sucursal`), nunca con un id de sucursal fijo.
    Check: sin comparaciones de `branchOfficeId` contra literales distintos de 0.
15. **Pruebas espejo.** Toda lógica nueva o modificada en `services`, `utils`, `hooks`, `rtk` o `*Controller` tiene prueba Jest en `__test__/` con la misma ruta.
    Check: el diff de un cambio incluye el archivo `__test__/` correspondiente.

## Listas de validación

### Producto (specs observadas)
Validar por área, empezando por la del primer cambio previsto. Por cada requisito: **conservar / corregir / descartar**, y responder sus `[NEEDS CLARIFICATION]`.
- [ ] Sesión y arranque: `autenticacion-sesion` (Login), `estado-aplicacion-version`, `catalogo-bandera-sucursal`, `menu-inicio` (Home)
- [ ] Tareas: `consulta-tarea-sucursal` (Task), `asignacion-tarea` (TaskAssign)
- [ ] Inventario: `conteo-inventario` (InventoryCount)
- [ ] Recepción: `recepcion-mercancia` (ReceptionTasks), `etiquetado-recepcion` (PrintReceptionTask, ValidatePrintReceptionTask)
- [ ] Surtido: `surtido-ronda` (AssortmentTask), `surtido-listado` (AssortmentTaskV2, ProductDetail)
- [ ] Revisión: `revision-surtido` (AssortmentCheck, AssortmentCheckProductDetail)
- [ ] Embarque: `evidencia-embarque` (ShipmentEvidence, ShipmentDetail, ShipmentEvidencePhoto)
- [ ] Cajas: `validacion-recepcion-caja` (ValidateReceivedGoods, ConfirmDownloadValidation), `reporte-incidencia-caja` (IncidenceReport, IncidenceReportPhotos)
- [ ] Dar nombre de negocio a los roles 2, 4, 6, 9 y a las actividades 34 y 35, y llenar la columna "Dueño funcional" de `product.md`

### Arquitectura
- [ ] Aprobar la constitución v1.1 (gate A), incluidos los principios 11–15 del proyecto
- [ ] Decidir si `frontend-exodus:dev-frontend` / `estandares-frontend` aplica a Expo / React Native o requiere anexo (`structure.md`, `tech.md`)
- [ ] Decidir dónde viven los cambios multi-repo (`structure.md`)
- [ ] Completar `servicios.md`: dueños y repositorios de los 8 servicios sin repo local; generación de plantilla .NET por repo
- [ ] Decidir el retiro de `surtido-api-gateway` (hotfix "temporal" `997716fc`)
- [ ] Revisar el acoplamiento recepción → `inventory-task` (pausa y detalle de producto)
- [ ] Revisar el job `sdd-validate` agregado a `.gitlab-ci.yml` (stage `.pre`, validador copiado en `tools/sdd/`) y el `CLAUDE.md` del repo

### QA (escenarios sin prueba)
Hay 205 escenarios y **ninguno está ligado todavía a una prueba**. Cobertura actual de `__test__/` (Jest):
- **Vistas:** solo `views/AssortmentCheckProductDetail.test.tsx`; las demás 19 pantallas no tienen pruebas de pantalla ni de controlador.
- **Lógica cubierta en parte:** `utils` (assortmentCheck, calendar, formats, imageValidation, services, speech), `services` (9 de dominio), `rtk` (8 slices), `hooks` (3), componentes atómicos, moléculas y organismos.
- [ ] Cruzar los escenarios de cada capacidad con esas pruebas y marcar cuáles ya están cubiertos (el principio 4 lo exige para cerrar un cambio)
- [ ] Priorizar pruebas de controlador para las capacidades del primer cambio

## Siguiente paso
Cuando Producto valide las specs de un área: `/exodus-sdd:intent` para el primer cambio sobre ella. Su `/exodus-sdd:sync` deja esas specs como verdad validada.
