import { linea, fila, ve } from '../datos/oleadas.js';

// Generador de oleadas infinitas del Modo Libre. La oleada n (desde 0) trae más enemigos,
// más variados y más seguidos que la anterior, con topes para que siga siendo jugable.
const MAX_ENEMIGOS = 30;
const MAX_TIRADORES = 4;
const SEPARACION_MIN = 0.6;
const INTERVALO_LINEA = 0.45;
// Los enemigos van un 4 % más rápido en cada oleada, hasta 1.6 veces su velocidad.
const ACELERACION_OLEADA = 0.04;
const VEL_MAX = 1.6;

const enRango = (rng, min, max) => min + rng() * (max - min);

function elegirTipo(n, rng, tiradorPermitido) {
  const pesos = [
    ['explorador', 4],
    ['zigzag', n >= 1 ? Math.min(4, n) : 0],
    ['tirador', tiradorPermitido ? 2 : 0],
  ];
  const total = pesos.reduce((s, [, p]) => s + p, 0);
  let r = rng() * total;
  for (const [tipo, peso] of pesos) {
    if (r < peso) return tipo;
    r -= peso;
  }
  return 'explorador';
}

// Una formación de `tipo` con como mucho `cupo` enemigos, empezando en t0.
function formacion(tipo, cupo, t0, rng) {
  // El zigzag oscila ±50: se lo mantiene lejos de los bordes.
  const x = tipo === 'zigzag' ? enRango(rng, 70, 290) : enRango(rng, 40, 320);
  const forma = rng();
  if (forma < 0.35 && cupo >= 5) return ve(tipo, t0);
  if (forma < 0.65 && cupo >= 2) return fila(tipo, Math.min(5, cupo), t0);
  return linea(tipo, Math.min(4, cupo), t0, INTERVALO_LINEA, x);
}

export function generarOleada(n, rng = Math.random) {
  const objetivo = Math.min(MAX_ENEMIGOS, 6 + 2 * n);
  const maxTiradores = n < 2 ? 0 : Math.min(MAX_TIRADORES, 1 + Math.floor(n / 3));
  const separacion = Math.max(SEPARACION_MIN, 2 - 0.1 * n);
  // Toda oleada trae exploradores; desde la 1 también zigzag, y desde la 2 al menos un tirador.
  const obligatorios = ['explorador'];
  if (n >= 1) obligatorios.push('zigzag');
  if (n >= 2) obligatorios.push('tirador');

  const apariciones = [];
  let tiradores = 0;
  let t = 0;
  while (apariciones.length < objetivo) {
    const tipo = obligatorios.shift() ?? elegirTipo(n, rng, tiradores < maxTiradores);
    const cupo = objetivo - apariciones.length;
    if (tipo === 'tirador') {
      tiradores++;
      apariciones.push({ t, tipo, x: enRango(rng, 40, 320) });
      t += separacion / 2;
    } else {
      apariciones.push(...formacion(tipo, cupo, t, rng));
      t += separacion;
    }
  }
  const vel = Math.min(VEL_MAX, 1 + ACELERACION_OLEADA * n);
  return apariciones.map((a) => ({ ...a, vel })).sort((a, b) => a.t - b.t);
}
