import { W, COLORS } from '../config.js';

const VEL_JUGADOR = -480;
const MARGEN = 10;

// Grupo de balas con el mismo aspecto (las del jugador, las de los enemigos...).
export function crearBalas({ color = COLORS.accent, ancho = 2, largo = 8 } = {}) {
  const lista = [];

  return {
    lista,

    disparar(x, y, vy = VEL_JUGADOR, vx = 0) {
      lista.push({ x, y, vx, vy });
    },

    update(dt, alto = Infinity) {
      for (const b of lista) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
      // Elimina las que salieron de la pantalla, recorriendo al revés para no saltarse ninguna.
      for (let i = lista.length - 1; i >= 0; i--) {
        const b = lista[i];
        if (b.y < -MARGEN || b.y > alto + MARGEN || b.x < -MARGEN || b.x > W + MARGEN) lista.splice(i, 1);
      }
    },

    draw(ctx) {
      ctx.fillStyle = color;
      for (const b of lista) {
        ctx.fillRect(Math.round(b.x - ancho / 2), Math.round(b.y - largo / 2), ancho, largo);
      }
    },
  };
}
