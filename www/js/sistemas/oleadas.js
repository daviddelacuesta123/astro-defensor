import { crearEnemigo } from '../entidades/enemigos.js';

// Cada vuelta completa a la lista de oleadas las hace más rápidas.
const ACELERACION_CICLO = 0.85;

// Director de oleadas: hace aparecer los enemigos de cada oleada en su tiempo.
// Una oleada termina cuando ya aparecieron todos y la flota quedó vacía; tras una pausa empieza la siguiente.
// `oleadas` puede ser una lista (se repite en ciclos cada vez más rápidos) o una función
// `(n) => oleada` que genera la oleada n sin fin (Modo Libre).
// Con `repetir: false` (capítulos), tras la última oleada y su pausa queda `terminado`.
export function crearDirector(oleadas, { pausa = 2, repetir = true } = {}) {
  const generada = typeof oleadas === 'function';
  let tiempo = 0;
  let siguiente = 0;
  let pausaRestante = null;
  // La pausa en curso es la que sigue a la última oleada.
  let pausaFinal = false;
  // Se genera una sola vez al empezar cada oleada (el generador puede ser aleatorio).
  let actual = generada ? oleadas(0) : oleadas[0];

  return {
    oleada: 0,
    ciclo: 0,
    terminado: false,

    update(dt, flota) {
      if (this.terminado) return;
      if (pausaRestante !== null) {
        pausaRestante -= dt;
        if (pausaRestante > 0) return;
        if (pausaFinal) {
          this.terminado = true;
          return;
        }
        // El tiempo que sobró de la pausa ya cuenta para la nueva oleada.
        tiempo = -pausaRestante;
        pausaRestante = null;
      } else {
        tiempo += dt;
      }

      const escala = ACELERACION_CICLO ** this.ciclo;
      while (siguiente < actual.length && actual[siguiente].t * escala <= tiempo) {
        const { tipo, x, vel = 1 } = actual[siguiente];
        flota.agregar(crearEnemigo(tipo, x, -20, { velocidad: vel }));
        siguiente++;
      }

      if (siguiente >= actual.length && flota.lista.length === 0) {
        // Sin repetir, la última oleada no da paso a otra: solo queda la pausa final.
        if (!generada && !repetir && this.oleada === oleadas.length - 1) {
          pausaFinal = true;
          pausaRestante = pausa;
          return;
        }
        this.oleada++;
        if (generada) {
          actual = oleadas(this.oleada);
        } else {
          if (this.oleada >= oleadas.length) {
            this.oleada = 0;
            this.ciclo++;
          }
          actual = oleadas[this.oleada];
        }
        siguiente = 0;
        pausaRestante = pausa;
      }
    },
  };
}
