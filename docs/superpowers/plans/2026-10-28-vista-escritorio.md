# Vista de escritorio — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el juego se pueda jugar en el navegador de un PC: columna vertical centrada con proporción de celular, paneles laterales con información y controles, y control por teclado.

**Problema actual:** el canvas ocupa toda la ventana con ancho lógico fijo de 360. En una ventana apaisada (por ejemplo 1366×768) la escala es 1366/360 ≈ 3,8 y el alto lógico mínimo (560) mide unos 2100 px: solo se ve la parte de arriba del juego.

**Architecture:** Una función pura `calcularMarco(anchoVentana, altoVentana)` decide dónde va el juego. El canvas se dibuja dentro de ese marco y la entrada convierte coordenadas con el rectángulo del canvas. El teclado es un módulo puro (`entrada/teclado.js`) que produce un "dedo virtual" para la nave. Los paneles laterales son HTML/CSS que solo se muestran en modo escritorio.

**Tech Stack:** Canvas 2D, HTML/CSS, ES modules, `node --test`.

**Spec:** pedido de David (28/10/2026): "una vista navegador para el PC".

## Global Constraints

- En el celular (y en ventanas de proporción de celular) todo se ve igual que ahora.
- `W = 360` sigue fijo. Sin dependencias nuevas. Commits a nombre de David, sin atribución.

## Review Focus

- Ventana apaisada baja (1366×768) → el juego entero cabe en alto, sin recortes (verificación en navegador).
- Clic en un botón dentro de la columna centrada → toca ese botón (las coordenadas tienen en cuenta el desplazamiento del canvas) (test en Task 1).
- Dos teclas opuestas a la vez (← y →) → la nave no se mueve en ese eje (test en Task 2).
- La ventana pierde el foco con una tecla presionada → la nave no sigue moviéndose sola (test en Task 2).
- Ventana estrecha pero de PC (por ejemplo 700×900) → no hay espacio para paneles: se ocultan (verificación en navegador).

---

### Task 1: Marco del juego y coordenadas

**Files:** Create `www/js/marco.js`; Modify `www/js/render.js`, `www/js/entrada/coordenadas.js` (`aLogicasEnRect`), `www/js/entrada/puntero.js`; Test `tests/marco.test.js`, `tests/entrada.test.js`

**Interfaces:**
- `calcularMarco(ancho, alto) -> { x, y, ancho, alto, escritorio }`: si `ancho / alto <= 0.62` usa toda la ventana (`escritorio: false`); si no, una columna centrada de ancho `round(alto * 0.5)` y alto completo (`escritorio: true`).
- `aLogicasEnRect(clientX, clientY, rect, H)`: como `aLogicas`, restando `rect.left`/`rect.top` y usando `rect.width`/`rect.height`.

### Task 2: Teclado

**Files:** Create `www/js/entrada/teclado.js`; Test `tests/teclado.test.js`

**Interfaces:** `crearTeclado() -> { presionar(codigo) -> boolean, soltar(codigo), soltarTodo(), direccion() -> { dx, dy }, dedoVirtual(jugador) -> { activo, x, y } | null }`.
- Flechas y WASD; `presionar` devuelve si la tecla es de movimiento (para `preventDefault`).
- `dedoVirtual`: null sin teclas; si no, apunta 70 unidades en la dirección pedida desde la nave, más los 60 de desfase del dedo.

### Task 3: Teclado en el juego

**Files:** Modify `www/js/escenas/juego.js` (`teclado` opcional; `alternarPausa()`), `www/js/main.js` (keydown/keyup/blur; Esc y P alternan la pausa); Test `tests/juego.test.js`

### Task 4: Paneles laterales

**Files:** Modify `www/index.html`, `www/style.css`, `www/js/main.js` (clase `escritorio` en `body` y posición de los paneles); `README.md`, `TAREAS.md`
- Izquierda: título, "La Última Señal" y la sinopsis en 3 líneas. Derecha: controles con mouse y teclado, y los modos de juego.
- Se ocultan si a cada lado quedan menos de 220 px.
- [ ] Verificar en navegador a 1366×768, 1920×1080, 700×900 y 390×844. Push y PR `Vista de escritorio para jugar en el PC`.
