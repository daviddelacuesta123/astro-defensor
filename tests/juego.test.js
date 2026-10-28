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
  const sonidos = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaJuego({
    sonar: (nombre) => sonidos.push(nombre),
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
  return { escena, destinos, textos, tocarBoton, sonidos };
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

test('los botones de pausa suenan', () => {
  const { sonidos, tocarBoton } = preparar();
  tocarBoton('PAUSA');
  tocarBoton('CONTINUAR');
  assert.deepEqual(sonidos, ['boton', 'boton']);
});

test('la partida del juego suena', () => {
  const { escena, sonidos } = preparar();
  const { jugador, balasEnemigas } = escena.partida;
  balasEnemigas.disparar(jugador.x, jugador.y, 0);
  escena.partida.update(0.01, { activo: false });
  assert.ok(sonidos.includes('golpe'));
});

// Modo Historia: la misma escena con la opción `capitulos`.
const { CAPITULOS } = await import('../www/js/datos/capitulos.js');

function prepararHistoria(capitulo, guardado = guardadoFalso(), progreso = undefined, extra = {}) {
  const destinos = [];
  // Cada llamada a irA con sus parámetros.
  const viajes = [];
  const puntero = crearEstadoPuntero();
  const escena = escenaJuego({
    estrellas: { update() {}, draw() {} },
    puntero,
    irA: (nombre, params) => {
      destinos.push(nombre);
      viajes.push([nombre, params]);
    },
    guardado,
    capitulos: CAPITULOS,
    progreso,
    ...extra,
  });
  escena.entrar({ capitulo });
  const textos = () => escena.botones().map((b) => b.texto);
  const tocarBoton = (texto) => {
    const b = escena.botones().find((x) => x.texto === texto);
    assert.ok(b, `no hay botón ${texto}; hay: ${textos()}`);
    puntero.bajar(1, b.x, b.y);
    puntero.subir(1);
    escena.update(0.01);
  };
  const completar = () => {
    escena.partida.estado = 'completada';
    escena.update(0.01);
  };
  return { escena, destinos, viajes, textos, tocarBoton, completar };
}

test('historia: entra al capítulo pedido y anuncia su título', () => {
  const { escena } = prepararHistoria(2);
  assert.equal(escena.capitulo.numero, 2);
  assert.equal(escena.estado, 'jugando');
  assert.equal(escena.avisoOleada.n, 1);
});

test('historia: al completar se ofrece seguir con el siguiente capítulo', () => {
  const { escena, textos, tocarBoton, completar } = prepararHistoria(2);
  const vieja = escena.partida;
  completar();
  assert.equal(escena.estado, 'completado');
  assert.deepEqual(textos(), ['SIGUIENTE', 'MENÚ']);
  tocarBoton('SIGUIENTE');
  assert.deepEqual([escena.estado, escena.capitulo.numero], ['jugando', 3]);
  assert.notEqual(escena.partida, vieja);
});

test('historia: el último capítulo solo ofrece volver al menú', () => {
  const { textos, tocarBoton, destinos, completar } = prepararHistoria(5);
  completar();
  assert.deepEqual(textos(), ['MENÚ']);
  tocarBoton('MENÚ');
  assert.deepEqual(destinos, ['menu']);
});

test('historia: reintentar repite el mismo capítulo', () => {
  const { escena, tocarBoton } = prepararHistoria(4);
  escena.partida.estado = 'terminada';
  escena.update(0.01);
  assert.equal(escena.estado, 'fin');
  tocarBoton('REINTENTAR');
  assert.deepEqual([escena.estado, escena.capitulo.numero], ['jugando', 4]);
  tocarBoton('PAUSA');
  tocarBoton('REINICIAR');
  assert.equal(escena.capitulo.numero, 4);
});

test('historia: no toca el récord del Modo Libre', () => {
  const guardado = guardadoFalso({ recordLibre: 100 });
  const { escena } = prepararHistoria(1, guardado);
  perderCon(escena, 5000);
  assert.equal(escena.nuevoRecord, false);
  assert.equal(guardado.leerNumero('recordLibre'), 100);
});

test('historia: el capítulo 3 camufla a los enemigos; el 1 no', () => {
  const ocultos = (capitulo) => {
    const { escena } = prepararHistoria(capitulo);
    let n = 0;
    for (let i = 0; i < 400; i++) {
      escena.update(0.01);
      n += escena.partida.flota.lista.filter((e) => escena.partida.flota.oculto(e)).length;
    }
    return n;
  };
  assert.ok(ocultos(3) > 0);
  assert.equal(ocultos(1), 0);
});

test('historia: el capítulo 1 se juega de principio a fin sin anunciar oleadas de más', () => {
  const { escena } = prepararHistoria(1);
  const total = CAPITULOS[0].oleadas.length;
  let maxAnunciada = 0;
  // Cada enemigo que aparece se elimina al instante, y el jefe también: solo se prueba el avance.
  for (let i = 0; i < 6000 && escena.estado === 'jugando'; i++) {
    const { flota, jefe } = escena.partida;
    for (let j = flota.lista.length - 1; j >= 0; j--) if (!flota.lista[j].jefe) flota.lista.splice(j, 1);
    if (jefe) jefe.vida = 0;
    escena.update(0.02);
    if (escena.avisoOleada) maxAnunciada = Math.max(maxAnunciada, escena.avisoOleada.n);
  }
  assert.equal(escena.estado, 'completado');
  assert.equal(maxAnunciada, total);
});

test('modo libre: entrar sin parámetros sigue funcionando', () => {
  const { escena } = preparar();
  assert.equal(escena.capitulo, null);
  escena.entrar(undefined);
  assert.equal(escena.estado, 'jugando');
});

const { crearProgreso } = await import('../www/js/sistemas/progreso.js');

test('historia: completar un capítulo desbloquea el siguiente y guarda el mejor puntaje', () => {
  const guardado = guardadoFalso();
  const progreso = crearProgreso(guardado);
  const { escena, completar } = prepararHistoria(1, guardado, progreso);
  escena.partida.puntos = 2500;
  completar();
  assert.deepEqual(escena.resultado, { nuevoMejor: true, desbloqueado: 2 });
  assert.equal(progreso.desbloqueado(2), true);
  assert.equal(progreso.mejor(1), 2500);
});

test('historia: perder no desbloquea nada', () => {
  const guardado = guardadoFalso();
  const progreso = crearProgreso(guardado);
  const { escena } = prepararHistoria(1, guardado, progreso);
  perderCon(escena, 9000);
  assert.equal(progreso.capituloMax(), 1);
  assert.equal(progreso.mejor(1), 0);
});

test('historia: entrar a un capítulo nuevo borra el resultado del anterior', () => {
  const guardado = guardadoFalso();
  const { escena, completar, tocarBoton } = prepararHistoria(1, guardado, crearProgreso(guardado));
  completar();
  tocarBoton('SIGUIENTE');
  assert.equal(escena.resultado, null);
});

test('historia con diálogos: al completar va al diálogo de después, con el progreso ya guardado', () => {
  const guardado = guardadoFalso();
  const progreso = crearProgreso(guardado);
  const { escena, viajes, completar } = prepararHistoria(2, guardado, progreso, { conDialogos: true });
  completar();
  assert.deepEqual(viajes, [['dialogo', { capitulo: 2, momento: 'despues' }]]);
  assert.equal(progreso.desbloqueado(3), true);
  assert.equal(escena.estado, 'completado');
});

test('historia con diálogos: volver del diálogo no reinicia ni cuenta otra vez', () => {
  const guardado = guardadoFalso();
  const { escena, textos, completar } = prepararHistoria(2, guardado, crearProgreso(guardado), { conDialogos: true });
  escena.partida.puntos = 700;
  completar();
  const partida = escena.partida;
  const resultado = escena.resultado;
  escena.entrar({ reanudar: true });
  assert.equal(escena.partida, partida);
  assert.equal(escena.resultado, resultado);
  assert.equal(escena.estado, 'completado');
  assert.deepEqual(textos(), ['SIGUIENTE', 'MENÚ']);
});

test('historia con diálogos: SIGUIENTE pasa por el diálogo de antes del próximo capítulo', () => {
  const { escena, viajes, tocarBoton, completar } = prepararHistoria(2, guardadoFalso(), undefined, { conDialogos: true });
  completar();
  escena.entrar({ reanudar: true });
  tocarBoton('SIGUIENTE');
  assert.deepEqual(viajes.at(-1), ['dialogo', { capitulo: 3, momento: 'antes' }]);
});

test('historia con diálogos: REINTENTAR repite el capítulo sin diálogo', () => {
  const { escena, viajes, tocarBoton } = prepararHistoria(4, guardadoFalso(), undefined, { conDialogos: true });
  escena.partida.estado = 'terminada';
  escena.update(0.01);
  tocarBoton('REINTENTAR');
  assert.deepEqual(viajes, []);
  assert.deepEqual([escena.estado, escena.capitulo.numero], ['jugando', 4]);
});

const { crearJefe } = await import('../www/js/entidades/jefes.js');

test('historia: tras la última oleada entra el jefe del capítulo y no se completa todavía', () => {
  const { escena } = prepararHistoria(1);
  for (let i = 0; i < 6000 && !escena.partida.jefe; i++) {
    escena.partida.flota.lista.length = 0;
    escena.update(0.02);
  }
  assert.equal(escena.partida.jefe.tipo, 'crucero');
  assert.equal(escena.estado, 'jugando');
  assert.ok(escena.partida.alerta > 0);
});

test('historia: el cambio de fase del jefe se anuncia', () => {
  const { escena } = prepararHistoria(5);
  escena.partida.jefe = crearJefe('reina');
  escena.update(0.01);
  assert.equal(escena.avisoFase, null);
  escena.partida.jefe.vida = 100;
  escena.partida.jefe.update(0.01, {});
  escena.update(0.01);
  assert.equal(escena.avisoFase.texto, '¡FASE 2!');
});

test('modo libre: no hay jefe', () => {
  const { escena } = preparar();
  assert.equal(escena.partida.jefe, null);
});
