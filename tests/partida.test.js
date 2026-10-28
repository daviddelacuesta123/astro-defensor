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

// Partida que anota los sonidos que pide.
function conSonidos() {
  const sonidos = [];
  const p = crearPartida({ oleadas: SIN_OLEADAS, sonar: (nombre) => sonidos.push(nombre) });
  return { p, sonidos };
}
const cuantos = (sonidos, nombre) => sonidos.filter((s) => s === nombre).length;

test('el disparo suena una vez por ráfaga, aunque sea triple', () => {
  const { p, sonidos } = conSonidos();
  p.jugador.nivelDisparo = 3;
  p.update(0.2, quieto);
  assert.equal(cuantos(sonidos, 'disparo'), 1);
  p.update(0.2, quieto);
  assert.equal(cuantos(sonidos, 'disparo'), 2);
});

test('destruir un enemigo suena a explosión', () => {
  const { p, sonidos } = conSonidos();
  p.flota.agregar(crearEnemigo('explorador', p.jugador.x, 200));
  simular(p, 1);
  assert.equal(cuantos(sonidos, 'explosion'), 1);
});

test('perder una vida suena a golpe, y la última además explota', () => {
  const { p, sonidos } = conSonidos();
  p.jugador.vidas = 2;
  p.balasEnemigas.disparar(p.jugador.x, p.jugador.y, 0);
  p.update(0.01, quieto);
  assert.deepEqual([cuantos(sonidos, 'golpe'), cuantos(sonidos, 'explosion')], [1, 0]);
  p.jugador.invulnerable = 0;
  p.balasEnemigas.disparar(p.jugador.x, p.jugador.y, 0);
  p.update(0.01, quieto);
  assert.deepEqual([cuantos(sonidos, 'golpe'), cuantos(sonidos, 'explosion')], [2, 1]);
});

test('recoger un power-up suena', () => {
  const { p, sonidos } = conSonidos();
  p.powerups.lista.push({ x: p.jugador.x, y: p.jugador.y, tipo: 'escudo', t: 0 });
  p.update(0.01, quieto);
  assert.equal(cuantos(sonidos, 'powerup'), 1);
});

test('la bomba suena una vez y no explota cada enemigo por separado', () => {
  const { p, sonidos } = conSonidos();
  for (const x of [60, 120, 240, 300]) p.flota.agregar(crearEnemigo('explorador', x, 100));
  p.powerups.lista.push({ x: p.jugador.x, y: p.jugador.y, tipo: 'bomba', t: 0 });
  p.update(0.01, quieto);
  assert.equal(cuantos(sonidos, 'bomba'), 1);
  assert.equal(cuantos(sonidos, 'explosion'), 0);
  assert.equal(p.flota.lista.length, 0);
});

test('sin repetir, la partida se completa al terminar la última oleada', () => {
  const p = crearPartida({ oleadas: [[{ t: 0, tipo: 'explorador', x: 180 }]], repetir: false });
  p.update(0.01, quieto);
  p.flota.lista.length = 0;
  simular(p, 2.5);
  assert.equal(p.estado, 'completada');
  const vidas = p.jugador.vidas;
  p.balasEnemigas.disparar(p.jugador.x, p.jugador.y, 0);
  p.update(0.01, quieto);
  assert.equal(p.jugador.vidas, vidas, 'completada ya no recibe golpes');
});

test('con repetir (por defecto) la partida nunca se completa', () => {
  const p = crearPartida({ oleadas: [[{ t: 0, tipo: 'explorador', x: 180 }]] });
  for (let i = 0; i < 3; i++) {
    p.update(0.01, quieto);
    p.flota.lista.length = 0;
    simular(p, 2.5);
  }
  assert.equal(p.estado, 'jugando');
});

test('morir en la pausa final no completa el capítulo', () => {
  const p = crearPartida({ oleadas: [[{ t: 0, tipo: 'explorador', x: 180 }]], repetir: false });
  p.update(0.01, quieto);
  p.flota.lista.length = 0;
  p.update(0.01, quieto);
  p.jugador.vidas = 1;
  p.balasEnemigas.disparar(p.jugador.x, p.jugador.y, 0);
  p.update(0.01, quieto);
  simular(p, 3);
  assert.equal(p.estado, 'terminada');
});

test('el camuflaje de la partida llega a la flota', () => {
  const p = crearPartida({ oleadas: SIN_OLEADAS, camuflaje: { ciclo: 3, oculto: 3 } });
  const e = crearEnemigo('tirador', 100, 100);
  p.flota.agregar(e);
  p.update(0.01, quieto);
  assert.equal(p.flota.oculto(e), true);
});
