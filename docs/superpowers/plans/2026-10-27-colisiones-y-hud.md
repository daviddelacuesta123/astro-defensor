# Colisiones y HUD — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el juego sea jugable: colisiones, vidas, puntaje, explosiones, power-ups, HUD, pausa y fin de partida.

**Architecture:** Lógica pura y probada en `sistemas/colisiones.js`, `entidades/powerups.js`, `entidades/explosiones.js`, `graficos/ui.js` (botones) y ampliaciones de `jugador.js`. La escena `juego` pasa a tener tres estados internos: `jugando`, `pausa`, `fin`.

**Tech Stack:** Canvas 2D, ES modules, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md` (sección 8)

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas.
- Commits a nombre de David, sin atribución; PR sin atribución. Cada commit deja el juego funcionando.
- "Salir al menú" del spec no existe aún (llega con `menu-principal`): la pausa ofrece **Continuar** y **Reiniciar**.

## Review Focus

- Una bala que toca a dos enemigos superpuestos → daña solo a uno (test en Task 1).
- Dos golpes en el mismo frame (bala + choque) → se pierde una sola vida gracias a la invulnerabilidad (test en Task 1).
- Recoger power-ups estando al máximo (vidas 5, disparo nivel 3) → no pasa del tope (test en Task 3).
- App en segundo plano a mitad de partida → al volver está en pausa (test del gestor en Task 5; verificación manual en Task 6).
- Tocar la pantalla para cerrar el fin de partida justo cuando aparece → el botón solo responde a toques nuevos, no al dedo que ya estaba abajo (test en Task 5).

---

### Task 1: Colisiones y daño al jugador

**Files:** Create `www/js/sistemas/colisiones.js`; Modify `www/js/entidades/jugador.js`; Test `tests/colisiones.test.js`, `tests/jugador.test.js`

**Interfaces:**
- `chocan(a, b) -> boolean` — cajas centradas `{x, y, ancho, alto}`.
- `impactarEnemigos(balas, flota) -> Array<enemigo>` — cada bala (caja 4×8) daña 1 a un solo enemigo y desaparece; marca `enemigo.golpeado = 0.08`; quita de `flota.lista` los que llegan a `vida <= 0` y los devuelve.
- `golpearJugador(jugador, balasEnemigas, flota) -> boolean` — caja del jugador al 60 % (`cajaJugador(jugador)`); quita la bala que lo toca; un enemigo que choca con la nave se destruye (sin puntos). Devuelve si hubo contacto.
- Jugador: `vidas: 3`, `invulnerable: 0`, `escudo: false`, `recibirGolpe() -> boolean` (true si perdió vida): invulnerable → false; escudo → lo quita, `invulnerable = 1`, false; si no → `vidas--`, `invulnerable = 2`, true. `update` descuenta `invulnerable`.

- [ ] Tests → fallar → implementar → pasar. Commit `feat: colisiones entre balas, enemigos y la nave`.

### Task 2: Niveles de disparo

**Files:** Modify `www/js/entidades/jugador.js`; Test `tests/jugador.test.js`

**Interfaces:**
- `nivelDisparo` 1–3. `disparar(x, y, vx)`: nivel 1 → `(x, punta, 0)`; nivel 2 → `(x-6, punta, 0)` y `(x+6, punta, 0)`; nivel 3 → `(x, punta, 0)`, `(x-6, punta, -120)`, `(x+6, punta, 120)`.
- `recibirGolpe` que quita vida también baja `nivelDisparo` en 1 (mínimo 1).

- [ ] Tests → fallar → implementar → pasar. Commit `feat: niveles de disparo doble y triple`.

### Task 3: Power-ups

**Files:** Create `www/js/entidades/powerups.js`; Test `tests/powerups.test.js`

**Interfaces:**
- `TIPOS_POWERUP = ['disparo', 'escudo', 'bomba', 'vida']`, pesos `[4, 3, 2, 1]`, probabilidad de soltar `0.12`.
- `crearPowerups({ rng = Math.random } = {}) -> { lista: Array<{x, y, tipo, t}>, soltar(x, y), update(dt, alto), recoger(jugador) -> Array<tipo>, draw(ctx) }`. Caen a 60 u/s; se eliminan con `y > alto + 20`; caja 16×16.
- `aplicarPowerup(jugador, tipo) -> 'bomba' | null`: disparo → `nivelDisparo = min(3, +1)`; escudo → `true`; vida → `min(5, +1)`; bomba → devuelve `'bomba'` (la escena destruye a todos los enemigos en pantalla y borra sus balas, dando sus puntos).

- [ ] Tests (rng determinista, topes, caída, recogida) → fallar → implementar → pasar. Commit `feat: power-ups de disparo, escudo, bomba y vida`.

### Task 4: Explosiones

**Files:** Create `www/js/entidades/explosiones.js`; Test `tests/explosiones.test.js`

**Interfaces:** `crearExplosiones({ rng } = {}) -> { lista, estallar(x, y, color, n = 14), update(dt), draw(ctx) }`; partículas con velocidad aleatoria (40–160 u/s), vida 0.5 s, se eliminan al acabar.

- [ ] Tests → fallar → implementar → pasar. Commit `feat: explosiones de partículas`.

### Task 5: Botones, toques y avisos a la escena

**Files:** Create `www/js/graficos/ui.js`; Modify `www/js/entrada/coordenadas.js`, `www/js/escenas/gestor.js`; Tests `tests/ui.test.js`, `tests/entrada.test.js`, `tests/gestor.test.js`

**Interfaces:**
- `crearBoton({ texto, x, y, ancho, alto }) -> { texto, x, y, ancho, alto, contiene(px, py) }` (caja centrada); `dibujarBoton(ctx, boton)`.
- Puntero: `tomarToques() -> Array<{x, y}>` devuelve y vacía los toques nuevos (cada `bajar` aceptado agrega uno).
- Gestor: `enviar(evento, ...args)` llama `escena[evento]?.(...args)` en la escena actual.

- [ ] Tests → fallar → implementar → pasar. Commit `feat: botones, toques y avisos a la escena actual`.

### Task 6: HUD, pausa, fin de partida e integración

**Files:** Create `www/js/graficos/hud.js`; Modify `www/js/escenas/juego.js`, `www/js/main.js`, `www/js/graficos/sprites.js` (`dibujarSprite(ctx, sprite, x, y, colorUnico?)` para el destello al recibir daño), `README.md`

- HUD: puntaje arriba a la izquierda (`COLORS.text`, 6 dígitos), vidas como mini naves arriba a la derecha junto al botón de pausa (32×32, esquina superior derecha).
- Estados: `jugando` → (botón pausa o `pausar` por segundo plano) → `pausa` (overlay, botones Continuar/Reiniciar) ; `vidas === 0` → gran explosión y 1.5 s después `fin` (overlay "FIN DE LA PARTIDA", puntaje, botón Reintentar).
- Nave: parpadea mientras es invulnerable; escudo como anillo `COLORS.accent`.
- `main.js`: `document.visibilitychange` oculto → `escenas.enviar('pausar')`.
- [ ] Verificar con el script CDP: enemigos explotan con los disparos, el puntaje sube, la nave pierde vidas, la pausa funciona y aparece el fin de partida. Commits `feat: HUD con puntaje, vidas y botón de pausa`, `feat: pausa y fin de partida`, `docs: actualizar estructura en el README`.
- [ ] Push y PR `Colisiones y HUD: vidas, puntaje, power-ups, pausa y fin de partida`.
