import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGOS } from '../www/js/datos/dialogos.js';
import { partirRenglones, RENGLONES, ANCHO_RENGLON } from '../www/js/sistemas/dialogo.js';

test('partirRenglones corta por palabras sin pasar del ancho', () => {
  assert.deepEqual(partirRenglones('hola mundo', 28), ['hola mundo']);
  assert.deepEqual(partirRenglones('uno dos tres cuatro', 8), ['uno dos', 'tres', 'cuatro']);
});

test('partirRenglones corta una palabra más larga que el renglón', () => {
  assert.deepEqual(partirRenglones('abcdefghij', 4), ['abcd', 'efgh', 'ij']);
});

test('partirRenglones ignora espacios repetidos', () => {
  assert.deepEqual(partirRenglones('  a   b  ', 28), ['a b']);
});

test('hay diálogo antes y después de cada uno de los cinco capítulos', () => {
  assert.deepEqual(Object.keys(DIALOGOS).map(Number), [1, 2, 3, 4, 5]);
  for (const [n, { antes, despues }] of Object.entries(DIALOGOS)) {
    assert.ok(antes.length > 0 && despues.length > 0, `capítulo ${n}`);
  }
});

test('cada línea es de un personaje conocido y cabe en el cuadro', () => {
  for (const [n, momentos] of Object.entries(DIALOGOS)) {
    for (const linea of [...momentos.antes, ...momentos.despues]) {
      assert.ok(['nova', 'iriarte', 'reina'].includes(linea.quien), `capítulo ${n}: ${linea.quien}`);
      const renglones = partirRenglones(linea.texto, ANCHO_RENGLON);
      assert.ok(renglones.length <= RENGLONES, `capítulo ${n}: "${linea.texto}"`);
    }
  }
});

test('la Reina del Enjambre habla por primera vez en el capítulo 5', () => {
  const habla = (n) => [...DIALOGOS[n].antes, ...DIALOGOS[n].despues].some((l) => l.quien === 'reina');
  assert.deepEqual([1, 2, 3, 4].map(habla), [false, false, false, false]);
  assert.equal(DIALOGOS[5].antes.some((l) => l.quien === 'reina'), true);
});

test('el capítulo 1 lo abre Iriarte explicando la misión', () => {
  assert.equal(DIALOGOS[1].antes[0].quien, 'iriarte');
  assert.match(DIALOGOS[1].antes.map((l) => l.texto).join(' '), /faro/i);
});

const { crearDialogo } = await import('../www/js/sistemas/dialogo.js');
const LINEAS = [
  { quien: 'iriarte', texto: 'abcdefghij' },
  { quien: 'nova', texto: 'xyz' },
];

test('las letras aparecen con el tiempo', () => {
  const d = crearDialogo(LINEAS, { letrasPorSegundo: 10 });
  assert.equal(d.linea.quien, 'iriarte');
  assert.equal(d.visibles, 0);
  d.update(0.35);
  assert.equal(d.visibles, 3);
  assert.equal(d.completa, false);
  d.update(5);
  assert.equal(d.visibles, 10, 'no pasa del largo del texto');
  assert.equal(d.completa, true);
});

test('un toque con el texto a medias lo completa sin pasar de línea', () => {
  const d = crearDialogo(LINEAS, { letrasPorSegundo: 10 });
  d.update(0.2);
  d.tocar();
  assert.deepEqual([d.indice, d.visibles, d.completa], [0, 10, true]);
});

test('con el texto completo, un toque pasa a la siguiente línea desde cero', () => {
  const d = crearDialogo(LINEAS, { letrasPorSegundo: 10 });
  d.tocar();
  d.tocar();
  assert.deepEqual([d.indice, d.linea.quien, d.visibles], [1, 'nova', 0]);
});

test('después de la última línea el diálogo termina', () => {
  const d = crearDialogo(LINEAS, { letrasPorSegundo: 10 });
  for (let i = 0; i < 3; i++) d.tocar();
  assert.equal(d.terminado, false);
  d.tocar();
  assert.equal(d.terminado, true);
  d.tocar();
  d.update(1);
  assert.equal(d.terminado, true, 'tocar de más no rompe nada');
});

test('un diálogo sin líneas empieza terminado', () => {
  assert.equal(crearDialogo([]).terminado, true);
});
