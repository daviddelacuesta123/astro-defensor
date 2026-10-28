// Progreso del Modo Historia en el guardado: hasta qué capítulo se llegó y el mejor puntaje
// de cada uno. Lee el guardado en cada consulta para enterarse enseguida de "Borrar progreso".
const TOTAL = 5;
const CLAVE_MAX = 'capituloMax';
const claveMejor = (n) => `mejorCap${n}`;

// Todas las claves de la campaña (las borra "Borrar progreso").
export const CLAVES_HISTORIA = [CLAVE_MAX, ...Array.from({ length: TOTAL }, (_, i) => claveMejor(i + 1))];

export function crearProgreso(guardado, total = TOTAL) {
  return {
    // Último capítulo desbloqueado. Sin haber jugado es el 1.
    capituloMax() {
      const max = Math.floor(guardado.leerNumero(CLAVE_MAX, 1));
      return Math.min(total, Math.max(1, max));
    },

    desbloqueado(n) {
      return n >= 1 && n <= this.capituloMax();
    },

    mejor(n) {
      return guardado.leerNumero(claveMejor(n));
    },

    // Devuelve si el puntaje es un nuevo mejor y qué capítulo se desbloqueó (o null).
    completar(n, puntos) {
      const nuevoMejor = puntos > this.mejor(n);
      if (nuevoMejor) guardado.escribir(claveMejor(n), puntos);
      let desbloqueado = null;
      if (n + 1 <= total && n + 1 > this.capituloMax()) {
        desbloqueado = n + 1;
        guardado.escribir(CLAVE_MAX, desbloqueado);
      }
      return { nuevoMejor, desbloqueado };
    },
  };
}
