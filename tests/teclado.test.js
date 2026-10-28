import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearTeclado } from '../www/js/entrada/teclado.js';

test('flechas y WASD dan la dirección', () => {
  const t = crearTeclado();
  assert.deepEqual(t.direccion(), { dx: 0, dy: 0 });
  t.presionar('ArrowLeft');
  assert.deepEqual(t.direccion(), { dx: -1, dy: 0 });
  t.presionar('KeyW');
  assert.deepEqual(t.direccion(), { dx: -1, dy: -1 });
  t.soltar('ArrowLeft');
  t.presionar('KeyD');
  t.presionar('ArrowDown');
  t.soltar('KeyW');
  assert.deepEqual(t.direccion(), { dx: 1, dy: 1 });
});

test('dos teclas opuestas se anulan', () => {
  const t = crearTeclado();
  t.presionar('ArrowLeft');
  t.presionar('ArrowRight');
  assert.deepEqual(t.direccion(), { dx: 0, dy: 0 });
});

test('presionar dice si la tecla es de movimiento', () => {
  const t = crearTeclado();
  assert.equal(t.presionar('ArrowUp'), true);
  assert.equal(t.presionar('KeyS'), true);
  assert.equal(t.presionar('Enter'), false);
  assert.equal(t.presionar('KeyQ'), false);
});

test('soltarTodo detiene la nave (por ejemplo, al perder el foco)', () => {
  const t = crearTeclado();
  t.presionar('ArrowLeft');
  t.presionar('ArrowUp');
  t.soltarTodo();
  assert.deepEqual(t.direccion(), { dx: 0, dy: 0 });
  assert.equal(t.dedoVirtual({ x: 180, y: 500 }), null);
});

test('el dedo virtual apunta 70 unidades hacia donde se pide, con el desfase del dedo', () => {
  const t = crearTeclado();
  const nave = { x: 180, y: 500 };
  assert.equal(t.dedoVirtual(nave), null);
  t.presionar('ArrowLeft');
  assert.deepEqual(t.dedoVirtual(nave), { activo: true, x: 110, y: 560 });
  t.presionar('ArrowUp');
  const d = t.dedoVirtual(nave);
  assert.ok(Math.abs(d.x - (180 - 70 / Math.SQRT2)) < 1e-9, 'en diagonal no va más rápido');
  assert.ok(Math.abs(d.y - (560 - 70 / Math.SQRT2)) < 1e-9);
});
