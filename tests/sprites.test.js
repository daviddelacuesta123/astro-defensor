import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as sprites from '../www/js/graficos/sprites.js';

const todos = Object.entries(sprites).filter(([, v]) => v && Array.isArray(v.filas));

test('existe el sprite de la nave del jugador', () => {
  assert.ok(sprites.NAVE_AD7, 'falta NAVE_AD7');
});

test('cada sprite tiene todas sus filas del mismo largo', () => {
  for (const [nombre, s] of todos) {
    const largo = s.filas[0].length;
    for (const fila of s.filas) assert.equal(fila.length, largo, `${nombre}: "${fila}"`);
  }
});

test('cada píxel de un sprite tiene color en su paleta o es transparente', () => {
  for (const [nombre, s] of todos) {
    for (const ch of s.filas.join('')) {
      assert.ok(ch === '.' || ch in s.paleta, `${nombre}: color sin definir "${ch}"`);
    }
  }
});
