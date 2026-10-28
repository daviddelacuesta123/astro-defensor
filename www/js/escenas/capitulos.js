import { W, view, COLORS } from '../config.js';
import { crearBoton, dibujarBoton } from '../graficos/ui.js';

const SEPARACION = 64;
const ALTO_CAPITULO = 52;
const DURACION_AVISO = 1.5;

// Candado de 14×16: arco arriba y cuerpo con ojo de cerradura.
function dibujarCandado(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 4, y - 8, 8, 8);
  ctx.fillStyle = color;
  ctx.fillRect(x - 7, y - 1, 14, 9);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(x - 1, y + 2, 2, 3);
}

// Botón de capítulo: número y zona arriba, y abajo su mejor puntaje o "BLOQUEADO".
function dibujarCapitulo(ctx, b) {
  const color = b.bloqueado ? COLORS.dim : COLORS.accent;
  const x0 = Math.round(b.x - b.ancho / 2);
  const y0 = Math.round(b.y - b.alto / 2);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(x0, y0, b.ancho, b.alto);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x0 + 1, y0 + 1, b.ancho - 2, b.alto - 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.font = 'bold 16px monospace';
  ctx.fillText(b.texto, b.x, b.y - 8);
  ctx.font = 'bold 11px monospace';
  if (b.bloqueado) {
    ctx.fillText('BLOQUEADO', b.x, b.y + 13);
    dibujarCandado(ctx, x0 + 22, b.y, color);
  } else {
    ctx.fillStyle = b.mejor > 0 ? COLORS.warn : COLORS.dim;
    ctx.fillText(b.mejor > 0 ? `MEJOR  ${b.mejor}` : 'SIN JUGAR', b.x, b.y + 13);
  }
}

// Selector del Modo Historia sobre la partida fantasma. Solo se puede entrar a los
// capítulos desbloqueados: sin haber jugado, únicamente al 1.
export function escenaCapitulos({ estrellas, puntero, irA, fantasma, capitulos, progreso, sonar = () => {} }) {
  // Estado de cada capítulo, leído del guardado al entrar (no en cada cuadro).
  let estados = [];

  return {
    aviso: null,

    // Se calculan al usarlos porque dependen del alto de la pantalla.
    botones() {
      const y0 = view.H * 0.24;
      const lista = capitulos.map(({ numero, zona }, i) => ({
        ...crearBoton({
          texto: `${numero}  ${zona}`, x: W / 2, y: y0 + i * SEPARACION, ancho: 300, alto: ALTO_CAPITULO,
        }),
        capitulo: numero,
        ...estados[i],
      }));
      lista.push(crearBoton({
        texto: 'VOLVER', x: W / 2, y: y0 + capitulos.length * SEPARACION + 10, ancho: 210, alto: 44,
      }));
      return lista;
    },

    entrar() {
      estados = capitulos.map(({ numero }) => ({
        bloqueado: !progreso.desbloqueado(numero),
        mejor: progreso.mejor(numero),
      }));
      this.aviso = null;
      // El toque que trajo hasta aquí no debe elegir un capítulo.
      puntero.tomarToques();
    },

    update(dt) {
      const botones = this.botones();
      for (const { x, y } of puntero.tomarToques()) {
        const tocado = botones.find((b) => b.contiene(x, y));
        if (!tocado) continue;
        sonar('boton');
        if (tocado.bloqueado) {
          this.aviso = { texto: 'COMPLETA EL CAPÍTULO ANTERIOR', restante: DURACION_AVISO };
          continue;
        }
        if (tocado.capitulo) irA('historia', { capitulo: tocado.capitulo });
        else irA('menu');
        return;
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

      const botones = this.botones();
      for (const b of botones) {
        if (b.capitulo) dibujarCapitulo(ctx, b);
        else dibujarBoton(ctx, b, COLORS.dim);
      }

      if (this.aviso) {
        ctx.globalAlpha = Math.min(1, this.aviso.restante / 0.3);
        ctx.fillStyle = COLORS.warn;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(this.aviso.texto, W / 2, botones[botones.length - 1].y + 48);
        ctx.globalAlpha = 1;
      }
    },
  };
}
