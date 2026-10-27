import { COLORS } from '../config.js';

const VEL_JUGADOR = -480;

export function crearBalas() {
  const lista = [];

  return {
    lista,

    disparar(x, y, vy = VEL_JUGADOR) {
      lista.push({ x, y, vy });
    },

    update(dt) {
      for (const b of lista) b.y += b.vy * dt;
      // Elimina las que salieron por arriba, recorriendo al revés para no saltarse ninguna.
      for (let i = lista.length - 1; i >= 0; i--) {
        if (lista[i].y < -10) lista.splice(i, 1);
      }
    },

    draw(ctx) {
      ctx.fillStyle = COLORS.accent;
      for (const b of lista) ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 4, 2, 8);
    },
  };
}
