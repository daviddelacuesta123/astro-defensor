// Paso máximo de simulación: evita saltos enormes al volver de segundo plano.
const DT_MAX = 0.05;
const ALTO_MIN = 560;

// Convierte los milisegundos entre frames a segundos, acotados a [0, DT_MAX].
export function clampDt(ms) {
  return Math.min(DT_MAX, Math.max(0, ms / 1000));
}

// Alto del mundo lógico para un ancho fijo de 360 según la proporción de la pantalla.
export function altoLogico(anchoPx, altoPx) {
  return Math.max(ALTO_MIN, Math.round(360 * altoPx / anchoPx));
}

// Velocidad (vx, vy) de módulo `rapidez` que va desde un punto hacia otro.
// Si ambos puntos coinciden, apunta hacia abajo para no dividir entre cero.
export function apuntar(desdeX, desdeY, haciaX, haciaY, rapidez) {
  const dx = haciaX - desdeX;
  const dy = haciaY - desdeY;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { vx: 0, vy: rapidez };
  return { vx: dx / dist * rapidez, vy: dy / dist * rapidez };
}
