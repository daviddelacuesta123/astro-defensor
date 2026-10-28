import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAPITULOS } from '../www/js/datos/capitulos.js';
import { TIPOS_ENEMIGO } from '../www/js/datos/enemigos.js';

const apariciones = (cap) => cap.oleadas.flat();
const naves = (cap) => apariciones(cap).filter((a) => !TIPOS_ENEMIGO[a.tipo].obstaculo);
const tipos = (cap) => new Set(apariciones(cap).map((a) => a.tipo));

test('hay cinco capítulos numerados del 1 al 5, con nombre, zona y color', () => {
  assert.deepEqual(CAPITULOS.map((c) => c.numero), [1, 2, 3, 4, 5]);
  for (const c of CAPITULOS) {
    assert.ok(c.nombre && c.zona, `capítulo ${c.numero}`);
    assert.match(c.colorFondo, /^#[0-9a-f]{6}$/i);
  }
});

test('cada capítulo tiene entre 5 y 8 oleadas, ordenadas y con tipos válidos', () => {
  for (const c of CAPITULOS) {
    assert.ok(c.oleadas.length >= 5 && c.oleadas.length <= 8, `capítulo ${c.numero}: ${c.oleadas.length}`);
    for (const oleada of c.oleadas) {
      assert.ok(oleada.length > 0);
      for (let i = 0; i < oleada.length; i++) {
        const a = oleada[i];
        assert.ok(a.tipo in TIPOS_ENEMIGO, `tipo ${a.tipo}`);
        assert.ok(a.x >= 20 && a.x <= 340, `x ${a.x}`);
        assert.ok(a.vel > 0);
        if (i > 0) assert.ok(a.t >= oleada[i - 1].t, `capítulo ${c.numero} desordenado`);
      }
    }
  }
});

test('cada capítulo trae más naves Vex y más rápidas que el anterior', () => {
  for (let i = 1; i < CAPITULOS.length; i++) {
    const antes = CAPITULOS[i - 1];
    const ahora = CAPITULOS[i];
    assert.ok(naves(ahora).length > naves(antes).length, `capítulo ${ahora.numero}`);
    assert.ok(naves(ahora)[0].vel > naves(antes)[0].vel, `capítulo ${ahora.numero}`);
  }
});

test('el capítulo 1 es un tutorial: empieza solo con exploradores', () => {
  const [primera] = CAPITULOS[0].oleadas;
  assert.ok(primera.every((a) => a.tipo === 'explorador'));
  assert.equal(tipos(CAPITULOS[0]).has('asteroide'), false);
});

test('el cinturón (capítulo 2) tiene asteroides de los dos tamaños', () => {
  assert.ok(tipos(CAPITULOS[1]).has('asteroide'));
  assert.ok(tipos(CAPITULOS[1]).has('asteroideGrande'));
});

test('la nebulosa (capítulo 3) reduce la visión y camufla; los demás no', () => {
  const nebulosa = CAPITULOS[2].efectos;
  assert.ok(nebulosa.vision > 0);
  assert.ok(nebulosa.camuflaje.oculto < nebulosa.camuflaje.ciclo);
  for (const c of CAPITULOS) {
    if (c.numero !== 3) assert.deepEqual(c.efectos ?? {}, {}, `capítulo ${c.numero}`);
  }
});

test('el Faro Omega (capítulo 4) tiene las oleadas más densas hasta ese punto', () => {
  const densidad = (c) => naves(c).length / c.oleadas.length;
  assert.ok(densidad(CAPITULOS[3]) > densidad(CAPITULOS[2]) * 1.4);
});

test('cada capítulo termina con su jefe, en el orden de la historia', async () => {
  const { TIPOS_JEFE } = await import('../www/js/datos/jefes.js');
  assert.deepEqual(CAPITULOS.map((c) => c.jefe), ['crucero', 'minero', 'acechador', 'acorazado', 'reina']);
  for (const c of CAPITULOS) assert.ok(c.jefe in TIPOS_JEFE);
});
