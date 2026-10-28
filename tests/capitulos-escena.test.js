import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaCapitulos } from '../www/js/escenas/capitulos.js';
import { CAPITULOS } from '../www/js/datos/capitulos.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';

function preparar() {
  const destinos = [];
  const sonidos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaCapitulos({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre, params) => destinos.push(params ? [nombre, params] : [nombre]),
    fantasma: { update() {}, draw() {} },
    capitulos: CAPITULOS,
    sonar: (nombre) => sonidos.push(nombre),
  });
  escena.entrar();
  const textos = () => escena.botones().map((b) => b.texto);
  const tocar = (texto) => {
    const b = escena.botones().find((x) => x.texto === texto);
    assert.ok(b, `no hay botón ${texto}; hay: ${textos()}`);
    puntero.bajar(1, b.x, b.y);
    puntero.subir(1);
    escena.update(0.01);
  };
  return { escena, destinos, sonidos, puntero, textos, tocar };
}

test('hay un botón por capítulo, con su número y zona, y uno para volver', () => {
  const { textos } = preparar();
  assert.deepEqual(textos(), [
    '1  ÓRBITA DE KEPLER',
    '2  CINTURÓN DE ASTEROIDES',
    '3  NEBULOSA CARMESÍ',
    '4  FARO OMEGA',
    '5  NAVE MADRE VEX',
    'VOLVER',
  ]);
});

test('los botones no se salen de la pantalla ni se superponen', () => {
  const { escena } = preparar();
  const botones = escena.botones();
  for (const b of botones) assert.ok(b.x - b.ancho / 2 >= 0 && b.x + b.ancho / 2 <= 360);
  for (let i = 1; i < botones.length; i++) {
    assert.ok(botones[i].y - botones[i - 1].y >= botones[i].alto, 'superpuestos');
  }
});

test('tocar un capítulo lo empieza', () => {
  const { destinos, tocar } = preparar();
  tocar('3  NEBULOSA CARMESÍ');
  assert.deepEqual(destinos, [['historia', { capitulo: 3 }]]);
});

test('VOLVER lleva al menú y cada toque suena', () => {
  const { destinos, sonidos, tocar } = preparar();
  tocar('VOLVER');
  assert.deepEqual(destinos, [['menu']]);
  assert.deepEqual(sonidos, ['boton']);
});

test('el toque que trajo a la pantalla no elige un capítulo', () => {
  const { escena, destinos, puntero } = preparar();
  const [primero] = escena.botones();
  puntero.bajar(1, primero.x, primero.y);
  puntero.subir(1);
  escena.entrar();
  escena.update(0.01);
  assert.deepEqual(destinos, []);
});
