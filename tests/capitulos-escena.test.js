import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaCapitulos } from '../www/js/escenas/capitulos.js';
import { CAPITULOS } from '../www/js/datos/capitulos.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';
import { crearProgreso } from '../www/js/sistemas/progreso.js';
import { crearGuardado } from '../www/js/sistemas/guardado.js';

// Almacén en memoria con la misma interfaz que localStorage.
function guardadoFalso(datos = {}) {
  const mapa = new Map(Object.entries(datos).map(([k, v]) => ['astro.' + k, String(v)]));
  return crearGuardado({
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
  });
}

function preparar(datos = {}, extra = {}) {
  const destinos = [];
  const sonidos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaCapitulos({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre, params) => destinos.push(params ? [nombre, params] : [nombre]),
    fantasma: { update() {}, draw() {} },
    capitulos: CAPITULOS,
    progreso: crearProgreso(guardadoFalso(datos)),
    sonar: (nombre) => sonidos.push(nombre),
    ...extra,
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

test('tocar un capítulo desbloqueado lo empieza', () => {
  const { destinos, tocar } = preparar({ capituloMax: 3 });
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

const bloqueados = (escena) => escena.botones().filter((b) => b.capitulo).map((b) => b.bloqueado);

test('sin haber jugado, solo el capítulo 1 está desbloqueado', () => {
  const { escena } = preparar();
  assert.deepEqual(bloqueados(escena), [false, true, true, true, true]);
});

test('con progreso guardado se desbloquean hasta el capítulo máximo', () => {
  const { escena } = preparar({ capituloMax: 4 });
  assert.deepEqual(bloqueados(escena), [false, false, false, false, true]);
});

test('tocar un capítulo bloqueado no lo abre y avisa', () => {
  const { escena, destinos, tocar } = preparar();
  tocar('2  CINTURÓN DE ASTEROIDES');
  assert.deepEqual(destinos, []);
  assert.equal(escena.aviso.texto, 'COMPLETA EL CAPÍTULO ANTERIOR');
  for (let i = 0; i < 200; i++) escena.update(0.01);
  assert.equal(escena.aviso, null);
});

test('cada capítulo desbloqueado muestra su mejor puntaje', () => {
  const { escena } = preparar({ capituloMax: 2, mejorCap1: 4200 });
  const [uno, dos] = escena.botones();
  assert.deepEqual([uno.mejor, dos.mejor], [4200, 0]);
});

test('el selector se entera del progreso nuevo al volver a entrar', () => {
  const guardado = guardadoFalso();
  const progreso = crearProgreso(guardado);
  const escena = escenaCapitulos({
    estrellas: { update() {}, draw() {} },
    puntero: crearEstadoPuntero(),
    irA: () => {},
    fantasma: { update() {}, draw() {} },
    capitulos: CAPITULOS,
    progreso,
  });
  escena.entrar();
  progreso.completar(1, 100);
  escena.entrar();
  assert.deepEqual(bloqueados(escena), [false, false, true, true, true]);
});

test('con diálogos, elegir un capítulo abre primero su diálogo de antes', () => {
  const { destinos, tocar } = preparar({ capituloMax: 2 }, { conDialogos: true });
  tocar('2  CINTURÓN DE ASTEROIDES');
  assert.deepEqual(destinos, [['dialogo', { capitulo: 2, momento: 'antes' }]]);
});
