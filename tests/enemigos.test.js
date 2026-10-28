import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearEnemigo, crearFlota } from '../www/js/entidades/enemigos.js';
import { TIPOS_ENEMIGO } from '../www/js/datos/enemigos.js';

const entorno = (disparos = []) => ({
  jugador: { x: 180, y: 560 },
  disparar: (x, y, vy, vx) => disparos.push({ x, y, vx, vy }),
});

function simular(enemigo, segundos, ent = entorno()) {
  for (let i = 0; i < Math.round(segundos / 0.01); i++) enemigo.update(0.01, ent);
}

test('el explorador baja recto a su velocidad', () => {
  const e = crearEnemigo('explorador', 100, 0);
  e.update(0.5, entorno());
  assert.equal(e.x, 100);
  assert.equal(e.y, TIPOS_ENEMIGO.explorador.vel * 0.5);
  assert.equal(e.vida, 1);
  assert.equal(e.puntos, 100);
});

test('el zigzag oscila alrededor de su x inicial sin pasar de 50', () => {
  const e = crearEnemigo('zigzag', 180, 0);
  const xs = [];
  for (let i = 0; i < 300; i++) { e.update(0.01, entorno()); xs.push(e.x); }
  assert.ok(Math.min(...xs) < 140 && Math.max(...xs) > 220, 'debería moverse a ambos lados');
  assert.ok(xs.every((x) => x >= 130 - 1e-9 && x <= 230 + 1e-9));
  assert.ok(e.y > 0);
});

test('el tirador baja hasta y = 120 y se queda ahí', () => {
  const e = crearEnemigo('tirador', 180, -20);
  simular(e, 5);
  assert.ok(Math.abs(e.y - 120) < 1e-9, `y: ${e.y}`);
});

test('el tirador dispara apuntando al jugador cada 1.4 s', () => {
  const disparos = [];
  const e = crearEnemigo('tirador', 180, 120);
  simular(e, 3, entorno(disparos));
  assert.equal(disparos.length, 2);
  const d = disparos[0];
  assert.ok(Math.abs(d.vx) < 1e-9 && Math.abs(d.vy - 170) < 1e-9, `apunta hacia abajo al jugador: ${JSON.stringify(d)}`);
});

test('un tipo de enemigo desconocido lanza error', () => {
  assert.throws(() => crearEnemigo('dragon', 0, 0), /dragon/);
});

test('la flota elimina los enemigos que salen por abajo', () => {
  const flota = crearFlota();
  flota.agregar(crearEnemigo('explorador', 100, 660));
  flota.agregar(crearEnemigo('explorador', 200, 100));
  flota.update(0.1, entorno(), 640);
  assert.equal(flota.lista.length, 1);
  assert.equal(flota.lista[0].x, 200);
});

test('el tirador se retira hacia abajo tras 6 s en su puesto', () => {
  const e = crearEnemigo('tirador', 180, 120);
  simular(e, 5.9);
  assert.ok(Math.abs(e.y - 120) < 1e-9);
  simular(e, 1);
  assert.ok(e.y > 120 + 30, `debería estar bajando: ${e.y}`);
});

test('un enemigo con velocidad 1.5 se mueve 1.5 veces más rápido', () => {
  const normal = crearEnemigo('explorador', 100, 0);
  const rapido = crearEnemigo('explorador', 100, 0, { velocidad: 1.5 });
  normal.update(0.5, entorno());
  rapido.update(0.5, entorno());
  assert.ok(Math.abs(rapido.y - normal.y * 1.5) < 1e-9);
});

test('los asteroides bajan recto, lentos y sin disparar', () => {
  for (const tipo of ['asteroide', 'asteroideGrande']) {
    const disparos = [];
    const a = crearEnemigo(tipo, 120, 0);
    simular(a, 3, entorno(disparos));
    assert.equal(a.x, 120, tipo);
    assert.ok(TIPOS_ENEMIGO[tipo].vel < TIPOS_ENEMIGO.explorador.vel, tipo);
    assert.deepEqual(disparos, [], tipo);
  }
});

