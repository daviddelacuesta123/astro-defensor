import { W, view, COLORS } from './config.js';
import { altoLogico } from './util.js';

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

// Ajusta el canvas al tamaño real de la pantalla y recalcula el alto lógico.
export function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cw = window.innerWidth;
  const ch = window.innerHeight;
  view.H = altoLogico(cw, ch);
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  view.scale = canvas.width / W;
  ctx.imageSmoothingEnabled = false;
}

export function beginFrame() {
  ctx.setTransform(view.scale, 0, 0, view.scale, 0, 0);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, view.H);
}
