import { COLORS } from '../config.js';

// Botón de interfaz dibujado en el canvas; (x, y) es su centro.
export function crearBoton({ texto, x, y, ancho, alto }) {
  return {
    texto,
    x,
    y,
    ancho,
    alto,
    contiene(px, py) {
      return Math.abs(px - x) * 2 <= ancho && Math.abs(py - y) * 2 <= alto;
    },
  };
}

export function dibujarBoton(ctx, boton, color = COLORS.accent) {
  const x = Math.round(boton.x - boton.ancho / 2);
  const y = Math.round(boton.y - boton.alto / 2);
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(x, y, boton.ancho, boton.alto);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, boton.ancho - 2, boton.alto - 2);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(boton.texto, boton.x, boton.y + 1);
}

// Velo oscuro con un título, para pausa y fin de partida.
export function dibujarVelo(ctx, ancho, alto, titulo, color = COLORS.text) {
  ctx.fillStyle = 'rgba(5, 6, 15, 0.75)';
  ctx.fillRect(0, 0, ancho, alto);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 26px monospace';
  ctx.fillText(titulo, ancho / 2, alto * 0.32);
}
