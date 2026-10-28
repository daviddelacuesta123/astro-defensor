# Configuración — Plan de implementación

**Goal:** Pantalla de ajustes (volumen de música y efectos, vibración, sensibilidad, borrar progreso) que se guardan en el teléfono. La sensibilidad cambia cómo responde la nave y la vibración se siente al recibir un golpe.

**Architecture:** Un módulo puro (`sistemas/configuracion.js`) lee los ajustes del guardado, los acota a su rango y los guarda al cambiar. La escena `configuracion` dibuja una fila por ajuste con `−` / `+` o un interruptor. La partida recibe la sensibilidad y una función `vibrar(ms)`; quien toca `navigator` es solo `main.js`.

**Tech Stack:** Canvas 2D, ES modules, `localStorage`, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md` y `TAREAS.md` (feature 8).

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas.
- Commits sin atribución; PR sin atribución. Cada commit deja el juego funcionando.
- El audio todavía no existe (feature 9): los volúmenes solo se guardan.

## Review Focus

- Valor fuera de rango (150, −3) → se acota; sensibilidad que no cae en un paso de 0,25 → se redondea al paso (test en Task 2).
- Valor guardado corrupto → vuelve al defecto (test en Task 2).
- Borrar progreso sin confirmar no borra nada; "NO" vuelve a la pantalla sin cambios (test en Task 4).
- Con la vibración apagada, `vibrar` no llama al motor (test en Task 3).

---

### Task 1: Borrar claves del guardado

**Files:** Modify `www/js/sistemas/guardado.js`; Test `tests/guardado.test.js`

**Interfaces:** `guardado.borrar(clave)` quita la clave con `removeItem`; ignora errores como `escribir`.

- [ ] Tests (borra y vuelve al defecto, almacén que lanza) → fallar → implementar → pasar. Commit `feat: borrar claves del guardado`.

### Task 2: Ajustes con rangos y persistencia

**Files:** Create `www/js/sistemas/configuracion.js`; Test `tests/configuracion.test.js`

**Interfaces:** `crearConfiguracion(guardado) -> { valores, cambiar(clave, valor), subir(clave), bajar(clave) }`. Ajustes: `volMusica` (0–100, defecto 70, paso 10), `volEfectos` (0–100, defecto 80, paso 10), `vibracion` (0/1, defecto 1), `sensibilidad` (0,5–2, defecto 1, paso 0,25).

- [ ] Tests (defectos, acotado, redondeo al paso, subir/bajar en los bordes, persiste y relee, clave desconocida) → fallar → implementar → pasar. Commit `feat: ajustes del juego con rangos y guardado`.

### Task 3: Sensibilidad y vibración en la partida

**Files:** Create `www/js/sistemas/vibracion.js`; Modify `www/js/sistemas/partida.js`, `www/js/escenas/juego.js`; Test `tests/vibracion.test.js`, `tests/partida.test.js`

**Interfaces:** `crearVibrador(configuracion, motor) -> vibrar(ms)`. `crearPartida({ oleadas, sensibilidad = 1, vibrar })` pasa la sensibilidad a `jugador.update` y llama `vibrar` al perder una vida (más largo al perder la última). `escenaJuego({ ..., configuracion, vibrar })` los pasa al crear la partida.

- [ ] Tests (vibrador respeta el ajuste, sin motor no falla, la partida vibra al perder una vida, la sensibilidad mueve la nave más rápido) → fallar → implementar → pasar. Commit `feat: la sensibilidad y la vibración llegan a la partida`.

### Task 4: Pantalla de configuración

**Files:** Create `www/js/escenas/configuracion.js`; Modify `www/js/escenas/menu.js`, `www/js/main.js`, `README.md`, `TAREAS.md`; Test `tests/configuracion-escena.test.js`, `tests/menu.test.js`

**Interfaces:** `escenaConfiguracion({ estrellas, puntero, irA, fantasma, configuracion, guardado })` con `estado: 'ajustes' | 'confirmar'`. Cada botón tiene `id` (por ejemplo `volMusica+`) además del texto. "BORRAR PROGRESO" pide confirmación; "SÍ" pone `recordLibre` en 0.

- [ ] Tests (subir/bajar cambian y guardan, interruptor de vibración, confirmar borra el récord, "NO" no borra, "VOLVER" lleva al menú) → fallar → implementar → pasar. Commit `feat: pantalla de configuración`. Docs en commit aparte.
