import { COLORS } from '../config.js';
import { chocan } from '../sistemas/colisiones.js';

export const TIPOS_POWERUP = ['disparo', 'escudo', 'bomba', 'vida'];
const PESOS = [4, 3, 2, 1];
const PROBABILIDAD = 0.12;
const VEL = 60;
const TAM = 16;
const MAX_VIDAS = 5;
const MAX_NIVEL = 3;

const ASPECTO = {
  disparo: { letra: 'D', color: COLORS.warn },
  escudo: { letra: 'E', color: COLORS.accent },
  bomba: { letra: 'B', color: COLORS.danger },
  vida: { letra: 'V', color: COLORS.pink },
};

function elegirTipo(r) {
  const total = PESOS.reduce((a, b) => a + b, 0);
  let acumulado = 0;
  for (let i = 0; i < PESOS.length; i++) {
    acumulado += PESOS[i];
    if (r * total < acumulado) return TIPOS_POWERUP[i];
  }
  return TIPOS_POWERUP[TIPOS_POWERUP.length - 1];
}

export function crearPowerups({ rng = Math.random } = {}) {
  const lista = [];

  return {
    lista,

    // Lo llama la escena cuando muere un enemigo: a veces deja caer un power-up.
    soltar(x, y) {
      if (rng() >= PROBABILIDAD) return;
      lista.push({ x, y, tipo: elegirTipo(rng()), t: 0 });
    },

    update(dt, alto) {
      for (const p of lista) {
        p.y += VEL * dt;
        p.t += dt;
      }
      for (let i = lista.length - 1; i >= 0; i--) {
        if (lista[i].y > alto + 20) lista.splice(i, 1);
      }
    },

    // Quita los power-ups que toca la nave y devuelve sus tipos.
    recoger(jugador) {
      const recogidos = [];
      for (let i = lista.length - 1; i >= 0; i--) {
        const p = lista[i];
        if (chocan(jugador, { x: p.x, y: p.y, ancho: TAM, alto: TAM })) {
          recogidos.push(p.tipo);
          lista.splice(i, 1);
        }
      }
      return recogidos;
    },

    draw(ctx) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 10px monospace';
      for (const p of lista) {
        const { letra, color } = ASPECTO[p.tipo];
        const x = Math.round(p.x - TAM / 2);
        const y = Math.round(p.y - TAM / 2);
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(x, y, TAM, TAM);
        // El borde parpadea para que se note entre los disparos.
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(p.t * 10);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TAM - 2, TAM - 2);
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        ctx.fillText(letra, p.x, p.y + 1);
      }
    },
  };
}

// Aplica el efecto a la nave. Devuelve 'bomba' para que la escena limpie la pantalla.
export function aplicarPowerup(jugador, tipo) {
  if (tipo === 'disparo') jugador.nivelDisparo = Math.min(MAX_NIVEL, jugador.nivelDisparo + 1);
  if (tipo === 'escudo') jugador.escudo = true;
  if (tipo === 'vida') jugador.vidas = Math.min(MAX_VIDAS, jugador.vidas + 1);
  return tipo === 'bomba' ? 'bomba' : null;
}
