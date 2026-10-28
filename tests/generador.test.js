import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generarOleada } from '../www/js/sistemas/generador.js';
import { TIPOS_ENEMIGO } from '../www/js/datos/enemigos.js';

function rngConSemilla(semilla = 7) {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const contar = (oleada, tipo) => oleada.filter((a) => a.tipo === tipo).length;

test('la oleada sale ordenada por tiempo y con tipos válidos', () => {
  for (let n = 0; n < 20; n++) {
    const oleada = generarOleada(n, rngConSemilla(n + 1));
    for (let i = 1; i < oleada.length; i++) assert.ok(oleada[i].t >= oleada[i - 1].t);
    assert.ok(oleada.every((a) => a.tipo in TIPOS_ENEMIGO));
  }
});

test('la cantidad crece con la oleada hasta un tope de 30', () => {
  assert.equal(generarOleada(0, rngConSemilla()).length, 6);
  assert.equal(generarOleada(5, rngConSemilla()).length, 16);
  assert.equal(generarOleada(12, rngConSemilla()).length, 30);
  assert.equal(generarOleada(60, rngConSemilla()).length, 30);
});

test('la primera oleada es solo de exploradores', () => {
  for (let s = 1; s < 10; s++) {
    const oleada = generarOleada(0, rngConSemilla(s));
    assert.equal(contar(oleada, 'explorador'), oleada.length);
  }
});

test('no hay tiradores antes de la oleada 2, y luego tienen tope', () => {
  for (let s = 1; s < 10; s++) {
    assert.equal(contar(generarOleada(1, rngConSemilla(s)), 'tirador'), 0);
    assert.ok(contar(generarOleada(3, rngConSemilla(s)), 'tirador') <= 2);
    assert.ok(contar(generarOleada(60, rngConSemilla(s)), 'tirador') <= 4);
  }
});

test('las oleadas avanzadas mezclan los tres tipos', () => {
  const tipos = new Set(generarOleada(9, rngConSemilla(3)).map((a) => a.tipo));
  assert.deepEqual([...tipos].sort(), ['explorador', 'tirador', 'zigzag']);
});

test('todos aparecen dentro de la pantalla', () => {
  for (let n = 0; n < 40; n += 3) {
    for (const a of generarOleada(n, rngConSemilla(n + 5))) {
      assert.ok(a.x >= 20 && a.x <= 340, `x fuera: ${a.x}`);
    }
  }
});

test('con el mismo rng se genera la misma oleada', () => {
  assert.deepEqual(generarOleada(8, rngConSemilla(42)), generarOleada(8, rngConSemilla(42)));
});

test('las oleadas avanzadas llegan más seguidas', () => {
  const duracion = (n) => {
    const o = generarOleada(n, rngConSemilla(11));
    return o[o.length - 1].t / o.length;
  };
  assert.ok(duracion(40) < duracion(12), 'más enemigos por segundo en la oleada 40');
});

test('los enemigos aceleran un 4 % por oleada, hasta 1.6 veces', () => {
  assert.ok(generarOleada(0, rngConSemilla()).every((a) => a.vel === 1));
  assert.ok(generarOleada(10, rngConSemilla()).every((a) => Math.abs(a.vel - 1.4) < 1e-9));
  assert.ok(generarOleada(60, rngConSemilla()).every((a) => a.vel === 1.6));
});
