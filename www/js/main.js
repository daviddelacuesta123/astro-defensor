import { view } from './config.js';
import { canvas, ctx, resize, beginFrame } from './render.js';
import { clampDt } from './util.js';
import { crearGestorEscenas } from './escenas/gestor.js';
import { escenaCarga } from './escenas/carga.js';
import { escenaMenu } from './escenas/menu.js';
import { escenaJuego } from './escenas/juego.js';
import { escenaConfiguracion } from './escenas/configuracion.js';
import { escenaCapitulos } from './escenas/capitulos.js';
import { escenaDialogo } from './escenas/dialogo.js';
import { DIALOGOS } from './datos/dialogos.js';
import { CAPITULOS } from './datos/capitulos.js';
import { crearFantasma } from './sistemas/fantasma.js';
import { OLEADAS_PRUEBA } from './datos/oleadas.js';
import { generarOleada } from './sistemas/generador.js';
import { crearGuardado, obtenerAlmacen } from './sistemas/guardado.js';
import { crearConfiguracion } from './sistemas/configuracion.js';
import { crearProgreso } from './sistemas/progreso.js';
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
const progreso = crearProgreso(guardado, CAPITULOS.length);
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
const TEMA_ESCENA = {
  carga: 'menu', menu: 'menu', configuracion: 'menu', capitulos: 'menu', dialogo: 'menu', juego: 'juego', historia: 'juego',
};
const estrellas = crearEstrellas({ alto: view.H });
const escenas = crearGestorEscenas();
const irA = (nombre, params) => {
  escenas.ir(nombre, params);
  audio.musica(TEMA_ESCENA[nombre] ?? null);
};
const fantasma = crearFantasma({ oleadas: OLEADAS_PRUEBA });
escenas.registrar('carga', escenaCarga({ estrellas, puntero, irA, fantasma }));
escenas.registrar('menu', escenaMenu({ estrellas, puntero, irA, fantasma, guardado, sonar }));
const juego = escenaJuego({
  estrellas, puntero, irA, guardado, configuracion, vibrar, sonar, oleadas: (n) => generarOleada(n),
});
escenas.registrar('juego', juego);
// El Modo Historia es la misma escena de juego, con los capítulos en lugar de oleadas infinitas.
const historia = escenaJuego({
  estrellas, puntero, irA, guardado, configuracion, vibrar, sonar, capitulos: CAPITULOS, progreso, conDialogos: true,
});
escenas.registrar('historia', historia);
// Escenas con partida: en pausa, la música calla.
const partidas = { juego, historia };
escenas.registrar('capitulos', escenaCapitulos({
  estrellas, puntero, irA, fantasma, capitulos: CAPITULOS, progreso, conDialogos: true, sonar,
}));
escenas.registrar('dialogo', escenaDialogo({ estrellas, puntero, irA, dialogos: DIALOGOS, capitulos: CAPITULOS, sonar }));
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
  audio.pausarMusica(partidas[escenas.actual]?.estado === 'pausa');
  audio.actualizar();
  beginFrame();
  escenas.draw(ctx);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
