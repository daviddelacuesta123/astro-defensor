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
