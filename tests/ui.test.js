import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearBoton } from '../www/js/graficos/ui.js';

test('un botón detecta toques dentro de su caja centrada', () => {
  const b = crearBoton({ texto: 'CONTINUAR', x: 180, y: 300, ancho: 160, alto: 40 });
  assert.equal(b.texto, 'CONTINUAR');
  assert.equal(b.contiene(180, 300), true);
  assert.equal(b.contiene(101, 281), true);
  assert.equal(b.contiene(99, 300), false);
  assert.equal(b.contiene(180, 321), false);
});
