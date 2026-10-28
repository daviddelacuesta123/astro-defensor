# Modo Historia — Plan de implementación

**Goal:** Selector de capítulos y los 5 capítulos de "La Última Señal" jugables de principio a fin, cada zona con su novedad. Sin diálogos ni jefes todavía (features 11 y 12).

**Architecture:** El director aprende a terminar tras la última oleada (`repetir: false`). Los capítulos son datos (`datos/capitulos.js`). La escena `juego.js` se reutiliza con la opción `capitulos`: registrada como `'historia'`, recibe `{ capitulo }` al entrar, no guarda récord y al vaciar la última oleada muestra "CAPÍTULO COMPLETADO". Las novedades de zona son datos del capítulo: asteroides (tipos de enemigo nuevos), camuflaje (lo aplica la flota) y visibilidad reducida (un velo que dibuja la escena).

**Tech Stack:** Canvas 2D, ES modules, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md` (capítulos) y `TAREAS.md` (feature 10).

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas.
- Commits sin atribución; PR sin atribución. Cada commit deja el juego funcionando.
- El Modo Libre y la partida fantasma no cambian de comportamiento (sus pruebas siguen igual).

## Review Focus

- Con `repetir: false`, tras la última oleada no se anuncia una "oleada 6 de 5" ni vuelve a empezar (test en Task 1).
- Los asteroides no dan puntos de más y el grande casi no se puede destruir (test en Task 2).
- Un enemigo camuflado se vuelve visible al recibir un disparo (test en Task 3).
- Los capítulos crecen en dificultad (test en Task 4).
- Reintentar un capítulo repite el mismo capítulo, y Siguiente pasa al próximo (test en Task 7).
- El Modo Libre sigue guardando récord; la historia no lo toca (test en Task 7).

---

### Task 1: Director que termina

**Files:** Modify `www/js/sistemas/oleadas.js`; Test `tests/oleadas.test.js`

**Interfaces:** `crearDirector(oleadas, { pausa, repetir = true })`. Con `repetir: false`, al vaciar la última oleada espera la pausa y pone `terminado = true`; no vuelve a empezar.

- [ ] Commit `feat: el director puede terminar tras la última oleada`.

### Task 2: Asteroides

**Files:** Modify `www/js/datos/enemigos.js`, `www/js/graficos/sprites.js`, `www/js/sistemas/partida.js` (color de explosión); Test `tests/enemigos.test.js`

**Interfaces:** tipos `asteroide` (24×24, vida 6, 20 puntos) y `asteroideGrande` (36×36, vida 99, 0 puntos), lentos y sin disparo.

- [ ] Commit `feat: asteroides como obstáculo`.

### Task 3: Camuflaje

**Files:** Modify `www/js/entidades/enemigos.js`; Test `tests/enemigos.test.js`

**Interfaces:** `crearFlota({ camuflaje: { ciclo, oculto }, rng })`. `flota.oculto(e)` dice si un enemigo está camuflado ahora (nunca mientras destella por un golpe); se dibuja casi transparente.

- [ ] Commit `feat: enemigos que se camuflan`.

### Task 4: Los cinco capítulos

**Files:** Create `www/js/datos/capitulos.js`; Test `tests/capitulos.test.js`

**Interfaces:** `CAPITULOS = [{ numero, nombre, zona, colorFondo, efectos: { camuflaje?, vision? }, oleadas }]`.

- [ ] Commit `feat: los cinco capítulos de la campaña`.

### Task 5: Partida que se completa

**Files:** Modify `www/js/sistemas/partida.js`; Test `tests/partida.test.js`

**Interfaces:** `crearPartida({ ..., repetir = true, camuflaje = null })`; nuevo estado `'completada'` cuando el director termina.

- [ ] Commit `feat: la partida se completa al terminar las oleadas`.

### Task 6: Selector de capítulos

**Files:** Create `www/js/escenas/capitulos.js`; Test `tests/capitulos-escena.test.js`

- [ ] Commit `feat: selector de capítulos`.

### Task 7: Jugar un capítulo

**Files:** Modify `www/js/escenas/juego.js`, `www/js/escenas/menu.js`, `www/js/main.js`; Create `www/js/graficos/zonas.js`; Test `tests/juego.test.js`, `tests/menu.test.js`

**Interfaces:** `escenaJuego({ ..., capitulos })`; `entrar({ capitulo })`; estado `'completado'` con botones `SIGUIENTE` (si hay otro capítulo) y `MENÚ`.

- [ ] Commit `feat: jugar los capítulos del Modo Historia`. Docs aparte.
