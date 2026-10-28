import { COLORS } from '../config.js';
import { medirTexto, dibujarTextoPixel } from './fuente.js';

const RETRASO_LETRA = 0.07;
const DURACION_CAIDA = 0.5;
const CAIDA = 40;
const SOMBRA = 3;
const PALABRAS = [
  { texto: 'ASTRO', escala: 8, dy: 0 },
  { texto: 'DEFENSOR', escala: 5, dy: 70 },
];
// Momento en que termina de caer la última letra.
export const FIN_LOGO = RETRASO_LETRA * 12 + DURACION_CAIDA;

// Entrada de la letra i: cae desde 40 unidades más arriba mientras aparece.
export function animacionLetra(t, i) {
  // Redondeo para que el final exacto no quede en 0.99999 por errores de coma flotante.
  const bruto = Math.round((t - RETRASO_LETRA * i) / DURACION_CAIDA * 1e9) / 1e9;
  const p = Math.min(1, Math.max(0, bruto));
  const suave = 1 - (1 - p) ** 3;
  return { dy: (suave - 1) * CAIDA, alpha: p };
}

// Logo "ASTRO DEFENSOR" centrado en x; y es el borde superior. t = segundos desde que apareció.
export function dibujarLogo(ctx, x, y, t) {
  const flotar = t > FIN_LOGO ? Math.sin((t - FIN_LOGO) * 2) * 3 : 0;
  let indice = 0;
  for (const { texto, escala, dy } of PALABRAS) {
    const izquierda = x - medirTexto(texto, escala) / 2;
    [...texto].forEach((letra, i) => {
      const anim = animacionLetra(t, indice++);
      if (anim.alpha === 0) return;
      const cx = izquierda + i * 6 * escala + 2.5 * escala;
      const cy = y + dy + anim.dy + flotar;
      ctx.globalAlpha = anim.alpha;
      dibujarTextoPixel(ctx, letra, cx + SOMBRA, cy + SOMBRA, escala, COLORS.pink);
      dibujarTextoPixel(ctx, letra, cx, cy, escala, COLORS.accent);
    });
  }
  ctx.globalAlpha = 1;

  // Subtítulo de la campaña, que aparece cuando el logo termina de armarse.
  const alphaSub = Math.min(1, Math.max(0, (t - FIN_LOGO) / 0.4));
  if (alphaSub > 0) {
    ctx.globalAlpha = alphaSub;
    ctx.fillStyle = COLORS.warn;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('LA ÚLTIMA SEÑAL', x, y + 125 + flotar);
    ctx.globalAlpha = 1;
  }
}
