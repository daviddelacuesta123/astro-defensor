// Dónde va el juego dentro de la ventana. En un celular (o una ventana con su proporción)
// ocupa toda la pantalla; en un PC es una columna vertical centrada de alto completo.
const PROPORCION_CELULAR = 0.62;
const PROPORCION_COLUMNA = 0.5;

export function calcularMarco(ancho, alto) {
  if (ancho / alto <= PROPORCION_CELULAR) return { x: 0, y: 0, ancho, alto, escritorio: false };
  const anchoColumna = Math.min(ancho, Math.round(alto * PROPORCION_COLUMNA));
  return { x: Math.round((ancho - anchoColumna) / 2), y: 0, ancho: anchoColumna, alto, escritorio: true };
}

// Ancho mínimo a cada lado de la columna para mostrar los paneles de información.
const ANCHO_PANEL_MIN = 220;

export function cabenPaneles(marco) {
  return marco.escritorio && marco.x >= ANCHO_PANEL_MIN;
}
