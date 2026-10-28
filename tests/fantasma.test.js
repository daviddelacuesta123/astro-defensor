import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearFantasma } from '../www/js/sistemas/fantasma.js';
import { OLEADAS_PRUEBA } from '../www/js/datos/oleadas.js';

test('la partida fantasma juega sola con el dedo virtual', () => {
  const f = crearFantasma({ oleadas: OLEADAS_PRUEBA });
  const xInicial = f.partida.jugador.x;
  for (let i = 0; i < 300; i++) f.update(0.01, 640);
  assert.equal(f.partida.estado, 'jugando');
  assert.notEqual(f.partida.jugador.y, 540, 'la nave debería haberse movido hacia la altura del piloto');
  assert.ok(Number.isFinite(xInicial));
});

test('cuando la nave fantasma pierde, empieza otra partida', () => {
  const f = crearFantasma({ oleadas: OLEADAS_PRUEBA });
  const primera = f.partida;
  primera.estado = 'terminada';
  f.update(0.01, 640);
  assert.notEqual(f.partida, primera);
  assert.equal(f.partida.estado, 'jugando');
});
