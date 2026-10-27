import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearBalas } from '../www/js/entidades/balas.js';

test('disparar agrega una bala que sube por defecto', () => {
  const balas = crearBalas();
  balas.disparar(180, 500);
  assert.deepEqual(balas.lista, [{ x: 180, y: 500, vy: -480 }]);
});

test('update mueve las balas según su velocidad', () => {
  const balas = crearBalas();
  balas.disparar(180, 500);
  balas.update(0.5);
  assert.equal(balas.lista[0].y, 260);
});

test('las balas que salen por arriba se eliminan', () => {
  const balas = crearBalas();
  balas.disparar(180, 0);
  balas.disparar(100, 300);
  balas.update(0.1);
  assert.equal(balas.lista.length, 1);
  assert.equal(balas.lista[0].x, 100);
});
