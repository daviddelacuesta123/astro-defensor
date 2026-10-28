import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularMarco } from '../www/js/marco.js';

test('en un celular el juego ocupa toda la pantalla', () => {
  assert.deepEqual(calcularMarco(390, 844), { x: 0, y: 0, ancho: 390, alto: 844, escritorio: false });
});

test('en un PC apaisado el juego es una columna centrada de alto completo', () => {
  assert.deepEqual(calcularMarco(1366, 768), { x: 491, y: 0, ancho: 384, alto: 768, escritorio: true });
  assert.deepEqual(calcularMarco(1920, 1080), { x: 690, y: 0, ancho: 540, alto: 1080, escritorio: true });
});

test('una ventana casi cuadrada también usa la columna', () => {
  const m = calcularMarco(800, 1000);
  assert.equal(m.escritorio, true);
  assert.equal(m.ancho, 500);
  assert.equal(m.x, 150);
});

test('la columna nunca es más ancha que la ventana', () => {
  const m = calcularMarco(300, 400);
  assert.ok(m.ancho <= 300 && m.x >= 0);
});
