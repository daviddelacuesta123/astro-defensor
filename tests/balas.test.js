import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearBalas } from '../www/js/entidades/balas.js';

test('disparar agrega una bala que sube por defecto', () => {
  const balas = crearBalas();
  balas.disparar(180, 500);
  assert.deepEqual(balas.lista, [{ x: 180, y: 500, vx: 0, vy: -480 }]);
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

test('la velocidad horizontal mueve la bala en x', () => {
  const balas = crearBalas();
  balas.disparar(100, 300, 100, 50);
  balas.update(0.5, 640);
  assert.deepEqual([balas.lista[0].x, balas.lista[0].y], [125, 350]);
});

test('las balas que salen por abajo o por los lados se eliminan', () => {
  const balas = crearBalas();
  balas.disparar(180, 640, 200);
  balas.disparar(355, 300, 0, 200);
  balas.disparar(5, 300, 0, -200);
  balas.disparar(180, 300, 0);
  balas.update(0.1, 640);
  assert.equal(balas.lista.length, 1);
  assert.equal(balas.lista[0].y, 300);
});
