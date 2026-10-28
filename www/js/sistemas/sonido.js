// Datos y cálculos del sonido, sin Web Audio: así se pueden probar en Node.
// audio.js los toca en el navegador.

const SEMITONOS = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

// 'A4' → 440 Hz. Afinación estándar: cada semitono multiplica por 2^(1/12).
export function frecuencia(nota) {
  const partes = /^([A-G]#?)(\d)$/.exec(nota);
  if (!partes) throw new Error(`Nota inválida: ${nota}`);
  const midi = (Number(partes[2]) + 1) * 12 + SEMITONOS[partes[1]];
  return 440 * 2 ** ((midi - 69) / 12);
}

// El oído percibe el volumen de forma logarítmica: con una curva cuadrática,
// el 50 % del control suena como "la mitad" y no casi igual que el 100 %.
export function volumenAGanancia(volumen) {
  const v = Math.min(100, Math.max(0, volumen)) / 100;
  return v * v;
}

// Cada efecto es una lista de capas. Una capa es un oscilador (o ruido blanco) que va
// de la frecuencia `de` a la `a` durante `duracion` segundos, con caída de volumen.
export const EFECTOS = {
  // Suena cada 0,18 s: muy corto y bajo para no cansar.
  disparo: [{ onda: 'square', de: 1400, a: 700, inicio: 0, duracion: 0.05, volumen: 0.06 }],
  explosion: [
    { onda: 'ruido', inicio: 0, duracion: 0.35, volumen: 0.5 },
    { onda: 'sine', de: 120, a: 40, inicio: 0, duracion: 0.25, volumen: 0.4 },
  ],
  golpe: [{ onda: 'sawtooth', de: 160, a: 50, inicio: 0, duracion: 0.35, volumen: 0.5 }],
  // Do-Mi-Sol-Do subiendo.
  powerup: [523, 659, 784, 1047].map((de, i) => ({
    onda: 'square', de, a: de, inicio: i * 0.06, duracion: 0.08, volumen: 0.2,
  })),
  bomba: [
    { onda: 'sawtooth', de: 300, a: 30, inicio: 0, duracion: 1, volumen: 0.5 },
    { onda: 'ruido', inicio: 0, duracion: 0.8, volumen: 0.4 },
  ],
  boton: [{ onda: 'square', de: 900, a: 900, inicio: 0, duracion: 0.03, volumen: 0.15 }],
  // Sirena de dos tonos cuando entra un jefe.
  alerta: [0, 0.3, 0.6].flatMap((inicio) => [
    { onda: 'square', de: 880, a: 880, inicio, duracion: 0.14, volumen: 0.16 },
    { onda: 'square', de: 620, a: 620, inicio: inicio + 0.15, duracion: 0.14, volumen: 0.16 },
  ]),
};

// Convierte un compás escrito como texto ("A4 - C5 -") en una lista de pasos.
const pasos = (texto) => texto.split(/\s+/).filter((p) => p && p !== '|');

// Temas en bucle. Cada paso es una corchea; '-' es silencio (o sostiene la nota anterior).
export const TEMAS = {
  // La menor, tranquilo: la colonia espera.
  menu: {
    bpm: 100,
    voces: [
      {
        onda: 'square', volumen: 0.12,
        notas: pasos(`A4 - C5 E5 - D5 C5 B4 | A4 - - - C5 - B4 -
                      F4 - A4 D5 - C5 B4 A4 | B4 - - - E4 - - -`),
      },
      {
        onda: 'triangle', volumen: 0.45,
        notas: pasos(`A2 - A2 - E2 - E2 - | F2 - F2 - C3 - C3 -
                      D2 - D2 - A2 - A2 - | E2 - E2 - G#2 - E2 -`),
      },
    ],
  },
  // Mi menor, con bajo en octavas que empuja hacia adelante.
  juego: {
    bpm: 140,
    voces: [
      {
        onda: 'square', volumen: 0.12,
        notas: pasos(`E5 - B4 - E5 G5 F#5 E5 | C5 - G4 - C5 E5 D5 C5
                      D5 - A4 - D5 F#5 E5 D5 | B4 - D#5 - F#5 - B5 -`),
      },
      {
        onda: 'triangle', volumen: 0.45,
        notas: pasos(`E2 E3 E2 E3 E2 E3 E2 E3 | C2 C3 C2 C3 C2 C3 C2 C3
                      D2 D3 D2 D3 D2 D3 D2 D3 | B1 B2 B1 B2 B1 B2 D2 D3`),
      },
    ],
  },
};

// Un paso es una corchea: medio pulso.
export function duracionPaso(tema) {
  return 60 / tema.bpm / 2;
}

// Notas que empiezan en el paso i (da la vuelta al final del tema). Cada nota dura
// hasta el siguiente paso con nota; se corta un poco antes para que se distingan.
export function notasDelPaso(tema, i) {
  const notas = [];
  const paso = duracionPaso(tema);
  for (const voz of tema.voces) {
    const largo = voz.notas.length;
    const j = i % largo;
    const nota = voz.notas[j];
    if (nota === '-') continue;
    let sostenida = 1;
    while (j + sostenida < largo && voz.notas[j + sostenida] === '-') sostenida++;
    notas.push({ onda: voz.onda, volumen: voz.volumen, frecuencia: frecuencia(nota), duracion: sostenida * paso * 0.9 });
  }
  return notas;
}
