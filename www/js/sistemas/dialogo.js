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

// Texto progresivo: las letras de la línea actual aparecen con el tiempo.
// Un toque con el texto a medias lo completa; con el texto completo pasa a la siguiente línea.
export function crearDialogo(lineas, { letrasPorSegundo = 40 } = {}) {
  let t = 0;

  return {
    indice: 0,
    terminado: lineas.length === 0,

    get linea() {
      return lineas[this.indice] ?? null;
    },

    get visibles() {
      if (!this.linea) return 0;
      return Math.min(this.linea.texto.length, Math.floor(t * letrasPorSegundo));
    },

    get completa() {
      return !!this.linea && this.visibles === this.linea.texto.length;
    },

    update(dt) {
      if (!this.terminado) t += dt;
    },

    tocar() {
      if (this.terminado) return;
      if (!this.completa) {
        // Tiempo suficiente para que se vea todo el texto.
        t = this.linea.texto.length / letrasPorSegundo + 1;
        return;
      }
      t = 0;
      this.indice++;
      if (this.indice >= lineas.length) this.terminado = true;
    },
  };
}
