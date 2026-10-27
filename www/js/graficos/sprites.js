import { COLORS } from '../config.js';

// Sprites en pixel art: cada carácter es un píxel ('.' = transparente) con su color en `paleta`.
// `escala` es el tamaño de cada píxel en unidades del mundo.

export const NAVE_AD7 = {
  escala: 3,
  paleta: {
    W: COLORS.text,
    A: COLORS.accent,
    C: COLORS.pink,
    B: '#1d3a7a',
    D: COLORS.dim,
  },
  filas: [
    '.....W.....',
    '....WAW....',
    '....ACA....',
    '...AACAA...',
    '...ABCBA...',
    '..AABBBAA..',
    '.AABBABBAA.',
    'AABBAAABBAA',
    'AB.BBABB.BA',
    'A..BB.BB..A',
    '...DD.DD...',
  ],
};

// Dibuja el sprite centrado en (x, y).
export function dibujarSprite(ctx, sprite, x, y) {
  const { filas, paleta, escala } = sprite;
  const x0 = Math.round(x - filas[0].length * escala / 2);
  const y0 = Math.round(y - filas.length * escala / 2);
  filas.forEach((fila, fy) => {
    for (let fx = 0; fx < fila.length; fx++) {
      const ch = fila[fx];
      if (ch === '.') continue;
      ctx.fillStyle = paleta[ch];
      ctx.fillRect(x0 + fx * escala, y0 + fy * escala, escala, escala);
    }
  });
}
