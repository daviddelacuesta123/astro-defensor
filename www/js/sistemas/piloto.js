import { W } from '../config.js';

// Piloto automático de la partida fantasma: decide dónde estaría el dedo de un jugador.
const ALTURA_NAVE = 0.8;
const DESFASE_DEDO = 60;
const ESQUIVE = 70;
const PELIGRO_BALA = { dy: 140, dx: 26 };
const PELIGRO_CHOQUE = { dy: 90, dx: 30 };
const MARGEN = 20;

const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

// La amenaza más cercana por encima de la nave dentro de la zona de peligro, o null.
function amenazaMasCercana(jugador, objetos, peligro, filtro = () => true) {
  let cercana = null;
  for (const o of objetos) {
    const dy = jugador.y - o.y;
    if (dy < 0 || dy >= peligro.dy || Math.abs(o.x - jugador.x) >= peligro.dx || !filtro(o)) continue;
    if (!cercana || dy < jugador.y - cercana.y) cercana = o;
  }
  return cercana;
}

export function pilotar(jugador, flota, balasEnemigas, alto) {
  // Apunta al enemigo más bajo que tiene encima (el más urgente).
  let objetivo = null;
  for (const e of flota.lista) {
    if (e.y < jugador.y && (!objetivo || e.y > objetivo.y)) objetivo = e;
  }
  let x = objetivo ? objetivo.x : W / 2;

  // Esquivar pesa más que apuntar: primero las balas que bajan, luego los choques.
  const amenaza = amenazaMasCercana(jugador, balasEnemigas.lista, PELIGRO_BALA, (b) => b.vy > 0)
    ?? amenazaMasCercana(jugador, flota.lista, PELIGRO_CHOQUE);
  if (amenaza) x = amenaza.x >= jugador.x ? jugador.x - ESQUIVE : jugador.x + ESQUIVE;

  return {
    activo: true,
    x: limitar(x, MARGEN, W - MARGEN),
    y: alto * ALTURA_NAVE + DESFASE_DEDO,
  };
}
