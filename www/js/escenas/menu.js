import { W, view, COLORS } from '../config.js';
import { dibujarLogo, FIN_LOGO } from '../graficos/logo.js';
import { crearBoton, dibujarBoton } from '../graficos/ui.js';
import { crearToquesSeguidos, crearPulsacionLarga } from '../sistemas/secretos.js';
import { dibujarVeloFondo } from './carga.js';

// Escena a la que lleva cada botón.
const OPCIONES = [
  { texto: 'MODO HISTORIA', destino: 'capitulos' },
  { texto: 'MODO LIBRE', destino: 'juego' },
  { texto: 'CONFIGURACIÓN', destino: 'configuracion' },
];
const DURACION_AVISO = 2;

// Zonas de los easter eggs (se calculan con el alto actual de la pantalla).
const enLogo = (x, y) => x >= 30 && x <= 330 && y >= view.H * 0.12 - 10 && y <= view.H * 0.12 + 135;
const enVersion = (x, y) => x >= 110 && x <= 250 && Math.abs(y - (view.H - 20)) <= 16;

// Menú principal sobre la partida fantasma.
// Secretos: 7 toques seguidos al logo alternan la nave dorada, y mantener presionado
// "v1.0 · UPB" 3 segundos abre los créditos ocultos.
export function escenaMenu({ estrellas, puntero, irA, fantasma, guardado, sonar = () => {} }) {
  let t = 0;
  let toquesLogo = crearToquesSeguidos();
  let pulsacionVersion = crearPulsacionLarga();

  return {
    // Récord del Modo Libre (se relee al volver al menú tras una partida).
    record: 0,
    // { texto, restante } mientras se anuncia un secreto.
    aviso: null,

    // Se calculan al usarlos porque dependen del alto de la pantalla.
    botones() {
      return OPCIONES.map(({ texto }, i) => crearBoton({
        texto, x: W / 2, y: view.H * 0.52 + i * 62, ancho: 210, alto: 46,
      }));
    },

    entrar() {
      t = 0;
      this.record = guardado.leerNumero('recordLibre');
      this.aviso = null;
      toquesLogo = crearToquesSeguidos();
      pulsacionVersion = crearPulsacionLarga();
      // El toque que trajo hasta aquí no debe activar un botón.
      puntero.tomarToques();
    },

    update(dt) {
      t += dt;
      if (this.aviso) {
        this.aviso.restante -= dt;
        if (this.aviso.restante <= 0) this.aviso = null;
      }

      const botones = this.botones();
      for (const { x, y } of puntero.tomarToques()) {
        const i = botones.findIndex((b) => b.contiene(x, y));
        if (i >= 0) {
          sonar('boton');
          irA(OPCIONES[i].destino);
          return;
        }
        if (enLogo(x, y) && toquesLogo.registrar(t)) this.alternarNave();
      }

      const presionado = puntero.activo && enVersion(puntero.x, puntero.y);
      if (pulsacionVersion.update(dt, presionado)) {
        sonar('powerup');
        irA('creditos');
        return;
      }

      estrellas.update(dt, view.H);
      fantasma.update(dt, view.H);
    },

    alternarNave() {
      const primeraVez = guardado.leerNumero('naveSecreta') !== 1;
      const dorada = primeraVez || guardado.leerNumero('naveDorada') !== 1;
      guardado.escribir('naveSecreta', 1);
      guardado.escribir('naveDorada', dorada ? 1 : 0);
      let texto = dorada ? 'NAVE DORADA ACTIVADA' : 'NAVE CLÁSICA ACTIVADA';
      if (primeraVez) texto = 'NAVE SECRETA DESBLOQUEADA';
      this.aviso = { texto, restante: DURACION_AVISO };
      sonar('powerup');
    },

    draw(ctx) {
      estrellas.draw(ctx);
      fantasma.draw(ctx);
      dibujarVeloFondo(ctx);

      // El logo ya viene armado desde la pantalla de carga: solo flota.
      dibujarLogo(ctx, W / 2, view.H * 0.12, FIN_LOGO + 1 + t);

      const botones = this.botones();
      for (const b of botones) dibujarBoton(ctx, b);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const yAviso = botones[botones.length - 1].y + 52;
      if (this.aviso) {
        ctx.globalAlpha = Math.min(1, this.aviso.restante / 0.3);
        ctx.fillStyle = COLORS.warn;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(this.aviso.texto, W / 2, yAviso);
        ctx.globalAlpha = 1;
      } else if (this.record > 0) {
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`RÉCORD  ${this.record}`, W / 2, yAviso);
      }

      ctx.fillStyle = COLORS.dim;
      ctx.font = '11px monospace';
      ctx.fillText('v1.0 · UPB', W / 2, view.H - 20);
    },
  };
}
