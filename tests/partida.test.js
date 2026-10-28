import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearPartida } from '../www/js/sistemas/partida.js';
import { crearEnemigo } from '../www/js/entidades/enemigos.js';

// Oleada que nunca llega: así la prueba controla qué enemigos hay.
const SIN_OLEADAS = [[{ t: 999, tipo: 'explorador', x: 0 }]];
const quieto = { activo: false, x: 0, y: 0 };

function simular(partida, segundos) {
  for (let i = 0; i < Math.round(segundos / 0.01); i++) partida.update(0.01, quieto);
}

test('una partida nueva arranca jugando con 0 puntos y 3 vidas', () => {
  const p = crearPartida({ oleadas: SIN_OLEADAS });
  assert.deepEqual([p.estado, p.puntos, p.jugador.vidas], ['jugando', 0, 3]);
});

test('destruir un explorador suma 100 puntos', () => {
  const p = crearPartida({ oleadas: SIN_OLEADAS });
  p.flota.agregar(crearEnemigo('explorador', p.jugador.x, 200));
  simular(p, 1);
  assert.equal(p.flota.lista.length, 0);
  assert.equal(p.puntos, 100);
});

test('perder la última vida pasa a muriendo y 1.5 s después a terminada', () => {
  const p = crearPartida({ oleadas: SIN_OLEADAS });
  p.jugador.vidas = 1;
  p.balasEnemigas.disparar(p.jugador.x, p.jugador.y, 0);
  p.update(0.01, quieto);
  assert.equal(p.estado, 'muriendo');
  simular(p, 1.4);
  assert.equal(p.estado, 'muriendo');
  simular(p, 0.2);
  assert.equal(p.estado, 'terminada');
});

test('perder una vida vibra, y la última vibra más largo', () => {
  const vibraciones = [];
  const p = crearPartida({ oleadas: SIN_OLEADAS, vibrar: (ms) => vibraciones.push(ms) });
  p.jugador.vidas = 2;
  p.balasEnemigas.disparar(p.jugador.x, p.jugador.y, 0);
  p.update(0.01, quieto);
  p.jugador.invulnerable = 0;
  p.balasEnemigas.disparar(p.jugador.x, p.jugador.y, 0);
  p.update(0.01, quieto);
  assert.equal(vibraciones.length, 2);
  assert.ok(vibraciones[1] > vibraciones[0]);
});

test('un golpe que solo rompe el escudo no vibra', () => {
  const vibraciones = [];
  const p = crearPartida({ oleadas: SIN_OLEADAS, vibrar: (ms) => vibraciones.push(ms) });
  p.jugador.escudo = true;
  p.balasEnemigas.disparar(p.jugador.x, p.jugador.y, 0);
  p.update(0.01, quieto);
  assert.deepEqual(vibraciones, []);
});

test('con más sensibilidad la nave llega antes al dedo', () => {
  const dedo = { activo: true, x: 40, y: 400 };
  const distancia = (sensibilidad) => {
    const p = crearPartida({ oleadas: SIN_OLEADAS, sensibilidad });
    const inicio = p.jugador.x;
    p.update(0.05, dedo);
    return inicio - p.jugador.x;
  };
  assert.ok(distancia(2) > distancia(1));
  assert.ok(distancia(1) > distancia(0.5));
});
