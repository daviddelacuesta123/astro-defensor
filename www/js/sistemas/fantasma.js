import { crearPartida } from './partida.js';
import { pilotar } from './piloto.js';

// Partida fantasma de fondo: la nave juega sola y, al perder, empieza otra.
// La comparten la pantalla de carga y el menú para que el fondo no se corte.
export function crearFantasma({ oleadas }) {
  const nueva = () => crearPartida({ oleadas });

  const fantasma = {
    partida: nueva(),

    update(dt, alto) {
      const p = fantasma.partida;
      p.update(dt, pilotar(p.jugador, p.flota, p.balasEnemigas, alto));
      if (p.estado === 'terminada') fantasma.partida = nueva();
    },

    draw(ctx) {
      fantasma.partida.draw(ctx);
    },
  };
  return fantasma;
}
