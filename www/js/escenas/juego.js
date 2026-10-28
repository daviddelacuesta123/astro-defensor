import { W, view, COLORS } from '../config.js';
import { crearPartida } from '../sistemas/partida.js';
import { OLEADAS_PRUEBA } from '../datos/oleadas.js';
import { crearBoton, dibujarBoton, dibujarVelo } from '../graficos/ui.js';
import { dibujarHUD } from '../graficos/hud.js';

const BOTON_PAUSA = crearBoton({ texto: 'PAUSA', x: W - 24, y: 24, ancho: 32, alto: 32 });

// Botones centrados uno debajo de otro, desde la altura `desde` (fracción del alto).
const columna = (textos, desde) => textos.map((texto, i) => crearBoton({
  texto, x: W / 2, y: view.H * desde + i * 60, ancho: 210, alto: 44,
}));

export function escenaJuego({ estrellas, puntero, irA }) {
  return {
    partida: null,
    // 'jugando' | 'pausa' | 'fin'
    estado: 'jugando',

    // Botones visibles en el estado actual. Se calculan al usarlos porque dependen del alto.
    botones() {
      if (this.estado === 'pausa') return columna(['CONTINUAR', 'REINICIAR', 'SALIR AL MENÚ'], 0.46);
      if (this.estado === 'fin') return columna(['REINTENTAR', 'MENÚ'], 0.55);
      return [BOTON_PAUSA];
    },

    entrar() {
      this.partida = crearPartida({ oleadas: OLEADAS_PRUEBA });
      this.estado = 'jugando';
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
      this.partida.update(dt, puntero);

      if (this.estado === 'jugando' && this.partida.estado === 'terminada') {
        this.estado = 'fin';
        // Descarta toques viejos: los botones solo responden a toques nuevos.
        puntero.tomarToques();
      }
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

      if (this.estado === 'pausa') dibujarVelo(ctx, W, view.H, 'PAUSA');
      if (this.estado === 'fin') {
        dibujarVelo(ctx, W, view.H, 'FIN DE LA PARTIDA', COLORS.danger);
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`PUNTAJE  ${this.partida.puntos}`, W / 2, view.H * 0.42);
      }
      if (this.estado !== 'jugando') {
        for (const boton of this.botones()) dibujarBoton(ctx, boton);
      }
    },
  };
}
