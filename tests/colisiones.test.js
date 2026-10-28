import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chocan, impactarEnemigos, golpearJugador, cajaJugador } from '../www/js/sistemas/colisiones.js';
import { crearEnemigo, crearFlota } from '../www/js/entidades/enemigos.js';
import { crearBalas } from '../www/js/entidades/balas.js';
import { crearJugador } from '../www/js/entidades/jugador.js';

const flotaCon = (...enemigos) => {
  const flota = crearFlota();
  enemigos.forEach((e) => flota.agregar(e));
  return flota;
};

test('chocan detecta cajas superpuestas y no las separadas', () => {
  const a = { x: 0, y: 0, ancho: 10, alto: 10 };
  assert.equal(chocan(a, { x: 8, y: 8, ancho: 10, alto: 10 }), true);
  assert.equal(chocan(a, { x: 10, y: 0, ancho: 10, alto: 10 }), false);
  assert.equal(chocan(a, { x: 0, y: 30, ancho: 10, alto: 10 }), false);
});

test('una bala daña a un solo enemigo aunque toque a dos', () => {
  const a = crearEnemigo('zigzag', 100, 100);
  const b = crearEnemigo('zigzag', 100, 100);
  const balas = crearBalas();
  balas.disparar(100, 100);
  impactarEnemigos(balas, flotaCon(a, b));
  assert.equal(a.vida + b.vida, 3);
  assert.equal(balas.lista.length, 0);
});

test('un enemigo sin vida sale de la flota y se devuelve', () => {
  const muerto = crearEnemigo('explorador', 100, 100);
  const vivo = crearEnemigo('zigzag', 250, 100);
  const flota = flotaCon(muerto, vivo);
  const balas = crearBalas();
  balas.disparar(100, 100);
  balas.disparar(250, 100);
  balas.disparar(30, 400);
  const muertos = impactarEnemigos(balas, flota);
  assert.deepEqual(muertos, [muerto]);
  assert.deepEqual(flota.lista, [vivo]);
  assert.equal(vivo.vida, 1);
  assert.equal(vivo.golpeado, 0.08);
  assert.equal(balas.lista.length, 1);
});

test('la caja de la nave es el 60 % de su tamaño', () => {
  const j = crearJugador({ x: 180, y: 500 });
  const c = cajaJugador(j);
  assert.deepEqual([c.x, c.y], [180, 500]);
  assert.ok(Math.abs(c.ancho - j.ancho * 0.6) < 1e-9 && Math.abs(c.alto - j.alto * 0.6) < 1e-9);
});

test('una bala enemiga en el centro golpea a la nave y desaparece', () => {
  const j = crearJugador({ x: 180, y: 500 });
  const balas = crearBalas();
  balas.disparar(180, 500, 100);
  assert.equal(golpearJugador(j, balas, crearFlota()), true);
  assert.equal(balas.lista.length, 0);
});

test('una bala que solo roza el borde del sprite no golpea', () => {
  const j = crearJugador({ x: 180, y: 500 });
  const balas = crearBalas();
  balas.disparar(180 + 14, 500, 100);
  assert.equal(golpearJugador(j, balas, crearFlota()), false);
  assert.equal(balas.lista.length, 1);
});

test('un enemigo que choca con la nave se destruye', () => {
  const j = crearJugador({ x: 180, y: 500 });
  const flota = flotaCon(crearEnemigo('explorador', 180, 505));
  assert.equal(golpearJugador(j, crearBalas(), flota), true);
  assert.equal(flota.lista.length, 0);
});
