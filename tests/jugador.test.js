import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearJugador } from '../www/js/entidades/jugador.js';

const ALTO = 640;
const nada = () => {};
const dedo = (x, y) => ({ activo: true, x, y });

// Avanza la simulación en pasos pequeños, como haría el game loop.
function simular(jugador, segundos, puntero, disparar = nada, sensibilidad = 1) {
  const pasos = Math.round(segundos / 0.01);
  for (let i = 0; i < pasos; i++) jugador.update(0.01, puntero, ALTO, disparar, sensibilidad);
}

test('la nave se acerca al dedo, por encima de él, sin pasarse', () => {
  for (const sensibilidad of [0.5, 1, 2]) {
    const j = crearJugador({ x: 180, y: 560 });
    j.update(0.1, dedo(100, 500), ALTO, nada, sensibilidad);
    assert.ok(j.x < 180 && j.x > 100, `x con sensibilidad ${sensibilidad}: ${j.x}`);
    assert.ok(j.y < 560 && j.y > 440, `y con sensibilidad ${sensibilidad}: ${j.y}`);
  }
});

test('con el tiempo la nave llega 60 unidades por encima del dedo', () => {
  const j = crearJugador({ x: 180, y: 560 });
  simular(j, 2, dedo(100, 500));
  assert.ok(Math.abs(j.x - 100) < 0.5);
  assert.ok(Math.abs(j.y - 440) < 0.5);
});

test('sin dedo en pantalla la nave no se mueve', () => {
  const j = crearJugador({ x: 180, y: 560 });
  simular(j, 1, { activo: false, x: 0, y: 0 });
  assert.deepEqual([j.x, j.y], [180, 560]);
});

test('la nave nunca sale de la pantalla', () => {
  const j = crearJugador({ x: 180, y: 560 });
  simular(j, 2, dedo(0, 0));
  assert.ok(Math.abs(j.x - j.ancho / 2) < 1e-9, `x mínimo: ${j.x}`);
  assert.ok(Math.abs(j.y - ALTO * 0.25) < 1e-9, `y mínimo: ${j.y}`);
  simular(j, 2, dedo(360, ALTO));
  assert.ok(j.x <= 360 - j.ancho / 2);
  assert.ok(j.y <= ALTO - j.alto / 2 - 8);
});

test('dispara sola cada 0.18 s desde la punta de la nave', () => {
  const j = crearJugador({ x: 180, y: 560 });
  const disparos = [];
  simular(j, 1, { activo: false, x: 0, y: 0 }, (x, y) => disparos.push([x, y]));
  assert.equal(disparos.length, 5);
  assert.deepEqual(disparos[0], [180, 560 - j.alto / 2]);
});

test('un frame con dt = 0 no mueve ni dispara', () => {
  const j = crearJugador({ x: 180, y: 560 });
  let disparos = 0;
  for (let i = 0; i < 100; i++) j.update(0, dedo(0, 0), ALTO, () => disparos++);
  assert.deepEqual([j.x, j.y, disparos], [180, 560, 0]);
});

test('recibir un golpe quita una vida y da 2 s de invulnerabilidad', () => {
  const j = crearJugador({ x: 180, y: 560 });
  assert.equal(j.vidas, 3);
  assert.equal(j.recibirGolpe(), true);
  assert.equal(j.vidas, 2);
  assert.equal(j.recibirGolpe(), false, 'el segundo golpe seguido no cuenta');
  assert.equal(j.vidas, 2);
  simular(j, 2.1, { activo: false, x: 0, y: 0 });
  assert.equal(j.recibirGolpe(), true);
  assert.equal(j.vidas, 1);
});

test('el escudo absorbe un golpe sin perder vida', () => {
  const j = crearJugador({ x: 180, y: 560 });
  j.escudo = true;
  assert.equal(j.recibirGolpe(), false);
  assert.deepEqual([j.vidas, j.escudo], [3, false]);
  assert.ok(j.invulnerable > 0);
});

// Recoge los disparos de la primera ráfaga (a los 0.18 s).
function primeraRafaga(nivel) {
  const j = crearJugador({ x: 180, y: 560 });
  j.nivelDisparo = nivel;
  const disparos = [];
  j.update(0.2, { activo: false, x: 0, y: 0 }, ALTO, (x, y, vx) => disparos.push([x, y, vx]));
  return { j, disparos };
}

test('nivel 1: un disparo recto', () => {
  const { j, disparos } = primeraRafaga(1);
  assert.deepEqual(disparos, [[180, 560 - j.alto / 2, 0]]);
});

test('nivel 2: dos disparos paralelos', () => {
  const { j, disparos } = primeraRafaga(2);
  const punta = 560 - j.alto / 2;
  assert.deepEqual(disparos, [[174, punta, 0], [186, punta, 0]]);
});

test('nivel 3: tres disparos en abanico', () => {
  const { j, disparos } = primeraRafaga(3);
  const punta = 560 - j.alto / 2;
  assert.deepEqual(disparos, [[180, punta, 0], [174, punta, -120], [186, punta, 120]]);
});

test('perder una vida baja un nivel de disparo, sin bajar de 1', () => {
  const j = crearJugador({ x: 180, y: 560 });
  assert.equal(j.nivelDisparo, 1);
  j.nivelDisparo = 3;
  j.recibirGolpe();
  assert.equal(j.nivelDisparo, 2);
  j.invulnerable = 0;
  j.recibirGolpe();
  j.invulnerable = 0;
  j.recibirGolpe();
  assert.equal(j.nivelDisparo, 1);
});
