# Easter eggs — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dos secretos en el menú: tocar el logo 7 veces alterna una nave dorada, y mantener presionado "v1.0 · UPB" 3 segundos abre unos créditos ocultos.

**Architecture:** La detección de gestos es pura (`sistemas/secretos.js`). La nave elegida se guarda con `guardado` y la partida recibe el sprite a usar. Los créditos son una escena nueva (`escenas/creditos.js`) con el texto en `datos/creditos.js`.

**Tech Stack:** Canvas 2D, ES modules, `node --test`.

**Spec:** pedido de David (28/10/2026): easter eggs 1 y 2. Equipo: David De La Cuesta y Sara Valentina Ochoa.

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas.
- Commits a nombre de David, sin atribución; PR sin atribución. Cada commit deja el juego funcionando.
- Nada en pantalla delata los secretos antes de descubrirlos.

## Review Focus

- Toques lentos al logo (más de 1 s entre uno y otro) → el conteo se reinicia (test en Task 1).
- Soltar el dedo antes de 3 s o salir de la zona de la versión → no abre los créditos (tests en Tasks 1 y 4).
- Mantener presionado más de 3 s → abre los créditos una sola vez, no en cada cuadro (test en Task 1).
- La partida fantasma del fondo no usa la nave dorada (solo las partidas del jugador) (test en Task 3).
- El toque que cierra los créditos no activa un botón del menú al volver (test en Task 4).

---

### Task 1: Gestos secretos

**Files:** Create `www/js/sistemas/secretos.js`; Test `tests/secretos.test.js`

**Interfaces:**
- `crearToquesSeguidos({ necesarios = 7, ventana = 1 }) -> { registrar(t) -> boolean }`: true al completar `necesarios` toques con menos de `ventana` s entre uno y el siguiente; después vuelve a contar desde 0.
- `crearPulsacionLarga({ duracion = 3 }) -> { progreso, update(dt, presionado) -> boolean }`: true una sola vez al llegar a `duracion` s con el dedo presionado; se rearma al soltar.

### Task 2: Nave dorada

**Files:** Modify `www/js/graficos/sprites.js` (`NAVE_DORADA`, misma figura que `NAVE_AD7` con paleta dorada), `www/js/sistemas/partida.js` (`crearPartida({ ..., sprite = NAVE_AD7 })`, expone `partida.sprite`), `www/js/escenas/juego.js` (lee `guardado.leerNumero('naveDorada')`); Test `tests/juego.test.js`, `tests/partida.test.js`.

### Task 3: Secretos en el menú

**Files:** Modify `www/js/escenas/menu.js`; Test `tests/menu.test.js`
- Zona del logo: `x` en [30, 330], `y` en [`view.H*0.12 - 10`, `view.H*0.12 + 135`]. 7 toques seguidos alternan `naveDorada` (0/1). Aviso de 2 s donde va el récord: la primera vez "NAVE SECRETA DESBLOQUEADA" (y guarda `naveSecreta = 1`); después "NAVE DORADA ACTIVADA" / "NAVE CLÁSICA ACTIVADA". Suena `powerup`.
- Zona de la versión: `x` en [110, 250], `y` a ±16 de `view.H - 20`. Mantener 3 s → suena `powerup` e `irA('creditos')`.

### Task 4: Créditos ocultos

**Files:** Create `www/js/datos/creditos.js`, `www/js/escenas/creditos.js`; Modify `www/js/main.js` (registro y música `menu`), `README.md`, `TAREAS.md`; Test `tests/creditos.test.js`
- Texto que sube lentamente sobre las estrellas, con la nave cruzando. Incluye "UN JUEGO DE", "DAVID DE LA CUESTA", "SARA VALENTINA OCHOA", "APLICACIONES MÓVILES · UPB · 2026" y "GRACIAS POR JUGAR". Al terminar vuelve a empezar.
- Cualquier toque → `irA('menu')`. `entrar()` descarta toques pendientes.
- [ ] Push y PR `Easter eggs: nave dorada y créditos ocultos`.
