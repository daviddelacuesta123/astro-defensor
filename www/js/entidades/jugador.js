import { W } from '../config.js';

// La nave se coloca por encima del dedo para que no quede tapada.
const DESFASE = 60;
const CADENCIA = 0.18;
const SUAVIZADO = 18;
const INVULNERABLE_GOLPE = 2;
const INVULNERABLE_ESCUDO = 1;

// Ráfaga por nivel de disparo: [desplazamiento x, velocidad horizontal] de cada bala.
const RAFAGAS = {
  1: [[0, 0]],
  2: [[-6, 0], [6, 0]],
  3: [[0, 0], [-6, -120], [6, 120]],
};

const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

export function crearJugador({ x, y }) {
  let enfriamiento = CADENCIA;

  return {
    x,
    y,
    ancho: 30,
    alto: 33,
    vidas: 3,
    invulnerable: 0,
    escudo: false,
    nivelDisparo: 1,

    // Devuelve true si el golpe costó una vida (y un nivel de disparo).
    recibirGolpe() {
      if (this.invulnerable > 0) return false;
      if (this.escudo) {
        this.escudo = false;
        this.invulnerable = INVULNERABLE_ESCUDO;
        return false;
      }
      this.vidas--;
      this.nivelDisparo = Math.max(1, this.nivelDisparo - 1);
      this.invulnerable = INVULNERABLE_GOLPE;
      return true;
    },

    update(dt, puntero, alto, disparar, sensibilidad = 1) {
      if (dt <= 0) return;
      this.invulnerable = Math.max(0, this.invulnerable - dt);

      if (puntero.activo) {
        const factor = 1 - Math.exp(-SUAVIZADO * sensibilidad * dt);
        this.x += (puntero.x - this.x) * factor;
        this.y += (puntero.y - DESFASE - this.y) * factor;
        this.x = limitar(this.x, this.ancho / 2, W - this.ancho / 2);
        this.y = limitar(this.y, alto * 0.25, alto - this.alto / 2 - 8);
      }

      enfriamiento -= dt;
      if (enfriamiento <= 0) {
        enfriamiento += CADENCIA;
        const punta = this.y - this.alto / 2;
        for (const [dx, vx] of RAFAGAS[this.nivelDisparo]) disparar(this.x + dx, punta, vx);
      }
    },
  };
}
