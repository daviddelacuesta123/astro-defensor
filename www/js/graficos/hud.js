import { COLORS } from '../config.js';
import { NAVE_AD7, dibujarSprite } from './sprites.js';

const MINI_NAVE = { ...NAVE_AD7, escala: 1 };

// HUD: puntaje arriba a la izquierda; vidas y botón de pausa arriba a la derecha.
export function dibujarHUD(ctx, { puntos, vidas }, botonPausa) {
  const y = botonPausa.y;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = COLORS.text;
  ctx.fillText(String(puntos).padStart(6, '0'), 10, y);

  const xVidas = botonPausa.x - botonPausa.ancho / 2 - 12;
  for (let i = 0; i < vidas; i++) dibujarSprite(ctx, MINI_NAVE, xVidas - i * 14, y);

  // Botón de pausa: marco con dos barras.
  const x0 = Math.round(botonPausa.x - botonPausa.ancho / 2);
  const y0 = Math.round(botonPausa.y - botonPausa.alto / 2);
  ctx.strokeStyle = COLORS.dim;
  ctx.lineWidth = 2;
  ctx.strokeRect(x0 + 1, y0 + 1, botonPausa.ancho - 2, botonPausa.alto - 2);
  ctx.fillStyle = COLORS.text;
  ctx.fillRect(Math.round(botonPausa.x) - 6, y0 + 9, 4, botonPausa.alto - 18);
  ctx.fillRect(Math.round(botonPausa.x) + 2, y0 + 9, 4, botonPausa.alto - 18);
}
