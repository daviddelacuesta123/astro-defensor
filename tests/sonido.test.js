import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  frecuencia, volumenAGanancia, EFECTOS, TEMAS, duracionPaso, notasDelPaso,
} from '../www/js/sistemas/sonido.js';

const cerca = (a, b) => Math.abs(a - b) < 0.01;

test('frecuencia convierte nombres de nota a hercios', () => {
  assert.equal(frecuencia('A4'), 440);
  assert.ok(cerca(frecuencia('A5'), 880));
  assert.ok(cerca(frecuencia('C4'), 261.63));
  assert.ok(cerca(frecuencia('F#3'), 185));
});

test('frecuencia de una nota inválida lanza error', () => {
  assert.throws(() => frecuencia('H4'));
  assert.throws(() => frecuencia('A'));
});

test('volumenAGanancia: 0 es silencio, 100 es 1 y crece sin pasarse', () => {
  assert.equal(volumenAGanancia(0), 0);
  assert.equal(volumenAGanancia(100), 1);
  assert.ok(volumenAGanancia(50) > 0 && volumenAGanancia(50) < 0.5);
  assert.equal(volumenAGanancia(150), 1);
  assert.equal(volumenAGanancia(-10), 0);
});

test('hay un efecto para cada evento del juego, con capas válidas', () => {
  assert.deepEqual(Object.keys(EFECTOS).sort(), ['alerta', 'bomba', 'boton', 'disparo', 'explosion', 'golpe', 'powerup']);
  for (const [nombre, capas] of Object.entries(EFECTOS)) {
    assert.ok(capas.length > 0, nombre);
    for (const c of capas) {
      assert.ok(['sine', 'square', 'triangle', 'sawtooth', 'ruido'].includes(c.onda), `${nombre}: ${c.onda}`);
      assert.ok(c.duracion > 0 && c.inicio >= 0, nombre);
      assert.ok(c.volumen > 0 && c.volumen <= 1, nombre);
      if (c.onda !== 'ruido') assert.ok(c.de > 0 && c.a > 0, nombre);
    }
  }
});

test('el disparo es corto y más bajo que la explosión, porque suena muy seguido', () => {
  const max = (capas) => Math.max(...capas.map((c) => c.volumen));
  assert.ok(EFECTOS.disparo.every((c) => c.duracion <= 0.08));
  assert.ok(max(EFECTOS.disparo) < max(EFECTOS.explosion));
});

test('el power-up es un arpegio ascendente', () => {
  const capas = [...EFECTOS.powerup].sort((a, b) => a.inicio - b.inicio);
  assert.ok(capas.length >= 3);
  for (let i = 1; i < capas.length; i++) assert.ok(capas[i].de > capas[i - 1].de);
});

test('cada tema tiene voces del mismo largo y solo notas válidas', () => {
  assert.deepEqual(Object.keys(TEMAS).sort(), ['juego', 'menu']);
  for (const [nombre, tema] of Object.entries(TEMAS)) {
    const largos = tema.voces.map((v) => v.notas.length);
    assert.ok(largos.every((n) => n === largos[0] && n > 0), nombre);
    for (const voz of tema.voces) {
      for (const nota of voz.notas) if (nota !== '-') assert.doesNotThrow(() => frecuencia(nota), `${nombre}: ${nota}`);
    }
  }
});

test('el tema del juego es más rápido que el del menú', () => {
  assert.ok(duracionPaso(TEMAS.juego) < duracionPaso(TEMAS.menu));
});

// Tema mínimo para probar el secuenciador con números exactos.
const PRUEBA = {
  bpm: 120,
  voces: [
    { onda: 'square', volumen: 0.2, notas: ['A4', '-', '-', 'C5'] },
    { onda: 'triangle', volumen: 0.5, notas: ['-', 'A2', 'A2', '-'] },
  ],
};

test('duracionPaso: un paso es una corchea', () => {
  assert.equal(duracionPaso(PRUEBA), 0.25);
});

test('notasDelPaso devuelve las notas que empiezan en ese paso', () => {
  const [nota] = notasDelPaso(PRUEBA, 0);
  assert.equal(nota.frecuencia, 440);
  assert.equal(nota.onda, 'square');
  assert.equal(nota.volumen, 0.2);
  assert.equal(notasDelPaso(PRUEBA, 1).length, 1);
  assert.equal(notasDelPaso(PRUEBA, 1)[0].onda, 'triangle');
});

test('una nota se sostiene durante los silencios que le siguen', () => {
  const [larga] = notasDelPaso(PRUEBA, 0);
  const [corta] = notasDelPaso(PRUEBA, 1);
  assert.ok(larga.duracion > 2.5 * duracionPaso(PRUEBA) && larga.duracion <= 3 * duracionPaso(PRUEBA));
  assert.ok(corta.duracion <= duracionPaso(PRUEBA));
  // La última nota no se sostiene más allá del final del bucle.
  assert.ok(notasDelPaso(PRUEBA, 3)[0].duracion <= duracionPaso(PRUEBA));
});

test('el paso da la vuelta al llegar al final del tema', () => {
  assert.deepEqual(notasDelPaso(PRUEBA, 4), notasDelPaso(PRUEBA, 0));
});

test('la alarma del jefe alterna dos tonos varias veces', () => {
  const tonos = new Set(EFECTOS.alerta.map((c) => c.de));
  assert.equal(tonos.size, 2);
  assert.ok(EFECTOS.alerta.length >= 4);
});
