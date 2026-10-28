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
  const puntero = crearEstadoPuntero();
  const escena = escenaMenu({
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
  return { escena, destinos, puntero, tocarBoton };
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

test('MODO HISTORIA y CONFIGURACIÓN avisan que llegan pronto', () => {
  const { escena, destinos, tocarBoton } = preparar();
  escena.entrar();
  tocarBoton('MODO HISTORIA');
  assert.equal(escena.aviso.texto, 'PRÓXIMAMENTE');
  tocarBoton('CONFIGURACIÓN');
  assert.equal(escena.aviso.texto, 'PRÓXIMAMENTE');
  assert.deepEqual(destinos, []);
});

test('el aviso dura 1.5 s y cada toque lo reinicia', () => {
  const { escena, tocarBoton } = preparar();
  escena.entrar();
  tocarBoton('MODO HISTORIA');
  for (let i = 0; i < 100; i++) escena.update(0.01);
  tocarBoton('MODO HISTORIA');
  for (let i = 0; i < 140; i++) escena.update(0.01);
  assert.ok(escena.aviso, 'el segundo toque reinició el aviso');
  for (let i = 0; i < 20; i++) escena.update(0.01);
  assert.equal(escena.aviso, null);
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
