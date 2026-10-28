// Lógica de los cuadros de diálogo, sin dibujo: corte en renglones y texto progresivo.

// Un cuadro muestra hasta 3 renglones de 28 caracteres (fuente de 14 px en 360 de ancho).
export const RENGLONES = 3;
export const ANCHO_RENGLON = 28;

// Corta el texto por palabras; una palabra más larga que el renglón se parte.
export function partirRenglones(texto, ancho = ANCHO_RENGLON) {
  const renglones = [];
  let actual = '';
  for (let palabra of texto.split(/\s+/).filter(Boolean)) {
    while (palabra.length > ancho) {
      if (actual) renglones.push(actual);
      renglones.push(palabra.slice(0, ancho));
      palabra = palabra.slice(ancho);
      actual = '';
    }
    if (!actual) actual = palabra;
    else if (actual.length + 1 + palabra.length <= ancho) actual += ' ' + palabra;
    else {
      renglones.push(actual);
      actual = palabra;
    }
  }
  if (actual) renglones.push(actual);
  return renglones;
}
