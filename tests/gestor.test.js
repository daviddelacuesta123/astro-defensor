import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearGestorEscenas } from '../www/js/escenas/gestor.js';

// Escena de prueba que anota en `eventos` cada método que se le llama.
function escenaEspia(nombre, eventos) {
  return {
    entrar(params) { eventos.push([nombre, 'entrar', params]); },
    salir() { eventos.push([nombre, 'salir']); },
    update(dt) { eventos.push([nombre, 'update', dt]); },
    draw(ctx) { eventos.push([nombre, 'draw', ctx]); },
  };
}

test('ir() entra a la escena con sus parámetros y la marca como actual', () => {
  const eventos = [];
  const gestor = crearGestorEscenas();
  gestor.registrar('a', escenaEspia('a', eventos));
  gestor.ir('a', { nivel: 1 });
  assert.deepEqual(eventos, [['a', 'entrar', { nivel: 1 }]]);
  assert.equal(gestor.actual, 'a');
});

test('al cambiar de escena sale de la anterior antes de entrar a la nueva', () => {
  const eventos = [];
  const gestor = crearGestorEscenas();
  gestor.registrar('a', escenaEspia('a', eventos));
  gestor.registrar('b', escenaEspia('b', eventos));
  gestor.ir('a');
  gestor.ir('b');
  assert.deepEqual(eventos.map(([n, m]) => `${n}.${m}`), ['a.entrar', 'a.salir', 'b.entrar']);
  assert.equal(gestor.actual, 'b');
});

test('update y draw solo llegan a la escena actual', () => {
  const eventos = [];
  const gestor = crearGestorEscenas();
  gestor.registrar('a', escenaEspia('a', eventos));
  gestor.registrar('b', escenaEspia('b', eventos));
  gestor.ir('b');
  eventos.length = 0;
  const ctx = {};
  gestor.update(0.1);
  gestor.draw(ctx);
  assert.deepEqual(eventos, [['b', 'update', 0.1], ['b', 'draw', ctx]]);
});

test('una escena sin métodos no provoca errores', () => {
  const gestor = crearGestorEscenas();
  gestor.registrar('vacia', {});
  gestor.registrar('otra', {});
  gestor.ir('vacia');
  gestor.update(0.016);
  gestor.draw({});
  gestor.ir('otra');
});

test('ir() a una escena no registrada lanza un error con su nombre', () => {
  const gestor = crearGestorEscenas();
  assert.throws(() => gestor.ir('noExiste'), /noExiste/);
});

test('update y draw sin escena actual no hacen nada', () => {
  const gestor = crearGestorEscenas();
  assert.equal(gestor.actual, null);
  gestor.update(0.016);
  gestor.draw({});
});

test('enviar avisa un evento solo a la escena actual', () => {
  const recibidos = [];
  const gestor = crearGestorEscenas();
  gestor.registrar('a', { pausar: (motivo) => recibidos.push(['a', motivo]) });
  gestor.registrar('b', { pausar: (motivo) => recibidos.push(['b', motivo]) });
  gestor.registrar('c', {});
  gestor.enviar('pausar', 'nadie');
  gestor.ir('b');
  gestor.enviar('pausar', 'fondo');
  gestor.ir('c');
  gestor.enviar('pausar', 'fondo');
  assert.deepEqual(recibidos, [['b', 'fondo']]);
});
