import { TIPOS_ENEMIGO } from '../datos/enemigos.js';
import { apuntar } from '../util.js';

// entorno = { jugador: {x, y}, disparar(x, y, vy, vx) }
export function crearEnemigo(tipo, x, y) {
  const def = TIPOS_ENEMIGO[tipo];
  if (!def) throw new Error(`Tipo de enemigo desconocido: ${tipo}`);
  const x0 = x;
  let t = 0;
  let enfriamiento = def.disparo?.cadencia ?? 0;

  return {
    tipo,
    x,
    y,
    vida: def.vida,
    puntos: def.puntos,
    ancho: def.ancho,
    alto: def.alto,

    update(dt, entorno) {
      t += dt;

      if (def.movimiento === 'zigzag') {
        this.y += def.vel * dt;
        this.x = x0 + Math.sin(t * def.frecuencia) * def.amplitud;
      } else if (def.movimiento === 'estacionar') {
        this.y = Math.min(def.alturaFija, this.y + def.vel * dt);
      } else {
        this.y += def.vel * dt;
      }

      if (def.disparo) {
        enfriamiento -= dt;
        if (enfriamiento <= 0) {
          enfriamiento += def.disparo.cadencia;
          const desdeY = this.y + this.alto / 2;
          const { vx, vy } = apuntar(this.x, desdeY, entorno.jugador.x, entorno.jugador.y, def.disparo.rapidez);
          entorno.disparar(this.x, desdeY, vy, vx);
        }
      }
    },
  };
}

export function crearFlota() {
  const lista = [];

  return {
    lista,

    agregar(enemigo) {
      lista.push(enemigo);
    },

    update(dt, entorno, alto) {
      for (const e of lista) e.update(dt, entorno);
      for (let i = lista.length - 1; i >= 0; i--) {
        if (lista[i].y > alto + 30) lista.splice(i, 1);
      }
    },
  };
}
