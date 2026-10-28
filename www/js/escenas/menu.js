import { W, view, COLORS } from '../config.js';
import { dibujarLogo, FIN_LOGO } from '../graficos/logo.js';
import { crearBoton, dibujarBoton } from '../graficos/ui.js';
import { dibujarVeloFondo } from './carga.js';

const DURACION_AVISO = 1.5;
// Destino de cada botón; null = todavía no existe (muestra "PRÓXIMAMENTE").
const OPCIONES = [
  { texto: 'MODO HISTORIA', destino: null },
  { texto: 'MODO LIBRE', destino: 'juego' },
  { texto: 'CONFIGURACIÓN', destino: null },
];

// Menú principal sobre la partida fantasma.
export function escenaMenu({ estrellas, puntero, irA, fantasma }) {
  let t = 0;

  return {
    aviso: null,

    // Se calculan al usarlos porque dependen del alto de la pantalla.
    botones() {
      return OPCIONES.map(({ texto }, i) => crearBoton({
        texto, x: W / 2, y: view.H * 0.52 + i * 62, ancho: 210, alto: 46,
      }));
    },

    entrar() {
      t = 0;
      this.aviso = null;
      // El toque que trajo hasta aquí no debe activar un botón.
      puntero.tomarToques();
    },

    update(dt) {
      t += dt;
      const botones = this.botones();
      for (const { x, y } of puntero.tomarToques()) {
        const i = botones.findIndex((b) => b.contiene(x, y));
        if (i < 0) continue;
        const { destino } = OPCIONES[i];
        if (destino) {
          irA(destino);
          return;
        }
        this.aviso = { texto: 'PRÓXIMAMENTE', restante: DURACION_AVISO };
      }

      if (this.aviso) {
        this.aviso.restante -= dt;
        if (this.aviso.restante <= 0) this.aviso = null;
      }
      estrellas.update(dt, view.H);
      fantasma.update(dt, view.H);
    },

    draw(ctx) {
      estrellas.draw(ctx);
      fantasma.draw(ctx);
      dibujarVeloFondo(ctx);

      // El logo ya viene armado desde la pantalla de carga: solo flota.
      dibujarLogo(ctx, W / 2, view.H * 0.12, FIN_LOGO + 1 + t);

      const botones = this.botones();
      botones.forEach((b, i) => dibujarBoton(ctx, b, OPCIONES[i].destino ? COLORS.accent : COLORS.dim));

      if (this.aviso) {
        ctx.globalAlpha = Math.min(1, this.aviso.restante / 0.3);
        ctx.fillStyle = COLORS.warn;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(this.aviso.texto, W / 2, botones[botones.length - 1].y + 52);
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = COLORS.dim;
      ctx.textAlign = 'center';
      ctx.font = '11px monospace';
      ctx.fillText('v1.0 · UPB', W / 2, view.H - 20);
    },
  };
}
