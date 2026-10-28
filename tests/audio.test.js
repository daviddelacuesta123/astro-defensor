import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearAudio } from '../www/js/sistemas/audio.js';
import { volumenAGanancia, duracionPaso, TEMAS } from '../www/js/sistemas/sonido.js';

const parametro = () => ({
  value: 1,
  setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {},
});
const nodo = (extra = {}) => ({ connect() {}, ...extra });

// AudioContext mínimo: cuenta los osciladores y fuentes de ruido que se arrancan.
function contextoFalso() {
  const ctx = {
    currentTime: 0,
    sampleRate: 8000,
    state: 'suspended',
    destination: nodo(),
    sonidos: [],
    reanudados: 0,
    resume() { ctx.state = 'running'; ctx.reanudados++; return Promise.resolve(); },
    suspend() { ctx.state = 'suspended'; return Promise.resolve(); },
    createGain: () => nodo({ gain: parametro() }),
    createOscillator: () => nodo({
      type: 'sine', frequency: parametro(),
      start() { ctx.sonidos.push(this.type); }, stop() {},
    }),
    createBuffer: (canales, largo) => ({ getChannelData: () => new Float32Array(largo) }),
    createBufferSource: () => nodo({ start() { ctx.sonidos.push('ruido'); }, stop() {} }),
  };
  return ctx;
}

function preparar(valores = {}) {
  const configuracion = { valores: { volMusica: 70, volEfectos: 80, ...valores } };
  const contextos = [];
  const audio = crearAudio({
    configuracion,
    crearContexto: () => {
      const ctx = contextoFalso();
      contextos.push(ctx);
      return ctx;
    },
  });
  return { audio, configuracion, contextos, ctx: () => contextos[0] };
}

test('antes del primer toque no se crea el AudioContext ni suena nada', () => {
  const { audio, contextos } = preparar();
  audio.efecto('explosion');
  audio.musica('menu');
  audio.actualizar();
  assert.equal(contextos.length, 0);
});

test('activar crea un solo contexto y lo reanuda', () => {
  const { audio, contextos, ctx } = preparar();
  audio.activar();
  audio.activar();
  assert.equal(contextos.length, 1);
  assert.equal(ctx().state, 'running');
});

test('un efecto arranca una fuente por capa', () => {
  const { audio, ctx } = preparar();
  audio.activar();
  audio.efecto('explosion');
  assert.deepEqual(ctx().sonidos.sort(), ['ruido', 'sine']);
  audio.efecto('powerup');
  assert.equal(ctx().sonidos.length, 6);
});

test('un efecto desconocido no falla ni suena', () => {
  const { audio, ctx } = preparar();
  audio.activar();
  assert.doesNotThrow(() => audio.efecto('nada'));
  assert.equal(ctx().sonidos.length, 0);
});

test('los buses siguen los volúmenes de la configuración', () => {
  const { audio, configuracion } = preparar();
  audio.activar();
  audio.actualizar();
  assert.equal(audio.ganancias().musica, volumenAGanancia(70));
  assert.equal(audio.ganancias().efectos, volumenAGanancia(80));
  configuracion.valores.volMusica = 0;
  audio.actualizar();
  assert.equal(audio.ganancias().musica, 0);
});

test('con efectos en 0 ni siquiera se crean osciladores', () => {
  const { audio, ctx } = preparar({ volEfectos: 0 });
  audio.activar();
  audio.efecto('disparo');
  assert.equal(ctx().sonidos.length, 0);
});

test('la música programa notas por adelantado, sin amontonarlas', () => {
  const { audio, ctx } = preparar();
  audio.activar();
  audio.musica('juego');
  audio.actualizar();
  const primeras = ctx().sonidos.length;
  assert.ok(primeras > 0);
  // Sin que avance el reloj no se programa nada nuevo.
  audio.actualizar();
  assert.equal(ctx().sonidos.length, primeras);
  ctx().currentTime += duracionPaso(TEMAS.juego) * 8;
  audio.actualizar();
  assert.ok(ctx().sonidos.length > primeras);
});

test('con la música pausada no se programan notas y el bus queda en silencio', () => {
  const { audio, ctx } = preparar();
  audio.activar();
  audio.musica('menu');
  audio.pausarMusica(true);
  audio.actualizar();
  assert.equal(ctx().sonidos.length, 0);
  assert.equal(audio.ganancias().musica, 0);
  audio.pausarMusica(false);
  audio.actualizar();
  assert.ok(ctx().sonidos.length > 0);
});

test('musica(null) detiene la música', () => {
  const { audio, ctx } = preparar();
  audio.activar();
  audio.musica('menu');
  audio.actualizar();
  audio.musica(null);
  const antes = ctx().sonidos.length;
  ctx().currentTime += 5;
  audio.actualizar();
  assert.equal(ctx().sonidos.length, antes);
});

test('en segundo plano se suspende y al volver se reanuda', () => {
  const { audio, ctx } = preparar();
  audio.activar();
  audio.segundoPlano(true);
  assert.equal(ctx().state, 'suspended');
  audio.segundoPlano(false);
  assert.equal(ctx().state, 'running');
});

test('volver del segundo plano antes del primer toque no crea el contexto', () => {
  const { audio, contextos } = preparar();
  audio.segundoPlano(true);
  audio.segundoPlano(false);
  assert.equal(contextos.length, 0);
});

test('sin Web Audio el juego sigue en silencio', () => {
  const audio = crearAudio({
    configuracion: { valores: { volMusica: 70, volEfectos: 80 } },
    crearContexto: () => { throw new Error('no hay AudioContext'); },
  });
  assert.doesNotThrow(() => {
    audio.activar();
    audio.efecto('bomba');
    audio.musica('menu');
    audio.actualizar();
    audio.segundoPlano(true);
  });
});
