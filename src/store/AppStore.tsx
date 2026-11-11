/**
 * Estado global del surtido multi-orden: ronda en curso + toasts.
 */
import { createContext, useCallback, useContext, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { estadoInicial, rondaReducer, type RondaAction, type RondaState } from '../domain/ronda';
import { CONFIG_MULTIORDEN_DEFAULT, resolverImagenListadoActiva, type ConfigMultiorden } from '../domain/configMultiorden';
import {
  abrirEntrada,
  cerrarEntrada,
  marcarCaptura,
  marcarNegacion,
  pedidoDeEntrada,
  type EntradaDetalle,
} from '../domain/entradasDetalle';
import { SUCURSAL_DEMO } from '../mocks/ronda';
import type { ToastKind } from '../design-system/components/organisms/Toast/Toast';

export type Etapa = 'surtido' | 'tareas';

export type ToastData = { id: number; kind: ToastKind; title: string; message: string };

/** Último código surtido y el pedido que lo recibió: la lista y las tarjetas lo resaltan (solo presentación). */
export type UltimoEscaneo = { codigo: string; pedidoId: string };

type Store = {
  ronda: RondaState;
  dispatch: Dispatch<RondaAction>;
  etapa: Etapa;
  setEtapa: (e: Etapa) => void;
  toast: ToastData | null;
  mostrarToast: (t: Omit<ToastData, 'id'>) => void;
  cerrarToast: () => void;
  ultimoEscaneo: UltimoEscaneo | null;
  setUltimoEscaneo: (u: UltimoEscaneo | null) => void;
  /** SDD 2026-11-10-surtido-listado-imagen-producto · Requirement: Activación de la imagen por sucursal. */
  config: ConfigMultiorden;
  sucursal: string;
  /**
   * Fuera de `RondaState`: `reiniciar` no lo borra.
   * SDD 2026-11-10-surtido-listado-imagen-producto · Requirement: Registro de entradas al detalle desde el listado.
   */
  entradasDetalle: EntradaDetalle[];
  abrirEntradaDetalle: (codigo: string) => void;
  marcarEntradaDetalle: (resultado: 'captura' | 'negacion') => void;
  cerrarEntradaDetalle: () => void;
};

const Ctx = createContext<Store | null>(null);

export type Semilla = {
  ronda?: RondaState;
  etapa?: Etapa;
  toast?: Omit<ToastData, 'id'>;
  ultimoEscaneo?: UltimoEscaneo;
  /** La semilla hace de respuesta del servicio de banderas (ADR-0001 §Ampliación 2026-11-11). */
  config?: Partial<ConfigMultiorden>;
  sucursal?: string;
};

export function AppStoreProvider({ children, semilla }: { children: ReactNode; semilla?: Semilla }) {
  const [ronda, dispatch] = useReducer(rondaReducer, undefined, () => semilla?.ronda ?? estadoInicial());
  const [etapa, setEtapa] = useState<Etapa>(semilla?.etapa ?? 'tareas');
  const [toast, setToast] = useState<ToastData | null>(semilla?.toast ? { id: 0, ...semilla.toast } : null);
  const [ultimoEscaneo, setUltimoEscaneo] = useState<UltimoEscaneo | null>(semilla?.ultimoEscaneo ?? null);
  const [config] = useState<ConfigMultiorden>(() => ({ ...CONFIG_MULTIORDEN_DEFAULT, ...semilla?.config }));
  const [sucursal] = useState<string>(semilla?.sucursal ?? SUCURSAL_DEMO);
  const [entradasDetalle, setEntradasDetalle] = useState<EntradaDetalle[]>([]);

  const mostrarToast = useCallback((t: Omit<ToastData, 'id'>) => setToast({ id: Date.now(), ...t }), []);
  const cerrarToast = useCallback(() => setToast(null), []);

  // La hora se toma fuera del updater: `StrictMode` lo invoca dos veces en desarrollo.
  const abrirEntradaDetalle = useCallback(
    (codigo: string) => {
      const pedido = pedidoDeEntrada(ronda.ronda, codigo);
      if (pedido === null) return;
      const datos = { sucursal, pedido, codigo, imagenListadoActiva: resolverImagenListadoActiva(config) };
      const ahora = Date.now();
      setEntradasDetalle((r) => abrirEntrada(r, datos, ahora));
    },
    [ronda, config, sucursal],
  );
  const marcarEntradaDetalle = useCallback(
    (resultado: 'captura' | 'negacion') =>
      setEntradasDetalle((r) => (resultado === 'captura' ? marcarCaptura(r) : marcarNegacion(r))),
    [],
  );
  const cerrarEntradaDetalle = useCallback(() => {
    const ahora = Date.now();
    setEntradasDetalle((r) => cerrarEntrada(r, ahora));
  }, []);

  const value = useMemo(
    () => ({
      ronda,
      dispatch,
      etapa,
      setEtapa,
      toast,
      mostrarToast,
      cerrarToast,
      ultimoEscaneo,
      setUltimoEscaneo,
      config,
      sucursal,
      entradasDetalle,
      abrirEntradaDetalle,
      marcarEntradaDetalle,
      cerrarEntradaDetalle,
    }),
    [
      ronda,
      etapa,
      toast,
      mostrarToast,
      cerrarToast,
      ultimoEscaneo,
      config,
      sucursal,
      entradasDetalle,
      abrirEntradaDetalle,
      marcarEntradaDetalle,
      cerrarEntradaDetalle,
    ],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore fuera de AppStoreProvider');
  return s;
}
