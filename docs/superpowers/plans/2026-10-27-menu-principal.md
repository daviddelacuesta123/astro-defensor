# Menú principal — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menú principal con Modo Historia, Modo Libre y Configuración sobre la partida fantasma, y navegación entre carga → menú → juego → menú.

**Architecture:** La partida fantasma pasa a un módulo compartido (`sistemas/fantasma.js`) que usan la carga y el menú, así el fondo no se corta al cambiar de pantalla. Las escenas con botones exponen `botones()` (los botones visibles en ese momento) para dibujarlos y para probarlos. Además se reemplaza el servidor de desarrollo (pedido de David tras el PR #5).

**Tech Stack:** Canvas 2D, ES modules, `node --test`, Node `http` para el servidor de desarrollo.

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md` (sección 9, pantallas 2 y 5)

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas.
- Commits a nombre de David, sin atribución; PR sin atribución. Cada commit deja el juego funcionando.
- Modo Historia y Configuración aún no existen: sus botones muestran "PRÓXIMAMENTE" 1.5 s sin cambiar de escena. Modo Libre lleva al juego actual.

## Review Focus

- El toque que lleva de la carga al menú → no debe activar a la vez un botón del menú (test en Task 3).
- Volver al menú desde la pausa → la partida abandonada no sigue corriendo ni deja la escena en pausa al volver a jugar (test en Task 4).
- `localhost` resolviendo a IPv6 (`::1`) → el servidor responde igual (verificación en Task 1).
- Tocar "PRÓXIMAMENTE" varias veces seguidas → el aviso se reinicia, no se acumula (test en Task 3).
- La partida fantasma no se reinicia al pasar de la carga al menú (test en Task 2).

---

### Task 1: Servidor de desarrollo propio

**Files:** Create `scripts/servidor.mjs`; Modify `package.json` (`"serve": "node scripts/servidor.mjs"`)

- Sirve `www/` en el puerto 8080 (o `PUERTO`), escuchando en `::` con `ipv6Only: false` (IPv4 + IPv6). Tipos MIME de html/js/css/png/svg/json; 404 para lo que no existe; evita salir de `www/` (`..`). Sin caché.
- [ ] Verificar: `curl` a `http://localhost:8080`, `http://127.0.0.1:8080` y `http://[::1]:8080` → 200; `/../package.json` → 404. Commit `fix: servidor de desarrollo propio que funciona con localhost`.

### Task 2: Partida fantasma compartida

**Files:** Create `www/js/sistemas/fantasma.js`; Modify `www/js/escenas/carga.js`, `www/js/main.js`; Test `tests/fantasma.test.js`, `tests/carga.test.js`

**Interfaces:** `crearFantasma({ oleadas }) -> { partida, update(dt, alto), draw(ctx) }` — pilota con `pilotar` y crea otra partida al terminar. `escenaCarga({ estrellas, puntero, irA, fantasma })`.

- [ ] Mover el test de reinicio de `carga.test.js` a `fantasma.test.js`; la carga ahora va a `irA('menu')`. Fallar → implementar → pasar. Commit `refactor: partida fantasma compartida entre pantallas`.

### Task 3: Escena del menú

**Files:** Create `www/js/escenas/menu.js`; Modify `www/js/main.js`; Test `tests/menu.test.js`

**Interfaces:** `escenaMenu({ estrellas, puntero, irA, fantasma })`; `botones() -> [MODO HISTORIA, MODO LIBRE, CONFIGURACIÓN]` (210×46, centrados, desde `view.H * 0.52`, separados 62); `aviso: { texto, restante } | null`.
- Logo ya armado (sin animación de entrada) en `view.H * 0.12`; botones; versión al pie.
- MODO LIBRE → `irA('juego')`; los otros dos → `aviso = { texto: 'PRÓXIMAMENTE', restante: 1.5 }` (se reinicia en cada toque).
- `entrar()` descarta toques pendientes.

- [ ] Tests (libre va al juego, historia/config muestran aviso, aviso caduca, aviso se reinicia, toque previo descartado) → fallar → implementar → pasar. Commit `feat: menú principal con modos de juego`.

### Task 4: Volver al menú desde el juego

**Files:** Modify `www/js/escenas/juego.js`, `www/js/main.js`, `README.md`; Test `tests/juego.test.js`

**Interfaces:** `escenaJuego({ estrellas, puntero, irA })`; `botones()` según estado: pausa → CONTINUAR, REINICIAR, SALIR AL MENÚ; fin → REINTENTAR, MENÚ; jugando → [botón de pausa].
- [ ] Tests (salir al menú desde pausa → `irA('menu')`; MENÚ desde fin → `irA('menu')`; volver a entrar empieza `jugando` con partida nueva) → fallar → implementar → pasar. Verificar el recorrido completo en navegador. Commits `feat: salir al menú desde la pausa y el fin de partida`, `docs: actualizar el README`.
- [ ] Push y PR `Menú principal: modos de juego y navegación`.
