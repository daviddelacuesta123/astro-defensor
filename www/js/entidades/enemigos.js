import { COLORS } from '../config.js';
import { TIPOS_ENEMIGO } from '../datos/enemigos.js';
import { apuntar } from '../util.js';
import { SPRITES_ENEMIGO, dibujarSprite } from '../graficos/sprites.js';

// entorno = { jugador: {x, y}, disparar(x, y, vy, vx) }
// `velocidad` multiplica la velocidad del tipo (las oleadas avanzadas son más rápidas).
export function crearEnemigo(tipo, x, y, { velocidad = 1 } = {}) {
  const def = TIPOS_ENEMIGO[tipo];
  if (!def) throw new Error(`Tipo de enemigo desconocido: ${tipo}`);
  const vel = def.vel * velocidad;
  const x0 = x;
  let t = 0;
  let enPuesto = 0;
  let enfriamiento = def.disparo?.cadencia ?? 0;

  return {
    tipo,
    x,
    y,
    vida: def.vida,
    puntos: def.puntos,
    ancho: def.ancho,
    alto: def.alto,
    golpeado: 0,

    update(dt, entorno) {
      t += dt;
      this.golpeado = Math.max(0, this.golpeado - dt);

      if (def.movimiento === 'zigzag') {
        this.y += vel * dt;
        this.x = x0 + Math.sin(t * def.frecuencia) * def.amplitud;
      } else if (def.movimiento === 'estacionar') {
        if (this.y < def.alturaFija) {
          this.y = Math.min(def.alturaFija, this.y + vel * dt);
        } else if (enPuesto < def.permanencia) {
          enPuesto += dt;
        } else {
          this.y += vel * dt;
        }
      } else {
        this.y += vel * dt;
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

// Opacidad de un enemigo camuflado: casi invisible, pero no del todo.
const ALFA_CAMUFLADO = 0.12;

// `camuflaje` = { ciclo, oculto }: cada nave Vex pasa `oculto` segundos de cada `ciclo` casi invisible
// (capítulo 3). Cada una empieza el ciclo en un momento al azar para que no desaparezcan todas juntas.
export function crearFlota({ camuflaje = null, rng = Math.random } = {}) {
  const lista = [];
  const desfases = new WeakMap();
  let tiempo = 0;

  return {
    lista,

    agregar(enemigo) {
      if (camuflaje) desfases.set(enemigo, rng() * camuflaje.ciclo);
      lista.push(enemigo);
    },

    // Mientras destella por un disparo se ve: así el jugador sabe que le está dando.
    oculto(enemigo) {
      if (!camuflaje || TIPOS_ENEMIGO[enemigo.tipo].obstaculo || enemigo.golpeado > 0) return false;
      return (tiempo + desfases.get(enemigo)) % camuflaje.ciclo < camuflaje.oculto;
    },

    update(dt, entorno, alto) {
      tiempo += dt;
      for (const e of lista) e.update(dt, entorno);
      for (let i = lista.length - 1; i >= 0; i--) {
        if (lista[i].y > alto + 30) lista.splice(i, 1);
      }
    },

    draw(ctx) {
      for (const e of lista) {
        if (this.oculto(e)) ctx.globalAlpha = ALFA_CAMUFLADO;
        dibujarSprite(ctx, SPRITES_ENEMIGO[e.tipo], e.x, e.y, e.golpeado > 0 ? COLORS.text : undefined);
        ctx.globalAlpha = 1;
      }
    },
  };
}
