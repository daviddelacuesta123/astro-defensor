import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearExplosiones } from '../www/js/entidades/explosiones.js';

const rngFijo = () => 0.5;

test('estallar crea n partículas en el punto con el color dado', () => {
  const ex = crearExplosiones({ rng: rngFijo });
  ex.estallar(100, 200, '#ff0000', 10);
  assert.equal(ex.lista.length, 10);
  assert.ok(ex.lista.every((p) => p.x === 100 && p.y === 200 && p.color === '#ff0000'));
});

test('por defecto son 14 partículas que se alejan del centro', () => {
  const ex = crearExplosiones({ rng: rngFijo });
  ex.estallar(100, 200, '#fff');
  assert.equal(ex.lista.length, 14);
  ex.update(0.1);
  for (const p of ex.lista) {
    const d = Math.hypot(p.x - 100, p.y - 200);
    assert.ok(d >= 4 - 1e-9 && d <= 16 + 1e-9, `distancia ${d}`);
  }
});

test('las partículas desaparecen tras 0.5 s', () => {
  const ex = crearExplosiones({ rng: rngFijo });
  ex.estallar(0, 0, '#fff');
  ex.update(0.4);
  assert.equal(ex.lista.length, 14);
  ex.update(0.11);
  assert.equal(ex.lista.length, 0);
});
