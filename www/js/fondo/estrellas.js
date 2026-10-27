import { W, COLORS } from '../config.js';

// Tres capas: las estrellas lejanas son lentas y tenues; las cercanas, rápidas y grandes.
const CAPAS = [
  { vel: 20, tam: 1, brillo: 0.35 },
  { vel: 45, tam: 1, brillo: 0.6 },
  { vel: 90, tam: 2, brillo: 0.9 },
];

export function crearEstrellas({ cantidad = 90, alto, rng = Math.random }) {
  let altoActual = alto;

  const estrellas = Array.from({ length: cantidad }, (_, i) => {
    const capa = CAPAS[i % CAPAS.length];
    return {
      x: rng() * W,
      y: rng() * alto,
      vel: capa.vel,
      tam: capa.tam,
      brillo: capa.brillo,
    };
  });

  return {
    estrellas,

    update(dt, alto) {
      // Si la pantalla se achicó (rotación, resize), reubica las que quedaron fuera.
      if (alto !== altoActual) {
        for (const e of estrellas) {
          if (e.y >= alto) e.y = rng() * alto;
        }
        altoActual = alto;
      }
      for (const e of estrellas) {
        e.y += e.vel * dt;
        if (e.y >= alto) {
          e.y = -e.tam;
          e.x = rng() * W;
        }
      }
    },

    draw(ctx) {
      ctx.fillStyle = COLORS.text;
      for (const e of estrellas) {
        ctx.globalAlpha = e.brillo;
        ctx.fillRect(Math.floor(e.x), Math.floor(e.y), e.tam, e.tam);
      }
      ctx.globalAlpha = 1;
    },
  };
}
