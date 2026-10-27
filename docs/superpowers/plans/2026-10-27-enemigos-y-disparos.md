# Enemigos y disparos — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tres tipos de enemigos Vex que llegan en oleadas, y balas enemigas (rectas y apuntadas al jugador). Sin colisiones todavía (siguiente feature).

**Architecture:** Datos de tipos y oleadas separados de la lógica (`datos/`), entidades puras y probadas (`entidades/enemigos.js`, `entidades/balas.js` generalizado) y un director de oleadas (`sistemas/oleadas.js`) que la escena `juego` consulta cada frame.

**Tech Stack:** Canvas 2D, ES modules, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md` (sección 8, "Enemigos")

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas.
- Commits a nombre de David, sin atribución; PR sin atribución.
- Cada commit deja el juego funcionando.

## Review Focus

- Balas enemigas que salen por abajo o por los lados → se eliminan (no se acumulan en memoria) (test en Task 1).
- Enemigo tirador con el jugador justo debajo o encima de él (distancia 0) → no produce `NaN` al apuntar (test en Task 1).
- Enemigos que salen de la pantalla sin morir → se eliminan de la flota (test en Task 2).
- Al terminar la última oleada → el director vuelve a empezar, más rápido, sin quedarse sin enemigos (test en Task 3).
- `dt` grande (0.05) con varias apariciones en el mismo frame → aparecen todas, ninguna se salta (test en Task 3).

---

### Task 1: Balas generalizadas y apuntado

**Files:**
- Modify: `www/js/entidades/balas.js`
- Create: `www/js/util.js` → agregar `apuntar`
- Test: `tests/balas.test.js`, `tests/util.test.js`

**Interfaces:**
- Produces:
  - `crearBalas({ color = COLORS.accent, ancho = 2, largo = 8 } = {}) -> { lista: Array<{x, y, vx, vy}>, disparar(x, y, vy = -480, vx = 0), update(dt, alto = Infinity), draw(ctx) }`. Elimina las que cumplen `y < -10 || y > alto + 10 || x < -10 || x > 370`.
  - `apuntar(desdeX, desdeY, haciaX, haciaY, rapidez) -> { vx, vy }`; con distancia 0 devuelve `{ vx: 0, vy: rapidez }`.

- [ ] Ajustar los tests existentes de balas (ahora `lista` incluye `vx: 0`); tests nuevos: `vx` mueve en x; salir por abajo/lados elimina; `apuntar(0,0,3,4,10)` = `{vx:6, vy:8}`; `apuntar(5,5,5,5,10)` = `{vx:0, vy:10}`.
- [ ] Fallar → implementar → pasar. Commit `feat: balas con dirección y función para apuntar`.

### Task 2: Tipos de enemigos y flota

**Files:**
- Create: `www/js/datos/enemigos.js`, `www/js/entidades/enemigos.js`
- Test: `tests/enemigos.test.js`

**Interfaces:**
- Produces:
  - `TIPOS_ENEMIGO` en `datos/enemigos.js`:
    - `explorador`: `vida 1, puntos 100, vel 110`, baja recto.
    - `zigzag`: `vida 2, puntos 150, vel 80`, `x = x0 + sin(t * 3) * 50`.
    - `tirador`: `vida 3, puntos 250, vel 70`, baja hasta `y = 120` y se queda; dispara apuntado al jugador cada `1.4` s con rapidez `170`.
  - `crearEnemigo(tipo, x, y) -> { tipo, x, y, vida, puntos, ancho, alto, update(dt, entorno) }` con `entorno = { jugador: {x, y}, disparar(x, y, vy, vx) }`.
  - `crearFlota() -> { lista, agregar(enemigo), update(dt, entorno, alto), draw(ctx) }`; elimina enemigos con `y > alto + 30`.
  - Ancho/alto de cada tipo = tamaño de su sprite (Task 4).

- [ ] Tests: explorador baja `vel*dt`; zigzag oscila alrededor de `x0` sin salirse de ±50; tirador se detiene en 120 y dispara apuntado (callback espía) cada 1.4 s; flota elimina enemigos fuera de pantalla; tipo desconocido lanza error.
- [ ] Fallar → implementar → pasar. Commit `feat: tipos de enemigos Vex y flota`.

### Task 3: Oleadas y director

**Files:**
- Create: `www/js/datos/oleadas.js`, `www/js/sistemas/oleadas.js`
- Test: `tests/oleadas.test.js`

**Interfaces:**
- Produces:
  - Formaciones en `datos/oleadas.js`: `linea(tipo, n, t0, intervalo, x)`, `fila(tipo, n, t0)` (n enemigos repartidos a lo ancho al mismo tiempo), `ve(tipo, t0)` (5 enemigos en V). Cada una devuelve `Array<{ t, tipo, x }>`.
  - `OLEADAS_PRUEBA`: 4 oleadas que mezclan los tres tipos.
  - `crearDirector(oleadas, { pausa = 2 } = {}) -> { oleada: number, ciclo: number, update(dt, flota) }`. Cada aparición crea `crearEnemigo(tipo, x, -20)`. Una oleada termina cuando ya apareció todo y la flota está vacía; tras `pausa` s empieza la siguiente. Al acabar la lista vuelve a la primera con `ciclo + 1` y el tiempo de aparición escalado por `0.85 ** ciclo`.

- [ ] Tests: aparecen en sus tiempos; un `dt` que cubre varias apariciones las crea todas; no avanza mientras quedan enemigos; pausa entre oleadas; tras la última vuelve a la 0 con `ciclo = 1` y apariciones más rápidas; formaciones devuelven las posiciones esperadas.
- [ ] Fallar → implementar → pasar. Commit `feat: oleadas de enemigos y director`.

### Task 4: Sprites e integración

**Files:**
- Modify: `www/js/graficos/sprites.js` (sprites `VEX_EXPLORADOR`, `VEX_ZIGZAG`, `VEX_TIRADOR` en tonos `COLORS.danger`/`pink`/`warn`), `www/js/escenas/juego.js`, `README.md`
- Test: `tests/sprites.test.js` ya cubre forma y paleta; agregar que existan los tres.

- [ ] Sprites → test → commit `feat: sprites de los enemigos Vex`.
- [ ] Escena: flota + director + balas enemigas (`COLORS.danger`, 3×6). Verificar con el script CDP: aparecen enemigos, los tiradores disparan hacia la nave, sin errores. Commit `feat: enemigos y balas enemigas en la escena de juego`.
- [ ] README. Commit `docs: actualizar estructura en el README`.
- [ ] Push y PR `Enemigos y disparos: tipos Vex, oleadas y balas enemigas`.
