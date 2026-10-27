import { view } from '../config.js';
import { aLogicas } from './coordenadas.js';

// Conecta los eventos táctiles/mouse del canvas al estado del puntero.
export function conectarPuntero(canvas, estado) {
  const logicas = (e) => aLogicas(e.clientX, e.clientY, window.innerWidth, window.innerHeight, view.H);

  canvas.addEventListener('pointerdown', (e) => {
    const p = logicas(e);
    estado.bajar(e.pointerId, p.x, p.y);
  });
  canvas.addEventListener('pointermove', (e) => {
    const p = logicas(e);
    estado.mover(e.pointerId, p.x, p.y);
  });
  // Una llamada entrante o un gesto del sistema dispara pointercancel: cuenta como levantar el dedo.
  canvas.addEventListener('pointerup', (e) => estado.subir(e.pointerId));
  canvas.addEventListener('pointercancel', (e) => estado.subir(e.pointerId));
}
