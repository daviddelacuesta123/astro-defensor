# Lienzo base — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Base técnica del juego: canvas escalable, game loop, gestor de escenas, fondo de estrellas y una escena provisional visible; con pruebas automáticas de la lógica pura.

**Architecture:** Módulos ES nativos en `www/js/`. Lo que toca el DOM (`render.js`, `main.js`) queda separado de la lógica pura (`escenas/gestor.js`, `fondo/estrellas.js`, `util.js`), que se prueba con `node --test` sin dependencias nuevas.

**Tech Stack:** HTML5 Canvas 2D, JavaScript (ES modules), Node 20+ test runner, Capacitor 8 (ya en `main`).

**Spec:** `docs/superpowers/specs/2026-10-27-astro-defensor-design.md`

## Global Constraints

- Mundo lógico de ancho fijo `W = 360`; alto `view.H = max(560, round(360 * altoPantalla / anchoPantalla))`.
- Fondo `#05060f`; paleta neón de `COLORS` en `config.js`.
- Sin bundler ni librerías de juego. Sin dependencias nuevas en `package.json`.
- Código e identificadores en español cuando sean nombres de dominio (escenas, estrellas); comentarios en español.
- Commits en español con prefijos `feat:`, `fix:`, `docs:`, `chore:`, `test:`; a nombre de David, sin líneas de coautoría ni atribución.
- Rama `feature/lienzo-base` desde `main`; PR a `main`; nunca mergear.

## Review Focus

- Pestaña en segundo plano y vuelta: el primer frame recibe un `dt` enorme → debe acotarse a 0.05 s (test en Task 1).
- Cambio de escena a un nombre no registrado → error claro, no un fallo silencioso con `undefined` (test en Task 2).
- Rotación / cambio de tamaño de ventana → las estrellas fuera del nuevo alto deben reaparecer dentro (test en Task 3).
- Pantallas muy anchas (tablet horizontal) → el alto lógico nunca baja de 560 (test en Task 1).
- `devicePixelRatio` alto (3+) → se limita a 3 para no reventar memoria (cubierto por `render.js`, verificación manual en Task 4).

---

### Task 1: Configuración de pruebas y utilidades del loop

**Files:**
- Modify: `package.json` (agregar `"type": "module"` y script `"test": "node --test \"tests/**/*.test.js\""`; en Node 24 pasar la carpeta `tests/` no funciona)
- Create: `www/js/util.js`
- Create: `tests/util.test.js`
- Commit también: `docs/superpowers/specs/2026-10-27-astro-defensor-design.md`, este plan (commit `docs:` previo)

**Interfaces:**
- Produces: `clampDt(ms: number) -> number` (segundos, en `[0, 0.05]`); `altoLogico(anchoPx: number, altoPx: number) -> number`.

- [ ] **Step 1:** Commit de documentos: `docs: documento de diseño y plan del lienzo base`.
- [ ] **Step 2: Test que falla** — `tests/util.test.js`:
  - `clampDt(16)` ≈ `0.016`; `clampDt(5000) === 0.05`; `clampDt(-10) === 0`.
  - `altoLogico(360, 640) === 640`; `altoLogico(1080, 2400) === 800`; `altoLogico(2000, 1000) === 560`.
- [ ] **Step 3:** `npm test` → FALLA (módulo no existe).
- [ ] **Step 4:** Implementar ambas funciones en `www/js/util.js`.
- [ ] **Step 5:** `npm test` → PASA.
- [ ] **Step 6:** Commit `chore: configurar pruebas con node --test y utilidades del loop`.

### Task 2: Gestor de escenas

**Files:**
- Create: `www/js/escenas/gestor.js`
- Create: `tests/gestor.test.js`

**Interfaces:**
- Produces: `crearGestorEscenas() -> { registrar(nombre, escena), ir(nombre, params?), update(dt), draw(ctx), actual: string|null }`.
  Una escena es un objeto con métodos opcionales `entrar(params)`, `salir()`, `update(dt)`, `draw(ctx)`.

