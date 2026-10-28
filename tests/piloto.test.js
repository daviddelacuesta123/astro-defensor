import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pilotar } from '../www/js/sistemas/piloto.js';

const ALTO = 640;
const nave = (x = 180, y = 512) => ({ x, y });
const flota = (...enemigos) => ({ lista: enemigos.map(([x, y]) => ({ x, y })) });
const balas = (...lista) => ({ lista: lista.map(([x, y, vy = 170]) => ({ x, y, vx: 0, vy })) });

test('el dedo virtual siempre está activo, 60 por debajo de la altura deseada', () => {
  const p = pilotar(nave(), flota(), balas(), ALTO);
  assert.equal(p.activo, true);
  assert.equal(p.y, ALTO * 0.8 + 60);
});

test('se alinea bajo el enemigo más bajo que tiene encima', () => {
  const p = pilotar(nave(), flota([100, 200], [250, 300]), balas(), ALTO);
  assert.equal(p.x, 250);
});

test('ignora a los enemigos que ya pasaron por debajo', () => {
  const p = pilotar(nave(), flota([100, 200], [300, 600]), balas(), ALTO);
  assert.equal(p.x, 100);
});

test('sin enemigos vuelve al centro', () => {
  const p = pilotar(nave(40), flota(), balas(), ALTO);
  assert.equal(p.x, 180);
});

test('esquiva una bala que baja hacia la nave', () => {
  const p = pilotar(nave(180), flota([180, 100]), balas([185, 420]), ALTO);
  assert.equal(p.x, 110);
});

test('no se preocupa por balas que ya pasaron o que suben', () => {
  const p = pilotar(nave(180), flota([180, 100]), balas([180, 560], [180, 450, -480]), ALTO);
  assert.equal(p.x, 180);
});

test('esquiva a un enemigo que está por chocarla', () => {
  const p = pilotar(nave(180), flota([170, 450]), balas(), ALTO);
  assert.equal(p.x, 250);
});

test('nunca apunta fuera de [20, 340]', () => {
  assert.equal(pilotar(nave(30), flota([30, 100]), balas([25, 420]), ALTO).x, 100);
  assert.equal(pilotar(nave(340), flota([355, 100]), balas([345, 420]), ALTO).x, 270);
  assert.equal(pilotar(nave(20), flota([5, 100]), balas(), ALTO).x, 20);
});
