// Ajustes del jugador. Cada uno vive en el guardado con su propia clave.
// La vibración se guarda como 1/0 porque el guardado solo lee números.
export const AJUSTES = {
  volMusica: { defecto: 70, min: 0, max: 100, paso: 10 },
  volEfectos: { defecto: 80, min: 0, max: 100, paso: 10 },
  vibracion: { defecto: 1, min: 0, max: 1, paso: 1 },
  sensibilidad: { defecto: 1, min: 0.5, max: 2, paso: 0.25 },
};

// Lleva el valor al paso más cercano dentro del rango (así 150 → 100 y 1.3 → 1.25).
function ajustar({ min, max, paso }, valor) {
  const pasos = Math.round((valor - min) / paso);
  return Math.min(max, Math.max(min, min + pasos * paso));
}

export function crearConfiguracion(guardado) {
  const valores = {};
  for (const [clave, ajuste] of Object.entries(AJUSTES)) {
    valores[clave] = ajustar(ajuste, guardado.leerNumero(clave, ajuste.defecto));
  }

  return {
    valores,

    cambiar(clave, valor) {
      const ajuste = AJUSTES[clave];
      if (!ajuste || !Number.isFinite(valor)) return;
      valores[clave] = ajustar(ajuste, valor);
      guardado.escribir(clave, valores[clave]);
    },

    subir(clave) {
      if (AJUSTES[clave]) this.cambiar(clave, valores[clave] + AJUSTES[clave].paso);
    },

    bajar(clave) {
      if (AJUSTES[clave]) this.cambiar(clave, valores[clave] - AJUSTES[clave].paso);
    },
  };
}
