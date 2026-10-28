import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaCarga } from '../www/js/escenas/carga.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';

function preparar() {
  const destinos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaCarga({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre) => destinos.push(nombre),
  });
  escena.entrar();
  const avanzar = (segundos) => {
    for (let i = 0; i < Math.round(segundos / 0.01); i++) escena.update(0.01);
  };
  const tocar = () => { puntero.bajar(1, 180, 300); puntero.subir(1); };
  return { escena, destinos, avanzar, tocar };
}

test('la carga dura 1.5 s', () => {
  const { escena, avanzar } = preparar();
  avanzar(1.4);
  assert.equal(escena.listo, false);
  avanzar(0.2);
  assert.equal(escena.listo, true);
});

test('un toque durante la carga se ignora, incluso después', () => {
  const { destinos, avanzar, tocar } = preparar();
  avanzar(0.5);
  tocar();
  avanzar(2);
  assert.deepEqual(destinos, []);
});

test('un toque cuando ya cargó lleva al juego', () => {
  const { destinos, avanzar, tocar } = preparar();
  avanzar(1.6);
  tocar();
  avanzar(0.01);
  assert.deepEqual(destinos, ['juego']);
});

test('cuando la nave fantasma pierde, empieza otra partida fantasma', () => {
  const { escena, avanzar } = preparar();
  const primera = escena.partida;
  primera.estado = 'terminada';
  avanzar(0.01);
  assert.notEqual(escena.partida, primera);
  assert.equal(escena.partida.estado, 'jugando');
});
