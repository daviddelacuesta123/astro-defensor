import { view } from './config.js';
import { canvas, ctx, resize, beginFrame } from './render.js';
import { cabenPaneles } from './marco.js';
import { clampDt } from './util.js';
import { crearGestorEscenas } from './escenas/gestor.js';
import { escenaCarga } from './escenas/carga.js';
import { escenaMenu } from './escenas/menu.js';
import { escenaJuego } from './escenas/juego.js';
import { escenaConfiguracion } from './escenas/configuracion.js';
import { escenaCapitulos } from './escenas/capitulos.js';
import { escenaDialogo } from './escenas/dialogo.js';
import { escenaCreditos } from './escenas/creditos.js';
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
import { crearTeclado } from './entrada/teclado.js';

// En el PC el juego va en una columna centrada; los paneles laterales ocupan los costados si caben.
function ajustarPantalla() {
  const marco = resize();
  document.body.classList.toggle('escritorio', marco.escritorio);
  document.body.classList.toggle('con-paneles', cabenPaneles(marco));
  document.body.style.setProperty('--lado', `${marco.x}px`);
}
window.addEventListener('resize', ajustarPantalla);
ajustarPantalla();

const puntero = crearEstadoPuntero();
conectarPuntero(canvas, puntero);
// En el PC: flechas o WASD mueven la nave; Esc o P pausan (los eventos se conectan más abajo).
const teclado = crearTeclado();

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
  carga: 'menu', menu: 'menu', configuracion: 'menu', capitulos: 'menu', dialogo: 'menu', creditos: 'menu', juego: 'juego', historia: 'juego',
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
  estrellas, puntero, irA, guardado, configuracion, vibrar, sonar, teclado, oleadas: (n) => generarOleada(n),
});
escenas.registrar('juego', juego);
// El Modo Historia es la misma escena de juego, con los capítulos en lugar de oleadas infinitas.
const historia = escenaJuego({
  estrellas, puntero, irA, guardado, configuracion, vibrar, sonar, teclado, capitulos: CAPITULOS, progreso, conDialogos: true,
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
// Easter egg: se llega manteniendo presionada la versión en el menú.
escenas.registrar('creditos', escenaCreditos({ estrellas, puntero, irA, sonar }));
irA('carga');

// Si la app pasa a segundo plano (llamada, cambio de app), la partida se pausa y el audio calla.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    escenas.enviar('pausar');
    teclado.soltarTodo();
  }
  audio.segundoPlano(document.hidden);
});

window.addEventListener('keydown', (e) => {
  // Las flechas harían scroll en la página.
  if (teclado.presionar(e.code)) e.preventDefault();
  if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat) escenas.enviar('alternarPausa');
});
window.addEventListener('keyup', (e) => teclado.soltar(e.code));
// Si la ventana pierde el foco no llega el keyup: sin esto la nave seguiría moviéndose sola.
window.addEventListener('blur', () => teclado.soltarTodo());

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
