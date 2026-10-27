import { W } from '../config.js';

// Convierte coordenadas de pantalla (píxeles CSS) a unidades del mundo lógico.
export function aLogicas(clientX, clientY, anchoPx, altoPx, H) {
  return {
    x: clientX / anchoPx * W,
    y: clientY / altoPx * H,
  };
}

// Estado del dedo que controla la nave. Solo cuenta el primer dedo que toca;
// los demás se ignoran hasta que ese se levante.
export function crearEstadoPuntero() {
  let idActual = null;

  return {
    activo: false,
    x: 0,
    y: 0,

    bajar(id, x, y) {
      if (idActual !== null) return;
      idActual = id;
      this.activo = true;
      this.x = x;
      this.y = y;
    },

    mover(id, x, y) {
      if (id !== idActual) return;
      this.x = x;
      this.y = y;
    },

    subir(id) {
      if (id !== idActual) return;
      idActual = null;
      this.activo = false;
    },
  };
}
