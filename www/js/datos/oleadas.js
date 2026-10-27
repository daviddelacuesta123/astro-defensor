// Formaciones: cada una devuelve una lista de apariciones { t, tipo, x }.
const MARGEN = 40;

// n enemigos en la misma columna, uno tras otro.
export function linea(tipo, n, t0, intervalo, x) {
  return Array.from({ length: n }, (_, i) => ({ t: t0 + i * intervalo, tipo, x }));
}

// n enemigos repartidos a lo ancho de la pantalla, al mismo tiempo.
export function fila(tipo, n, t0) {
  const paso = (360 - 2 * MARGEN) / (n - 1);
  return Array.from({ length: n }, (_, i) => ({ t: t0, tipo, x: MARGEN + i * paso }));
}

// 5 enemigos en V: primero el del centro, luego las alas.
export function ve(tipo, t0) {
  return [-80, -40, 0, 40, 80].map((dx) => ({ t: t0 + Math.abs(dx) / 40 * 0.25, tipo, x: 180 + dx }));
}

const ordenar = (apariciones) => apariciones.sort((a, b) => a.t - b.t);

// Oleadas de prueba hasta que lleguen el Modo Libre y los capítulos.
export const OLEADAS_PRUEBA = [
  ordenar([...linea('explorador', 4, 0, 0.6, 90), ...linea('explorador', 4, 0.3, 0.6, 270)]),
  ordenar([...ve('explorador', 0), ...fila('zigzag', 3, 1.5)]),
  ordenar([...fila('zigzag', 4, 0), ...linea('tirador', 1, 1, 0, 180), ...ve('explorador', 2.5)]),
  ordenar([...linea('tirador', 1, 0, 0, 90), ...linea('tirador', 1, 0, 0, 270), ...fila('explorador', 5, 1.5), ...fila('zigzag', 3, 3)]),
];
