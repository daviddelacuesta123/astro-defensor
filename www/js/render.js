import { W, view, COLORS } from './config.js';
import { altoLogico } from './util.js';
import { calcularMarco } from './marco.js';

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

// Ajusta el canvas a su marco (toda la pantalla o la columna del PC) y recalcula el alto lógico.
// Devuelve el marco para que main.js acomode los paneles laterales.
export function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const marco = calcularMarco(window.innerWidth, window.innerHeight);
  canvas.style.left = `${marco.x}px`;
  canvas.style.top = `${marco.y}px`;
  canvas.style.width = `${marco.ancho}px`;
  canvas.style.height = `${marco.alto}px`;
  view.H = altoLogico(marco.ancho, marco.alto);
  canvas.width = Math.round(marco.ancho * dpr);
  canvas.height = Math.round(marco.alto * dpr);
  view.scale = canvas.width / W;
  ctx.imageSmoothingEnabled = false;
  return marco;
}

export function beginFrame() {
  ctx.setTransform(view.scale, 0, 0, view.scale, 0, 0);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, view.H);
}
