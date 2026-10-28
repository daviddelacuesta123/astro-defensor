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

// Enemigos del Enjambre Vex: miran hacia abajo, hacia el jugador.

export const VEX_EXPLORADOR = {
  escala: 3,
  paleta: { R: COLORS.danger, Y: COLORS.warn },
  filas: [
    '.R.....R.',
    'RR.RRR.RR',
    'RRRRRRRRR',
    'RRYRRRYRR',
    '.RRRRRRR.',
    '..RR.RR..',
    '..R...R..',
    '.R.....R.',
  ],
};

export const VEX_ZIGZAG = {
  escala: 3,
  paleta: { P: COLORS.pink, M: '#5a1a4a' },
  filas: [
    'P.........P',
    'PP...P...PP',
    'PPPPPPPPPPP',
    '.PPMPPPMPP.',
    '..PPPPPPP..',
    '...P.P.P...',
    '..P.....P..',
    '...P...P...',
  ],
};

export const VEX_TIRADOR = {
  escala: 3,
  paleta: { Y: COLORS.warn, R: COLORS.danger, K: '#3a0a14' },
  filas: [
    '..YYYYYYY..',
    '.YYRRRRRYY.',
    'YYRRKKKRRYY',
    'YRRKKYKKRRY',
    'YRRKKKKKRRY',
    '.YRRRRRRRY.',
    '..YYRRRYY..',
    '...YYRYY...',
    '....YRY....',
    '.....R.....',
  ],
};

export const SPRITES_ENEMIGO = {
  explorador: VEX_EXPLORADOR,
  zigzag: VEX_ZIGZAG,
  tirador: VEX_TIRADOR,
};

// Dibuja el sprite centrado en (x, y). Con `colorUnico` pinta todo de ese color (destello al recibir daño).
export function dibujarSprite(ctx, sprite, x, y, colorUnico) {
  const { filas, paleta, escala } = sprite;
  const x0 = Math.round(x - filas[0].length * escala / 2);
  const y0 = Math.round(y - filas.length * escala / 2);
  filas.forEach((fila, fy) => {
    for (let fx = 0; fx < fila.length; fx++) {
      const ch = fila[fx];
      if (ch === '.') continue;
      ctx.fillStyle = colorUnico ?? paleta[ch];
      ctx.fillRect(x0 + fx * escala, y0 + fy * escala, escala, escala);
    }
  });
}
