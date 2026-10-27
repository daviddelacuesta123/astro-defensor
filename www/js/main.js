import { view } from './config.js';
import { ctx, resize, beginFrame } from './render.js';
import { clampDt } from './util.js';
import { crearGestorEscenas } from './escenas/gestor.js';
import { escenaProvisional } from './escenas/provisional.js';
import { crearEstrellas } from './fondo/estrellas.js';

window.addEventListener('resize', resize);
resize();

const estrellas = crearEstrellas({ alto: view.H });
const escenas = crearGestorEscenas();
escenas.registrar('provisional', escenaProvisional(estrellas));
escenas.ir('provisional');

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
