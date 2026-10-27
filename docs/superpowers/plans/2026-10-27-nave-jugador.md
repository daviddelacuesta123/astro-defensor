# Nave del jugador — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La nave AD-7 en pixel art, controlada arrastrando el dedo (o el mouse), con disparo automático.

**Architecture:** Lógica pura y probada en `entrada/coordenadas.js`, `entidades/jugador.js`, `entidades/balas.js`; lo que toca el DOM queda en `entrada/puntero.js`. Una escena `juego` reemplaza a la provisional como escena inicial (hasta que exista la pantalla de carga).

**Tech Stack:** Canvas 2D, Pointer Events, ES modules, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md` (sección 8, "Control")

## Global Constraints

- Ancho lógico `W = 360`, alto `view.H`. Paleta de `COLORS`.
- Sin dependencias nuevas. Comentarios e identificadores de dominio en español.
- Commits a nombre de David, sin atribución; PR sin atribución.

## Review Focus

- Segundo dedo en pantalla → se ignora; solo manda el primer puntero (test en Task 1 vía `crearEstadoPuntero`).
- `pointercancel` (llamada entrante, gesto del sistema) → el dedo cuenta como levantado (test en Task 1).
- Dedo en el borde o fuera de la zona de juego → la nave queda dentro de la pantalla (test en Task 2).
- Sensibilidad en los extremos (0.5 y 2) → la nave sigue llegando al dedo sin pasarse (test en Task 2).
- Frame con `dt = 0` → no dispara ni se mueve (test en Task 2).

---

### Task 1: Entrada táctil

**Files:**
- Create: `www/js/entrada/coordenadas.js`, `www/js/entrada/puntero.js`
- Test: `tests/entrada.test.js`

**Interfaces:**
- Produces:
  - `aLogicas(clientX, clientY, anchoPx, altoPx, H) -> { x, y }` (x en [0, 360], y en [0, H]).
  - `crearEstadoPuntero() -> { activo: boolean, x, y, bajar(id, x, y), mover(id, x, y), subir(id) }` — solo sigue al primer `id`; `subir` de otro id no hace nada.
  - `conectarPuntero(canvas, estado)` (DOM): `pointerdown/move/up/cancel` → estado en coordenadas lógicas; `pointercancel` = `subir`.

- [ ] Test: `aLogicas(195, 422, 390, 844, 779)` ≈ `{x: 180, y: 389.5}`; `aLogicas(0,0,…)` = `{0,0}`.
- [ ] Test: estado sigue al primer id, ignora `mover`/`subir` del segundo, `subir` del primero deja `activo=false`; tras subir, otro id puede tomar el control.
- [ ] Ver fallar → implementar → ver pasar.
- [ ] Commit `feat: entrada táctil con coordenadas lógicas y un solo dedo`.

### Task 2: Nave del jugador

**Files:**
- Create: `www/js/entidades/jugador.js`
- Test: `tests/jugador.test.js`

**Interfaces:**
- Consumes: estado de puntero `{activo, x, y}`.
- Produces: `crearJugador({ x, y }) -> { x, y, ancho: 20, alto: 22, update(dt, puntero, alto, disparar, sensibilidad = 1) }`.
  - Objetivo: `(puntero.x, puntero.y - DESFASE)` con `DESFASE = 60`, solo si `puntero.activo`.
  - Suavizado: `factor = 1 - Math.exp(-18 * sensibilidad * dt)`; `x += (objX - x) * factor` (igual en y).
  - Límites: `x` en `[ancho/2, 360 - ancho/2]`, `y` en `[alto * 0.25, alto - alto_nave/2 - 8]`.
  - Disparo automático cada `CADENCIA = 0.18` s: llama `disparar(x, y - alto_nave/2)`.

- [ ] Tests: se acerca al objetivo sin pasarse (sensibilidad 0.5, 1, 2); sin dedo activo no se mueve; queda dentro de los límites con dedo en (0, 0) y (360, H); `update(1, …)` con varias llamadas de 0.01 dispara 5 veces en 1 s; `dt = 0` no dispara ni mueve.
- [ ] Ver fallar → implementar → ver pasar.
- [ ] Commit `feat: nave del jugador que sigue al dedo y dispara sola`.

### Task 3: Balas del jugador

**Files:**
- Create: `www/js/entidades/balas.js`
- Test: `tests/balas.test.js`

**Interfaces:**
- Produces: `crearBalas() -> { lista: Array<{x, y, vy}>, disparar(x, y, vy = -480), update(dt), draw(ctx) }`; elimina las que salen por arriba (`y < -10`).

- [ ] Tests: `disparar` agrega; `update(0.5)` mueve 240 hacia arriba; una bala en `y = 0` se elimina tras `update(0.1)`.
- [ ] Ver fallar → implementar → ver pasar.
- [ ] Commit `feat: balas del jugador`.

### Task 4: Sprite y escena de juego

**Files:**
- Create: `www/js/graficos/sprites.js` (pixel art desde arreglos de texto + `dibujarSprite(ctx, sprite, x, y)` centrado), `www/js/escenas/juego.js`
- Modify: `www/js/main.js` (escena inicial `juego`, conectar puntero), `README.md` (estructura)
- Delete: `www/js/escenas/provisional.js`
- Test: `tests/sprites.test.js` (todas las filas de cada sprite tienen el mismo largo; cada carácter tiene color en la paleta o es `.`)

- [ ] Test de sprites → fallar → implementar → pasar. Commit `feat: sprite pixel art de la nave AD-7`.
- [ ] Escena `juego`: estrellas + balas + jugador (con llama del propulsor parpadeante). Verificar en Chrome headless (ventana ≥ 512 px) que la nave aparece abajo al centro y hay balas subiendo. Commit `feat: escena de juego con la nave controlable`.
- [ ] README. Commit `docs: actualizar estructura en el README`.
- [ ] Push y PR `Nave del jugador: control con el dedo y disparo automático`.
