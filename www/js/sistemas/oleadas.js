import { crearEnemigo } from '../entidades/enemigos.js';

// Cada vuelta completa a la lista de oleadas las hace más rápidas.
const ACELERACION_CICLO = 0.85;

// Director de oleadas: hace aparecer los enemigos de cada oleada en su tiempo.
// Una oleada termina cuando ya aparecieron todos y la flota quedó vacía; tras una pausa empieza la siguiente.
export function crearDirector(oleadas, { pausa = 2 } = {}) {
  let tiempo = 0;
  let siguiente = 0;
  let pausaRestante = null;

  return {
    oleada: 0,
    ciclo: 0,

    update(dt, flota) {
      if (pausaRestante !== null) {
        pausaRestante -= dt;
        if (pausaRestante > 0) return;
        // El tiempo que sobró de la pausa ya cuenta para la nueva oleada.
        tiempo = -pausaRestante;
        pausaRestante = null;
      } else {
        tiempo += dt;
      }

      const actual = oleadas[this.oleada];
      const escala = ACELERACION_CICLO ** this.ciclo;
      while (siguiente < actual.length && actual[siguiente].t * escala <= tiempo) {
        const { tipo, x } = actual[siguiente];
        flota.agregar(crearEnemigo(tipo, x, -20));
        siguiente++;
      }

      if (siguiente >= actual.length && flota.lista.length === 0) {
        this.oleada++;
        if (this.oleada >= oleadas.length) {
          this.oleada = 0;
          this.ciclo++;
        }
        siguiente = 0;
        pausaRestante = pausa;
      }
    },
  };
}
