import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearDirector } from '../www/js/sistemas/oleadas.js';
import { crearFlota } from '../www/js/entidades/enemigos.js';
import { linea, fila, ve, OLEADAS_PRUEBA } from '../www/js/datos/oleadas.js';

const e = (t, x = 180) => ({ t, tipo: 'explorador', x });

test('los enemigos aparecen en su tiempo, arriba de la pantalla', () => {
  const flota = crearFlota();
  const director = crearDirector([[e(0, 100), e(1, 200)]]);
  director.update(0.5, flota);
  assert.equal(flota.lista.length, 1);
  assert.deepEqual([flota.lista[0].x, flota.lista[0].y], [100, -20]);
  director.update(0.6, flota);
  assert.equal(flota.lista.length, 2);
});

test('un dt grande crea todas las apariciones que cubre', () => {
  const flota = crearFlota();
  crearDirector([[e(0), e(0.01), e(0.02)]]).update(0.05, flota);
  assert.equal(flota.lista.length, 3);
});

test('no pasa a la siguiente oleada mientras queden enemigos', () => {
  const flota = crearFlota();
  const director = crearDirector([[e(0)], [e(0)]]);
  director.update(10, flota);
  director.update(10, flota);
  assert.equal(director.oleada, 0);
});

test('tras vaciar la flota hay una pausa antes de la siguiente oleada', () => {
  const flota = crearFlota();
  const director = crearDirector([[e(0)], [e(0)]], { pausa: 2 });
  director.update(0.01, flota);
  flota.lista.length = 0;
  director.update(0.01, flota);
  assert.equal(director.oleada, 1);
  director.update(1.5, flota);
  assert.equal(flota.lista.length, 0);
  director.update(0.6, flota);
  assert.equal(flota.lista.length, 1);
});

test('después de la última oleada vuelve a empezar, más rápido', () => {
  const flota = crearFlota();
  const director = crearDirector([[e(0)], [e(0), e(1)]], { pausa: 0 });
  const vaciarYAvanzar = () => { flota.lista.length = 0; director.update(0.001, flota); };
  director.update(0.001, flota);
  vaciarYAvanzar();
  director.update(2, flota);
  vaciarYAvanzar();
  assert.deepEqual([director.oleada, director.ciclo], [0, 1]);
  director.update(0.001, flota);
  vaciarYAvanzar();
  director.update(0.001, flota);
  director.update(0.86, flota);
  assert.equal(flota.lista.length, 2, 'la aparición en t=1 debe llegar en t=0.85');
});

test('formaciones: fila, línea y V', () => {
  assert.deepEqual(fila('zigzag', 3, 2).map((a) => [a.t, a.x]), [[2, 40], [2, 180], [2, 320]]);
  assert.deepEqual(linea('explorador', 3, 1, 0.5, 90).map((a) => [a.t, a.x]), [[1, 90], [1.5, 90], [2, 90]]);
  const v = ve('explorador', 0);
  assert.deepEqual(v.map((a) => a.x), [100, 140, 180, 220, 260]);
  assert.equal(v[2].t, 0);
  assert.ok(v[0].t > v[1].t && v[1].t > v[2].t);
});

test('las oleadas de prueba usan los tres tipos y están ordenadas por tiempo', () => {
  assert.equal(OLEADAS_PRUEBA.length, 4);
  const tipos = new Set(OLEADAS_PRUEBA.flat().map((a) => a.tipo));
  assert.deepEqual([...tipos].sort(), ['explorador', 'tirador', 'zigzag']);
  for (const oleada of OLEADAS_PRUEBA) {
    for (let i = 1; i < oleada.length; i++) assert.ok(oleada[i].t >= oleada[i - 1].t);
  }
});

test('con una función, las oleadas se generan una a una y sin fin', () => {
  const pedidas = [];
  const generar = (n) => { pedidas.push(n); return [e(0, 50 + n)]; };
  const flota = crearFlota();
  const director = crearDirector(generar, { pausa: 0 });
  for (let i = 0; i < 3; i++) {
    director.update(0.01, flota);
    assert.equal(flota.lista[0].x, 50 + i, `la oleada ${i} usa lo generado para ella`);
    flota.lista.length = 0;
    director.update(0.01, flota);
  }
  director.update(0.01, flota);
  assert.deepEqual([director.oleada, director.ciclo], [3, 0]);
  assert.deepEqual(pedidas, [0, 1, 2, 3]);
});
