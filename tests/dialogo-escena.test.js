import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaDialogo } from '../www/js/escenas/dialogo.js';
import { CAPITULOS } from '../www/js/datos/capitulos.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';

const DIALOGOS = {
  1: {
    antes: [{ quien: 'iriarte', texto: 'Hola, Nova.' }, { quien: 'nova', texto: 'Lista.' }],
    despues: [{ quien: 'iriarte', texto: 'Bien hecho.' }],
  },
};

function preparar(params = { capitulo: 1, momento: 'antes' }) {
  const destinos = [];
  const sonidos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaDialogo({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre, p) => destinos.push([nombre, p]),
    dialogos: DIALOGOS,
    capitulos: CAPITULOS,
    sonar: (nombre) => sonidos.push(nombre),
  });
  escena.entrar(params);
  // Un toque en el centro del cuadro (lejos del botón SALTAR).
  const tocarPantalla = () => {
    puntero.bajar(1, 180, 500);
    puntero.subir(1);
    escena.update(0.01);
  };
  const tocarSaltar = () => {
    const [b] = escena.botones();
    puntero.bajar(1, b.x, b.y);
    puntero.subir(1);
    escena.update(0.01);
  };
  return { escena, destinos, sonidos, puntero, tocarPantalla, tocarSaltar };
}

test('empieza por la primera línea del momento pedido', () => {
  const { escena } = preparar();
  assert.equal(escena.dialogo.linea.texto, 'Hola, Nova.');
  assert.deepEqual(escena.botones().map((b) => b.texto), ['SALTAR']);
});

test('el primer toque completa el texto y el segundo pasa de línea', () => {
  const { escena, tocarPantalla } = preparar();
  tocarPantalla();
  assert.equal(escena.dialogo.completa, true);
  assert.equal(escena.dialogo.indice, 0);
  tocarPantalla();
  assert.equal(escena.dialogo.linea.texto, 'Lista.');
});

test('al terminar el diálogo de antes, empieza el capítulo', () => {
  const { destinos, tocarPantalla } = preparar();
  for (let i = 0; i < 4; i++) tocarPantalla();
  assert.deepEqual(destinos, [['historia', { capitulo: 1 }]]);
});

test('SALTAR lleva directo al capítulo y suena', () => {
  const { destinos, sonidos, tocarSaltar } = preparar();
  tocarSaltar();
  assert.deepEqual(destinos, [['historia', { capitulo: 1 }]]);
  assert.deepEqual(sonidos, ['boton']);
});

test('al terminar el diálogo de después, vuelve a la pantalla final sin reiniciar', () => {
  const { destinos, tocarPantalla } = preparar({ capitulo: 1, momento: 'despues' });
  tocarPantalla();
  tocarPantalla();
  assert.deepEqual(destinos, [['historia', { reanudar: true }]]);
});

test('el toque que trajo al diálogo no cuenta', () => {
  const { escena, puntero } = preparar();
  puntero.bajar(1, 180, 500);
  puntero.subir(1);
  escena.entrar({ capitulo: 1, momento: 'antes' });
  escena.update(0.01);
  assert.equal(escena.dialogo.completa, false);
});

test('las letras aparecen solas con el tiempo', () => {
  const { escena } = preparar();
  for (let i = 0; i < 20; i++) escena.update(0.01);
  assert.ok(escena.dialogo.visibles > 0 && !escena.dialogo.completa);
});
