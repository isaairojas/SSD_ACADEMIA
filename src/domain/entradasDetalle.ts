/**
 * Registro en memoria de las entradas al detalle del producto desde el listado de surtido.
 * SDD 2026-11-10-surtido-listado-imagen-producto · Requirement: Registro de entradas al detalle desde el listado.
 *
 * Funciones puras e idempotentes (la hora llega como parámetro): abrir dos veces el mismo código,
 * cerrar dos veces o marcar sin entrada abierta no cambian nada, para tolerar el doble montaje de
 * `StrictMode`. A lo sumo hay una entrada abierta y siempre es la última del registro.
 */
import { productoVista, proximaPartidaPara, type Ronda } from './ronda';

/** Si en la misma entrada hubo captura y negación, cuenta como negación (negar cierra el detalle). */
export type ResultadoEntrada = 'captura' | 'negacion' | 'ninguna';

export type EntradaDetalle = {
  sucursal: string;
  pedido: string;
  codigo: string;
  /** Fecha y hora de entrada (ms epoch). */
  entrada: number;
  /** Fecha y hora de salida (ms epoch). null = entrada abierta. */
  salida: number | null;
  /** Valor de `Bandera_ImagenListadoEnHH` al abrir: false = "sin imagen en el listado" (línea base). */
  imagenListadoActiva: boolean;
  resultado: ResultadoEntrada;
};

/**
 * Pedido de la entrada: el destino de las siguientes piezas del código o, si ya no hay destino
 * (código resuelto), su primera presencia. null si el código no está en la ronda.
 */
export function pedidoDeEntrada(r: Ronda, codigo: string): string | null {
  const loc = proximaPartidaPara(r, codigo);
  if (loc) return r.pedidos[loc.pedidoIdx].id;
  return productoVista(r, codigo)?.presencias[0]?.pedidoId ?? null;
}

function abierta(registro: EntradaDetalle[]): EntradaDetalle | null {
  const ultima = registro[registro.length - 1];
  return ultima && ultima.salida === null ? ultima : null;
}

function conUltima(registro: EntradaDetalle[], entrada: EntradaDetalle): EntradaDetalle[] {
  return [...registro.slice(0, -1), entrada];
}

/** Con una entrada abierta del mismo código la conserva; si es de otro código, la cierra antes de abrir la nueva. */
export function abrirEntrada(
  registro: EntradaDetalle[],
  datos: Pick<EntradaDetalle, 'sucursal' | 'pedido' | 'codigo' | 'imagenListadoActiva'>,
  ahora: number,
): EntradaDetalle[] {
  const actual = abierta(registro);
  if (actual?.codigo === datos.codigo) return registro;
  const previo = actual ? cerrarEntrada(registro, ahora) : registro;
  return [...previo, { ...datos, entrada: ahora, salida: null, resultado: 'ninguna' }];
}

export function marcarCaptura(registro: EntradaDetalle[]): EntradaDetalle[] {
  const actual = abierta(registro);
  if (!actual || actual.resultado !== 'ninguna') return registro;
  return conUltima(registro, { ...actual, resultado: 'captura' });
}

export function marcarNegacion(registro: EntradaDetalle[]): EntradaDetalle[] {
  const actual = abierta(registro);
  if (!actual || actual.resultado === 'negacion') return registro;
  return conUltima(registro, { ...actual, resultado: 'negacion' });
}

export function cerrarEntrada(registro: EntradaDetalle[], ahora: number): EntradaDetalle[] {
  const actual = abierta(registro);
  if (!actual) return registro;
  return conUltima(registro, { ...actual, salida: ahora });
}
