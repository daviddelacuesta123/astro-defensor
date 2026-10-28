import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaCarga } from '../www/js/escenas/carga.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';
import { crearFantasma } from '../www/js/sistemas/fantasma.js';
import { OLEADAS_PRUEBA } from '../www/js/datos/oleadas.js';

function preparar() {
  const destinos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaCarga({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre) => destinos.push(nombre),
    fantasma: crearFantasma({ oleadas: OLEADAS_PRUEBA }),
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

test('un toque cuando ya cargó lleva al menú', () => {
  const { destinos, avanzar, tocar } = preparar();
  avanzar(1.6);
  tocar();
  avanzar(0.01);
  assert.deepEqual(destinos, ['menu']);
});

