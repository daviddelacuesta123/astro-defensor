import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearProgreso, CLAVES_HISTORIA } from '../www/js/sistemas/progreso.js';
import { crearGuardado } from '../www/js/sistemas/guardado.js';

// Almacén en memoria con la misma interfaz que localStorage.
function guardadoFalso(datos = {}) {
  const mapa = new Map(Object.entries(datos).map(([k, v]) => ['astro.' + k, String(v)]));
  return crearGuardado({
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
  });
}

test('sin haber jugado, solo el capítulo 1 está desbloqueado', () => {
  const p = crearProgreso(guardadoFalso());
  assert.equal(p.capituloMax(), 1);
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => p.desbloqueado(n)), [true, false, false, false, false]);
  assert.equal(p.mejor(1), 0);
});

test('completar un capítulo desbloquea el siguiente y lo guarda', () => {
  const guardado = guardadoFalso();
  const p = crearProgreso(guardado);
  const r = p.completar(1, 3200);
  assert.deepEqual(r, { nuevoMejor: true, desbloqueado: 2 });
  assert.equal(guardado.leerNumero('capituloMax'), 2);
  assert.equal(guardado.leerNumero('mejorCap1'), 3200);
  // Otra instancia (la app reabierta) ve lo mismo.
  assert.equal(crearProgreso(guardado).desbloqueado(2), true);
});

test('repetir un capítulo viejo no desbloquea dos veces ni vuelve a bloquear', () => {
  const guardado = guardadoFalso({ capituloMax: 4 });
  const p = crearProgreso(guardado);
  assert.equal(p.completar(2, 100).desbloqueado, null);
  assert.equal(p.capituloMax(), 4);
});

test('completar el último capítulo no desbloquea un sexto', () => {
  const p = crearProgreso(guardadoFalso({ capituloMax: 5 }));
  assert.equal(p.completar(5, 100).desbloqueado, null);
  assert.equal(p.capituloMax(), 5);
  assert.equal(p.desbloqueado(6), false);
});

test('el mejor puntaje solo cambia si se supera', () => {
  const guardado = guardadoFalso({ mejorCap3: 5000, capituloMax: 3 });
  const p = crearProgreso(guardado);
  assert.equal(p.completar(3, 4000).nuevoMejor, false);
  assert.equal(p.mejor(3), 5000);
  assert.equal(p.completar(3, 5000).nuevoMejor, false, 'empatar no cuenta');
  assert.equal(p.completar(3, 6000).nuevoMejor, true);
  assert.equal(p.mejor(3), 6000);
});

test('un capituloMax guardado fuera de rango se acota', () => {
  assert.equal(crearProgreso(guardadoFalso({ capituloMax: 9 })).capituloMax(), 5);
  assert.equal(crearProgreso(guardadoFalso({ capituloMax: 0 })).capituloMax(), 1);
  assert.equal(crearProgreso(guardadoFalso({ capituloMax: 2.7 })).capituloMax(), 2);
  assert.equal(crearProgreso(guardadoFalso({ capituloMax: 'abc' })).capituloMax(), 1);
});

test('lee el guardado en cada consulta: lo borrado se nota enseguida', () => {
  const guardado = guardadoFalso();
  const p = crearProgreso(guardado);
  p.completar(1, 900);
  for (const clave of CLAVES_HISTORIA) guardado.borrar(clave);
  assert.equal(p.capituloMax(), 1);
  assert.equal(p.mejor(1), 0);
});

test('CLAVES_HISTORIA incluye el capítulo máximo y los cinco mejores puntajes', () => {
  assert.deepEqual(CLAVES_HISTORIA, ['capituloMax', 'mejorCap1', 'mejorCap2', 'mejorCap3', 'mejorCap4', 'mejorCap5']);
});
