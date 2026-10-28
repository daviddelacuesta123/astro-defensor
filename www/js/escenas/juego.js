import { W, view, COLORS } from '../config.js';
import { crearPartida } from '../sistemas/partida.js';
import { OLEADAS_PRUEBA } from '../datos/oleadas.js';
import { crearBoton, dibujarBoton, dibujarVelo } from '../graficos/ui.js';
import { dibujarHUD } from '../graficos/hud.js';

export function escenaJuego({ estrellas, puntero }) {
  let partida;
  // 'jugando' | 'pausa' | 'fin'
  let estado;
  const botonPausa = crearBoton({ texto: '', x: W - 24, y: 24, ancho: 32, alto: 32 });
  // Se calculan al usarlos porque dependen del alto de la pantalla.
  const botonesPausa = () => [
    crearBoton({ texto: 'CONTINUAR', x: W / 2, y: view.H * 0.48, ancho: 190, alto: 44 }),
    crearBoton({ texto: 'REINICIAR', x: W / 2, y: view.H * 0.48 + 60, ancho: 190, alto: 44 }),
  ];
  const botonReintentar = () => crearBoton({ texto: 'REINTENTAR', x: W / 2, y: view.H * 0.55, ancho: 190, alto: 44 });

  return {
    entrar() {
      partida = crearPartida({ oleadas: OLEADAS_PRUEBA });
      estado = 'jugando';
    },

    // El gestor lo avisa cuando la app pasa a segundo plano.
    pausar() {
      if (estado === 'jugando') estado = 'pausa';
    },

    update(dt) {
      const toques = puntero.tomarToques();

      if (estado === 'pausa') {
        const [continuar, reiniciar] = botonesPausa();
        for (const { x, y } of toques) {
          if (continuar.contiene(x, y)) estado = 'jugando';
          else if (reiniciar.contiene(x, y)) this.entrar();
        }
        return;
      }
      if (estado === 'fin' && toques.some(({ x, y }) => botonReintentar().contiene(x, y))) {
        this.entrar();
        return;
      }
      if (estado === 'jugando' && partida.estado === 'jugando'
        && toques.some(({ x, y }) => botonPausa.contiene(x, y))) {
        estado = 'pausa';
        return;
      }

      estrellas.update(dt, view.H);
      partida.update(dt, puntero);

      if (estado === 'jugando' && partida.estado === 'terminada') {
        estado = 'fin';
        // Descarta toques viejos: el botón solo responde a toques nuevos.
        puntero.tomarToques();
      }
    },

    draw(ctx) {
      estrellas.draw(ctx);
      partida.draw(ctx);
      dibujarHUD(ctx, { puntos: partida.puntos, vidas: partida.jugador.vidas }, botonPausa);

      if (estado === 'pausa') {
        dibujarVelo(ctx, W, view.H, 'PAUSA');
        for (const boton of botonesPausa()) dibujarBoton(ctx, boton);
      }

      if (estado === 'fin') {
        dibujarVelo(ctx, W, view.H, 'FIN DE LA PARTIDA', COLORS.danger);
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`PUNTAJE  ${partida.puntos}`, W / 2, view.H * 0.42);
        dibujarBoton(ctx, botonReintentar());
      }
    },
  };
}
