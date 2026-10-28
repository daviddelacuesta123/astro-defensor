import { W } from '../config.js';
import { TIPOS_JEFE } from '../datos/jefes.js';
import { SPRITES_JEFE } from '../graficos/sprites.js';
import { apuntar } from '../util.js';

// Altura donde el jefe se queda a pelear tras entrar desde arriba.
export const Y_PUESTO = 110;
const VEL_ENTRADA = 50;

// Disparos de los jefes. entorno = { jugador, disparar(x, y, vy, vx), invocar(tipo, x, y) }.

// n balas hacia abajo, repartidas en `apertura` radianes.
function abanico(entorno, x, y, n, apertura, rapidez) {
  for (let i = 0; i < n; i++) {
    const angulo = Math.PI / 2 - apertura / 2 + apertura * i / (n - 1);
    entorno.disparar(x, y, Math.sin(angulo) * rapidez, Math.cos(angulo) * rapidez);
  }
}

// n balas en círculo, en todas direcciones.
function anillo(entorno, x, y, n, rapidez) {
  for (let i = 0; i < n; i++) {
    const angulo = i / n * Math.PI * 2;
    entorno.disparar(x, y, Math.sin(angulo) * rapidez, Math.cos(angulo) * rapidez);
  }
}

function apuntado(entorno, x, y, rapidez) {
  const { vx, vy } = apuntar(x, y, entorno.jugador.x, entorno.jugador.y, rapidez);
  entorno.disparar(x, y, vy, vx);
}

// Patrones de ataque. `h` trae el tiempo en el puesto (`t`), relojes (`cada`) y el azar (`rng`).
const PATRONES = {
  // Va de lado a lado y dispara en abanico (más ancho al enfurecerse).
  crucero(j, entorno, h) {
    j.x = W / 2 + Math.sin(h.t * 0.9) * 110;
    if (h.cada('abanico', j.fase === 1 ? 1.6 : 1.0)) {
      abanico(entorno, j.x, j.y + j.alto / 2, j.fase === 1 ? 3 : 5, 0.7, 170);
    }
  },

  // Lento; suelta asteroides y apunta al jugador.
  minero(j, entorno, h) {
    j.x = W / 2 + Math.sin(h.t * 0.6) * 90;
    if (h.cada('roca', j.fase === 1 ? 2.4 : 1.6)) entorno.invocar('asteroide', j.x, j.y + j.alto / 2);
    if (h.cada('tiro', j.fase === 1 ? 1.3 : 0.9)) apuntado(entorno, j.x, j.y + j.alto / 2, 180);
  },

  // Salta a otro lugar; se deja ver un momento, dispara una ráfaga y vuelve a camuflarse.
  acechador(j, entorno, h) {
    if (h.cada('salto', j.fase === 1 ? 3 : 2)) {
      j.x = 60 + h.rng() * 240;
      j.y = 80 + h.rng() * 80;
      h.visibleHasta = h.t + 0.9;
      h.rafaga = 3;
    }
    j.camuflado = h.t > (h.visibleHasta ?? 0);
    if (h.rafaga > 0 && h.cada('rafaga', 0.15)) {
      apuntado(entorno, j.x, j.y + j.alto / 2, 200);
      h.rafaga--;
    }
  },

  // Mucha vida: dos torretas que disparan recto, alternadas, y ráfagas apuntadas.
  acorazado(j, entorno, h) {
    j.x = W / 2 + Math.sin(h.t * 0.4) * 60;
    if (h.cada('torreta', 0.5)) {
      h.lado = -(h.lado ?? 1);
      entorno.disparar(j.x + h.lado * 30, j.y + j.alto / 2, 200, 0);
    }
    if (h.cada('rafaga', j.fase === 1 ? 2.6 : 1.6)) h.rafaga = 5;
    if (h.rafaga > 0 && h.cada('bala', 0.12)) {
      apuntado(entorno, j.x, j.y + j.alto / 2, 190);
      h.rafaga--;
    }
  },

  // Tres fases, cada una más rápida y agresiva; invoca exploradores para que la protejan.
  reina(j, entorno, h) {
    const f = j.fase;
    j.x = W / 2 + Math.sin(h.t * (0.5 + 0.25 * f)) * (80 + 20 * f);
    const boca = j.y + j.alto / 2;
    if (f < 3) {
      if (h.cada('abanico', f === 1 ? 2 : 1.4)) abanico(entorno, j.x, boca, 5, 0.9, 160);
    } else if (h.cada('anillo', 1.8)) {
      anillo(entorno, j.x, j.y, 12, 140);
    }
    if (f > 1 && h.cada('tiro', f === 2 ? 1 : 0.7)) apuntado(entorno, j.x, boca, 200);
    if (h.cada('invocar', [6, 4.5, 4][f - 1])) {
      const n = f === 3 ? 3 : 2;
      for (let i = 0; i < n; i++) entorno.invocar('explorador', j.x + (i - (n - 1) / 2) * 50, boca);
    }
  },
};

// Jefe con la misma forma que un enemigo (x, y, ancho, alto, vida, golpeado, update):
// así lo dañan las balas del jugador. `jefe: true` le avisa a la flota y a la partida.
export function crearJefe(tipo, { rng = Math.random } = {}) {
  const def = TIPOS_JEFE[tipo];
  if (!def) throw new Error(`Tipo de jefe desconocido: ${tipo}`);
  const relojes = {};
  const h = {
    t: 0,
    rng,
    // true cada `intervalo` segundos; el primero llega tras un intervalo completo.
    cada(nombre, intervalo) {
      relojes[nombre] = (relojes[nombre] ?? intervalo) - h.dt;
      if (relojes[nombre] > 0) return false;
      relojes[nombre] += intervalo;
      return true;
    },
  };

  return {
    jefe: true,
    tipo,
    nombre: def.nombre,
    x: W / 2,
    y: -def.alto / 2,
    ancho: def.ancho,
    alto: def.alto,
    vida: def.vida,
    vidaMax: def.vida,
    puntos: def.puntos,
    fases: def.fases,
    fase: 1,
    golpeado: 0,
    entrando: true,
    camuflado: false,

    get sprite() {
      return SPRITES_JEFE[tipo][this.fase - 1];
    },

    update(dt, entorno) {
      this.golpeado = Math.max(0, this.golpeado - dt);
      this.fase = 1 + def.fases.filter((f) => this.vida <= f * this.vidaMax).length;
      if (this.entrando) {
        this.y = Math.min(Y_PUESTO, this.y + VEL_ENTRADA * dt);
        this.entrando = this.y < Y_PUESTO;
        return;
      }
      h.t += dt;
      h.dt = dt;
      PATRONES[tipo](this, entorno, h);
    },
  };
}
