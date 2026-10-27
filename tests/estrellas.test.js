import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearEstrellas } from '../www/js/fondo/estrellas.js';

// Generador pseudoaleatorio con semilla, para que las pruebas sean repetibles.
function rngConSemilla(semilla = 42) {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

test('crea la cantidad pedida de estrellas dentro de la pantalla', () => {
  const { estrellas } = crearEstrellas({ cantidad: 50, alto: 640, rng: rngConSemilla() });
  assert.equal(estrellas.length, 50);
  for (const e of estrellas) {
    assert.ok(e.x >= 0 && e.x < 360, `x fuera de rango: ${e.x}`);
    assert.ok(e.y >= 0 && e.y < 640, `y fuera de rango: ${e.y}`);
  }
});

test('usa tres capas de velocidad para el parallax', () => {
  const { estrellas } = crearEstrellas({ cantidad: 90, alto: 640, rng: rngConSemilla() });
  const velocidades = new Set(estrellas.map((e) => e.vel));
  assert.deepEqual([...velocidades].sort((a, b) => a - b), [20, 45, 90]);
});

test('update mueve cada estrella hacia abajo según su velocidad', () => {
  const campo = crearEstrellas({ cantidad: 30, alto: 100000, rng: rngConSemilla() });
  const antes = campo.estrellas.map((e) => e.y);
  campo.update(1, 100000);
  campo.estrellas.forEach((e, i) => {
    assert.ok(Math.abs(e.y - (antes[i] + e.vel)) < 1e-9);
  });
});

test('una estrella que sale por abajo reaparece arriba', () => {
  const campo = crearEstrellas({ cantidad: 1, alto: 640, rng: rngConSemilla() });
  const estrella = campo.estrellas[0];
  estrella.y = 639;
  campo.update(1, 640);
  assert.ok(estrella.y < 0, `y debería ser negativa: ${estrella.y}`);
  assert.ok(estrella.x >= 0 && estrella.x < 360);
});

test('al reducir el alto, las estrellas que quedan fuera se reubican dentro', () => {
  const campo = crearEstrellas({ cantidad: 90, alto: 800, rng: rngConSemilla() });
  campo.update(0, 500);
  for (const e of campo.estrellas) {
    assert.ok(e.y < 500, `estrella fuera del nuevo alto: ${e.y}`);
  }
});
