import { W, view, COLORS } from '../config.js';
import { crearBoton, dibujarBoton, dibujarVelo } from '../graficos/ui.js';

const DURACION_AVISO = 1.5;
// Claves que borra "BORRAR PROGRESO". Los ajustes no son progreso: se conservan.
const CLAVES_PROGRESO = ['recordLibre'];
const FILAS = [
  { clave: 'volMusica', etiqueta: 'MÚSICA' },
  { clave: 'volEfectos', etiqueta: 'EFECTOS' },
  { clave: 'vibracion', etiqueta: 'VIBRACIÓN', interruptor: true },
  { clave: 'sensibilidad', etiqueta: 'SENSIBILIDAD' },
];
// Columna de los controles: − en X_MENOS, el valor en X_VALOR y + en X_MAS.
const X_MENOS = 200;
const X_VALOR = 252;
const X_MAS = 304;
const LADO = 44;
const SEPARACION_FILAS = 62;

// Botón con un id, porque − y + repiten texto en cada fila.
const boton = (id, opciones) => ({ ...crearBoton(opciones), id });

const yFila = (i) => view.H * 0.22 + i * SEPARACION_FILAS;

function textoValor(clave, valor) {
  return clave === 'sensibilidad' ? valor.toFixed(2).replace('.', ',') : String(valor);
}

// Ajustes del jugador sobre la partida fantasma; se guardan en cuanto cambian.
export function escenaConfiguracion({ estrellas, puntero, irA, fantasma, configuracion, guardado, vibrar }) {
  return {
    // 'ajustes' | 'confirmar' (preguntando si borra el progreso)
    estado: 'ajustes',
    aviso: null,

    // Se calculan al usarlos porque dependen del alto de la pantalla y de los valores.
    botones() {
      if (this.estado === 'confirmar') {
        return ['SÍ', 'NO'].map((texto, i) => boton(texto, {
          texto, x: W / 2, y: view.H * 0.52 + i * 60, ancho: 160, alto: 44,
        }));
      }
      const lista = [];
      FILAS.forEach(({ clave, interruptor }, i) => {
        const y = yFila(i);
        if (interruptor) {
          const texto = configuracion.valores[clave] ? 'SÍ' : 'NO';
          lista.push(boton(clave, { texto, x: X_VALOR, y, ancho: X_MAS - X_MENOS + LADO, alto: 40 }));
        } else {
          lista.push(boton(`${clave}-`, { texto: '−', x: X_MENOS, y, ancho: LADO, alto: 40 }));
          lista.push(boton(`${clave}+`, { texto: '+', x: X_MAS, y, ancho: LADO, alto: 40 }));
        }
      });
      const yBajo = yFila(FILAS.length) + 20;
      for (const [i, texto] of ['BORRAR PROGRESO', 'VOLVER'].entries()) {
        lista.push(boton(texto, { texto, x: W / 2, y: yBajo + i * 60, ancho: 230, alto: 44 }));
      }
      return lista;
    },

    entrar() {
      this.estado = 'ajustes';
      this.aviso = null;
      // El toque que trajo hasta aquí no debe activar un botón.
      puntero.tomarToques();
    },

    update(dt) {
      const botones = this.botones();
      for (const { x, y } of puntero.tomarToques()) {
        const tocado = botones.find((b) => b.contiene(x, y));
        if (!tocado) continue;
        this.accion(tocado.id);
        // Los botones cambian tras cada acción: los demás toques de este cuadro se descartan.
        break;
      }

      if (this.aviso) {
        this.aviso.restante -= dt;
        if (this.aviso.restante <= 0) this.aviso = null;
      }
      estrellas.update(dt, view.H);
      fantasma.update(dt, view.H);
    },

    accion(id) {
      if (this.estado === 'confirmar') {
        if (id === 'SÍ') {
          for (const clave of CLAVES_PROGRESO) guardado.borrar(clave);
          this.aviso = { texto: 'PROGRESO BORRADO', restante: DURACION_AVISO };
        }
        this.estado = 'ajustes';
      } else if (id === 'VOLVER') {
        irA('menu');
      } else if (id === 'BORRAR PROGRESO') {
        this.estado = 'confirmar';
      } else if (id === 'vibracion') {
        configuracion.cambiar('vibracion', configuracion.valores.vibracion ? 0 : 1);
        // Un toque de prueba para que se sienta que quedó activada.
        if (configuracion.valores.vibracion) vibrar?.(60);
      } else if (id.endsWith('+')) {
        configuracion.subir(id.slice(0, -1));
      } else if (id.endsWith('-')) {
        configuracion.bajar(id.slice(0, -1));
      }
    },

    draw(ctx) {
      estrellas.draw(ctx);
      fantasma.draw(ctx);
      ctx.fillStyle = 'rgba(5, 6, 15, 0.7)';
      ctx.fillRect(0, 0, W, view.H);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = COLORS.accent;
      ctx.font = 'bold 24px monospace';
      ctx.fillText('CONFIGURACIÓN', W / 2, view.H * 0.1);

      FILAS.forEach(({ clave, etiqueta, interruptor }, i) => {
        const y = yFila(i);
        ctx.textAlign = 'left';
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 15px monospace';
        ctx.fillText(etiqueta, 24, y + 1);
        if (!interruptor) {
          ctx.textAlign = 'center';
          ctx.fillStyle = COLORS.warn;
          ctx.font = 'bold 16px monospace';
          ctx.fillText(textoValor(clave, configuracion.valores[clave]), X_VALOR, y + 1);
        }
      });

      const botones = this.botones();
      if (this.estado === 'ajustes') {
        for (const b of botones) {
          const color = b.id === 'BORRAR PROGRESO' ? COLORS.danger
            : b.id === 'vibracion' && !configuracion.valores.vibracion ? COLORS.dim
            : COLORS.accent;
          dibujarBoton(ctx, b, color);
        }
      }

      if (this.aviso) {
        ctx.globalAlpha = Math.min(1, this.aviso.restante / 0.3);
        ctx.textAlign = 'center';
        ctx.fillStyle = COLORS.warn;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(this.aviso.texto, W / 2, botones[botones.length - 1].y + 52);
        ctx.globalAlpha = 1;
      }

      if (this.estado === 'confirmar') {
        dibujarVelo(ctx, W, view.H, '¿SEGURO?', COLORS.danger);
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 14px monospace';
        ctx.fillText('SE BORRARÁ TU RÉCORD', W / 2, view.H * 0.4);
        botones.forEach((b) => dibujarBoton(ctx, b, b.id === 'SÍ' ? COLORS.danger : COLORS.accent));
      }
    },
  };
}
