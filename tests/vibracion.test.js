import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearVibrador } from '../www/js/sistemas/vibracion.js';

test('vibra solo si el ajuste está activado', () => {
  const llamadas = [];
  const configuracion = { valores: { vibracion: 1 } };
  const vibrar = crearVibrador(configuracion, (ms) => llamadas.push(ms));
  vibrar(120);
  configuracion.valores.vibracion = 0;
  vibrar(300);
  assert.deepEqual(llamadas, [120]);
});

test('sin motor de vibración (navegador de escritorio) no falla', () => {
  const vibrar = crearVibrador({ valores: { vibracion: 1 } }, undefined);
  assert.doesNotThrow(() => vibrar(100));
});

test('si el motor lanza error, el juego sigue', () => {
  const vibrar = crearVibrador({ valores: { vibracion: 1 } }, () => { throw new Error('bloqueado'); });
  assert.doesNotThrow(() => vibrar(100));
});
