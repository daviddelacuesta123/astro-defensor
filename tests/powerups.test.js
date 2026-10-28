import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearPowerups, aplicarPowerup, TIPOS_POWERUP } from '../www/js/entidades/powerups.js';
import { crearJugador } from '../www/js/entidades/jugador.js';

// rng que devuelve los valores dados en orden.
const rngGuion = (...valores) => () => valores.shift();

test('hay cuatro tipos de power-up', () => {
  assert.deepEqual(TIPOS_POWERUP, ['disparo', 'escudo', 'bomba', 'vida']);
});

test('suelta un power-up solo con probabilidad 0.12', () => {
  const p = crearPowerups({ rng: rngGuion(0.5, 0.11, 0) });
  p.soltar(100, 100);
  assert.equal(p.lista.length, 0);
  p.soltar(100, 100);
  assert.equal(p.lista.length, 1);
  assert.deepEqual([p.lista[0].x, p.lista[0].y, p.lista[0].tipo], [100, 100, 'disparo']);
});

test('el tipo se elige por pesos 4-3-2-1', () => {
  const tipoCon = (r) => {
    const p = crearPowerups({ rng: rngGuion(0, r) });
    p.soltar(0, 0);
    return p.lista[0].tipo;
  };
  assert.equal(tipoCon(0.39), 'disparo');
  assert.equal(tipoCon(0.41), 'escudo');
  assert.equal(tipoCon(0.71), 'bomba');
  assert.equal(tipoCon(0.95), 'vida');
});

test('caen a 60 unidades por segundo y se eliminan al salir', () => {
  const p = crearPowerups({ rng: rngGuion(0, 0, 0, 0) });
  p.soltar(100, 100);
  p.soltar(200, 655);
  p.update(0.5, 640);
  assert.equal(p.lista.length, 1);
  assert.equal(p.lista[0].y, 130);
});

test('la nave recoge los power-ups que toca', () => {
  const p = crearPowerups({ rng: rngGuion(0, 0, 0, 0.5) });
  p.soltar(180, 500);
  p.soltar(30, 100);
  const j = crearJugador({ x: 180, y: 505 });
  assert.deepEqual(p.recoger(j), ['disparo']);
  assert.equal(p.lista.length, 1);
});

test('aplicar power-ups respeta los topes', () => {
  const j = crearJugador({ x: 0, y: 0 });
  for (let i = 0; i < 5; i++) aplicarPowerup(j, 'disparo');
  for (let i = 0; i < 5; i++) aplicarPowerup(j, 'vida');
  assert.deepEqual([j.nivelDisparo, j.vidas], [3, 5]);
  assert.equal(aplicarPowerup(j, 'escudo'), null);
  assert.equal(j.escudo, true);
  assert.equal(aplicarPowerup(j, 'bomba'), 'bomba');
});
