import { W, view } from '../config.js';

// Color de fondo de la zona del capítulo, debajo de las estrellas.
export function dibujarFondoZona(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, view.H);
}

// Nebulosa Carmesí: un velo rojizo que solo deja ver bien un círculo alrededor de la nave.
// Más allá del doble del radio casi no se ve nada, pero las siluetas cercanas se adivinan.
export function dibujarNebulosa(ctx, x, y, radio) {
  const velo = ctx.createRadialGradient(x, y, radio, x, y, radio * 2.2);
  velo.addColorStop(0, 'rgba(36, 4, 14, 0)');
  velo.addColorStop(1, 'rgba(36, 4, 14, 0.92)');
  ctx.fillStyle = velo;
  ctx.fillRect(0, 0, W, view.H);
}
