// Vibración del teléfono según el ajuste del jugador. `motor` es navigator.vibrate en el
// navegador; puede no existir (escritorio, iOS) o lanzar error, y el juego sigue igual.
export function crearVibrador(configuracion, motor) {
  return (ms) => {
    if (!configuracion.valores.vibracion) return;
    try {
      motor?.(ms);
    } catch {
      // Sin permiso o sin motor: se juega sin vibración.
    }
  };
}
