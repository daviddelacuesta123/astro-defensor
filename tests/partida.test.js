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
