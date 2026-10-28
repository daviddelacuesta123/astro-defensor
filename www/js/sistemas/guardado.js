// Guardado local (récord, progreso, configuración). localStorage puede no existir o
// lanzar errores (modo privado, almacenamiento bloqueado): en ese caso el juego sigue sin guardar.
const PREFIJO = 'astro.';

// El acceso mismo a localStorage puede lanzar SecurityError en algunos navegadores.
export function obtenerAlmacen() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function crearGuardado(almacen) {
  return {
    leerNumero(clave, defecto = 0) {
      try {
        const crudo = almacen?.getItem(PREFIJO + clave);
        if (crudo === null || crudo === undefined) return defecto;
        const valor = Number(crudo);
        return Number.isFinite(valor) && valor >= 0 ? valor : defecto;
      } catch {
        return defecto;
      }
    },

    escribir(clave, valor) {
      try {
        almacen?.setItem(PREFIJO + clave, String(valor));
      } catch {
        // Sin espacio o bloqueado: no hay nada más que hacer.
      }
    },

    borrar(clave) {
      try {
        almacen?.removeItem(PREFIJO + clave);
      } catch {
        // Bloqueado: el valor se queda, pero el juego sigue.
      }
    },
  };
}
