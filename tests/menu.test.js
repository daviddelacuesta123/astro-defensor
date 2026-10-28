import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaMenu } from '../www/js/escenas/menu.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';
import { crearFantasma } from '../www/js/sistemas/fantasma.js';
import { OLEADAS_PRUEBA } from '../www/js/datos/oleadas.js';
import { crearGuardado } from '../www/js/sistemas/guardado.js';

// Almacén en memoria con la misma interfaz que localStorage.
function guardadoFalso(datos = {}) {
  const mapa = new Map(Object.entries(datos).map(([k, v]) => ['astro.' + k, String(v)]));
  return crearGuardado({ getItem: (k) => (mapa.has(k) ? mapa.get(k) : null), setItem: (k, v) => mapa.set(k, String(v)) });
}

function preparar(guardado = guardadoFalso()) {
  const destinos = [];
  const sonidos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaMenu({
    sonar: (nombre) => sonidos.push(nombre),
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre) => destinos.push(nombre),
    fantasma: crearFantasma({ oleadas: OLEADAS_PRUEBA }),
    guardado,
  });
  const tocarBoton = (texto) => {
    const b = escena.botones().find((x) => x.texto === texto);
    assert.ok(b, `no hay botón ${texto}`);
    puntero.bajar(1, b.x, b.y);
    puntero.subir(1);
    escena.update(0.01);
  };
  return { escena, destinos, puntero, tocarBoton, sonidos };
}

test('el menú tiene los tres modos en orden', () => {
  const { escena } = preparar();
  escena.entrar();
  assert.deepEqual(escena.botones().map((b) => b.texto), ['MODO HISTORIA', 'MODO LIBRE', 'CONFIGURACIÓN']);
});

test('MODO LIBRE lleva al juego', () => {
  const { escena, destinos, tocarBoton } = preparar();
  escena.entrar();
  tocarBoton('MODO LIBRE');
  assert.deepEqual(destinos, ['juego']);
});

test('MODO HISTORIA lleva al selector de capítulos', () => {
  const { escena, destinos, tocarBoton } = preparar();
  escena.entrar();
  tocarBoton('MODO HISTORIA');
  assert.deepEqual(destinos, ['capitulos']);
});

test('CONFIGURACIÓN lleva a la pantalla de ajustes', () => {
  const { escena, destinos, tocarBoton } = preparar();
  escena.entrar();
  tocarBoton('CONFIGURACIÓN');
  assert.deepEqual(destinos, ['configuracion']);
});

test('un toque anterior a entrar al menú no activa ningún botón', () => {
  const { escena, destinos, puntero } = preparar();
  const libre = () => escena.botones().find((b) => b.texto === 'MODO LIBRE');
  escena.entrar();
  const { x, y } = libre();
  escena.salir?.();
  puntero.bajar(1, x, y);
  puntero.subir(1);
  escena.entrar();
  escena.update(0.01);
  assert.deepEqual(destinos, []);
});

test('el menú muestra el récord guardado del Modo Libre', () => {
  const { escena } = preparar(guardadoFalso({ recordLibre: 1234 }));
  escena.entrar();
  assert.equal(escena.record, 1234);
});

test('tocar un botón suena', () => {
  const { escena, sonidos, tocarBoton } = preparar();
  escena.entrar();
  tocarBoton('MODO LIBRE');
  assert.deepEqual(sonidos, ['boton']);
});

test('tocar fuera de los botones no suena', () => {
  const { escena, sonidos, puntero } = preparar();
  escena.entrar();
  puntero.bajar(1, 5, 5);
  puntero.subir(1);
  escena.update(0.01);
  assert.deepEqual(sonidos, []);
});

// --- Easter eggs ---
// Con el alto por defecto (640), el logo ocupa y ≈ 77–212 y la versión está en y = 620.
const LOGO = [180, 140];
const VERSION = [180, 620];

function tocarEn(puntero, escena, [x, y], espera = 0.1) {
  puntero.bajar(1, x, y);
  puntero.subir(1);
  escena.update(espera);
}

function mantenerEn(puntero, escena, [x, y], segundos) {
  puntero.bajar(1, x, y);
  for (let i = 0; i < Math.round(segundos / 0.01); i++) escena.update(0.01);
  puntero.subir(1);
  escena.update(0.01);
}

test('siete toques rápidos al logo desbloquean la nave dorada', () => {
  const guardado = guardadoFalso();
  const { escena, puntero, destinos, sonidos } = preparar(guardado);
  escena.entrar();
  for (let i = 0; i < 7; i++) tocarEn(puntero, escena, LOGO);
  assert.equal(guardado.leerNumero('naveDorada'), 1);
  assert.equal(guardado.leerNumero('naveSecreta'), 1);
  assert.equal(escena.aviso.texto, 'NAVE SECRETA DESBLOQUEADA');
  assert.deepEqual(sonidos, ['powerup']);
  assert.deepEqual(destinos, []);
});

test('después de desbloquearla, siete toques más alternan entre la clásica y la dorada', () => {
  const guardado = guardadoFalso({ naveSecreta: 1, naveDorada: 1 });
  const { escena, puntero } = preparar(guardado);
  escena.entrar();
  for (let i = 0; i < 7; i++) tocarEn(puntero, escena, LOGO);
  assert.equal(guardado.leerNumero('naveDorada'), 0);
  assert.equal(escena.aviso.texto, 'NAVE CLÁSICA ACTIVADA');
  for (let i = 0; i < 7; i++) tocarEn(puntero, escena, LOGO);
  assert.equal(guardado.leerNumero('naveDorada'), 1);
  assert.equal(escena.aviso.texto, 'NAVE DORADA ACTIVADA');
});

test('toques lentos al logo no activan nada', () => {
  const guardado = guardadoFalso();
  const { escena, puntero } = preparar(guardado);
  escena.entrar();
  for (let i = 0; i < 10; i++) tocarEn(puntero, escena, LOGO, 1.5);
  assert.equal(guardado.leerNumero('naveDorada'), 0);
  assert.equal(escena.aviso, null);
});

test('el aviso del secreto desaparece a los 2 s', () => {
  const { escena, puntero } = preparar();
  escena.entrar();
  for (let i = 0; i < 7; i++) tocarEn(puntero, escena, LOGO);
  for (let i = 0; i < 190; i++) escena.update(0.01);
  assert.ok(escena.aviso);
  for (let i = 0; i < 20; i++) escena.update(0.01);
  assert.equal(escena.aviso, null);
});

test('mantener presionada la versión 3 s abre los créditos', () => {
  const { escena, puntero, destinos, sonidos } = preparar();
  escena.entrar();
  mantenerEn(puntero, escena, VERSION, 3.1);
  assert.deepEqual(destinos, ['creditos']);
  assert.deepEqual(sonidos, ['powerup']);
});

test('soltar la versión antes de 3 s no abre los créditos', () => {
  const { escena, puntero, destinos } = preparar();
  escena.entrar();
  mantenerEn(puntero, escena, VERSION, 2);
  mantenerEn(puntero, escena, VERSION, 2);
  assert.deepEqual(destinos, []);
});

test('mantener presionado fuera de la versión no abre los créditos', () => {
  const { escena, puntero, destinos } = preparar();
  escena.entrar();
  mantenerEn(puntero, escena, [180, 560], 4);
  mantenerEn(puntero, escena, [20, 620], 4);
  assert.deepEqual(destinos, []);
});
