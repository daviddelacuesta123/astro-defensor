// Gestor de escenas: carga, menú, juego, diálogo... Solo una está activa a la vez.
// Una escena es un objeto con métodos opcionales: entrar(params), salir(), update(dt), draw(ctx).
export function crearGestorEscenas() {
  const escenas = new Map();
  let escena = null;

  return {
    actual: null,

    registrar(nombre, nuevaEscena) {
      escenas.set(nombre, nuevaEscena);
    },

    ir(nombre, params) {
      const siguiente = escenas.get(nombre);
      if (!siguiente) throw new Error(`Escena no registrada: ${nombre}`);
      escena?.salir?.();
      escena = siguiente;
      this.actual = nombre;
      escena.entrar?.(params);
    },

    // Avisa un evento (p. ej. 'pausar' al pasar a segundo plano) a la escena actual.
    enviar(evento, ...args) {
      escena?.[evento]?.(...args);
    },

    update(dt) {
      escena?.update?.(dt);
    },

    draw(ctx) {
      escena?.draw?.(ctx);
    },
  };
}
