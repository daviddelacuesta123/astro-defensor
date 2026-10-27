// Tipos de enemigos del Enjambre Vex.
// movimiento: 'recto' (baja sin parar), 'zigzag' (baja oscilando), 'estacionar' (baja hasta `alturaFija` y se queda).
// disparo: null o { cadencia (s), rapidez } — los disparos van apuntados al jugador.
// ancho/alto coinciden con el tamaño de su sprite.
export const TIPOS_ENEMIGO = {
  explorador: {
    vida: 1, puntos: 100, vel: 110, ancho: 27, alto: 24,
    movimiento: 'recto', disparo: null,
  },
  zigzag: {
    vida: 2, puntos: 150, vel: 80, ancho: 33, alto: 24,
    movimiento: 'zigzag', amplitud: 50, frecuencia: 3, disparo: null,
  },
  tirador: {
    vida: 3, puntos: 250, vel: 70, ancho: 33, alto: 30,
    movimiento: 'estacionar', alturaFija: 120, disparo: { cadencia: 1.4, rapidez: 170 },
  },
};
