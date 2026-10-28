import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GLIFOS, medirTexto } from '../www/js/graficos/fuente.js';
import { animacionLetra } from '../www/js/graficos/logo.js';

test('la fuente tiene todas las letras del logo, en 5x7', () => {
  for (const letra of 'ASTRODEFNS ') {
    const g = GLIFOS[letra];
    assert.ok(g, `falta la letra "${letra}"`);
    assert.equal(g.length, 7, `alto de "${letra}"`);
    for (const fila of g) assert.equal(fila.length, 5, `ancho de "${letra}": "${fila}"`);
  }
});

test('medirTexto: 5 píxeles por letra más 1 de separación, por la escala', () => {
  assert.equal(medirTexto('ASTRO', 8), 29 * 8);
  assert.equal(medirTexto('A', 3), 15);
});

test('una letra empieza invisible y 40 más arriba', () => {
  assert.deepEqual(animacionLetra(0, 0), { dy: -40, alpha: 0 });
  assert.deepEqual(animacionLetra(0.2, 3), { dy: -40, alpha: 0 });
});

test('a mitad de su animación la letra va bajando y apareciendo', () => {
  const { dy, alpha } = animacionLetra(0.25, 0);
  assert.ok(dy > -40 && dy < 0, `dy ${dy}`);
  assert.ok(alpha > 0 && alpha < 1, `alpha ${alpha}`);
});

test('al terminar, la letra queda en su lugar y opaca', () => {
  assert.deepEqual(animacionLetra(0.07 * 3 + 0.5, 3), { dy: 0, alpha: 1 });
  assert.deepEqual(animacionLetra(10, 12), { dy: 0, alpha: 1 });
});
