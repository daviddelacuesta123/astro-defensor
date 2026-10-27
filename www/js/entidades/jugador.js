import { W } from '../config.js';

// La nave se coloca por encima del dedo para que no quede tapada.
const DESFASE = 60;
const CADENCIA = 0.18;
const SUAVIZADO = 18;

const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

export function crearJugador({ x, y }) {
  let enfriamiento = CADENCIA;

  return {
    x,
    y,
    ancho: 30,
    alto: 33,

    update(dt, puntero, alto, disparar, sensibilidad = 1) {
      if (dt <= 0) return;

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
        disparar(this.x, this.y - this.alto / 2);
      }
    },
  };
}
