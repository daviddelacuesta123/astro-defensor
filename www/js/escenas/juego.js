import { W, view, COLORS } from '../config.js';
import { crearPartida } from '../sistemas/partida.js';
import { crearBoton, dibujarBoton, dibujarVelo } from '../graficos/ui.js';
import { dibujarHUD } from '../graficos/hud.js';
import { dibujarFondoZona, dibujarNebulosa } from '../graficos/zonas.js';

const BOTON_PAUSA = crearBoton({ texto: 'PAUSA', x: W - 24, y: 24, ancho: 32, alto: 32 });
const CLAVE_RECORD = 'recordLibre';
const DURACION_AVISO_OLEADA = 2;
// El título del capítulo tiene más texto que el aviso de oleada: se deja más tiempo.
const DURACION_TITULO = 3;

// Botones centrados uno debajo de otro, desde la altura `desde` (fracción del alto).
const columna = (textos, desde) => textos.map((texto, i) => crearBoton({
  texto, x: W / 2, y: view.H * desde + i * 60, ancho: 210, alto: 44,
}));

// Sin `capitulos` es el Modo Libre: oleadas sin fin hasta perder; guarda el récord.
// Con `capitulos` es el Modo Historia: entrar({ capitulo }) juega ese capítulo hasta vaciar
// su última oleada, sin récord; al completarlo avisa a `progreso` (desbloqueo y mejor puntaje).
// `configuracion`, `vibrar`, `sonar` y `progreso` son opcionales.
export function escenaJuego({
  estrellas, puntero, irA, guardado, oleadas, capitulos, progreso, configuracion, vibrar, sonar = () => {},
}) {
  return {
    partida: null,
    // 'jugando' | 'pausa' | 'fin' | 'completado'
    estado: 'jugando',
    // Datos del capítulo en juego; null en el Modo Libre.
    capitulo: null,
    record: 0,
    nuevoRecord: false,
    // { nuevoMejor, desbloqueado } del último capítulo completado.
    resultado: null,
    // { n (desde 1), restante } mientras se anuncia una oleada.
    avisoOleada: null,

    // Botones visibles en el estado actual. Se calculan al usarlos porque dependen del alto.
    botones() {
      if (this.estado === 'pausa') return columna(['CONTINUAR', 'REINICIAR', 'SALIR AL MENÚ'], 0.46);
      if (this.estado === 'fin') return columna(['REINTENTAR', 'MENÚ'], 0.6);
      if (this.estado === 'completado') return columna(this.haySiguiente() ? ['SIGUIENTE', 'MENÚ'] : ['MENÚ'], 0.6);
      return [BOTON_PAUSA];
    },

    haySiguiente() {
      return this.capitulo.numero < capitulos.length;
    },

    // Reiniciar y reintentar vuelven a entrar sin parámetros: se repite el mismo capítulo.
    entrar({ capitulo } = {}) {
      if (capitulos) this.capitulo = capitulos[(capitulo ?? this.capitulo.numero) - 1];
      // La sensibilidad se lee en cada partida nueva: así toma los cambios de la configuración.
      const sensibilidad = configuracion?.valores.sensibilidad ?? 1;
      this.partida = crearPartida({
        oleadas: this.capitulo?.oleadas ?? oleadas,
        sensibilidad,
        vibrar,
        sonar,
        repetir: !this.capitulo,
        camuflaje: this.capitulo?.efectos.camuflaje ?? null,
      });
      this.estado = 'jugando';
      this.record = this.capitulo ? 0 : guardado.leerNumero(CLAVE_RECORD);
      this.nuevoRecord = false;
      this.resultado = null;
      this.avisoOleada = { n: 1, restante: this.capitulo ? DURACION_TITULO : DURACION_AVISO_OLEADA };
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
        sonar('boton');
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

      if (this.estado !== 'jugando') return;
      if (this.partida.estado === 'terminada') this.terminar();
      else if (this.partida.estado === 'completada') this.completar();
    },

    terminar() {
      this.estado = 'fin';
      this.avisoOleada = null;
      if (!this.capitulo && this.partida.puntos > this.record) {
        this.record = this.partida.puntos;
        this.nuevoRecord = true;
        guardado.escribir(CLAVE_RECORD, this.record);
      }
      // Descarta toques viejos: los botones solo responden a toques nuevos.
      puntero.tomarToques();
    },

    completar() {
      this.estado = 'completado';
      this.avisoOleada = null;
      this.resultado = progreso?.completar(this.capitulo.numero, this.partida.puntos) ?? null;
      // El arpegio del power-up sirve de fanfarria.
      sonar('powerup');
      puntero.tomarToques();
    },

    accion(texto) {
      if (texto === 'PAUSA') this.estado = 'pausa';
      else if (texto === 'CONTINUAR') this.estado = 'jugando';
      else if (texto === 'REINICIAR' || texto === 'REINTENTAR') this.entrar();
      else if (texto === 'SIGUIENTE') this.entrar({ capitulo: this.capitulo.numero + 1 });
      else if (texto === 'SALIR AL MENÚ' || texto === 'MENÚ') irA('menu');
    },

    draw(ctx) {
      if (this.capitulo) dibujarFondoZona(ctx, this.capitulo.colorFondo);
      estrellas.draw(ctx);
      this.partida.draw(ctx);
      const vision = this.capitulo?.efectos.vision;
      if (vision) dibujarNebulosa(ctx, this.partida.jugador.x, this.partida.jugador.y, vision);
      dibujarHUD(ctx, { puntos: this.partida.puntos, vidas: this.partida.jugador.vidas }, BOTON_PAUSA);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (this.avisoOleada && this.estado === 'jugando') this.dibujarAviso(ctx);

      if (this.estado === 'pausa') dibujarVelo(ctx, W, view.H, 'PAUSA');
      if (this.estado === 'fin') this.dibujarFin(ctx);
      if (this.estado === 'completado') this.dibujarCompletado(ctx);
      if (this.estado !== 'jugando') {
        for (const boton of this.botones()) dibujarBoton(ctx, boton);
      }
    },

    // Al empezar un capítulo se anuncia su título; después, cada oleada con el total.
    dibujarAviso(ctx) {
      const { n, restante } = this.avisoOleada;
      ctx.globalAlpha = Math.min(1, restante / 0.4);
      if (this.capitulo && n === 1) {
        ctx.fillStyle = COLORS.accent;
        ctx.font = 'bold 15px monospace';
        ctx.fillText(`CAPÍTULO ${this.capitulo.numero}`, W / 2, view.H * 0.36);
        ctx.fillStyle = COLORS.warn;
        ctx.font = 'bold 22px monospace';
        ctx.fillText(this.capitulo.nombre, W / 2, view.H * 0.36 + 30);
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(this.capitulo.zona, W / 2, view.H * 0.36 + 58);
      } else {
        const total = this.capitulo ? ` / ${this.capitulo.oleadas.length}` : '';
        ctx.fillStyle = COLORS.warn;
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`OLEADA ${n}${total}`, W / 2, view.H * 0.4);
      }
      ctx.globalAlpha = 1;
    },

    dibujarFin(ctx) {
      dibujarVelo(ctx, W, view.H, 'FIN DE LA PARTIDA', COLORS.danger);
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`PUNTAJE  ${this.partida.puntos}`, W / 2, view.H * 0.41);
      if (this.capitulo) return;
      ctx.fillStyle = COLORS.dim;
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`RÉCORD  ${this.record}`, W / 2, view.H * 0.41 + 28);
      if (this.nuevoRecord && Math.floor(performance.now() / 400) % 2 === 0) {
        ctx.fillStyle = COLORS.warn;
        ctx.font = 'bold 16px monospace';
        ctx.fillText('¡NUEVO RÉCORD!', W / 2, view.H * 0.41 + 62);
      }
    },

    dibujarCompletado(ctx) {
      dibujarVelo(ctx, W, view.H, 'CAPÍTULO COMPLETADO', COLORS.accent);
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`PUNTAJE  ${this.partida.puntos}`, W / 2, view.H * 0.41);
      ctx.fillStyle = COLORS.warn;
      ctx.font = 'bold 14px monospace';
      const mensaje = this.haySiguiente() ? 'ZONA DESPEJADA' : 'LA SEÑAL VUELVE A LA TIERRA';
      ctx.fillText(mensaje, W / 2, view.H * 0.41 + 30);
      if (!this.resultado) return;
      const { nuevoMejor, desbloqueado } = this.resultado;
      ctx.font = 'bold 13px monospace';
      if (desbloqueado) {
        ctx.fillStyle = COLORS.accent;
        ctx.fillText(`CAPÍTULO ${desbloqueado} DESBLOQUEADO`, W / 2, view.H * 0.41 + 56);
      }
      if (nuevoMejor && Math.floor(performance.now() / 400) % 2 === 0) {
        ctx.fillStyle = COLORS.pink;
        ctx.fillText('¡NUEVO MEJOR PUNTAJE!', W / 2, view.H * 0.41 + 78);
      }
    },
  };
}
