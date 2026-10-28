import { W, view, COLORS } from '../config.js';
import { crearPartida } from '../sistemas/partida.js';
import { crearBoton, dibujarBoton, dibujarVelo } from '../graficos/ui.js';
import { dibujarHUD } from '../graficos/hud.js';

const BOTON_PAUSA = crearBoton({ texto: 'PAUSA', x: W - 24, y: 24, ancho: 32, alto: 32 });
const CLAVE_RECORD = 'recordLibre';
const DURACION_AVISO_OLEADA = 2;

// Botones centrados uno debajo de otro, desde la altura `desde` (fracción del alto).
const columna = (textos, desde) => textos.map((texto, i) => crearBoton({
  texto, x: W / 2, y: view.H * desde + i * 60, ancho: 210, alto: 44,
}));

// Modo Libre: oleadas sin fin hasta perder; guarda el récord.
export function escenaJuego({ estrellas, puntero, irA, guardado, oleadas }) {
  return {
    partida: null,
    // 'jugando' | 'pausa' | 'fin'
    estado: 'jugando',
    record: 0,
    nuevoRecord: false,
    // { n (desde 1), restante } mientras se anuncia una oleada.
    avisoOleada: null,

    // Botones visibles en el estado actual. Se calculan al usarlos porque dependen del alto.
    botones() {
      if (this.estado === 'pausa') return columna(['CONTINUAR', 'REINICIAR', 'SALIR AL MENÚ'], 0.46);
      if (this.estado === 'fin') return columna(['REINTENTAR', 'MENÚ'], 0.6);
      return [BOTON_PAUSA];
    },

    entrar() {
      this.partida = crearPartida({ oleadas });
      this.estado = 'jugando';
      this.record = guardado.leerNumero(CLAVE_RECORD);
      this.nuevoRecord = false;
      this.avisoOleada = { n: 1, restante: DURACION_AVISO_OLEADA };
      puntero.tomarToques();
    },

    // El gestor lo avisa cuando la app pasa a segundo plano.
    pausar() {
      if (this.estado === 'jugando') this.estado = 'pausa';
    },

    update(dt) {
      const botones = this.botones();
      for (const { x, y } of puntero.tomarToques()) {
        const boton = botones.find((b) => b.contiene(x, y));
        if (!boton) continue;
        // La pausa solo se puede abrir mientras la nave sigue viva.
        if (boton.texto === 'PAUSA' && this.partida.estado !== 'jugando') continue;
        this.accion(boton.texto);
        return;
      }

      if (this.estado === 'pausa') return;
      estrellas.update(dt, view.H);
      const oleadaAntes = this.partida.oleada;
      this.partida.update(dt, puntero);

      // El director cambia de oleada al vaciarse la pantalla: se anuncia durante la pausa entre oleadas.
      if (this.partida.oleada !== oleadaAntes) {
        this.avisoOleada = { n: this.partida.oleada + 1, restante: DURACION_AVISO_OLEADA };
      } else if (this.avisoOleada) {
        this.avisoOleada.restante -= dt;
        if (this.avisoOleada.restante <= 0) this.avisoOleada = null;
      }

      if (this.estado === 'jugando' && this.partida.estado === 'terminada') this.terminar();
    },

    terminar() {
      this.estado = 'fin';
      this.avisoOleada = null;
      if (this.partida.puntos > this.record) {
        this.record = this.partida.puntos;
        this.nuevoRecord = true;
        guardado.escribir(CLAVE_RECORD, this.record);
      }
      // Descarta toques viejos: los botones solo responden a toques nuevos.
      puntero.tomarToques();
    },

    accion(texto) {
      if (texto === 'PAUSA') this.estado = 'pausa';
      else if (texto === 'CONTINUAR') this.estado = 'jugando';
      else if (texto === 'REINICIAR' || texto === 'REINTENTAR') this.entrar();
      else if (texto === 'SALIR AL MENÚ' || texto === 'MENÚ') irA('menu');
    },

    draw(ctx) {
      estrellas.draw(ctx);
      this.partida.draw(ctx);
      dibujarHUD(ctx, { puntos: this.partida.puntos, vidas: this.partida.jugador.vidas }, BOTON_PAUSA);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (this.avisoOleada && this.estado === 'jugando') {
        ctx.globalAlpha = Math.min(1, this.avisoOleada.restante / 0.4);
        ctx.fillStyle = COLORS.warn;
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`OLEADA ${this.avisoOleada.n}`, W / 2, view.H * 0.4);
        ctx.globalAlpha = 1;
      }

      if (this.estado === 'pausa') dibujarVelo(ctx, W, view.H, 'PAUSA');
      if (this.estado === 'fin') this.dibujarFin(ctx);
      if (this.estado !== 'jugando') {
        for (const boton of this.botones()) dibujarBoton(ctx, boton);
      }
    },

    dibujarFin(ctx) {
      dibujarVelo(ctx, W, view.H, 'FIN DE LA PARTIDA', COLORS.danger);
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`PUNTAJE  ${this.partida.puntos}`, W / 2, view.H * 0.41);
      ctx.fillStyle = COLORS.dim;
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`RÉCORD  ${this.record}`, W / 2, view.H * 0.41 + 28);
      if (this.nuevoRecord && Math.floor(performance.now() / 400) % 2 === 0) {
        ctx.fillStyle = COLORS.warn;
        ctx.font = 'bold 16px monospace';
        ctx.fillText('¡NUEVO RÉCORD!', W / 2, view.H * 0.41 + 62);
      }
    },
  };
}
