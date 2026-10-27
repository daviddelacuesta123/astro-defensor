import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clampDt, altoLogico } from '../www/js/util.js';

test('clampDt convierte milisegundos a segundos', () => {
  assert.ok(Math.abs(clampDt(16) - 0.016) < 1e-9);
});

test('clampDt limita saltos grandes (pestaña en segundo plano)', () => {
  assert.equal(clampDt(5000), 0.05);
});

test('clampDt nunca devuelve tiempo negativo', () => {
  assert.equal(clampDt(-10), 0);
});

test('altoLogico mantiene la proporción de la pantalla', () => {
  assert.equal(altoLogico(360, 640), 640);
  assert.equal(altoLogico(1080, 2400), 800);
});

test('altoLogico nunca baja de 560 en pantallas anchas', () => {
  assert.equal(altoLogico(2000, 1000), 560);
});
