import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearGuardado } from '../www/js/sistemas/guardado.js';

// Almacén en memoria con la misma interfaz que localStorage.
function almacenFalso() {
  const datos = new Map();
  return {
    datos,
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
  };
}

const almacenRoto = {
  getItem() { throw new Error('bloqueado'); },
  setItem() { throw new Error('bloqueado'); },
};

test('lee lo que escribió, con prefijo astro.', () => {
  const almacen = almacenFalso();
  const g = crearGuardado(almacen);
  g.escribir('recordLibre', 4200);
  assert.equal(almacen.datos.get('astro.recordLibre'), '4200');
  assert.equal(g.leerNumero('recordLibre'), 4200);
});

test('sin valor devuelve el defecto', () => {
  const g = crearGuardado(almacenFalso());
  assert.equal(g.leerNumero('nada'), 0);
  assert.equal(g.leerNumero('nada', 7), 7);
});

test('un valor corrupto o negativo se trata como el defecto', () => {
  const almacen = almacenFalso();
  almacen.setItem('astro.a', 'abc');
  almacen.setItem('astro.b', '-5');
  almacen.setItem('astro.c', 'Infinity');
  const g = crearGuardado(almacen);
  assert.equal(g.leerNumero('a'), 0);
  assert.equal(g.leerNumero('b'), 0);
  assert.equal(g.leerNumero('c'), 0);
});

test('si el almacén falla, el juego sigue sin guardar', () => {
  const g = crearGuardado(almacenRoto);
  assert.doesNotThrow(() => g.escribir('recordLibre', 10));
  assert.equal(g.leerNumero('recordLibre'), 0);
});

test('sin almacén disponible tampoco falla', () => {
  const g = crearGuardado(undefined);
  assert.doesNotThrow(() => g.escribir('x', 1));
  assert.equal(g.leerNumero('x', 3), 3);
});
