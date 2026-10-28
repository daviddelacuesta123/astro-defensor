import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaJuego } from '../www/js/escenas/juego.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';

function preparar() {
  const destinos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaJuego({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre) => destinos.push(nombre),
  });
  escena.entrar();
  const textos = () => escena.botones().map((b) => b.texto);
  const tocarBoton = (texto) => {
    const b = escena.botones().find((x) => x.texto === texto);
    assert.ok(b, `no hay botón ${texto}; hay: ${textos()}`);
    puntero.bajar(1, b.x, b.y);
    puntero.subir(1);
    escena.update(0.01);
  };
  return { escena, destinos, textos, tocarBoton };
}

test('jugando, el único botón es el de pausa', () => {
  const { escena, textos } = preparar();
  assert.equal(escena.estado, 'jugando');
  assert.deepEqual(textos(), ['PAUSA']);
});

test('en pausa se puede continuar, reiniciar o salir al menú', () => {
  const { escena, textos, destinos, tocarBoton } = preparar();
  tocarBoton('PAUSA');
  assert.equal(escena.estado, 'pausa');
  assert.deepEqual(textos(), ['CONTINUAR', 'REINICIAR', 'SALIR AL MENÚ']);
  tocarBoton('SALIR AL MENÚ');
  assert.deepEqual(destinos, ['menu']);
});

test('al fin de la partida se puede reintentar o ir al menú', () => {
  const { escena, textos, destinos, tocarBoton } = preparar();
  escena.partida.estado = 'terminada';
  escena.update(0.01);
  assert.equal(escena.estado, 'fin');
  assert.deepEqual(textos(), ['REINTENTAR', 'MENÚ']);
  tocarBoton('MENÚ');
  assert.deepEqual(destinos, ['menu']);
});

test('volver a entrar tras salir en pausa empieza una partida nueva jugando', () => {
  const { escena, tocarBoton } = preparar();
  const vieja = escena.partida;
  tocarBoton('PAUSA');
  tocarBoton('SALIR AL MENÚ');
  escena.entrar();
  assert.equal(escena.estado, 'jugando');
  assert.notEqual(escena.partida, vieja);
});
