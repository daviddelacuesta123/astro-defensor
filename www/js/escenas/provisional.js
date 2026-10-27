import { W, view, COLORS } from '../config.js';

// Escena temporal para comprobar el lienzo; la reemplaza la pantalla de carga.
export function escenaProvisional(estrellas) {
  return {
    update(dt) {
      estrellas.update(dt, view.H);
    },

    draw(ctx) {
      estrellas.draw(ctx);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.accent;
      ctx.font = 'bold 32px monospace';
      ctx.fillText('ASTRO DEFENSOR', W / 2, view.H / 2);
      ctx.fillStyle = COLORS.dim;
      ctx.font = '14px monospace';
      ctx.fillText('lienzo base', W / 2, view.H / 2 + 32);
    },
  };
}
