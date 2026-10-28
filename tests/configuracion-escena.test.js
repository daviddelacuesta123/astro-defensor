import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaConfiguracion } from '../www/js/escenas/configuracion.js';
import { crearConfiguracion } from '../www/js/sistemas/configuracion.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';
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

function preparar(guardado = guardadoFalso()) {
  const destinos = [];
  const vibraciones = [];
  const sonidos = [];
  const puntero = crearEstadoPuntero();
  const configuracion = crearConfiguracion(guardado);
  const escena = escenaConfiguracion({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre) => destinos.push(nombre),
    fantasma: { update() {}, draw() {} },
    configuracion,
    guardado,
    vibrar: (ms) => vibraciones.push(ms),
    sonar: (nombre) => sonidos.push(nombre),
  });
  escena.entrar();
  const ids = () => escena.botones().map((b) => b.id);
  // Los botones − y + repiten texto: se buscan por id.
  const tocar = (id) => {
    const b = escena.botones().find((x) => x.id === id);
    assert.ok(b, `no hay botón ${id}; hay: ${ids()}`);
    puntero.bajar(1, b.x, b.y);
    puntero.subir(1);
    escena.update(0.01);
  };
  return { escena, destinos, vibraciones, sonidos, configuracion, guardado, ids, tocar };
}

test('muestra una fila por ajuste, borrar progreso y volver', () => {
  const { ids } = preparar();
  assert.deepEqual(ids(), [
    'volMusica-', 'volMusica+', 'volEfectos-', 'volEfectos+', 'vibracion',
    'sensibilidad-', 'sensibilidad+', 'BORRAR PROGRESO', 'VOLVER',
  ]);
});

test('− y + cambian el ajuste y lo guardan', () => {
  const { tocar, configuracion, guardado } = preparar();
  tocar('volMusica+');
  tocar('volEfectos-');
  tocar('sensibilidad+');
  assert.deepEqual(
    [configuracion.valores.volMusica, configuracion.valores.volEfectos, configuracion.valores.sensibilidad],
    [80, 70, 1.25],
  );
  assert.equal(guardado.leerNumero('volMusica'), 80);
  assert.equal(guardado.leerNumero('sensibilidad'), 1.25);
});

test('el interruptor apaga y prende la vibración, y vibra al prenderla', () => {
  const { tocar, escena, configuracion, vibraciones } = preparar();
  const textoVibracion = () => escena.botones().find((b) => b.id === 'vibracion').texto;
  assert.equal(textoVibracion(), 'SÍ');
  tocar('vibracion');
  assert.equal(configuracion.valores.vibracion, 0);
  assert.equal(textoVibracion(), 'NO');
  tocar('vibracion');
  assert.equal(configuracion.valores.vibracion, 1);
  assert.equal(vibraciones.length, 1);
});

test('borrar progreso pide confirmación y SÍ deja el récord en 0', () => {
  const { tocar, escena, ids, guardado } = preparar(guardadoFalso({ recordLibre: 4200 }));
  tocar('BORRAR PROGRESO');
  assert.equal(escena.estado, 'confirmar');
  assert.deepEqual(ids(), ['SÍ', 'NO']);
  assert.equal(guardado.leerNumero('recordLibre'), 4200);
  tocar('SÍ');
  assert.equal(escena.estado, 'ajustes');
  assert.equal(guardado.leerNumero('recordLibre'), 0);
  assert.equal(escena.aviso.texto, 'PROGRESO BORRADO');
});

test('NO cancela sin borrar nada', () => {
  const { tocar, escena, guardado } = preparar(guardadoFalso({ recordLibre: 4200 }));
  tocar('BORRAR PROGRESO');
  tocar('NO');
  assert.equal(escena.estado, 'ajustes');
  assert.equal(guardado.leerNumero('recordLibre'), 4200);
  assert.equal(escena.aviso, null);
});

test('borrar progreso no toca los ajustes', () => {
  const { tocar, configuracion, guardado } = preparar();
  tocar('volMusica-');
  tocar('BORRAR PROGRESO');
  tocar('SÍ');
  assert.equal(configuracion.valores.volMusica, 60);
  assert.equal(guardado.leerNumero('volMusica'), 60);
});

test('VOLVER lleva al menú', () => {
  const { tocar, destinos } = preparar();
  tocar('VOLVER');
  assert.deepEqual(destinos, ['menu']);
});

test('entrar de nuevo vuelve a los ajustes aunque se haya salido confirmando', () => {
  const { tocar, escena } = preparar();
  tocar('BORRAR PROGRESO');
  escena.entrar();
  assert.equal(escena.estado, 'ajustes');
});

test('cada botón suena al tocarlo', () => {
  const { tocar, sonidos } = preparar();
  tocar('volEfectos+');
  tocar('BORRAR PROGRESO');
  tocar('NO');
  assert.deepEqual(sonidos, ['boton', 'boton', 'boton']);
});
