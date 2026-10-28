import { linea, fila, ve } from './oleadas.js';

// Una oleada: junta formaciones, les pone la velocidad del capítulo y las ordena por tiempo.
const oleada = (vel, ...formaciones) => formaciones.flat()
  .map((a) => ({ ...a, vel }))
  .sort((a, b) => a.t - b.t);

// Asteroides que caen uno tras otro en las columnas `xs`.
const rocas = (tipo, xs, t0, intervalo) => xs.map((x, i) => ({ t: t0 + i * intervalo, tipo, x }));

// Campaña "La Última Señal". Cada capítulo es más rápido y trae más naves que el anterior.
// efectos: novedades de la zona. `camuflaje` = { ciclo, oculto } (lo aplica la flota),
// `vision` = radio del círculo visible alrededor de la nave (lo dibuja la escena).
export const CAPITULOS = [
  {
    numero: 1,
    nombre: 'LA ÚLTIMA DEFENSA',
    zona: 'ÓRBITA DE KEPLER',
    colorFondo: '#081430',
    efectos: {},
    oleadas: [
      oleada(1, linea('explorador', 3, 0, 0.8, 180)),
      oleada(1, linea('explorador', 4, 0, 0.6, 100), linea('explorador', 4, 0.3, 0.6, 260)),
      oleada(1, ve('explorador', 0), ve('explorador', 3)),
      oleada(1, fila('zigzag', 3, 0), linea('explorador', 3, 2, 0.5, 180)),
      oleada(1, fila('explorador', 5, 0), fila('zigzag', 4, 2.5)),
      oleada(1, linea('tirador', 1, 0, 0, 180), ve('explorador', 1.5), fila('zigzag', 3, 4)),
    ],
  },
  {
    numero: 2,
    nombre: 'PERSECUCIÓN',
    zona: 'CINTURÓN DE ASTEROIDES',
    colorFondo: '#16120e',
    efectos: {},
    oleadas: [
      oleada(1.05, rocas('asteroide', [70, 250, 160, 300, 40], 0, 0.9), linea('explorador', 4, 1, 0.6, 120)),
      oleada(1.05, rocas('asteroideGrande', [110], 0, 0), rocas('asteroide', [280, 200], 1.2, 1), ve('explorador', 2)),
      oleada(1.05, fila('zigzag', 4, 0), rocas('asteroide', [60, 180, 300], 1.5, 0.8), linea('explorador', 4, 3, 0.5, 240)),
      oleada(
        1.05,
        linea('tirador', 1, 0, 0, 90), linea('tirador', 1, 0, 0, 270),
        rocas('asteroideGrande', [180], 1, 0), rocas('asteroide', [50, 310], 2.5, 0.5), fila('explorador', 5, 3.5),
      ),
      oleada(
        1.05,
        rocas('asteroideGrande', [70, 290], 0, 1.5), ve('zigzag', 1),
        fila('explorador', 5, 3), linea('explorador', 3, 4.5, 0.5, 180),
      ),
      oleada(
        1.05,
        rocas('asteroide', [40, 120, 200, 280, 320, 160], 0, 0.5), fila('zigzag', 4, 1.5),
        linea('tirador', 1, 2, 0, 180), ve('explorador', 4), linea('explorador', 3, 5.5, 0.4, 60),
      ),
    ],
  },
  {
    numero: 3,
    nombre: 'SEÑAL PERDIDA',
    zona: 'NEBULOSA CARMESÍ',
    colorFondo: '#22050f',
    efectos: { camuflaje: { ciclo: 3.2, oculto: 1.2 }, vision: 110 },
    oleadas: [
      oleada(1.1, linea('explorador', 4, 0, 0.6, 120), linea('explorador', 4, 0.3, 0.6, 240)),
      oleada(1.1, ve('zigzag', 0), fila('explorador', 5, 2)),
      oleada(1.1, linea('tirador', 1, 0, 0, 180), fila('zigzag', 4, 1.5), ve('explorador', 3.5)),
      oleada(1.1, fila('explorador', 5, 0), fila('explorador', 5, 1.2), linea('zigzag', 3, 2.5, 0.6, 180)),
      oleada(
        1.1,
        linea('tirador', 1, 0, 0, 80), linea('tirador', 1, 0.5, 0, 280), ve('zigzag', 2), fila('explorador', 4, 4),
      ),
      oleada(1.1, ve('explorador', 0), ve('zigzag', 2), fila('zigzag', 3, 4), linea('tirador', 1, 4.5, 0, 180)),
      oleada(1.1, fila('tirador', 3, 0), fila('explorador', 5, 2), ve('explorador', 3.5), fila('zigzag', 4, 5)),
    ],
  },
  {
    numero: 4,
    nombre: 'RECUPERAR EL FARO',
    zona: 'FARO OMEGA',
    colorFondo: '#062222',
    efectos: {},
    oleadas: [
      oleada(1.15, fila('explorador', 5, 0), fila('explorador', 5, 0.8), fila('explorador', 5, 1.6)),
      oleada(
        1.15,
        ve('zigzag', 0), ve('zigzag', 1.5), linea('tirador', 1, 1, 0, 60), linea('tirador', 1, 1, 0, 300),
      ),
      oleada(
        1.15,
        linea('explorador', 6, 0, 0.35, 70), linea('explorador', 6, 0, 0.35, 290),
        fila('zigzag', 4, 2.5), linea('tirador', 1, 3, 0, 180),
      ),
      oleada(1.15, fila('tirador', 3, 0), ve('explorador', 1.5), ve('explorador', 3), fila('zigzag', 5, 4.5)),
      oleada(
        1.15,
        fila('zigzag', 5, 0), fila('zigzag', 5, 1.5), fila('explorador', 5, 3),
        linea('tirador', 1, 3.5, 0, 100), linea('tirador', 1, 3.5, 0, 260),
      ),
      oleada(
        1.15,
        ve('explorador', 0), ve('zigzag', 1), ve('explorador', 2), fila('tirador', 4, 3), fila('explorador', 5, 4.5),
      ),
      oleada(
        1.15,
        fila('explorador', 5, 0), fila('zigzag', 5, 1), fila('explorador', 5, 2),
        fila('tirador', 4, 3), ve('zigzag', 4.5), linea('explorador', 6, 5.5, 0.3, 180),
      ),
    ],
  },
  {
    numero: 5,
    nombre: 'EL CORAZÓN DEL ENJAMBRE',
    zona: 'NAVE MADRE VEX',
    colorFondo: '#160822',
    efectos: {},
    oleadas: [
      oleada(1.2, ve('explorador', 0), ve('explorador', 1.5), fila('zigzag', 4, 3)),
      oleada(1.2, fila('tirador', 3, 0), fila('explorador', 5, 1.5), fila('explorador', 5, 2.5)),
      oleada(
        1.2,
        linea('zigzag', 4, 0, 0.5, 90), linea('zigzag', 4, 0, 0.5, 270),
        ve('explorador', 2.5), linea('tirador', 1, 3, 0, 180),
      ),
      oleada(1.2, fila('explorador', 5, 0), fila('zigzag', 5, 1), fila('explorador', 5, 2), fila('tirador', 3, 3.5)),
      oleada(1.2, ve('zigzag', 0), ve('zigzag', 1.5), fila('tirador', 4, 2.5), linea('explorador', 6, 3.5, 0.3, 180)),
      oleada(
        1.2,
        fila('explorador', 5, 0), fila('explorador', 5, 0.7), fila('explorador', 5, 1.4), fila('zigzag', 5, 2.5),
        linea('tirador', 1, 3, 0, 70), linea('tirador', 1, 3, 0, 290),
      ),
      oleada(
        1.2,
        fila('tirador', 4, 0), ve('explorador', 1), ve('zigzag', 2.5), fila('explorador', 5, 4), fila('zigzag', 5, 5),
      ),
      oleada(
        1.2,
        fila('zigzag', 5, 0), ve('explorador', 1), fila('tirador', 4, 2), fila('explorador', 5, 3),
        ve('zigzag', 4), fila('tirador', 3, 5.5), linea('explorador', 6, 6, 0.3, 180),
      ),
    ],
  },
];
