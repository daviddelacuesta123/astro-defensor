import { W, view, COLORS } from '../config.js';
import { crearJugador } from '../entidades/jugador.js';
import { crearBalas } from '../entidades/balas.js';
import { crearFlota } from '../entidades/enemigos.js';
import { crearPowerups, aplicarPowerup } from '../entidades/powerups.js';
import { crearExplosiones } from '../entidades/explosiones.js';
import { crearDirector } from '../sistemas/oleadas.js';
import { impactarEnemigos, golpearJugador } from '../sistemas/colisiones.js';
import { OLEADAS_PRUEBA } from '../datos/oleadas.js';
import { NAVE_AD7, dibujarSprite } from '../graficos/sprites.js';

const COLOR_EXPLOSION = { explorador: COLORS.danger, zigzag: COLORS.pink, tirador: COLORS.warn };

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

export function escenaJuego({ estrellas, puntero }) {
  let jugador;
  let balas;
  let balasEnemigas;
  let flota;
  let director;
  let powerups;
  let explosiones;
  let entorno;
  let puntos;
  let destello;
  let t;
  const disparar = (x, y, vx) => balas.disparar(x, y, undefined, vx);

  function destruir(enemigo) {
    puntos += enemigo.puntos;
    explosiones.estallar(enemigo.x, enemigo.y, COLOR_EXPLOSION[enemigo.tipo]);
  }

  // La bomba destruye todo lo que hay en pantalla y borra las balas enemigas.
  function detonarBomba() {
    for (const e of flota.lista) destruir(e);
    flota.lista.length = 0;
    balasEnemigas.lista.length = 0;
    destello = 0.3;
  }

  return {
    entrar() {
      jugador = crearJugador({ x: W / 2, y: view.H - 100 });
      balas = crearBalas();
      balasEnemigas = crearBalas({ color: COLORS.danger, ancho: 3, largo: 6 });
      flota = crearFlota();
      director = crearDirector(OLEADAS_PRUEBA);
      powerups = crearPowerups();
      explosiones = crearExplosiones();
      entorno = {
        jugador,
        disparar: (x, y, vy, vx) => balasEnemigas.disparar(x, y, vy, vx),
      };
      puntos = 0;
      destello = 0;
      t = 0;
    },

    update(dt) {
      t += dt;
      destello = Math.max(0, destello - dt);
      estrellas.update(dt, view.H);
      jugador.update(dt, puntero, view.H, disparar);
      director.update(dt, flota);
      flota.update(dt, entorno, view.H);
      balas.update(dt, view.H);
      balasEnemigas.update(dt, view.H);
      powerups.update(dt, view.H);
      explosiones.update(dt);

      for (const muerto of impactarEnemigos(balas, flota)) {
        destruir(muerto);
        powerups.soltar(muerto.x, muerto.y);
      }

      if (golpearJugador(jugador, balasEnemigas, flota) && jugador.recibirGolpe()) {
        explosiones.estallar(jugador.x, jugador.y, COLORS.accent, 10);
        // Sin HUD ni fin de partida todavía: al perder todas las vidas se reinicia.
        if (jugador.vidas <= 0) this.entrar();
      }

      for (const tipo of powerups.recoger(jugador)) {
        if (aplicarPowerup(jugador, tipo) === 'bomba') detonarBomba();
      }
    },

    draw(ctx) {
      estrellas.draw(ctx);
      flota.draw(ctx);
      powerups.draw(ctx);
      balas.draw(ctx);
      balasEnemigas.draw(ctx);
      explosiones.draw(ctx);

      // Mientras es invulnerable, la nave parpadea.
      const visible = jugador.invulnerable === 0 || Math.floor(t * 12) % 2 === 0;
      if (visible) {
        dibujarLlama(ctx, jugador.x, jugador.y + 16);
        dibujarSprite(ctx, NAVE_AD7, jugador.x, jugador.y);
      }
      if (jugador.escudo) dibujarEscudo(ctx, jugador.x, jugador.y, t);

      if (destello > 0) {
        ctx.globalAlpha = destello / 0.3 * 0.6;
        ctx.fillStyle = COLORS.text;
        ctx.fillRect(0, 0, W, view.H);
        ctx.globalAlpha = 1;
      }
    },
  };
}
