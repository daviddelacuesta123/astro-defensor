import { W, view, COLORS } from '../config.js';
import { crearBoton, dibujarBoton } from '../graficos/ui.js';

const SEPARACION = 58;

// Selector del Modo Historia: un botón por capítulo sobre la partida fantasma.
// Por ahora todos están desbloqueados (el progreso llega en la feature 13).
export function escenaCapitulos({ estrellas, puntero, irA, fantasma, capitulos, sonar = () => {} }) {
  return {
    // Se calculan al usarlos porque dependen del alto de la pantalla.
    botones() {
      const y0 = view.H * 0.25;
      const lista = capitulos.map(({ numero, zona }, i) => ({
        ...crearBoton({ texto: `${numero}  ${zona}`, x: W / 2, y: y0 + i * SEPARACION, ancho: 300, alto: 46 }),
        capitulo: numero,
      }));
      lista.push(crearBoton({
        texto: 'VOLVER', x: W / 2, y: y0 + capitulos.length * SEPARACION + 14, ancho: 210, alto: 44,
      }));
      return lista;
    },

    entrar() {
      // El toque que trajo hasta aquí no debe elegir un capítulo.
      puntero.tomarToques();
    },

    update(dt) {
      const botones = this.botones();
      for (const { x, y } of puntero.tomarToques()) {
        const tocado = botones.find((b) => b.contiene(x, y));
        if (!tocado) continue;
        sonar('boton');
        if (tocado.capitulo) irA('historia', { capitulo: tocado.capitulo });
        else irA('menu');
        return;
      }
      estrellas.update(dt, view.H);
      fantasma.update(dt, view.H);
    },

    draw(ctx) {
      estrellas.draw(ctx);
      fantasma.draw(ctx);
      ctx.fillStyle = 'rgba(5, 6, 15, 0.7)';
      ctx.fillRect(0, 0, W, view.H);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.accent;
      ctx.font = 'bold 24px monospace';
      ctx.fillText('MODO HISTORIA', W / 2, view.H * 0.1);
      ctx.fillStyle = COLORS.dim;
      ctx.font = 'bold 13px monospace';
      ctx.fillText('LA ÚLTIMA SEÑAL', W / 2, view.H * 0.1 + 28);

      for (const b of this.botones()) dibujarBoton(ctx, b, b.capitulo ? COLORS.accent : COLORS.dim);
    },
  };
}
