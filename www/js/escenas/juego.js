import { W, view, COLORS } from '../config.js';
import { crearJugador } from '../entidades/jugador.js';
import { crearBalas } from '../entidades/balas.js';
import { crearFlota } from '../entidades/enemigos.js';
import { crearDirector } from '../sistemas/oleadas.js';
import { OLEADAS_PRUEBA } from '../datos/oleadas.js';
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
  let balasEnemigas;
  let flota;
  let director;
  let entorno;
  const disparar = (x, y) => balas.disparar(x, y);

  return {
    entrar() {
      jugador = crearJugador({ x: W / 2, y: view.H - 100 });
      balas = crearBalas();
      balasEnemigas = crearBalas({ color: COLORS.danger, ancho: 3, largo: 6 });
      flota = crearFlota();
      director = crearDirector(OLEADAS_PRUEBA);
      entorno = {
        jugador,
        disparar: (x, y, vy, vx) => balasEnemigas.disparar(x, y, vy, vx),
      };
    },

    update(dt) {
      estrellas.update(dt, view.H);
      jugador.update(dt, puntero, view.H, disparar);
      director.update(dt, flota);
      flota.update(dt, entorno, view.H);
      balas.update(dt, view.H);
      balasEnemigas.update(dt, view.H);
    },

    draw(ctx) {
      estrellas.draw(ctx);
      flota.draw(ctx);
      balas.draw(ctx);
      balasEnemigas.draw(ctx);
      dibujarLlama(ctx, jugador.x, jugador.y + 16);
      dibujarSprite(ctx, NAVE_AD7, jugador.x, jugador.y);
    },
  };
}
