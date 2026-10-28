# Pantalla de carga — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pantalla inicial con el logo "ASTRO DEFENSOR" animado sobre una partida fantasma (la nave juega sola), con "TOCA PARA EMPEZAR".

**Architecture:** Se extrae la simulación de una partida de `escenas/juego.js` a `sistemas/partida.js`, para que la usen tanto el juego como la partida fantasma. Un piloto automático puro (`sistemas/piloto.js`) produce un "dedo virtual". El logo usa una fuente pixel propia (`graficos/fuente.js`).

**Tech Stack:** Canvas 2D, ES modules, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md` (sección 9, pantalla 1)

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas ni imágenes.
- Commits a nombre de David, sin atribución; PR sin atribución. Cada commit deja el juego funcionando.
- Hasta que exista el menú (`feature/menu-principal`), tocar en la pantalla de carga lleva directo al juego.

## Review Focus

- Toque durante la animación de entrada → se ignora hasta que termine la carga (1.5 s), para no saltarse el logo sin querer (test en Task 4 con el estado de la escena).
- La nave fantasma muere → la partida fantasma se reinicia sola, sin pantalla de fin (test en Task 4).
- Sin enemigos en pantalla → el piloto vuelve al centro, no se queda pegado a un borde (test en Task 2).
- Bala enemiga acercándose a la nave fantasma → la esquiva (test en Task 2).
- Refactor de la partida → el juego se comporta igual que antes (pruebas de Task 1 + verificación en navegador).

---

### Task 1: Extraer la partida

**Files:** Create `www/js/sistemas/partida.js`; Modify `www/js/escenas/juego.js`; Test `tests/partida.test.js`

**Interfaces:**
- `crearPartida({ oleadas }) -> { jugador, flota, balasEnemigas, puntos, estado: 'jugando' | 'muriendo' | 'terminada', update(dt, puntero), draw(ctx) }`. Contiene jugador, balas, flota, director, power-ups, explosiones, bomba, destello y la espera de 1.5 s tras morir. No dibuja estrellas ni HUD.
- `escenaJuego` queda con lo propio de la escena: estrellas, toques, pausa, HUD y fin (`estado` de escena `jugando | pausa | fin`).

- [ ] Tests: arranca `jugando` con 0 puntos; destruir un explorador con una bala suma 100; con 1 vida, una bala enemiga sobre la nave pasa a `muriendo` y tras 1.5 s a `terminada`.
- [ ] Fallar → implementar → pasar; verificar en navegador que el juego sigue igual. Commit `refactor: extraer la simulación de la partida de la escena de juego`.

### Task 2: Piloto automático

**Files:** Create `www/js/sistemas/piloto.js`; Test `tests/piloto.test.js`

**Interfaces:** `pilotar(jugador, flota, balasEnemigas, alto) -> { activo: true, x, y }` (posición del dedo virtual; la nave queda 60 por encima):
- Altura deseada de la nave `alto * 0.8` → dedo en `alto * 0.8 + 60`.
- Objetivo x: el enemigo más bajo que esté por encima de la nave; sin enemigos, `180`.
- Esquiva: si una bala enemiga que baja está a menos de 140 por encima y a menos de 26 en x, o un enemigo a menos de 90 por encima y 30 en x, el objetivo x se aleja 70 hacia el lado contrario.
- x limitado a `[20, 340]`.

- [ ] Tests (alinear, centro sin enemigos, ignorar enemigos debajo, esquivar bala, esquivar choque, límites) → fallar → implementar → pasar. Commit `feat: piloto automático para la partida fantasma`.

### Task 3: Fuente pixel y logo

**Files:** Create `www/js/graficos/fuente.js`, `www/js/graficos/logo.js`; Test `tests/fuente.test.js`

**Interfaces:**
- `GLIFOS` (5×7, letras `A D E F N O R S T` y espacio), `medirTexto(texto, escala) -> number` (`(n*6 - 1) * escala`), `dibujarTextoPixel(ctx, texto, x, y, escala, color)` (centrado en x, y arriba).
- `animacionLetra(t, i) -> { dy, alpha }`: la letra i empieza a los `0.07 * i` s y cae 40 en 0.5 s con *ease-out*; antes `alpha 0`, después `dy 0, alpha 1`.
- `dibujarLogo(ctx, x, y, t)`: "ASTRO" escala 8 y "DEFENSOR" escala 5, sombra `COLORS.pink` desplazada 3, frente `COLORS.accent`, flotación suave `sin(t*2)*3`.

- [ ] Tests (glifos 7×5, medir, animación al inicio/medio/final) → fallar → implementar → pasar. Commit `feat: fuente pixel y logo animado`.

### Task 4: Escena de carga

**Files:** Create `www/js/escenas/carga.js`; Modify `www/js/main.js`, `README.md`; Test `tests/carga.test.js`

**Interfaces:** `escenaCarga({ estrellas, puntero, irA })`; `irA(nombre)` cambia de escena. Expone `listo` (true tras `CARGA = 1.5` s) para pruebas.
- Barra "CARGANDO" de 0 a 100 % en 1.5 s, luego "TOCA PARA EMPEZAR" parpadeando.
- Partida fantasma de fondo con `pilotar`, velada al 45 % para que el logo se lea; cuando `estado === 'terminada'`, se crea otra.
- Toques antes de `listo` se descartan; después, cualquier toque → `irA('juego')`.
- `main.js`: registra `carga` y arranca en ella.

- [ ] Tests (toque temprano ignorado, toque tardío va al juego, partida fantasma se reinicia) → fallar → implementar → pasar. Verificar en navegador (captura a 0.5 s y a 4 s; tocar → juego). Commits `feat: pantalla de carga con logo y partida fantasma`, `docs: actualizar estructura en el README`.
- [ ] Push y PR `Pantalla de carga: logo animado y partida fantasma`.
