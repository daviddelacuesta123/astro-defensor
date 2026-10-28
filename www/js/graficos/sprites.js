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

// Easter egg: la AD-7 en dorado (se alterna tocando 7 veces el logo del menú).
export const NAVE_DORADA = {
  ...NAVE_AD7,
  paleta: { W: '#fff6c8', A: COLORS.warn, C: '#ff9a2a', B: '#8a5a1a', D: '#a07a30' },
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

// Asteroides del cinturón: grises, con cráteres oscuros y el borde iluminado.
const PALETA_ROCA = { G: '#6b7186', D: '#3d4256', L: '#a3a9bd' };

export const ASTEROIDE = {
  escala: 3,
  paleta: PALETA_ROCA,
  filas: [
    '..GGGG..',
    '.GLLGGG.',
    'GLLGGDGG',
    'GLGGGDDG',
    'GGGDGGGG',
    'GGDDGGLG',
    '.GGGGGG.',
    '..GGG...',
  ],
};

export const ASTEROIDE_GRANDE = {
  escala: 3,
  paleta: PALETA_ROCA,
  filas: [
    '....GGGG....',
    '..GGLLGGGG..',
    '.GLLLGGGDGG.',
    '.GLLGGGGDDG.',
    'GGLGGDGGGGGG',
    'GGGGDDDGGLGG',
    'GGGGGDGGGGGG',
    'GDDGGGGGGDGG',
    'GDDDGGLGGDDG',
    '.GDGGGGGGGG.',
    '..GGGGDGGG..',
    '....GGGG....',
  ],
};

export const SPRITES_ENEMIGO = {
  explorador: VEX_EXPLORADOR,
  zigzag: VEX_ZIGZAG,
  tirador: VEX_TIRADOR,
  asteroide: ASTEROIDE,
  asteroideGrande: ASTEROIDE_GRANDE,
};

// Jefes (30 columnas a escala 3): uno por capítulo. Cada uno tiene una variante por fase;
// al enfurecerse cambia de color para que se note el cambio de fase.
const JEFE_CRUCERO = {
  escala: 3,
  paleta: { R: COLORS.danger, K: '#3a0a14', Y: COLORS.warn },
  filas: [
    '..RR......................RR..',
    '.RRRR....................RRRR.',
    'RRRRRR..RRRRRRRRRRRRRR..RRRRRR',
    'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    '.RRRRRRRKKKKKKKKKKKKKKRRRRRRR.',
    '..RRRRRKKYYKKKKKKKKYYKKRRRRR..',
    '..RRRRKKYYYYKKKKKKYYYYKKRRRR..',
    '...RRRKKKYYKKKKKKKKYYKKKRRR...',
    '...RRRRKKKKKKKKKKKKKKKKRRRR...',
    '....RRRRRRRRRRRRRRRRRRRRRR....',
    '.....RR.RRRRRRRRRRRRRR.RR.....',
    '.....R...RRRRRRRRRRRR...R.....',
    '..........RR.RRRR.RR..........',
    '..........R...RR...R..........',
  ],
};

const JEFE_MINERO = {
  escala: 3,
  paleta: { G: '#6b7186', D: '#3d4256', B: '#8a5a2a', Y: COLORS.warn },
  filas: [
    '......YY..............YY......',
    '.....YYYY............YYYY.....',
    '..GGGGGGGGGGGGGGGGGGGGGGGGGG..',
    '.GGDDGGGGGGGGGGGGGGGGGGGGDDGG.',
    'GGDDDDGGGBBBBBBBBBBBBGGGDDDDGG',
    'GGDDDDGGBBYYBBBBBBYYBBGGDDDDGG',
    'GGGDDGGGBYYYYBBBBYYYYBGGGDDGGG',
    '.GGGGGGGBBYYBBBBBBYYBBGGGGGGG.',
    '..GGGGGGGBBBBBBBBBBBBGGGGGGG..',
    '..GG..GGGGGGGGGGGGGGGGGG..GG..',
    '.GG....GGG..GGGGGG..GGG....GG.',
    'GG......G....GGGG....G......GG',
    'G.............GG.............G',
  ],
};

const JEFE_ACECHADOR = {
  escala: 3,
  paleta: { P: COLORS.pink, M: '#5a1a4a', W: COLORS.text },
  filas: [
    'P............................P',
    'PP..........................PP',
    '.PP.....PPPPPPPPPPPPPP.....PP.',
    '..PPPPPPPMMMMMMMMMMMMPPPPPPP..',
    '...PPPPMMMMMMMMMMMMMMMMPPPP...',
    '....PPMMMWWMMMMMMMMWWMMMPP....',
    '....PMMMWWWWMMMMMMWWWWMMMP....',
    '....PPMMMWWMMMMMMMMWWMMMPP....',
    '...PPPPMMMMMMMMMMMMMMMMPPPP...',
    '..PPPPPPPMMMMMMMMMMMMPPPPPPP..',
    '.PP.....PPPPPPPPPPPPPP.....PP.',
    'PP.......PP..PPPP..PP.......PP',
    'P.........P...PP...P.........P',
  ],
};

const JEFE_ACORAZADO = {
  escala: 3,
  paleta: { S: '#4a5578', R: COLORS.danger, K: '#3a0a14', Y: COLORS.warn },
  filas: [
    '....YY..................YY....',
    '....YY..................YY....',
    '..SSSSSSSSSSSSSSSSSSSSSSSSSS..',
    '.SSSSSSSSSSSSSSSSSSSSSSSSSSSS.',
    'SSRRSSSSSRRRRRRRRRRRRSSSSSRRSS',
    'SRRRRSSSRRKKKKRRKKKKRRSSSRRRRS',
    'SRRRRSSRRKKYYKKKKYYKKRRSSRRRRS',
    'SSRRSSSRRKKYYKKKKYYKKRRSSSRRSS',
    'SSSSSSSSRRKKKKRRKKKKRRSSSSSSSS',
    '.SSSSSSSSRRRRRRRRRRRRSSSSSSSS.',
    '..SSSSSSSSSSSSSSSSSSSSSSSSSS..',
    '...SS..SS..SS....SS..SS..SS...',
    '...SS..SS..SS....SS..SS..SS...',
  ],
};

const JEFE_REINA = {
  escala: 3,
  paleta: { R: COLORS.danger, Y: COLORS.warn, K: '#3a0a14', P: COLORS.pink },
  filas: [
    '.......Y.....Y..Y.....Y.......',
    '......YYY...YYYYYY...YYY......',
    '.......YYYYYYYYYYYYYYYY.......',
    '..R.....RRRRRRRRRRRRRR.....R..',
    '.RR...RRRRRRRRRRRRRRRRRR...RR.',
    'RRR..RRKKRRRRRRRRRRRRKKRR..RRR',
    'RRRRRRRKYYRRRRRRRRRRYYKRRRRRRR',
    '.RRRRRRKKRRRRRRRRRRRRKKRRRRRR.',
    '..RRRRRRRRRKKKKKKKKRRRRRRRRR..',
    '...PPRRRRRKYKYKKYKYKRRRRRPP...',
    '..PP.PRRRRRKKKKKKKKRRRRRP.PP..',
    '.PP..PPRRRRRRRRRRRRRRRRPP..PP.',
    'PP....PP.RRRRRRRRRRRR.PP....PP',
    'P......P..RR.RRRR.RR..P......P',
    '.........R...R..R...R.........',
  ],
};

// Misma figura con otros colores (para las fases).
const recolorear = (sprite, cambios) => ({ ...sprite, paleta: { ...sprite.paleta, ...cambios } });

export const SPRITES_JEFE = {
  crucero: [JEFE_CRUCERO, recolorear(JEFE_CRUCERO, { R: '#ff7a3a' })],
  minero: [JEFE_MINERO, recolorear(JEFE_MINERO, { B: COLORS.danger })],
  acechador: [JEFE_ACECHADOR, recolorear(JEFE_ACECHADOR, { W: COLORS.danger })],
  acorazado: [JEFE_ACORAZADO, recolorear(JEFE_ACORAZADO, { S: '#7a3a4a' })],
  // La Reina se enciende con cada fase: roja, rosada y por último dorada.
  reina: [
    JEFE_REINA,
    recolorear(JEFE_REINA, { R: COLORS.pink, P: COLORS.danger }),
    recolorear(JEFE_REINA, { R: COLORS.warn, Y: COLORS.text, P: COLORS.danger }),
  ],
};

// Retratos de los diálogos (16×16). Nova con su casco cian, Iriarte con gorra y uniforme,
// y la Reina del Enjambre con la corona y los colores Vex.
const PIEL = '#e8b48c';

export const RETRATO_NOVA = {
  escala: 3,
  paleta: { A: COLORS.accent, W: COLORS.text, K: '#0c1630', S: PIEL, R: '#b0505e', B: '#1d3a7a' },
  filas: [
    '.....AAAAAA.....',
    '...AAAAAAAAAA...',
    '..AAAWAAAAAAAA..',
    '.AAAWAAAAAAAAAA.',
    '.AAKKKKKKKKKKAA.',
    '.AKKWWKKKKKKKKA.',
    '.AKKWKKKKKKKKKA.',
    '.AKKKKKKKKKKKKA.',
    '.AAKSSSSSSSSKAA.',
    '..AASSSSSSSSAA..',
    '..AASSSRRSSSAA..',
    '...AASSSSSSAA...',
    '....BBBBBBBB....',
    '..BBBBAAAABBBB..',
    '.BBBBBBAABBBBBB.',
    'BBBBBBBBBBBBBBBB',
  ],
};

export const RETRATO_IRIARTE = {
  escala: 3,
  paleta: { G: '#2f5a44', Y: COLORS.warn, D: '#14141c', H: '#b8bcc8', S: PIEL, K: '#20202a', R: '#a04a52', W: COLORS.text },
  filas: [
    '................',
    '....GGGGGGGG....',
    '...GGGGYYGGGG...',
    '..GGGGGGGGGGGG..',
    '..DDDDDDDDDDDD..',
    '...HSSSSSSSSH...',
    '...HSKSSSSKSH...',
    '...SSSSSSSSSS...',
    '...SSSSSSSSSS...',
    '....SSSRRSSS....',
    '.....SSSSSS.....',
    '......SSSS......',
    '...GGGGWWGGGG...',
    '..GGYGGWWGGYGG..',
    '.GGGGGGWWGGGGGG.',
    'GGGGGGGGGGGGGGGG',
  ],
};

export const RETRATO_REINA = {
  escala: 3,
  paleta: { R: COLORS.danger, Y: COLORS.warn, K: '#3a0a14' },
  filas: [
    '.Y....Y..Y....Y.',
    '.YY..YY..YY..YY.',
    '.YYYYYYYYYYYYYY.',
    '..RRRRRRRRRRRR..',
    '.RRRRRRRRRRRRRR.',
    'RRKKRRRRRRRRKKRR',
    'RRKYYRRRRRRYYKRR',
    'RRRKKRRRRRRKKRRR',
    '.RRRRRRRRRRRRRR.',
    '.RRRRKKKKKKRRRR.',
    '..RRKYKYKYKKRR..',
    '..RRRKKKKKKRRR..',
    '...RRRRRRRRRR...',
    '.R..RRRRRRRR..R.',
    'RR...RRRRRR...RR',
    'R.....RRRR.....R',
  ],
};

export const RETRATOS = { nova: RETRATO_NOVA, iriarte: RETRATO_IRIARTE, reina: RETRATO_REINA };

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
