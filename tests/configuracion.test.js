import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearConfiguracion } from '../www/js/sistemas/configuracion.js';
import { crearGuardado } from '../www/js/sistemas/guardado.js';

// Almacén en memoria con la misma interfaz que localStorage.
function almacenFalso(datos = {}) {
  const mapa = new Map(Object.entries(datos).map(([k, v]) => ['astro.' + k, String(v)]));
  return {
    mapa,
    getItem: (k) => (mapa.has(k) ? mapa.get(k) : null),
    setItem: (k, v) => mapa.set(k, String(v)),
    removeItem: (k) => mapa.delete(k),
  };
}

test('sin nada guardado usa los valores por defecto', () => {
  const c = crearConfiguracion(crearGuardado(almacenFalso()));
  assert.deepEqual(c.valores, { volMusica: 70, volEfectos: 80, vibracion: 1, sensibilidad: 1 });
});

test('cambiar acota al rango de cada ajuste', () => {
  const c = crearConfiguracion(crearGuardado(almacenFalso()));
  c.cambiar('volMusica', 150);
  c.cambiar('volEfectos', -3);
  c.cambiar('sensibilidad', 9);
  c.cambiar('vibracion', 7);
  assert.deepEqual(c.valores, { volMusica: 100, volEfectos: 0, vibracion: 1, sensibilidad: 2 });
  c.cambiar('sensibilidad', 0.1);
  assert.equal(c.valores.sensibilidad, 0.5);
});

test('la sensibilidad se redondea al paso de 0.25', () => {
  const c = crearConfiguracion(crearGuardado(almacenFalso()));
  c.cambiar('sensibilidad', 1.3);
  assert.equal(c.valores.sensibilidad, 1.25);
  c.cambiar('sensibilidad', 1.4);
  assert.equal(c.valores.sensibilidad, 1.5);
});

test('subir y bajar avanzan un paso y se detienen en los bordes', () => {
  const c = crearConfiguracion(crearGuardado(almacenFalso({ volMusica: 90, sensibilidad: 0.75 })));
  c.subir('volMusica');
  c.subir('volMusica');
  assert.equal(c.valores.volMusica, 100);
  c.bajar('sensibilidad');
  c.bajar('sensibilidad');
  assert.equal(c.valores.sensibilidad, 0.5);
  c.bajar('vibracion');
  c.bajar('vibracion');
  assert.equal(c.valores.vibracion, 0);
});

test('los cambios se guardan y se releen en una configuración nueva', () => {
  const almacen = almacenFalso();
  const c = crearConfiguracion(crearGuardado(almacen));
  c.cambiar('volEfectos', 30);
  c.cambiar('vibracion', 0);
  c.cambiar('sensibilidad', 1.75);
  assert.equal(almacen.mapa.get('astro.volEfectos'), '30');
  const otra = crearConfiguracion(crearGuardado(almacen));
  assert.deepEqual(otra.valores, { volMusica: 70, volEfectos: 30, vibracion: 0, sensibilidad: 1.75 });
});

test('un valor guardado fuera de rango se acota al leerlo', () => {
  const c = crearConfiguracion(crearGuardado(almacenFalso({ volMusica: 500, sensibilidad: 'abc' })));
  assert.equal(c.valores.volMusica, 100);
  assert.equal(c.valores.sensibilidad, 1);
});

test('una clave desconocida se ignora', () => {
  const almacen = almacenFalso();
  const c = crearConfiguracion(crearGuardado(almacen));
  c.cambiar('dificultad', 3);
  assert.equal('dificultad' in c.valores, false);
  assert.equal(almacen.mapa.size, 0);
});
