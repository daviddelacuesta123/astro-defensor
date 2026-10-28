import { EFECTOS, TEMAS, volumenAGanancia, duracionPaso, notasDelPaso } from './sonido.js';

// Segundos de música que se programan por adelantado: el game loop puede tardar,
// pero el reloj de Web Audio es exacto.
const ADELANTO = 0.15;
// Las rampas exponenciales no pueden llegar a 0.
const PISO = 0.0001;

// Motor de audio. `crearContexto` devuelve un AudioContext (en las pruebas, uno falso).
// El navegador solo deja sonar tras un toque: hasta activar() no se crea nada.
export function crearAudio({ configuracion, crearContexto }) {
  let ctx = null;
  let sinAudio = false;
  let busMusica = null;
  let busEfectos = null;
  let ruido = null;
  let tema = null;
  let paso = 0;
  let siguiente = 0;
  let musicaPausada = false;
  let enFondo = false;

  function montar() {
    try {
      ctx = crearContexto();
    } catch {
      ctx = null;
    }
    if (!ctx) {
      sinAudio = true;
      return;
    }
    busMusica = ctx.createGain();
    busMusica.connect(ctx.destination);
    busEfectos = ctx.createGain();
    busEfectos.connect(ctx.destination);
    // Un segundo de ruido blanco que reutilizan todas las explosiones.
    ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const datos = ruido.getChannelData(0);
    for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
    aplicarVolumenes();
  }

  function aplicarVolumenes() {
    busMusica.gain.value = musicaPausada ? 0 : volumenAGanancia(configuracion.valores.volMusica);
    busEfectos.gain.value = volumenAGanancia(configuracion.valores.volEfectos);
  }

  // Toca una capa: los efectos caen de golpe; las notas de la música se sostienen y se cortan al final.
  function tocar(capa, cuando, destino, sostener = false) {
    const fin = cuando + capa.duracion;
    const envolvente = ctx.createGain();
    envolvente.gain.setValueAtTime(capa.volumen, cuando);
    if (sostener) {
      envolvente.gain.setValueAtTime(capa.volumen, Math.max(cuando, fin - 0.03));
      envolvente.gain.linearRampToValueAtTime(0, fin);
    } else {
      envolvente.gain.exponentialRampToValueAtTime(PISO, fin);
    }
    envolvente.connect(destino);

    let fuente;
    if (capa.onda === 'ruido') {
      fuente = ctx.createBufferSource();
      fuente.buffer = ruido;
    } else {
      fuente = ctx.createOscillator();
      fuente.type = capa.onda;
      fuente.frequency.setValueAtTime(capa.de, cuando);
      if (capa.a !== capa.de) fuente.frequency.exponentialRampToValueAtTime(capa.a, fin);
    }
    fuente.connect(envolvente);
    fuente.start(cuando);
    fuente.stop(fin);
  }

  function reanudar() {
    // resume() devuelve una promesa que puede rechazarse si el navegador aún no lo permite.
    ctx.resume()?.catch?.(() => {});
  }

  return {
    // Se llama en cada toque: el primero crea el contexto y los demás lo reanudan si hace falta.
    activar() {
      if (sinAudio) return;
      if (!ctx) montar();
      if (ctx && ctx.state !== 'running' && !enFondo) reanudar();
    },

    efecto(nombre) {
      const capas = EFECTOS[nombre];
      if (!ctx || !capas || configuracion.valores.volEfectos <= 0) return;
      for (const capa of capas) tocar(capa, ctx.currentTime + capa.inicio, busEfectos);
    },

    // Cambia de tema y empieza desde el principio; el mismo tema sigue sin cortarse.
    musica(nombre) {
      const nuevo = TEMAS[nombre] ?? null;
      if (nuevo === tema) return;
      tema = nuevo;
      paso = 0;
      siguiente = 0;
    },

    pausarMusica(pausada) {
      if (pausada === musicaPausada) return;
      musicaPausada = pausada;
      // Al volver, se retoma desde ahora en lugar de recuperar las notas perdidas.
      siguiente = 0;
    },

    segundoPlano(oculto) {
      enFondo = oculto;
      if (!ctx) return;
      if (oculto) ctx.suspend()?.catch?.(() => {});
      else reanudar();
    },

    // Se llama en cada cuadro: aplica los volúmenes y programa las próximas notas.
    actualizar() {
      if (!ctx) return;
      aplicarVolumenes();
      if (!tema || musicaPausada || ctx.state !== 'running') return;
      // Si el reloj se adelantó (pestaña lenta, recién empieza), se sigue desde ahora.
      if (siguiente < ctx.currentTime) siguiente = ctx.currentTime + 0.05;
      while (siguiente < ctx.currentTime + ADELANTO) {
        for (const nota of notasDelPaso(tema, paso)) {
          tocar({ ...nota, de: nota.frecuencia, a: nota.frecuencia }, siguiente, busMusica, true);
        }
        siguiente += duracionPaso(tema);
        paso++;
      }
    },

    // Para las pruebas y la depuración.
    ganancias() {
      return { musica: busMusica?.gain.value ?? 0, efectos: busEfectos?.gain.value ?? 0 };
    },
  };
}
