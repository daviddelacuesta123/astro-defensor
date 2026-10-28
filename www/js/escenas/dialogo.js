import { W, view, COLORS } from '../config.js';
import { crearBoton, dibujarBoton } from '../graficos/ui.js';
import { RETRATOS, dibujarSprite } from '../graficos/sprites.js';
import { dibujarFondoZona } from '../graficos/zonas.js';
import { crearDialogo, partirRenglones } from '../sistemas/dialogo.js';

const BOTON_SALTAR = crearBoton({ texto: 'SALTAR', x: W - 52, y: 30, ancho: 84, alto: 32 });
const NOMBRES = {
  nova: { texto: 'NOVA RÍOS', color: COLORS.accent },
  iriarte: { texto: 'CMDTE. IRIARTE', color: COLORS.warn },
  reina: { texto: 'REINA DEL ENJAMBRE', color: COLORS.danger },
};
const ALTO_CUADRO = 140;
const INTERLINEA = 22;

// Diálogos antes y después de cada capítulo: cuadro abajo con retrato, nombre y texto
// que aparece letra por letra. entrar({ capitulo, momento: 'antes' | 'despues' }).
export function escenaDialogo({ estrellas, puntero, irA, dialogos, capitulos, sonar = () => {} }) {
  let t = 0;

  return {
    dialogo: null,
    capitulo: null,
    momento: 'antes',

    botones() {
      return [BOTON_SALTAR];
    },

    entrar({ capitulo, momento }) {
      t = 0;
      this.capitulo = capitulos[capitulo - 1];
      this.momento = momento;
      this.dialogo = crearDialogo(dialogos[capitulo]?.[momento] ?? []);
      // El toque que trajo hasta aquí no debe completar el texto.
      puntero.tomarToques();
    },

    // Antes: empieza el capítulo. Después: vuelve a "CAPÍTULO COMPLETADO" sin reiniciar la partida.
    terminar() {
      if (this.momento === 'antes') irA('historia', { capitulo: this.capitulo.numero });
      else irA('historia', { reanudar: true });
    },

    update(dt) {
      t += dt;
      for (const { x, y } of puntero.tomarToques()) {
        if (BOTON_SALTAR.contiene(x, y)) {
          sonar('boton');
          this.terminar();
          return;
        }
        this.dialogo.tocar();
      }
      if (this.dialogo.terminado) {
        this.terminar();
        return;
      }
      this.dialogo.update(dt);
      estrellas.update(dt, view.H);
    },

    draw(ctx) {
      dibujarFondoZona(ctx, this.capitulo.colorFondo);
      estrellas.draw(ctx);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.dim;
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`CAPÍTULO ${this.capitulo.numero}`, W / 2, view.H * 0.18);
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 20px monospace';
      ctx.fillText(this.capitulo.nombre, W / 2, view.H * 0.18 + 28);
      dibujarBoton(ctx, BOTON_SALTAR, COLORS.dim);

      const { linea } = this.dialogo;
      if (linea) this.dibujarCuadro(ctx, linea);
    },

    dibujarCuadro(ctx, linea) {
      const arriba = view.H - ALTO_CUADRO - 30;
      ctx.fillStyle = 'rgba(5, 6, 15, 0.9)';
      ctx.fillRect(10, arriba, W - 20, ALTO_CUADRO);
      const { texto: nombre, color } = NOMBRES[linea.quien];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(11, arriba + 1, W - 22, ALTO_CUADRO - 2);

      // Retrato de 48×48 arriba a la izquierda, dentro del cuadro.
      dibujarSprite(ctx, RETRATOS[linea.quien], 46, arriba + 38);

      ctx.textAlign = 'left';
      ctx.fillStyle = color;
      ctx.font = 'bold 14px monospace';
      ctx.fillText(nombre, 84, arriba + 20);

      // Solo las letras que ya aparecieron; cada corte de renglón consume un espacio.
      ctx.fillStyle = COLORS.text;
      let restantes = this.dialogo.visibles;
      partirRenglones(linea.texto).forEach((renglon, i) => {
        if (restantes > 0) ctx.fillText(renglon.slice(0, restantes), 84, arriba + 48 + i * INTERLINEA);
        restantes -= renglon.length + 1;
      });

      if (this.dialogo.completa && Math.floor(t * 2) % 2 === 0) {
        ctx.textAlign = 'center';
        ctx.fillStyle = COLORS.dim;
        ctx.font = 'bold 11px monospace';
        ctx.fillText('TOCA PARA SEGUIR', W / 2, arriba + ALTO_CUADRO - 18);
      }
    },
  };
}
