import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escenaJuego } from '../www/js/escenas/juego.js';
import { crearEstadoPuntero } from '../www/js/entrada/coordenadas.js';
import { crearGuardado } from '../www/js/sistemas/guardado.js';
import { OLEADAS_PRUEBA } from '../www/js/datos/oleadas.js';

// Almacén en memoria con la misma interfaz que localStorage.
function guardadoFalso(datos = {}) {
  const mapa = new Map(Object.entries(datos).map(([k, v]) => ['astro.' + k, String(v)]));
  return crearGuardado({ getItem: (k) => (mapa.has(k) ? mapa.get(k) : null), setItem: (k, v) => mapa.set(k, String(v)) });
}

function preparar(guardado = guardadoFalso(), extra = {}) {
  const destinos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaJuego({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre) => destinos.push(nombre),
    guardado,
    oleadas: OLEADAS_PRUEBA,
    ...extra,
  });
  escena.entrar();
  const textos = () => escena.botones().map((b) => b.texto);
  const tocarBoton = (texto) => {
    const b = escena.botones().find((x) => x.texto === texto);
    assert.ok(b, `no hay botón ${texto}; hay: ${textos()}`);
    puntero.bajar(1, b.x, b.y);
    puntero.subir(1);
    escena.update(0.01);
  };
  return { escena, destinos, textos, tocarBoton };
}

test('jugando, el único botón es el de pausa', () => {
  const { escena, textos } = preparar();
  assert.equal(escena.estado, 'jugando');
  assert.deepEqual(textos(), ['PAUSA']);
});

test('en pausa se puede continuar, reiniciar o salir al menú', () => {
  const { escena, textos, destinos, tocarBoton } = preparar();
  tocarBoton('PAUSA');
  assert.equal(escena.estado, 'pausa');
  assert.deepEqual(textos(), ['CONTINUAR', 'REINICIAR', 'SALIR AL MENÚ']);
  tocarBoton('SALIR AL MENÚ');
  assert.deepEqual(destinos, ['menu']);
});

test('al fin de la partida se puede reintentar o ir al menú', () => {
  const { escena, textos, destinos, tocarBoton } = preparar();
  escena.partida.estado = 'terminada';
  escena.update(0.01);
  assert.equal(escena.estado, 'fin');
  assert.deepEqual(textos(), ['REINTENTAR', 'MENÚ']);
  tocarBoton('MENÚ');
  assert.deepEqual(destinos, ['menu']);
});

test('volver a entrar tras salir en pausa empieza una partida nueva jugando', () => {
  const { escena, tocarBoton } = preparar();
  const vieja = escena.partida;
  tocarBoton('PAUSA');
  tocarBoton('SALIR AL MENÚ');
  escena.entrar();
  assert.equal(escena.estado, 'jugando');
  assert.notEqual(escena.partida, vieja);
});

function perderCon(escena, puntos) {
  escena.partida.puntos = puntos;
  escena.partida.estado = 'terminada';
  escena.update(0.01);
}

test('superar el récord lo guarda y avisa', () => {
  const guardado = guardadoFalso({ recordLibre: 100 });
  const { escena } = preparar(guardado);
  assert.equal(escena.record, 100);
  perderCon(escena, 500);
  assert.deepEqual([escena.record, escena.nuevoRecord], [500, true]);
  assert.equal(guardado.leerNumero('recordLibre'), 500);
});

test('empatar el récord no cuenta como nuevo', () => {
  const guardado = guardadoFalso({ recordLibre: 500 });
  const { escena } = preparar(guardado);
  perderCon(escena, 500);
  assert.equal(escena.nuevoRecord, false);
});

test('reintentar después de un récord no arrastra el aviso', () => {
  const { escena, tocarBoton } = preparar(guardadoFalso({ recordLibre: 0 }));
  perderCon(escena, 300);
  tocarBoton('REINTENTAR');
  assert.deepEqual([escena.estado, escena.nuevoRecord, escena.record], ['jugando', false, 300]);
});

test('al empezar se anuncia la oleada 1', () => {
  const { escena } = preparar();
  assert.equal(escena.avisoOleada.n, 1);
});

test('la partida usa la sensibilidad de la configuración al empezar', () => {
  // Cuánto avanza la nave hacia el dedo en un instante, con la sensibilidad dada.
  const avance = (sensibilidad) => {
    const configuracion = { valores: { sensibilidad } };
    const { escena } = preparar(guardadoFalso(), { configuracion });
    const { jugador } = escena.partida;
    const inicio = jugador.x;
    escena.partida.update(0.05, { activo: true, x: 40, y: 400 });
    return inicio - jugador.x;
  };
  assert.ok(avance(2) > avance(0.5));
});

test('perder una vida en el juego llama a vibrar', () => {
  const vibraciones = [];
  const { escena } = preparar(guardadoFalso(), { vibrar: (ms) => vibraciones.push(ms) });
  const { jugador, balasEnemigas } = escena.partida;
  balasEnemigas.disparar(jugador.x, jugador.y, 0);
  escena.partida.update(0.01, { activo: false });
  assert.equal(vibraciones.length, 1);
});
