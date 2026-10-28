import { view } from './config.js';
import { canvas, ctx, resize, beginFrame } from './render.js';
import { clampDt } from './util.js';
import { crearGestorEscenas } from './escenas/gestor.js';
import { escenaCarga } from './escenas/carga.js';
import { escenaMenu } from './escenas/menu.js';
import { escenaJuego } from './escenas/juego.js';
import { escenaConfiguracion } from './escenas/configuracion.js';
import { crearFantasma } from './sistemas/fantasma.js';
import { OLEADAS_PRUEBA } from './datos/oleadas.js';
import { generarOleada } from './sistemas/generador.js';
import { crearGuardado, obtenerAlmacen } from './sistemas/guardado.js';
import { crearConfiguracion } from './sistemas/configuracion.js';
import { crearVibrador } from './sistemas/vibracion.js';
import { crearAudio } from './sistemas/audio.js';
import { crearEstrellas } from './fondo/estrellas.js';
import { crearEstadoPuntero } from './entrada/coordenadas.js';
import { conectarPuntero } from './entrada/puntero.js';

window.addEventListener('resize', resize);
resize();

const puntero = crearEstadoPuntero();
conectarPuntero(canvas, puntero);

const guardado = crearGuardado(obtenerAlmacen());
const configuracion = crearConfiguracion(guardado);
// navigator.vibrate no existe en todos los navegadores (por ejemplo, en iOS).
const vibrar = crearVibrador(configuracion, (ms) => navigator.vibrate?.(ms));
// Si el navegador no tiene Web Audio, `new` lanza error y el audio queda en silencio.
const audio = crearAudio({
  configuracion,
  crearContexto: () => new (window.AudioContext || window.webkitAudioContext)(),
});
const sonar = (nombre) => audio.efecto(nombre);
// El navegador solo deja sonar después de un toque del usuario.
canvas.addEventListener('pointerdown', () => audio.activar());

// Tema musical de cada pantalla; el mismo tema sigue sin cortarse al cambiar entre ellas.
const TEMA_ESCENA = { carga: 'menu', menu: 'menu', configuracion: 'menu', juego: 'juego' };
const estrellas = crearEstrellas({ alto: view.H });
const escenas = crearGestorEscenas();
const irA = (nombre) => {
  escenas.ir(nombre);
  audio.musica(TEMA_ESCENA[nombre] ?? null);
};
const fantasma = crearFantasma({ oleadas: OLEADAS_PRUEBA });
escenas.registrar('carga', escenaCarga({ estrellas, puntero, irA, fantasma }));
escenas.registrar('menu', escenaMenu({ estrellas, puntero, irA, fantasma, guardado, sonar }));
const juego = escenaJuego({
  estrellas, puntero, irA, guardado, configuracion, vibrar, sonar, oleadas: (n) => generarOleada(n),
});
escenas.registrar('juego', juego);
escenas.registrar('configuracion', escenaConfiguracion({
  estrellas, puntero, irA, fantasma, configuracion, guardado, vibrar, sonar,
}));
irA('carga');

// Si la app pasa a segundo plano (llamada, cambio de app), la partida se pausa y el audio calla.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) escenas.enviar('pausar');
  audio.segundoPlano(document.hidden);
});

let last = performance.now();
function loop(now) {
  const dt = clampDt(now - last);
  last = now;
  escenas.update(dt);
  audio.pausarMusica(escenas.actual === 'juego' && juego.estado === 'pausa');
  audio.actualizar();
  beginFrame();
  escenas.draw(ctx);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
