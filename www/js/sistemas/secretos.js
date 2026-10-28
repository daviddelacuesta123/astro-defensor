// Detección de los gestos de los easter eggs del menú.

// Cuenta toques seguidos: `registrar(t)` devuelve true al completar `necesarios` toques
// sin pasar más de `ventana` segundos entre uno y otro. Después vuelve a contar desde 0.
export function crearToquesSeguidos({ necesarios = 7, ventana = 1 } = {}) {
  let cuenta = 0;
  let ultimo = -Infinity;

  return {
    registrar(t) {
      cuenta = t - ultimo <= ventana ? cuenta + 1 : 1;
      ultimo = t;
      if (cuenta < necesarios) return false;
      cuenta = 0;
      ultimo = -Infinity;
      return true;
    },
  };
}

// Pulsación larga: `update` devuelve true una sola vez al mantener `duracion` segundos;
// soltar la rearma. `progreso` va de 0 a 1.
export function crearPulsacionLarga({ duracion = 3 } = {}) {
  let tiempo = 0;
  let disparada = false;

  return {
    progreso: 0,

    update(dt, presionado) {
      if (!presionado) {
        tiempo = 0;
        disparada = false;
        this.progreso = 0;
        return false;
      }
      tiempo += dt;
      this.progreso = Math.min(1, tiempo / duracion);
      if (disparada || tiempo < duracion) return false;
      disparada = true;
      return true;
    },
  };
}
