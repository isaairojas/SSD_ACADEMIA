/**
 * Card de producto para el surtido multi-orden.
 * Interfaz: card 15:1528 de la propuesta A (`Solicitud anticipada Uber`, rama feature-surtido-multipedido;
 * archivo "Handheld for Claude"): código, chip de avance de la ronda, ubicación y desglose por
 * contenedor ("A 0/2 · B 0/2"), coloreado según el estado de cada pedido.
 *
 * Además de la referencia (sesión del 2026-11-02) se conservan:
 * - Marca de misceláneo y aviso de las partidas negadas del código.
 * - Chip "Mismo cliente" cuando los pedidos que lo necesitan comparten cliente.
 * El desglose sustituye al badge "En N pedidos". No se incorporó al design-system compartido.
 */
import { useState } from 'react';
import { Chip } from '@ds/components/atoms/Chip/Chip';
import iconoProducto from '@assets/illustrations/bxs-package.svg';
import { statusProducto, ubicacionLegible, type Presencia, type ProductoVista } from '../../domain/ronda';
import { letraPedido } from './Contenedores';
import styles from './ProductoRondaRow.module.css';

type Props = {
  producto: ProductoVista;
  /** Último producto escaneado: fondo azul claro, como el resaltado de Revision-HH-v2. */
  marcado?: boolean;
  /** SDD 2026-11-10-surtido-listado-imagen-producto · Requirement: Imagen del producto en el listado. */
  mostrarImagen?: boolean;
  onClick?: () => void;
};

/** En 0 la etiqueta se queda blanca; parcial y completo toman los colores del chip de avance. */
const claseTag = (p: Presencia) =>
  p.estado === 'negado'
    ? styles.tagNegado
    : p.estado === 'completo'
      ? styles.tagListo
      : p.estado === 'parcial'
        ? styles.tagParcial
        : '';

/**
 * Sin imagen, mientras carga o si falla, el icono genérico ocupa la misma caja. Tras un error no se
 * reintenta mientras la fila siga montada (Arquitectura, 2026-11-11: tráfico en red móvil).
 * SDD 2026-11-10-surtido-listado-imagen-producto · Requirement: Producto sin imagen en el listado ·
 * Requirement: Listado utilizable mientras cargan las imágenes.
 */
function Miniatura({ imagen }: { imagen?: string }) {
  const [carga, setCarga] = useState<'cargando' | 'cargada' | 'error'>('cargando');
  return (
    <div className={styles.miniatura}>
      {(!imagen || carga !== 'cargada') && <img src={iconoProducto} alt="" className={styles.iconoGenerico} />}
      {imagen && carga !== 'error' && (
        <img
          src={imagen}
          alt=""
          className={carga === 'cargada' ? undefined : styles.imagenCargando}
          onLoad={() => setCarga('cargada')}
          onError={() => setCarga('error')}
        />
      )}
    </div>
  );
}

export function ProductoRondaRow({ producto: v, marcado, mostrarImagen, onClick }: Props) {
  const status = statusProducto(v);
  const enVariosPedidos = v.presencias.length > 1;
  const clientesUnicos = new Set(v.presencias.map((p) => p.cliente.id));
  const mismoClienteEnPresencias = enVariosPedidos && clientesUnicos.size === 1;
  const negadas = v.presencias.filter((p) => p.motivoNegacion);

  return (
    <button
      type="button"
      className={`${styles.row} ${marcado ? styles.marcado : ''}`}
      data-codigo={v.codigo}
      aria-current={marcado ? 'true' : undefined}
      onClick={onClick}
      disabled={!onClick}
    >
      {mostrarImagen && <Miniatura imagen={v.imagen} />}
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.codigoLinea}>
            <span className={styles.codigo}>{v.codigo}</span>
            {v.miscelaneo && <span className={styles.badgeMiscelaneo}>Misc.</span>}
          </div>
          <Chip status={status} value={v.surtidoTotal} total={v.solicitadoTotal} />
        </div>
        <div className={styles.ubicacion}>
          {ubicacionLegible(v.ubicacion).map((u, i) => (
            <span key={i} className={styles.ubicacionItem}>
              {i > 0 && <b>|</b>}
              <span>{u}</span>
            </span>
          ))}
        </div>
        <div className={styles.desglose}>
          {v.presencias.map((p) => (
            <span key={p.pedidoId} className={`${styles.tag} ${claseTag(p)}`} title={`Pedido ${p.pedidoId}`}>
              <b>{letraPedido(p.ordenPedido)}</b> {p.estado === 'negado' ? 'Negado' : `${p.surtido}/${p.solicitado}`}
            </span>
          ))}
          {mismoClienteEnPresencias && <span className={styles.chipMismoCliente}>Mismo cliente</span>}
        </div>
        {negadas.length > 0 && (
          <p className={styles.negado}>
            Negado en {negadas.map((p) => letraPedido(p.ordenPedido)).join(', ')} · {negadas[0].motivoNegacion}
          </p>
        )}
      </div>
    </button>
  );
}
