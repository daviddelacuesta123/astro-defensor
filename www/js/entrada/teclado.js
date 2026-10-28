// Control por teclado para jugar en el PC: flechas o WASD mueven la nave.
const DIRECCIONES = {
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
};
// Hasta dónde "adelanta" el dedo virtual a la nave. Con el suavizado del jugador da unas
// 250 unidades por segundo: cruzar la pantalla toma cerca de 1,5 s.
const ALCANCE = 16;
// Mismo desfase que usa la nave respecto al dedo (entidades/jugador.js).
const DESFASE_DEDO = 60;

export function crearTeclado() {
  const presionadas = new Set();

  return {
    // Devuelve true si es una tecla de movimiento (para evitar que la página haga scroll).
    presionar(codigo) {
      if (!(codigo in DIRECCIONES)) return false;
      presionadas.add(codigo);
      return true;
    },

    soltar(codigo) {
      presionadas.delete(codigo);
    },

    // Al perder el foco no llega el keyup: se sueltan todas para que la nave no siga sola.
    soltarTodo() {
      presionadas.clear();
    },

    direccion() {
      let dx = 0;
      let dy = 0;
      for (const codigo of presionadas) {
        dx += DIRECCIONES[codigo][0];
        dy += DIRECCIONES[codigo][1];
      }
      // Flecha y WASD del mismo lado no suman doble; opuestas se anulan.
      return { dx: Math.sign(dx), dy: Math.sign(dy) };
    },

    // "Dedo" que mueve la nave hacia donde se pide, o null si no hay teclas de movimiento.
    dedoVirtual(jugador) {
      const { dx, dy } = this.direccion();
      if (dx === 0 && dy === 0) return null;
      const largo = Math.hypot(dx, dy);
      return {
        activo: true,
        x: jugador.x + dx / largo * ALCANCE,
        y: jugador.y + DESFASE_DEDO + dy / largo * ALCANCE,
      };
    },
  };
}
