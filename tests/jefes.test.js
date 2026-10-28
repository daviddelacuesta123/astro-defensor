import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearJefe, Y_PUESTO } from '../www/js/entidades/jefes.js';
import { TIPOS_JEFE } from '../www/js/datos/jefes.js';

// Entorno espía: anota cada disparo e invocación.
function entorno() {
  const disparos = [];
  const invocados = [];
  return {
    disparos,
    invocados,
    jugador: { x: 180, y: 560 },
    disparar: (x, y, vy, vx) => disparos.push({ x, y, vx, vy }),
    invocar: (tipo, x, y) => invocados.push({ tipo, x, y }),
  };
}

function simular(jefe, segundos, ent) {
  for (let i = 0; i < Math.round(segundos / 0.01); i++) jefe.update(0.01, ent);
}

// Deja al jefe en su puesto, listo para atacar.
function enPuesto(tipo, opciones) {
  const jefe = crearJefe(tipo, opciones);
  const ent = entorno();
  while (jefe.entrando) jefe.update(0.05, ent);
  ent.disparos.length = 0;
  return { jefe, ent };
}

test('cada jefe empieza con toda su vida, en fase 1 y por encima de la pantalla', () => {
  for (const [tipo, def] of Object.entries(TIPOS_JEFE)) {
    const j = crearJefe(tipo);
    assert.deepEqual([j.vida, j.vidaMax, j.fase, j.jefe], [def.vida, def.vida, 1, true], tipo);
    assert.ok(j.y < 0, tipo);
    assert.equal(j.nombre, def.nombre);
  }
});

test('mientras entra no dispara; luego se queda en su puesto', () => {
  for (const tipo of Object.keys(TIPOS_JEFE)) {
    const j = crearJefe(tipo, { rng: () => 0.5 });
    const ent = entorno();
    let disparosEntrando = 0;
    while (j.entrando) {
      j.update(0.05, ent);
      disparosEntrando = ent.disparos.length;
    }
    assert.equal(disparosEntrando, 0, tipo);
    if (tipo !== 'acechador') assert.equal(j.y, Y_PUESTO, tipo);
  }
});

test('la fase cambia según la vida que le queda', () => {
  const c = crearJefe('crucero');
  const ent = entorno();
  c.vida = 31;
  c.update(0.01, ent);
  assert.equal(c.fase, 1);
  c.vida = 30;
  c.update(0.01, ent);
  assert.equal(c.fase, 2);

  const r = crearJefe('reina');
  const fase = (fraccion) => {
    r.vida = Math.floor(r.vidaMax * fraccion);
    r.update(0.01, ent);
    return r.fase;
  };
  assert.deepEqual([fase(0.9), fase(0.74), fase(0.5), fase(0.34), fase(0.1)], [1, 2, 2, 3, 3]);
});

test('el sprite cambia con la fase', () => {
  const r = crearJefe('reina');
  const primero = r.sprite;
  r.vida = 10;
  r.update(0.01, entorno());
  assert.notEqual(r.sprite, primero);
});

test('el crucero va de lado a lado y dispara en abanico de 3', () => {
  const { jefe, ent } = enPuesto('crucero');
  const xs = [];
  for (let i = 0; i < 400; i++) {
    jefe.update(0.01, ent);
    xs.push(jefe.x);
  }
  assert.ok(Math.max(...xs) - Math.min(...xs) > 100, 'se mueve a lo ancho');
  const primera = ent.disparos.filter((d) => d.y === ent.disparos[0].y && d.x === ent.disparos[0].x);
  assert.equal(primera.length, 3);
  const vxs = primera.map((d) => d.vx).sort((a, b) => a - b);
  assert.ok(vxs[0] < 0 && Math.abs(vxs[1]) < 1e-9 && vxs[2] > 0, 'una al centro y dos abiertas');
  assert.ok(primera.every((d) => d.vy > 0), 'hacia abajo');
});

test('el minero lanza asteroides', () => {
  const { jefe, ent } = enPuesto('minero');
  simular(jefe, 6, ent);
  assert.ok(ent.invocados.length >= 2);
  assert.ok(ent.invocados.every((i) => i.tipo === 'asteroide'));
});

test('el acechador salta a otro lugar y se camufla entre saltos', () => {
  let semilla = 0;
  const rng = () => (semilla = (semilla + 0.37) % 1);
  const { jefe, ent } = enPuesto('acechador', { rng });
  const posiciones = new Set();
  let camuflado = 0;
  for (let i = 0; i < 800; i++) {
    jefe.update(0.01, ent);
    posiciones.add(`${Math.round(jefe.x)},${Math.round(jefe.y)}`);
    if (jefe.camuflado) camuflado++;
  }
  assert.ok(posiciones.size >= 2, 'cambió de lugar');
  assert.ok(camuflado > 100 && camuflado < 800, `camuflado ${camuflado} de 800 cuadros`);
  assert.ok(ent.disparos.length > 0);
});

test('el acorazado dispara recto con sus torretas y en ráfagas apuntadas', () => {
  const { jefe, ent } = enPuesto('acorazado');
  simular(jefe, 4, ent);
  const rectos = ent.disparos.filter((d) => d.vx === 0);
  assert.ok(rectos.length >= 6);
  // Las torretas están a los dos lados del casco.
  assert.ok(rectos.some((d) => d.x < jefe.x) && rectos.some((d) => d.x > jefe.x));
  assert.ok(ent.disparos.length > rectos.length, 'también apunta al jugador');
});

test('la Reina invoca exploradores y en la fase 3 dispara más que en la 1', () => {
  const tasa = (vida) => {
    const { jefe, ent } = enPuesto('reina');
    jefe.vida = vida;
    simular(jefe, 8, ent);
    return { disparos: ent.disparos.length, invocados: ent.invocados };
  };
  const f1 = tasa(180);
  const f3 = tasa(20);
  assert.ok(f3.disparos > f1.disparos * 1.5, `fase 1: ${f1.disparos}, fase 3: ${f3.disparos}`);
  assert.ok(f1.invocados.length >= 2);
  assert.ok(f1.invocados.every((i) => i.tipo === 'explorador'));
});

test('un tipo de jefe desconocido lanza error', () => {
  assert.throws(() => crearJefe('dragon'));
});
