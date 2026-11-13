/**
 * Pruebas del cambio 2026-11-10-surtido-listado-imagen-producto: equivalencia del listado con y sin
 * imagen, resolución de la bandera de imagen y registro de entradas al detalle.
 *
 * Correr con: npm run test:domain
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { conteosRonda, estadoInicial, productosVista, rondaReducer } from '../../src/domain/ronda.ts';
import { CONFIG_MULTIORDEN_DEFAULT, resolverImagenListadoActiva } from '../../src/domain/configMultiorden.ts';
import {
  abrirEntrada,
  cerrarEntrada,
  marcarCaptura,
  marcarNegacion,
  pedidoDeEntrada,
} from '../../src/domain/entradasDetalle.ts';

const surtir = (s, codigo, cantidad) => rondaReducer(s, { type: 'surtirPorCodigo', codigo, cantidad });
const negar = (s, codigo, motivo = 'Sin existencia') => rondaReducer(s, { type: 'negar', codigo, motivo });

/* ---------------------------------------------------------------- *
 * SDD 2026-11-10-surtido-listado-imagen-producto · Orden y datos del listado sin cambios
 * ---------------------------------------------------------------- */

/** 1394010 parcial, 1458000 completo, 6200404 negado y el resto pendiente. */
const rondaConAvance = () => negar(surtir(surtir(estadoInicial(), '1394010', 11), '1458000', 2), '6200404');

function sinImagen(s) {
  const pedidos = s.ronda.pedidos.map((p) => ({
    ...p,
    partidas: p.partidas.map((x) => ({ ...x, imagen: undefined })),
  }));
  return { ronda: { ...s.ronda, pedidos } };
}

test('con y sin imagen, productosVista da los mismos productos, en el mismo orden y con los mismos datos salvo imagen', () => {
  const s = rondaConAvance();
  const con = productosVista(s.ronda);
  const sin = productosVista(sinImagen(s).ronda);
  assert.ok(con.every((v) => v.imagen), 'con imagen todas la traen');
  assert.ok(sin.every((v) => v.imagen === undefined), 'sin imagen ninguna la trae');
  assert.deepEqual(sin, con.map((v) => ({ ...v, imagen: undefined })));
});

// SDD 2026-11-10-surtido-listado-imagen-producto · Orden y datos del listado sin cambios · sustituta de Guía por voz sin cambios
test('conteosRonda es igual con y sin imagen', () => {
  const s = rondaConAvance();
  assert.deepEqual(conteosRonda(sinImagen(s).ronda), conteosRonda(s.ronda));
});

/* ---------------------------------------------------------------- *
 * SDD 2026-11-10-surtido-listado-imagen-producto · Activación de la imagen por sucursal
 * SDD 2026-11-10-surtido-listado-imagen-producto · Bandera de imagen en el listado de surtido
 * ---------------------------------------------------------------- */

test('la bandera activa se resuelve como activa', () => {
  assert.equal(resolverImagenListadoActiva({ imagenListadoActiva: true }), true);
  assert.equal(resolverImagenListadoActiva({ ...CONFIG_MULTIORDEN_DEFAULT, imagenListadoActiva: true }), true);
});

test('por defecto la bandera está inactiva', () => {
  assert.equal(resolverImagenListadoActiva(CONFIG_MULTIORDEN_DEFAULT), false);
});

// SDD 2026-11-10-surtido-listado-imagen-producto · Activación de la imagen por sucursal · sustituta de Falla al consultar la bandera
// SDD 2026-11-10-surtido-listado-imagen-producto · Bandera de imagen en el listado de surtido · sustituta de Falla al consultar la bandera de imagen
test('sin config o sin el campo, la bandera se trata como inactiva', () => {
  assert.equal(resolverImagenListadoActiva(null), false);
  assert.equal(resolverImagenListadoActiva(undefined), false);
  assert.equal(resolverImagenListadoActiva({}), false);
});

/* ---------------------------------------------------------------- *
 * SDD 2026-11-10-surtido-listado-imagen-producto · Registro de entradas al detalle desde el listado
 * ---------------------------------------------------------------- */

const DATOS = { sucursal: 'Centro', pedido: '100001', codigo: '1394010', imagenListadoActiva: true };
const ENTRADA = 1000;
const SALIDA = 2000;

const abrir = (registro = [], datos = DATOS) => abrirEntrada(registro, datos, ENTRADA);

test('entrada solo para ver el producto: queda una entrada sin captura ni negación', () => {
  assert.deepEqual(cerrarEntrada(abrir(), SALIDA), [
    { ...DATOS, entrada: ENTRADA, salida: SALIDA, resultado: 'ninguna' },
  ]);
});

test('entrada con captura', () => {
  const r = cerrarEntrada(marcarCaptura(abrir()), SALIDA);
  assert.equal(r.length, 1);
  assert.equal(r[0].resultado, 'captura');
});

test('entrada con negación', () => {
  const r = cerrarEntrada(marcarNegacion(abrir()), SALIDA);
  assert.equal(r.length, 1);
  assert.equal(r[0].resultado, 'negacion');
});

test('captura y luego negación en la misma entrada: una sola entrada, con negación', () => {
  const r = cerrarEntrada(marcarNegacion(marcarCaptura(abrir())), SALIDA);
  assert.equal(r.length, 1);
  assert.equal(r[0].resultado, 'negacion');
});

test('línea base: con la bandera apagada la entrada también se registra, sin imagen en el listado', () => {
  const r = cerrarEntrada(abrir([], { ...DATOS, imagenListadoActiva: false }), SALIDA);
  assert.equal(r.length, 1);
  assert.equal(r[0].imagenListadoActiva, false);
  assert.equal(r[0].salida, SALIDA);
});

test('abrir dos veces el mismo código conserva la entrada abierta', () => {
  const una = marcarCaptura(abrir());
  const otra = abrirEntrada(una, DATOS, 1500);
  assert.equal(otra, una);
});

test('abrir otro código con una entrada abierta la cierra antes de abrir la nueva', () => {
  const r = abrirEntrada(abrir(), { ...DATOS, codigo: '0607006' }, 1500);
  assert.equal(r.length, 2);
  assert.equal(r[0].codigo, '1394010');
  assert.equal(r[0].salida, 1500);
  assert.equal(r[1].codigo, '0607006');
  assert.equal(r[1].salida, null);
});

test('cerrar dos veces no cambia la entrada cerrada', () => {
  const cerrada = cerrarEntrada(abrir(), SALIDA);
  assert.equal(cerrarEntrada(cerrada, 3000), cerrada);
});

test('marcar sin entrada abierta no hace nada', () => {
  assert.deepEqual(marcarCaptura([]), []);
  assert.deepEqual(marcarNegacion([]), []);
  const cerrada = cerrarEntrada(abrir(), SALIDA);
  assert.equal(marcarCaptura(cerrada), cerrada);
  assert.equal(marcarNegacion(cerrada), cerrada);
});

test('pedidoDeEntrada: el destino de las siguientes piezas o, sin destino, la primera presencia', () => {
  const s = estadoInicial();
  assert.equal(pedidoDeEntrada(s.ronda, '1394010'), '100001');
  assert.equal(pedidoDeEntrada(surtir(s, '1394010', 11).ronda, '1394010'), '100002');
  // 2012000 vive en el 100002 y el 100003: negado no tiene destino y queda su primera presencia.
  assert.equal(pedidoDeEntrada(negar(s, '2012000').ronda, '2012000'), '100002');
  assert.equal(pedidoDeEntrada(s.ronda, '9999999'), null);
});
