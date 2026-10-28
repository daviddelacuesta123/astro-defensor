import { W, view, COLORS } from '../config.js';
import { CREDITOS } from '../datos/creditos.js';
import { NAVE_DORADA, dibujarSprite } from '../graficos/sprites.js';

const VELOCIDAD = 30;
// Alto que ocupa cada estilo de línea y cómo se dibuja.
const ESTILOS = {
  titulo: { alto: 44, fuente: 'bold 22px monospace', color: COLORS.accent },
  sub: { alto: 24, fuente: '11px monospace', color: COLORS.dim },
  seccion: { alto: 30, fuente: 'bold 12px monospace', color: COLORS.warn },
  nombre: { alto: 26, fuente: 'bold 15px monospace', color: COLORS.text },
  espacio: { alto: 30 },
};
const ALTO_TEXTO = CREDITOS.reduce((total, l) => total + ESTILOS[l.estilo].alto, 0);
// Franja inferior reservada a la nave y al aviso: el texto aparece por encima, con un fundido.
const FRANJA_INFERIOR = 140;
const FUNDIDO = 50;

// Créditos ocultos: el texto sube sobre las estrellas mientras la nave dorada pasea abajo.
// Cualquier toque vuelve al menú.
export function escenaCreditos({ estrellas, puntero, irA, sonar = () => {} }) {
  let t = 0;
  const limite = () => view.H - FRANJA_INFERIOR;
  const inicio = () => limite() + 10;

  return {
    // Posición y de la primera línea.
    desplazamiento: 0,
    altoTexto: ALTO_TEXTO,

    entrar() {
      t = 0;
      this.desplazamiento = inicio();
      // El dedo que abrió los créditos no debe cerrarlos.
      puntero.tomarToques();
    },

    update(dt) {
      t += dt;
      if (puntero.tomarToques().length > 0) {
        sonar('boton');
        irA('menu');
        return;
      }
      estrellas.update(dt, view.H);
      this.desplazamiento -= VELOCIDAD * dt;
      // Cuando la última línea salió por arriba, vuelve a empezar.
      if (this.desplazamiento < -ALTO_TEXTO) this.desplazamiento = inicio();
    },

    draw(ctx) {
      estrellas.draw(ctx);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let y = this.desplazamiento;
      for (const linea of CREDITOS) {
        const estilo = ESTILOS[linea.estilo];
        const alfa = Math.min(1, (limite() - y) / FUNDIDO);
        if (linea.texto && y > -40 && alfa > 0) {
          ctx.globalAlpha = alfa;
          ctx.font = estilo.fuente;
          ctx.fillStyle = estilo.color;
          ctx.fillText(linea.texto, W / 2, y);
        }
        y += estilo.alto;
      }
      ctx.globalAlpha = 1;

      // La nave dorada vuela de lado a lado bajo el texto.
      dibujarSprite(ctx, NAVE_DORADA, W / 2 + Math.sin(t * 0.8) * 120, view.H - 90 + Math.sin(t * 2) * 6);

      if (t > 2) {
        ctx.fillStyle = COLORS.dim;
        ctx.font = '11px monospace';
        ctx.fillText('TOCA PARA VOLVER', W / 2, view.H - 30);
      }
    },
  };
}
