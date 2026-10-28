# Modo Libre — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supervivencia infinita: oleadas generadas sin fin con dificultad creciente, aviso de cada oleada, y récord guardado en el teléfono.

**Architecture:** Un generador puro (`sistemas/generador.js`) crea la oleada n. El director acepta, además de una lista, una función `(n) => oleada`. Un módulo de guardado (`sistemas/guardado.js`) envuelve `localStorage` con try/catch. La escena `juego` pasa a ser el Modo Libre.

**Tech Stack:** Canvas 2D, ES modules, `localStorage`, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md` (secciones 8 "Modo Libre" y 10 "Guardado")

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas.
- Commits a nombre de David, sin atribución; PR sin atribución. Cada commit deja el juego funcionando.
- `localStorage` puede fallar (modo privado, almacenamiento bloqueado): el juego debe funcionar igual, solo que sin récord persistente.

## Review Focus

- `localStorage` que lanza error al leer o escribir → el juego sigue, récord 0 (test en Task 1).
- Valor guardado corrupto (`"abc"`, negativo) → se trata como 0 (test en Task 1).
- Oleada 50 o más → los números no se desbordan: cantidad y tiradores tienen tope, el intervalo tiene mínimo (test en Task 3).
- Empatar el récord → no cuenta como nuevo récord (test en Task 4).
- Reintentar después de un nuevo récord → el aviso "NUEVO RÉCORD" no se queda pegado en la siguiente partida (test en Task 4).

---

### Task 1: Guardado

**Files:** Create `www/js/sistemas/guardado.js`; Test `tests/guardado.test.js`

**Interfaces:** `obtenerAlmacen()` (localStorage o `undefined` si acceder lanza error) y `crearGuardado(almacen) -> { leerNumero(clave, defecto = 0), escribir(clave, valor) }`. Claves con prefijo `astro.`. `leerNumero` devuelve `defecto` si no hay valor, si no es un número finito ≥ 0 o si el almacén lanza error; `escribir` ignora errores.

- [ ] Tests (lee lo escrito, prefijo, defecto, corrupto, almacén que lanza, sin almacén) → fallar → implementar → pasar. Commit `feat: guardado local tolerante a fallos`.

### Task 2: Director con oleadas generadas

**Files:** Modify `www/js/sistemas/oleadas.js`; Test `tests/oleadas.test.js`

**Interfaces:** `crearDirector(oleadas)` acepta un arreglo (como hasta ahora, con ciclos) o una función `(n) => oleada`; con función, `oleada` crece sin fin y `ciclo` queda en 0.

- [ ] Test: con función, tras 3 oleadas vaciadas `director.oleada === 3` y se pidió `(0), (1), (2), (3)` en orden. Fallar → implementar → pasar. Commit `feat: el director acepta oleadas generadas`.

### Task 3: Generador de oleadas infinitas

**Files:** Create `www/js/sistemas/generador.js`; Test `tests/generador.test.js`

**Interfaces:** `generarOleada(n, rng = Math.random) -> Array<{ t, tipo, x }>` ordenada por `t`:
- Cantidad objetivo `min(30, 6 + 2n)`; se arma con formaciones (`linea`, `fila`, `ve`) separadas por `max(0.6, 2 - 0.1n)` s.
- Tipos: oleada 0 solo exploradores; zigzag desde la 1; tiradores desde la 2, como máximo `min(4, 1 + floor(n / 3))`.
- `x` dentro de `[20, 340]`.

- [ ] Tests (ordenada, oleada 0 solo exploradores, sin tiradores antes de la 2, topes en la 60, crece con n, x en rango, determinista con rng fijo) → fallar → implementar → pasar. Commit `feat: generador de oleadas infinitas con dificultad creciente`.

### Task 4: Integración del Modo Libre

**Files:** Modify `www/js/escenas/juego.js`, `www/js/escenas/menu.js`, `www/js/main.js`, `README.md`; Test `tests/juego.test.js`, `tests/menu.test.js`

**Interfaces:** `escenaJuego({ estrellas, puntero, irA, guardado, oleadas })` con `record` y `nuevoRecord`; clave `recordLibre`. `escenaMenu({ ..., guardado })` muestra `RÉCORD n` bajo los botones si es > 0.
- Al llegar a `fin`: si `puntos > record` → guarda, `nuevoRecord = true`. Pantalla de fin: PUNTAJE, RÉCORD y "¡NUEVO RÉCORD!" parpadeando.
- Aviso "OLEADA n" (n desde 1) centrado durante 2 s al empezar cada oleada.

- [ ] Tests (supera → guarda y avisa; empata → no; reintentar limpia el aviso; menú lee el récord) → fallar → implementar → pasar. Verificar en navegador (aviso de oleada, récord tras perder, récord en el menú). Commits `feat: modo libre con oleadas infinitas y récord`, `docs: actualizar el README`.
- [ ] Push y PR `Modo Libre: oleadas infinitas y récord`.
