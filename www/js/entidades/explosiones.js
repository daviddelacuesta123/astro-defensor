const VIDA = 0.5;
const VEL_MIN = 40;
const VEL_MAX = 160;

// Explosiones de partículas: cuadritos que salen disparados y se desvanecen.
export function crearExplosiones({ rng = Math.random } = {}) {
  const lista = [];

  return {
    lista,

    estallar(x, y, color, n = 14) {
      for (let i = 0; i < n; i++) {
        const angulo = (i / n) * Math.PI * 2 + rng() * 0.5;
        const vel = VEL_MIN + rng() * (VEL_MAX - VEL_MIN);
        lista.push({
          x, y, color,
          vx: Math.cos(angulo) * vel,
          vy: Math.sin(angulo) * vel,
          vida: VIDA,
          tam: rng() < 0.3 ? 3 : 2,
        });
      }
    },

    update(dt) {
      for (const p of lista) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vida -= dt;
      }
      for (let i = lista.length - 1; i >= 0; i--) {
        if (lista[i].vida <= 0) lista.splice(i, 1);
      }
    },

    draw(ctx) {
      for (const p of lista) {
        ctx.globalAlpha = Math.max(0, p.vida / VIDA);
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.tam, p.tam);
      }
      ctx.globalAlpha = 1;
    },
  };
}
