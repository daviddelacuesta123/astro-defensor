import { W, view, COLORS } from '../config.js';
import { crearJugador } from '../entidades/jugador.js';
import { crearBalas } from '../entidades/balas.js';
import { crearFlota, crearEnemigo } from '../entidades/enemigos.js';
import { crearJefe } from '../entidades/jefes.js';
import { crearPowerups, aplicarPowerup } from '../entidades/powerups.js';
import { crearExplosiones } from '../entidades/explosiones.js';
import { crearDirector } from './oleadas.js';
import { impactarEnemigos, golpearJugador } from './colisiones.js';
import { NAVE_AD7, dibujarSprite } from '../graficos/sprites.js';

// Segundos entre la explosión de la nave y el final de la partida.
const ESPERA_FIN = 1.5;
const DURACION_DESTELLO = 0.3;
// Milisegundos de vibración al perder una vida y al perder la última.
const VIBRA_GOLPE = 120;
const VIBRA_MUERTE = 400;
// Segundos del aviso "¡ALERTA!" y de la gran explosión del jefe antes de completar.
const DURACION_ALERTA = 2.5;
const ESPERA_COMPLETAR = 2;
// La bomba no borra al jefe: le quita esta vida.
const DANO_BOMBA_JEFE = 12;
const COLOR_EXPLOSION = {
  explorador: COLORS.danger, zigzag: COLORS.pink, tirador: COLORS.warn,
  asteroide: COLORS.dim, asteroideGrande: COLORS.dim,
};

// Llama del propulsor: dos chorros bajo los motores que parpadean.
function dibujarLlama(ctx, x, y) {
  for (const dx of [-4.5, 4.5]) {
    const largo = 3 + Math.random() * 5;
    ctx.fillStyle = COLORS.warn;
    ctx.fillRect(Math.round(x + dx) - 2, Math.round(y), 4, 2);
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(Math.round(x + dx) - 1, Math.round(y) + 2, 2, Math.round(largo));
  }
}

function dibujarEscudo(ctx, x, y, t) {
  ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 8);
  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

