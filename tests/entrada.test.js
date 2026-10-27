import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aLogicas, crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';

test('aLogicas convierte píxeles de pantalla a unidades del mundo', () => {
  const p = aLogicas(195, 422, 390, 844, 779);
  assert.ok(Math.abs(p.x - 180) < 1e-9);
  assert.ok(Math.abs(p.y - 389.5) < 1e-9);
  assert.deepEqual(aLogicas(0, 0, 390, 844, 779), { x: 0, y: 0 });
});

test('el puntero sigue al primer dedo', () => {
  const p = crearEstadoPuntero();
  assert.equal(p.activo, false);
  p.bajar(1, 100, 200);
  p.mover(1, 110, 210);
  assert.deepEqual([p.activo, p.x, p.y], [true, 110, 210]);
});

test('un segundo dedo se ignora', () => {
  const p = crearEstadoPuntero();
  p.bajar(1, 100, 200);
  p.bajar(2, 300, 50);
  p.mover(2, 310, 60);
  p.subir(2);
  assert.deepEqual([p.activo, p.x, p.y], [true, 100, 200]);
});

test('al levantar el primer dedo, otro puede tomar el control', () => {
  const p = crearEstadoPuntero();
  p.bajar(1, 100, 200);
  p.subir(1);
  assert.equal(p.activo, false);
  p.mover(1, 0, 0);
  assert.deepEqual([p.x, p.y], [100, 200]);
  p.bajar(2, 50, 60);
  assert.deepEqual([p.activo, p.x, p.y], [true, 50, 60]);
});
