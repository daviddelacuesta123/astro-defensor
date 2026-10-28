import { view } from '../config.js';
import { aLogicasEnRect } from './coordenadas.js';

// Conecta los eventos táctiles/mouse del canvas al estado del puntero.
export function conectarPuntero(canvas, estado) {
  // En el PC el canvas no empieza en (0, 0): se mide su rectángulo en cada evento.
  const logicas = (e) => aLogicasEnRect(e.clientX, e.clientY, canvas.getBoundingClientRect(), view.H);

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
