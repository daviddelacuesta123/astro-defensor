// Colisiones por cajas centradas { x, y, ancho, alto }.
const BALA = { ancho: 4, alto: 8 };
// La caja de la nave es más chica que su dibujo: los roces no cuentan.
const TOLERANCIA_JUGADOR = 0.6;
const DESTELLO = 0.08;

export function chocan(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.ancho + b.ancho
    && Math.abs(a.y - b.y) * 2 < a.alto + b.alto;
}

const cajaBala = (b) => ({ x: b.x, y: b.y, ...BALA });

export function cajaJugador(jugador) {
  return {
    x: jugador.x,
    y: jugador.y,
    ancho: jugador.ancho * TOLERANCIA_JUGADOR,
    alto: jugador.alto * TOLERANCIA_JUGADOR,
  };
}

// Balas del jugador contra la flota. Devuelve los enemigos destruidos (ya quitados de la flota).
export function impactarEnemigos(balas, flota) {
  const muertos = [];
  for (let i = balas.lista.length - 1; i >= 0; i--) {
    const caja = cajaBala(balas.lista[i]);
    const enemigo = flota.lista.find((e) => chocan(caja, e));
    if (!enemigo) continue;
    balas.lista.splice(i, 1);
    enemigo.vida -= 1;
    enemigo.golpeado = DESTELLO;
    if (enemigo.vida <= 0) {
      flota.lista.splice(flota.lista.indexOf(enemigo), 1);
      muertos.push(enemigo);
    }
  }
  return muertos;
}

// Balas enemigas y choques contra la nave. Devuelve si algo la tocó.
// Un enemigo que choca se destruye; un jefe no: sigue ahí y la nave pierde la vida igual.
export function golpearJugador(jugador, balasEnemigas, flota) {
  const caja = cajaJugador(jugador);
  let tocado = false;
  for (let i = balasEnemigas.lista.length - 1; i >= 0; i--) {
    if (chocan(caja, cajaBala(balasEnemigas.lista[i]))) {
      balasEnemigas.lista.splice(i, 1);
      tocado = true;
    }
  }
  for (let i = flota.lista.length - 1; i >= 0; i--) {
    if (chocan(caja, flota.lista[i])) {
      if (!flota.lista[i].jefe) flota.lista.splice(i, 1);
      tocado = true;
    }
  }
  return tocado;
}
