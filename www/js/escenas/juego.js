import { W, view, COLORS } from '../config.js';
import { crearJugador } from '../entidades/jugador.js';
import { crearBalas } from '../entidades/balas.js';
import { NAVE_AD7, dibujarSprite } from '../graficos/sprites.js';

// Llama del propulsor: dos chorros bajo los motores que parpadean.
function dibujarLlama(ctx, x, y) {
  for (const dx of [-4.5, 4.5]) {
    const largo = 3 + Math.random() * 5;
    ctx.fillStyle = COLORS.warn;
    ctx.fillRect(Math.round(x + dx) - 2, Math.round(y), 4, 2);
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(Math.round(x + dx) - 1, Math.round(y) + 2, 2, Math.round(largo));
  }
}

export function escenaJuego({ estrellas, puntero }) {
  let jugador;
  let balas;
  const disparar = (x, y) => balas.disparar(x, y);

  return {
    entrar() {
      jugador = crearJugador({ x: W / 2, y: view.H - 100 });
      balas = crearBalas();
    },

    update(dt) {
      estrellas.update(dt, view.H);
      jugador.update(dt, puntero, view.H, disparar);
      balas.update(dt);
    },

    draw(ctx) {
      estrellas.draw(ctx);
      balas.draw(ctx);
      dibujarLlama(ctx, jugador.x, jugador.y + 16);
      dibujarSprite(ctx, NAVE_AD7, jugador.x, jugador.y);
    },
  };
}
