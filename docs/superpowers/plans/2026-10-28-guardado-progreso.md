# Guardado del progreso — Plan de implementación

**Goal:** Quien nunca jugó el Modo Historia solo puede empezar en el capítulo 1; los demás aparecen bloqueados. Completar un capítulo desbloquea el siguiente y guarda su mejor puntaje. "Borrar progreso" lo reinicia todo.

**Architecture:** Un módulo puro (`sistemas/progreso.js`) lee y escribe en el guardado las claves `capituloMax` y `mejorCap1` a `mejorCap5`. Lee del guardado en cada consulta, así el selector ve enseguida lo que borró la configuración. La escena de juego avisa al progreso al completar un capítulo; el selector pregunta qué está desbloqueado.

**Tech Stack:** Canvas 2D, ES modules, `localStorage`, `node --test`.

**Spec:** `TAREAS.md` (feature 13; se adelanta a la 11 a pedido del equipo, sus dependencias ya están).

## Global Constraints

- `W = 360`, alto `view.H`. Paleta de `COLORS`. Sin dependencias nuevas.
- Commits sin atribución; PR sin atribución. Cada commit deja el juego funcionando.

## Review Focus

- Sin nada guardado, solo el capítulo 1 está desbloqueado (test en Task 1).
- Completar un capítulo viejo no vuelve a bloquear ni desbloquea dos veces; nunca pasa de 5 (test en Task 1).
- Un valor guardado corrupto o fuera de rango (`capituloMax` = 9 o 0) se acota (test en Task 1).
- Un puntaje menor no pisa el mejor (test en Task 1).
- Tocar un capítulo bloqueado no lo abre (test en Task 3).

---

### Task 1: Progreso de la campaña

**Files:** Create `www/js/sistemas/progreso.js`; Test `tests/progreso.test.js`

**Interfaces:** `crearProgreso(guardado, total = 5) -> { capituloMax(), desbloqueado(n), mejor(n), completar(n, puntos) -> { nuevoMejor, desbloqueado } }`; `CLAVES_HISTORIA` con todas las claves.

- [ ] Commit `feat: progreso de la campaña guardado`.

### Task 2: Completar desbloquea

**Files:** Modify `www/js/escenas/juego.js`, `www/js/main.js`; Test `tests/juego.test.js`

- [ ] La escena llama `progreso.completar` y muestra "¡NUEVO MEJOR PUNTAJE!" y "CAPÍTULO n DESBLOQUEADO". Commit `feat: completar un capítulo desbloquea el siguiente`.

### Task 3: Selector con candados

**Files:** Modify `www/js/escenas/capitulos.js`; Test `tests/capitulos-escena.test.js`

- [ ] Bloqueados atenuados con candado; tocarlos muestra "BLOQUEADO". Desbloqueados muestran su mejor puntaje. Commit `feat: capítulos bloqueados en el selector`.

### Task 4: Borrar progreso

**Files:** Modify `www/js/escenas/configuracion.js`; Test `tests/configuracion-escena.test.js`

- [ ] Commit `feat: borrar progreso reinicia los capítulos`. Docs aparte.