test('el asteroide grande casi no se puede destruir y no da puntos', () => {
  const chico = TIPOS_ENEMIGO.asteroide;
  const grande = TIPOS_ENEMIGO.asteroideGrande;
  assert.ok(grande.vida >= 50);
  assert.equal(grande.puntos, 0);
  assert.ok(grande.ancho > chico.ancho);
  // Romper una roca cuesta varios disparos y vale menos que un explorador.
  assert.ok(chico.vida > TIPOS_ENEMIGO.tirador.vida);
  assert.ok(chico.puntos < TIPOS_ENEMIGO.explorador.puntos);
});

const CAMUFLAJE = { ciclo: 3, oculto: 1 };

test('sin camuflaje ningún enemigo se oculta', () => {
  const flota = crearFlota();
  const e = crearEnemigo('explorador', 100, 0);
  flota.agregar(e);
  for (let i = 0; i < 300; i++) {
    flota.update(0.01, entorno(), 640);
    assert.equal(flota.oculto(e), false);
  }
});

test('con camuflaje el enemigo se oculta una parte de cada ciclo', () => {
  const flota = crearFlota({ camuflaje: CAMUFLAJE, rng: () => 0 });
  const e = crearEnemigo('tirador', 100, 0);
  flota.agregar(e);
  let oculto = 0;
  for (let i = 0; i < 600; i++) {
    flota.update(0.01, entorno(), 640);
    if (flota.oculto(e)) oculto++;
  }
  // 1 de cada 3 segundos: alrededor de 200 de 600 cuadros.
  assert.ok(oculto > 180 && oculto < 220, `cuadros ocultos: ${oculto}`);
});

test('un enemigo camuflado se ve mientras destella por un disparo', () => {
  const flota = crearFlota({ camuflaje: CAMUFLAJE, rng: () => 0 });
  const e = crearEnemigo('tirador', 100, 0);
  flota.agregar(e);
  flota.update(0.01, entorno(), 640);
  assert.equal(flota.oculto(e), true);
  e.golpeado = 0.08;
  assert.equal(flota.oculto(e), false);
});

test('cada enemigo empieza el ciclo en un momento distinto', () => {
  const valores = [0, 0.5];
  const flota = crearFlota({ camuflaje: CAMUFLAJE, rng: () => valores.shift() });
  const a = crearEnemigo('tirador', 100, 0);
  const b = crearEnemigo('tirador', 200, 0);
  flota.agregar(a);
  flota.agregar(b);
  flota.update(0.01, entorno(), 640);
  assert.notEqual(flota.oculto(a), flota.oculto(b));
});

test('los asteroides no se camuflan', () => {
  const flota = crearFlota({ camuflaje: CAMUFLAJE, rng: () => 0 });
  const roca = crearEnemigo('asteroide', 100, 0);
  flota.agregar(roca);
  flota.update(0.01, entorno(), 640);
  assert.equal(flota.oculto(roca), false);
});

const { crearJefe } = await import('../www/js/entidades/jefes.js');

test('la flota mueve a un jefe como a cualquier enemigo y nunca lo saca por abajo', () => {
  const flota = crearFlota();
  const jefe = crearJefe('crucero');
  flota.agregar(jefe);
  const ent = { ...entorno(), invocar() {} };
  for (let i = 0; i < 2000; i++) flota.update(0.01, ent, 640);
  assert.deepEqual(flota.lista, [jefe]);
  assert.equal(jefe.entrando, false);
});

test('un jefe camuflado se oculta aunque la zona no tenga camuflaje, salvo al recibir un disparo', () => {
  const flota = crearFlota();
  const jefe = crearJefe('acechador');
  flota.agregar(jefe);
  jefe.camuflado = true;
  assert.equal(flota.oculto(jefe), true);
  jefe.golpeado = 0.08;
  assert.equal(flota.oculto(jefe), false);
});
