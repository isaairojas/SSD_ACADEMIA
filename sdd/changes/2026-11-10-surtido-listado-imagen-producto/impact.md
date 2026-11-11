# Impacto · 2026-11-10-surtido-listado-imagen-producto · Imagen del producto en el listado de surtido V2

> Qué servicios, frentes y repositorios toca este cambio y por qué. Lo produce `/exodus-sdd:impact` a partir de la intención, los deltas, el catálogo de servicios y el código de integración. Lo confirma Arquitectura; alimenta `change.json.repos` y los espejos.
>
> Alcance de la evidencia (2026-11-11): los repositorios de servicio del catálogo (`C:\Repositorios\...`) **no están accesibles** desde esta sesión, así que no se inspeccionó su código. La evidencia viene del catálogo `steering/servicios.md`, de las specs canónicas observadas, de `constitution.md` y del simulador (este repo). Todo lo que depende del código de los servicios se reporta como duda.

## Capacidades del cambio y dónde viven
| Capacidad | Nueva / existente | Servicio o frente que la posee | Repositorio | Evidencia (catálogo, spec canónica, código) |
| --- | --- | --- | --- | --- |
| surtido-listado | existente (7 requisitos ADDED) | exodus-gtm-pwa (experiencia); datos de productos de `assortment-task` | Real: `exodus-gtm-pwa`. Taller: este simulador (`frontend`) | `steering/servicios.md` filas exodus-gtm-pwa y assortment-task; `specs/surtido-listado/spec.md`; `decisions/ADR-0001` (el listado del simulador representa V2) |
| catalogo-bandera-sucursal | existente (1 requisito ADDED: "Bandera de imagen en el listado de surtido"; la fila de su tabla de banderas no entra por `sync`) | SeguridadService (Objeto) | `<por definir: sin repo local>` | `steering/servicios.md` fila SeguridadService; `specs/catalogo-bandera-sucursal/spec.md:14-18` (tabla de banderas) y requisito "Bandera inactiva ante falla" |

## Servicios que cambian
| Servicio | Qué cambia (requisitos) | Contrato afectado (nuevo / modificado / sin cambio) | Compatibilidad hacia atrás | Riesgo |
| --- | --- | --- | --- | --- |
| Simulador SSD_ACADEMIA (`frontend`, alcance del taller) | Los 7 requisitos: imagen e icono en el listado, carga, orden y datos sin cambios, pulsar abre el detalle, bandera (en `ConfigMultiorden`, principio 14 según ADR-0001) y registro de entradas al detalle (en memoria; no hay back-end, principio 12 no aplica) | Sin contrato (datos mock) | Sí: con la bandera apagada el listado queda como hoy | Bajo. Ancho de 360 px y navegador de las Zebra (chrome ≥ 49) |
| exodus-gtm-pwa (app real, fuera del alcance del taller) | Los mismos 7 requisitos en la pantalla V2 (`AssortmentTaskV2`) | Consume `assortmentTask/api/v1,v2/Product` y `api/Objeto/{sucursal}`; ¿y un destino para el registro? (ver dudas) | Sí, si la bandera nueva se trata como inactiva al faltar | Medio. Ya existe un `fetch` HEAD de imágenes en `AssortmentTaskController.tsx` (`constitution.md:43`) |
| assortment-task | **Ninguno, si** la URL de la imagen ya viene en los productos del pedido; **cambia, si** no viene o si se decide que reciba el registro de entradas al detalle | Sin cambio / modificado (por confirmar) | Un campo nuevo opcional es compatible | Por confirmar (sin acceso al repo) |
| SeguridadService (Objeto) | Solo configuración: alta de `Bandera_ImagenListadoEnHH` por sucursal piloto | Sin cambio (la bandera es un dato del catálogo, no un contrato nuevo) | Sí | Bajo |

## Consumidores afectados (no cambian su código pero dependen de un contrato que cambia)
| Consumidor | Contrato que consume | Qué debe verificar |
| --- | --- | --- |
| exodus-gtm-pwa, `surtido-ronda` (V1) | `assortmentTask/api/v1,v2/Product`, solo si assortment-task lo modifica | Que un campo nuevo de imagen no altere la ronda V1, que no muestra imágenes |
| exodus-gtm-pwa, `revision-surtido` | Mismo contrato, solo si cambia | Que el detalle de revisión no cambie (escenario "Listado con revisión de piezas") |

## Orden de implementación propuesto
**Taller (alcance de `change.json`):** 1. dominio del simulador (bandera en `ConfigMultiorden`, registro de entradas al detalle, con pruebas `node --test`) → 2. pantalla del listado (imagen, icono y estados). Un solo repo, sin contratos.

**App real (si el cambio se lleva a producción):** 1. Arquitectura confirma el origen de la imagen y el destino del registro → 2. si assortment-task u otro servicio cambia su contrato: ADR y contrato en `contracts/`, servicio primero → 3. alta de la bandera en SeguridadService → 4. exodus-gtm-pwa.

## Dudas para Arquitectura
- **Origen de la imagen en la app real:** ¿los productos de `assortmentTask/.../Product` ya traen la URL de la imagen que usa el detalle? El `fetch` HEAD de imágenes en `AssortmentTaskController.tsx` (`constitution.md:43`) sugiere que sí, pero sin acceso al repo no se puede afirmar.
- **Destino del registro de entradas al detalle (SC-001):** ningún servicio del catálogo recibe telemetría o eventos de uso. Opciones: un endpoint nuevo en assortment-task, un servicio de analítica no catalogado, o los logs del cliente. Si es un contrato nuevo entre servicios, la constitución obliga a intensidad **full** ("contratos públicos" y "más de un repositorio con dependencia de orden") y a un ADR.
- **SeguridadService sin repositorio local:** el catálogo no dice quién da de alta una bandera nueva ni cómo. Es un trámite de configuración, no de código.
- **Catálogo desactualizado (no editado aquí):** `steering/servicios.md` no incluye este simulador (SSD_ACADEMIA) como frente; ADR-0001 sí lo describe. Lo corrige Arquitectura.

## Confirmación de Arquitectura (2026-11-11)
- `change.json.repos` se queda en `frontend` (solo el simulador). Sin espejos ni contratos nuevos; la intensidad sigue en standard.
- El destino del registro de entradas al detalle en la app real se queda como duda abierta para `design`.
- Resuelta en `design.md` (sección Contratos, 2026-11-11): el destino en la app real queda fuera de este cambio y lo decidirá un cambio nuevo sobre `exodus-gtm-pwa`.
