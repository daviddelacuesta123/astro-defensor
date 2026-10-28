import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearToquesSeguidos, crearPulsacionLarga } from '../www/js/sistemas/secretos.js';

test('siete toques seguidos activan el secreto', () => {
  const toques = crearToquesSeguidos();
  const resultados = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((t) => toques.registrar(t));
  assert.deepEqual(resultados, [false, false, false, false, false, false, true]);
});

test('una pausa larga entre toques reinicia la cuenta', () => {
  const toques = crearToquesSeguidos();
  for (const t of [0, 0.3, 0.6, 0.9, 1.2, 1.5]) toques.registrar(t);
  assert.equal(toques.registrar(3), false, 'el séptimo llegó tarde: cuenta como el primero');
  for (const t of [3.2, 3.4, 3.6, 3.8, 4.0]) assert.equal(toques.registrar(t), false);
  assert.equal(toques.registrar(4.2), true);
});

test('después de activarse vuelve a contar desde cero', () => {
  const toques = crearToquesSeguidos({ necesarios: 2 });
  assert.deepEqual([0, 0.1, 0.2, 0.3].map((t) => toques.registrar(t)), [false, true, false, true]);
});

test('mantener presionado 3 s activa la pulsación larga una sola vez', () => {
  const pulsacion = crearPulsacionLarga();
  let activaciones = 0;
  for (let i = 0; i < 500; i++) if (pulsacion.update(0.01, true)) activaciones++;
  assert.equal(activaciones, 1);
});

test('soltar antes de tiempo no activa y reinicia el progreso', () => {
  const pulsacion = crearPulsacionLarga({ duracion: 3 });
  for (let i = 0; i < 250; i++) assert.equal(pulsacion.update(0.01, true), false);
  assert.ok(pulsacion.progreso > 0.8);
  pulsacion.update(0.01, false);
  assert.equal(pulsacion.progreso, 0);
  for (let i = 0; i < 250; i++) assert.equal(pulsacion.update(0.01, true), false);
});

test('al soltar y volver a mantener se puede activar de nuevo', () => {
  const pulsacion = crearPulsacionLarga({ duracion: 1 });
  let activaciones = 0;
  for (const presionado of [true, false]) {
    for (let i = 0; i < 150; i++) if (pulsacion.update(0.01, presionado)) activaciones++;
  }
  for (let i = 0; i < 150; i++) if (pulsacion.update(0.01, true)) activaciones++;
  assert.equal(activaciones, 2);
});
