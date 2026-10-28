import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaCreditos } from '../www/js/escenas/creditos.js';
import { CREDITOS } from '../www/js/datos/creditos.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';

function preparar() {
  const destinos = [];
  const sonidos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaCreditos({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre) => destinos.push(nombre),
    sonar: (nombre) => sonidos.push(nombre),
  });
  const tocar = () => { puntero.bajar(1, 180, 300); puntero.subir(1); escena.update(0.01); };
  return { escena, destinos, sonidos, puntero, tocar };
}

test('los créditos nombran al equipo y la materia', () => {
  const textos = CREDITOS.map((l) => l.texto);
  for (const esperado of ['UN JUEGO DE', 'DAVID DE LA CUESTA', 'SARA VALENTINA OCHOA', 'APLICACIONES MÓVILES', 'GRACIAS POR JUGAR']) {
    assert.ok(textos.some((t) => t.includes(esperado)), `falta "${esperado}"`);
  }
  assert.ok(textos.some((t) => t.includes('UPB')));
});

test('cada línea tiene un estilo conocido', () => {
  const estilos = new Set(['titulo', 'sub', 'seccion', 'nombre', 'espacio']);
  for (const l of CREDITOS) assert.ok(estilos.has(l.estilo), `estilo desconocido: ${l.estilo}`);
});

test('tocar la pantalla vuelve al menú', () => {
  const { escena, destinos, sonidos, tocar } = preparar();
  escena.entrar();
  escena.update(0.5);
  tocar();
  assert.deepEqual(destinos, ['menu']);
  assert.deepEqual(sonidos, ['boton']);
});

test('el toque que abrió los créditos no los cierra', () => {
  const { escena, destinos, puntero } = preparar();
  puntero.bajar(1, 180, 620);
  puntero.subir(1);
  escena.entrar();
  escena.update(0.01);
  assert.deepEqual(destinos, []);
});

test('el texto sube y, al terminar, vuelve a empezar desde abajo', () => {
  const { escena } = preparar();
  escena.entrar();
  const inicio = escena.desplazamiento;
  escena.update(1);
  assert.ok(escena.desplazamiento < inicio, 'el texto sube');
  for (let i = 0; i < 6000; i++) escena.update(0.01);
  assert.ok(escena.desplazamiento <= inicio && escena.desplazamiento > -escena.altoTexto);
});
