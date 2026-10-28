// Fuente pixel 5x7 para el logo ('#' = píxel encendido).
export const GLIFOS = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

const ANCHO_GLIFO = 5;
const SEPARACION = 1;

export function medirTexto(texto, escala) {
  return (texto.length * (ANCHO_GLIFO + SEPARACION) - SEPARACION) * escala;
}

// Dibuja el texto centrado en x, con y como borde superior.
export function dibujarTextoPixel(ctx, texto, x, y, escala, color) {
  const x0 = Math.round(x - medirTexto(texto, escala) / 2);
  ctx.fillStyle = color;
  [...texto].forEach((letra, i) => {
    const glifo = GLIFOS[letra] ?? GLIFOS[' '];
    const xl = x0 + i * (ANCHO_GLIFO + SEPARACION) * escala;
    glifo.forEach((fila, fy) => {
      for (let fx = 0; fx < ANCHO_GLIFO; fx++) {
        if (fila[fx] === '#') ctx.fillRect(xl + fx * escala, Math.round(y) + fy * escala, escala, escala);
      }
    });
  });
}
