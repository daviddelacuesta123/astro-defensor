import { W, view, COLORS } from '../config.js';
import { dibujarLogo } from '../graficos/logo.js';

// Segundos que dura la barra de carga antes de aceptar toques.
const CARGA = 1.5;
const ANCHO_BARRA = 200;

// Velo para que los textos se lean sobre la partida fantasma.
export function dibujarVeloFondo(ctx) {
  ctx.fillStyle = 'rgba(5, 6, 15, 0.45)';
  ctx.fillRect(0, 0, W, view.H);
}

// Pantalla de carga: logo sobre la partida fantasma que juega sola.
export function escenaCarga({ estrellas, puntero, irA, fantasma }) {
  let t = 0;

  return {
    listo: false,

    entrar() {
      t = 0;
      this.listo = false;
      puntero.tomarToques();
    },

    update(dt) {
      t += dt;
      // Los toques durante la carga se descartan para no saltarse el logo sin querer.
      const toques = puntero.tomarToques();
      if (!this.listo) {
        this.listo = t >= CARGA;
      } else if (toques.length > 0) {
        irA('menu');
        return;
      }
      estrellas.update(dt, view.H);
      fantasma.update(dt, view.H);
    },

    draw(ctx) {
      estrellas.draw(ctx);
      fantasma.draw(ctx);
      dibujarVeloFondo(ctx);

      dibujarLogo(ctx, W / 2, view.H * 0.2, t);

      const yInferior = view.H * 0.72;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (!this.listo) {
        const x0 = (W - ANCHO_BARRA) / 2;
        ctx.fillStyle = COLORS.dim;
        ctx.font = '12px monospace';
        ctx.fillText('CARGANDO', W / 2, yInferior - 16);
        ctx.strokeStyle = COLORS.dim;
        ctx.lineWidth = 2;
        ctx.strokeRect(x0, yInferior, ANCHO_BARRA, 10);
        ctx.fillStyle = COLORS.accent;
        ctx.fillRect(x0 + 2, yInferior + 2, (ANCHO_BARRA - 4) * Math.min(1, t / CARGA), 6);
      } else if (Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 16px monospace';
        ctx.fillText('TOCA PARA EMPEZAR', W / 2, yInferior);
      }

      ctx.fillStyle = COLORS.dim;
      ctx.font = '11px monospace';
      ctx.fillText('v1.0 · UPB', W / 2, view.H - 20);
    },
  };
}