- [ ] **Step 1: Test que falla** — `tests/gestor.test.js`:
  - `ir('a')` llama `a.entrar(params)` y `actual === 'a'`.
  - `ir('b')` desde `a` llama `a.salir()` antes de `b.entrar()` (verificar orden con un arreglo de eventos).
  - `update(0.1)` y `draw(ctx)` delegan solo a la escena actual.
  - Escena sin métodos opcionales no lanza error.
  - `ir('noExiste')` lanza `Error` cuyo mensaje contiene `noExiste`.
  - `update`/`draw` sin escena actual no lanzan.
- [ ] **Step 2:** `npm test` → FALLA.
- [ ] **Step 3:** Implementar en `www/js/escenas/gestor.js` (Map de escenas).
- [ ] **Step 4:** `npm test` → PASA.
- [ ] **Step 5:** Commit `feat: gestor de escenas con entrar/salir/update/draw`.

### Task 3: Fondo de estrellas con parallax

**Files:**
- Create: `www/js/fondo/estrellas.js`
- Create: `tests/estrellas.test.js`

**Interfaces:**
- Consumes: `W` de `config.js`.
- Produces: `crearEstrellas({ cantidad = 90, alto, rng = Math.random }) -> { estrellas: Array<{x, y, vel, tam, brillo}>, update(dt, alto), draw(ctx) }`.
  Tres capas: `vel` en {20, 45, 90} unidades/s, `tam` 1, 1, 2.

- [ ] **Step 1: Test que falla** — `tests/estrellas.test.js` (con `rng` determinista):
  - Crea exactamente `cantidad` estrellas, todas con `0 <= x < 360` y `0 <= y < alto`.
  - `update(1, alto)` aumenta `y` de cada estrella en su `vel` (si no se sale).
  - Una estrella con `y >= alto` tras `update` reaparece con `y < 0` y `x` en `[0, 360)`.
  - `update(0, 500)` tras crear con `alto: 800` deja todas las estrellas con `y < 500` (reubica las que quedaron fuera).
- [ ] **Step 2:** `npm test` → FALLA.
- [ ] **Step 3:** Implementar; `draw` pinta rectángulos de `tam` con `globalAlpha = brillo` usando `COLORS.text`.
- [ ] **Step 4:** `npm test` → PASA.
- [ ] **Step 5:** Commit `feat: fondo de estrellas con parallax de tres capas`.

### Task 4: Integración del loop y escena provisional

**Files:**
- Modify: `www/js/render.js` (usar `altoLogico`)
- Modify: `www/js/main.js` (usar `clampDt`, gestor y estrellas)
- Create: `www/js/escenas/provisional.js`
- Commit también: `www/index.html`, `www/style.css`, `www/js/config.js`
- Modify: `README.md` (sección "Desarrollo": `npm run serve`, `npm test`)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: `escenaProvisional(estrellas) -> escena` que muestra "ASTRO DEFENSOR" centrado en `COLORS.accent` y "lienzo base" en `COLORS.dim`, sobre las estrellas. `main.js` exporta nada; arranca el gestor con `ir('provisional')`.

- [ ] **Step 1:** Implementar cambios; `resize` también actualiza el alto de las estrellas en el siguiente `update`.
- [ ] **Step 2:** `npm test` → PASA (sin regresiones).
- [ ] **Step 3:** `npm run serve` y abrir `http://localhost:8080` en modo dispositivo móvil del navegador: se ven estrellas cayendo a tres velocidades y el título nítido (sin borrosidad con DPR 3); al rotar/cambiar tamaño no quedan zonas sin estrellas; la consola no tiene errores.
- [ ] **Step 4:** Commit `feat: integrar loop, gestor de escenas y escena provisional`.
- [ ] **Step 5:** Commit `docs: instrucciones de desarrollo en el README`.
- [ ] **Step 6:** `git push -u origin feature/lienzo-base` y `gh pr create --base main` con título `Lienzo base: canvas, loop, escenas y estrellas`, cuerpo con resumen, cómo probar (`npm test`, `npm run serve`), sin atribución.
- [ ] **Step 7:** Esperar aprobación de David. No mergear.