// Simulación de una partida: nave, enemigos, balas, power-ups y explosiones.
// La usan el juego y la partida fantasma de la pantalla de carga. No dibuja estrellas ni HUD.
// `sensibilidad` y `vibrar` vienen de la configuración, y `sonar(nombre)` toca un efecto.
// La partida fantasma usa los defectos: no vibra ni suena.
// En los capítulos, `repetir: false` hace que la partida se complete tras la última oleada
// (o, si hay `jefe`, tras derrotarlo), y `camuflaje` lo aplica la flota (capítulo 3).
export function crearPartida({
  oleadas, sensibilidad = 1, vibrar = () => {}, sonar = () => {}, repetir = true, camuflaje = null, jefe = null,
}) {
  const jugador = crearJugador({ x: W / 2, y: view.H - 100 });
  const balas = crearBalas();
  const balasEnemigas = crearBalas({ color: COLORS.danger, ancho: 3, largo: 6 });
  const flota = crearFlota({ camuflaje });
  const director = crearDirector(oleadas, { repetir });
  const powerups = crearPowerups();
  const explosiones = crearExplosiones();
  const entorno = {
    jugador,
    disparar: (x, y, vy, vx) => balasEnemigas.disparar(x, y, vy, vx),
    // Los jefes sueltan asteroides o llaman exploradores.
    invocar: (tipo, x, y) => flota.agregar(crearEnemigo(tipo, x, y)),
  };
  let destello = 0;
  let finEn = 0;
  let t = 0;
  let ultimoDisparo = -1;
  // Cuenta atrás entre la muerte del jefe y el capítulo completado.
  let completarEn = 0;
  let jefeDerrotado = false;
  // Una ráfaga triple son tres balas en el mismo instante: suena una sola vez.
  const disparar = (x, y, vx) => {
    balas.disparar(x, y, undefined, vx);
    if (ultimoDisparo !== t) sonar('disparo');
    ultimoDisparo = t;
  };

  const partida = {
    jugador,
    flota,
    balasEnemigas,
    powerups,
    puntos: 0,
    // Número de oleada actual del director (desde 0).
    oleada: 0,
    // 'jugando' | 'muriendo' (la nave explotó) | 'terminada' | 'completada' (capítulo superado)
    estado: 'jugando',
    // El jefe del capítulo, cuando ya apareció (sigue aquí después de derrotado).
    jefe: null,
    // Segundos que le quedan al aviso "¡ALERTA!".
    alerta: 0,

    update(dt, puntero) {
      t += dt;
      destello = Math.max(0, destello - dt);
      partida.alerta = Math.max(0, partida.alerta - dt);
      // Tras perder, el mundo sigue moviéndose pero sin nave ni enemigos nuevos.
      if (partida.estado === 'jugando') {
        jugador.update(dt, puntero, view.H, disparar, sensibilidad);
        director.update(dt, flota);
        partida.oleada = director.oleada;
        if (director.terminado && !partida.jefe) {
          if (jefe) aparecerJefe();
          else partida.estado = 'completada';
        }
      }
      flota.update(dt, entorno, view.H);
      balas.update(dt, view.H);
      balasEnemigas.update(dt, view.H);
      powerups.update(dt, view.H);
      explosiones.update(dt);

      for (const muerto of impactarEnemigos(balas, flota)) {
        // El jefe tiene su propio final (más abajo).
        if (muerto.jefe) continue;
        destruir(muerto);
        powerups.soltar(muerto.x, muerto.y);
      }
      if (partida.jefe && partida.jefe.vida <= 0 && !jefeDerrotado) derrotarJefe();
      if (jefeDerrotado && partida.estado === 'jugando') {
        completarEn -= dt;
        if (completarEn <= 0) partida.estado = 'completada';
      }

      if (partida.estado === 'jugando') {
        if (golpearJugador(jugador, balasEnemigas, flota) && jugador.recibirGolpe()) {
          explosiones.estallar(jugador.x, jugador.y, COLORS.accent, 10);
          vibrar(jugador.vidas > 0 ? VIBRA_GOLPE : VIBRA_MUERTE);
          sonar('golpe');
          if (jugador.vidas <= 0) {
            sonar('explosion');
            partida.estado = 'muriendo';
            finEn = ESPERA_FIN;
            explosiones.estallar(jugador.x, jugador.y, COLORS.accent, 40);
            explosiones.estallar(jugador.x, jugador.y, COLORS.warn, 20);
          }
        }
        for (const tipo of powerups.recoger(jugador)) {
          if (aplicarPowerup(jugador, tipo) === 'bomba') detonarBomba();
          else sonar('powerup');
        }
      } else if (partida.estado === 'muriendo') {
        finEn -= dt;
        if (finEn <= 0) partida.estado = 'terminada';
      }
    },

    draw(ctx) {
      flota.draw(ctx);
      powerups.draw(ctx);
      balas.draw(ctx);
      balasEnemigas.draw(ctx);
      explosiones.draw(ctx);

      // Al completar el capítulo la nave se queda en pantalla.
      if (partida.estado === 'jugando' || partida.estado === 'completada') {
        // Mientras es invulnerable, la nave parpadea.
        const visible = jugador.invulnerable === 0 || Math.floor(t * 12) % 2 === 0;
        if (visible) {
          dibujarLlama(ctx, jugador.x, jugador.y + 16);
          dibujarSprite(ctx, NAVE_AD7, jugador.x, jugador.y);
        }
        if (jugador.escudo) dibujarEscudo(ctx, jugador.x, jugador.y, t);
      }

      if (destello > 0) {
        ctx.globalAlpha = destello / DURACION_DESTELLO * 0.6;
        ctx.fillStyle = COLORS.text;
        ctx.fillRect(0, 0, W, view.H);
        ctx.globalAlpha = 1;
      }
    },
  };

  function destruir(enemigo, conSonido = true) {
    partida.puntos += enemigo.puntos;
    explosiones.estallar(enemigo.x, enemigo.y, COLOR_EXPLOSION[enemigo.tipo]);
    if (conSonido) sonar('explosion');
  }

  // La bomba destruye todo lo que hay en pantalla y borra las balas enemigas.
  // Al jefe solo le quita vida (si lo mata, lo derrota el chequeo de update).
  function detonarBomba() {
    // La bomba tiene su propio estruendo: los enemigos no suenan uno por uno.
    for (const e of flota.lista) {
      if (e.jefe) {
        e.vida = Math.max(0, e.vida - DANO_BOMBA_JEFE);
        e.golpeado = DURACION_DESTELLO;
      } else {
        destruir(e, false);
      }
    }
    sonar('bomba');
    // En el mismo arreglo: la flota guarda una referencia a él.
    for (let i = flota.lista.length - 1; i >= 0; i--) if (!flota.lista[i].jefe) flota.lista.splice(i, 1);
    balasEnemigas.lista.length = 0;
    destello = DURACION_DESTELLO;
  }

  function aparecerJefe() {
    partida.jefe = crearJefe(jefe);
    flota.agregar(partida.jefe);
    partida.alerta = DURACION_ALERTA;
    sonar('alerta');
  }

  // Gran explosión: el jefe y todo lo que invocó desaparecen y la pantalla queda limpia.
  function derrotarJefe() {
    const derrotado = partida.jefe;
    jefeDerrotado = true;
    partida.puntos += derrotado.puntos;
    // Lo que invocó explota con él, pero sin dar puntos: no lo derribó el jugador.
    for (const e of flota.lista) if (!e.jefe) explosiones.estallar(e.x, e.y, COLOR_EXPLOSION[e.tipo]);
    flota.lista.length = 0;
    balasEnemigas.lista.length = 0;
    for (let i = 0; i < 6; i++) {
      const x = derrotado.x + (Math.random() - 0.5) * derrotado.ancho;
      const y = derrotado.y + (Math.random() - 0.5) * derrotado.alto;
      explosiones.estallar(x, y, [COLORS.warn, COLORS.danger, COLORS.text][i % 3], 24);
    }
    destello = DURACION_DESTELLO;
    sonar('bomba');
    vibrar(VIBRA_MUERTE);
    completarEn = ESPERA_COMPLETAR;
  }

  return partida;
}
