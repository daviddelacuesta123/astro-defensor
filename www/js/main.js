import { view } from './config.js';
import { canvas, ctx, resize, beginFrame } from './render.js';
import { clampDt } from './util.js';
import { crearGestorEscenas } from './escenas/gestor.js';
import { escenaJuego } from './escenas/juego.js';
import { crearEstrellas } from './fondo/estrellas.js';
import { crearEstadoPuntero } from './entrada/coordenadas.js';
import { conectarPuntero } from './entrada/puntero.js';

window.addEventListener('resize', resize);
resize();

const puntero = crearEstadoPuntero();
conectarPuntero(canvas, puntero);

const estrellas = crearEstrellas({ alto: view.H });
const escenas = crearGestorEscenas();
escenas.registrar('juego', escenaJuego({ estrellas, puntero }));
escenas.ir('juego');

// Si la app pasa a segundo plano (llamada, cambio de app), la partida se pausa.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) escenas.enviar('pausar');
});

let last = performance.now();
function loop(now) {
  const dt = clampDt(now - last);
  last = now;
  escenas.update(dt);
  beginFrame();
  escenas.draw(ctx);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
