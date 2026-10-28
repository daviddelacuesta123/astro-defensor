// Jefes del Enjambre Vex: uno al final de cada capítulo.
// fases: fracciones de la vida en las que el jefe pasa a la fase siguiente (más agresiva).
// ancho/alto coinciden con el tamaño de su sprite.
export const TIPOS_JEFE = {
  crucero: { nombre: 'CRUCERO EXPLORADOR', vida: 60, puntos: 3000, ancho: 90, alto: 42, fases: [0.5] },
  minero: { nombre: 'MINERO VEX', vida: 80, puntos: 4000, ancho: 90, alto: 39, fases: [0.5] },
  acechador: { nombre: 'EL ACECHADOR', vida: 70, puntos: 5000, ancho: 90, alto: 39, fases: [0.5] },
  acorazado: { nombre: 'ACORAZADO VEX', vida: 140, puntos: 6000, ancho: 90, alto: 39, fases: [0.5] },
  reina: { nombre: 'REINA DEL ENJAMBRE', vida: 180, puntos: 10000, ancho: 90, alto: 45, fases: [0.75, 0.35] },
};
