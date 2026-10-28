# Astro Defensor — Tareas pendientes

Guía para seguir el desarrollo desde donde quedó. Antes de empezar, lee primero las secciones 1 a 4. Ahí está cómo funciona el proyecto y cómo se trabaja en Git. Después toma las features de la sección 6 **en orden**.

Documento de diseño completo (trama, pantallas y decisiones): [`docs/superpowers/specs/2026-10-27-astro-defensor-design.md`](docs/superpowers/specs/2026-10-27-astro-defensor-design.md).

---

## 1. Qué es el proyecto

**Astro Defensor** es un shooter vertical arcade para celular. Es una app híbrida: HTML5 Canvas y JavaScript empaquetados para Android con **Capacitor 8**. No usa motor de juego ni imágenes ni audio externos: todo se dibuja y se sintetiza por código.

- La nave sigue al dedo, unas 60 unidades por encima para que no se tape, y dispara sola.
- Pantallas: carga con logo y partida fantasma → menú (Modo Historia, Modo Libre, Configuración) → juego.
- **Trama** ("La Última Señal"): en el año 2387, el Enjambre Vex apaga los faros de salto que conectan la colonia de Kepler-442 con la Tierra. La piloto **Nova Ríos**, en el caza **AD-7 "Defensor"**, es la última defensa. La guía por radio la **Comandante Iriarte**. La campaña tiene 5 capítulos con jefe al final de cada uno (detalle en la feature 10).

## 2. Cómo correrlo

Requisitos: Node.js 20 o superior. Para Android, también Android Studio con el SDK.

```bash
npm install      # instala Capacitor
npm run serve    # abre el juego en http://localhost:8080
npm test         # corre las pruebas automáticas (hoy: 154, todas pasan)
npm run android  # copia www/ al proyecto Android y abre Android Studio
```

- En Chrome, para verlo como celular: **F12** y luego **Ctrl+Shift+M**, y elige un teléfono. Con el mouse, arrastra con el botón presionado.
- Si `npm run serve` dice que el puerto 8080 está ocupado, ya hay un servidor abierto en otra terminal.

## 3. Cómo está organizado el código

```
www/
  index.html, style.css
  js/
    main.js          arranque: crea las escenas, el game loop y conecta todo
    config.js        W = 360 (ancho lógico fijo), view.H (alto según la pantalla), COLORS (paleta neón)
    render.js        canvas escalado a la pantalla (DPR hasta 3)
    util.js          clampDt, altoLogico, apuntar
    escenas/         pantallas: gestor.js, carga.js, menu.js, juego.js (= Modo Libre), configuracion.js
    sistemas/        partida.js, fantasma.js, piloto.js, oleadas.js (director), generador.js,
                     colisiones.js, guardado.js, configuracion.js, vibracion.js
    entidades/       jugador.js, enemigos.js, balas.js, powerups.js, explosiones.js
    datos/           enemigos.js (tipos Vex), oleadas.js (formaciones y OLEADAS_PRUEBA)
    graficos/        sprites.js (pixel art en texto), fuente.js (fuente pixel), logo.js, hud.js, ui.js (botones)
    entrada/         coordenadas.js (estado del dedo, toques), puntero.js (eventos del DOM)
    fondo/           estrellas.js
scripts/servidor.mjs servidor de desarrollo
tests/               pruebas con node --test (una por módulo)
docs/superpowers/    diseño y un plan por feature (sirven de ejemplo)
android/             proyecto Android de Capacitor (todavía SIN commitear, ver feature 14)
```

### Piezas que vas a reutilizar

| Pieza | Para qué sirve | Cómo se usa |
|---|---|---|
| **Gestor de escenas** (`escenas/gestor.js`) | Una sola pantalla activa | Una escena es un objeto con `entrar(params)`, `salir()`, `update(dt)`, `draw(ctx)` y opcionalmente `pausar()`. Se registra en `main.js` con `escenas.registrar('nombre', escena)` y se cambia con `irA('nombre')`. |
| **Botones** (`graficos/ui.js`) | Menús dibujados en el canvas | `crearBoton({ texto, x, y, ancho, alto })` con `(x, y)` en el centro, `boton.contiene(px, py)` y `dibujarBoton(ctx, boton, color)`. Las escenas exponen `botones()` con los botones visibles: así se dibujan y así se prueban. |
| **Toques** (`entrada/coordenadas.js`) | Detectar toques en botones | `puntero.tomarToques()` devuelve los toques nuevos y los vacía. Llámalo en `entrar()` para descartar el toque que trajo a la pantalla. Solo cuenta el primer dedo. |
| **Partida** (`sistemas/partida.js`) | Simular una partida completa | `crearPartida({ oleadas })` devuelve `{ jugador, flota, balasEnemigas, puntos, oleada, estado: 'jugando' \| 'muriendo' \| 'terminada', update(dt, puntero), draw(ctx) }`. No dibuja estrellas ni HUD. `oleadas` puede ser una **lista** (se repite en ciclos) o una **función** `(n) => oleada` (infinito). |
| **Oleada** | Datos de enemigos | Arreglo de `{ t, tipo, x, vel? }` ordenado por `t` (segundos). Formaciones listas: `linea`, `fila`, `ve` en `datos/oleadas.js`. |
| **Enemigos** (`datos/enemigos.js`) | Tipos Vex | `explorador`, `zigzag`, `tirador`. Para agregar un tipo: datos aquí más un sprite en `graficos/sprites.js` (`SPRITES_ENEMIGO`). Hay una prueba que verifica que el tamaño del sprite coincide con `ancho`/`alto`. |
| **Guardado** (`sistemas/guardado.js`) | Persistencia en el teléfono | `crearGuardado(obtenerAlmacen())` devuelve `{ leerNumero(clave, defecto), escribir(clave, valor), borrar(clave) }`. Prefijo `astro.`; nunca lanza errores aunque `localStorage` falle. Claves en uso: `recordLibre`, `volMusica`, `volEfectos`, `vibracion`, `sensibilidad`. |
| **Configuración** (`sistemas/configuracion.js`) | Ajustes del jugador | `crearConfiguracion(guardado)` devuelve `{ valores, cambiar(clave, valor), subir(clave), bajar(clave) }`; acota y guarda al cambiar. En `main.js` hay una sola instancia, `configuracion`, y `vibrar(ms)` (`sistemas/vibracion.js`), que solo vibra si el ajuste está activo. |
| **Sprites** (`graficos/sprites.js`) | Pixel art | Arreglos de texto con una letra por color (`.` = transparente), `paleta` y `escala`. `dibujarSprite(ctx, sprite, x, y, colorUnico?)`. |

### Convenciones

- **Lógica pura separada del DOM** y con su prueba en `tests/`. Lo que toca `document`/`window` queda en `main.js`, `render.js` y `entrada/puntero.js`.
- **Pruebas primero:** se escribe la prueba, se ve fallar, se implementa y se ve pasar. Prueba de ejemplo: `tests/juego.test.js` (escena con botones) y `tests/generador.test.js` (lógica con `rng` determinista).
- Nombres y comentarios **en español**; comentarios cortos que expliquen el *porqué*.
- **Sin dependencias nuevas** para el juego. Los plugins oficiales de Capacitor sí se pueden usar si hacen falta (feature 14).
- Todo en **unidades del mundo lógico**: 360 de ancho y `view.H` de alto. Nunca en píxeles de pantalla.
- **Ojo con Windows:** Git convierte los archivos a CRLF al cambiar de rama. Si un script de búsqueda y reemplazo "no encuentra" un texto, probablemente es por eso; usa el editor.

## 4. Flujo de trabajo en Git (obligatorio)

1. Cada feature va en su rama **desde `main` actualizado**:
   ```bash
   git checkout main && git pull
   git checkout -b feature/<nombre>
   ```
2. **Varios commits pequeños**, cada uno dejando el juego funcionando (`npm test` en verde). Mensajes en español con prefijo: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`. Ejemplo: `feat: pantalla de configuración con volúmenes`.
3. Al terminar: `git push -u origin feature/<nombre>` y abrir un **PR a `main`** que diga qué hace y cómo probarlo.
4. **David revisa y aprueba cada PR.** No se empieza la siguiente feature hasta que el PR anterior esté mergeado.
5. Opcional pero recomendado: escribir el plan corto de la feature en `docs/superpowers/plans/` antes de empezar (mira los existentes).

## 5. Lo que ya está hecho

| # | Feature | PR | Qué dejó |
|---|---|---|---|
| 1 | `lienzo-base` | #1 | Canvas escalable, game loop, gestor de escenas, estrellas, pruebas |
| 2 | `nave-jugador` | #2 | Nave AD-7, control con el dedo, disparo automático |
| 3 | `enemigos-y-disparos` | #3 | 3 tipos Vex, oleadas, director, balas enemigas |
| 4 | `colisiones-y-hud` | #4 | Colisiones, vidas, puntaje, power-ups (D/E/B/V), explosiones, HUD, pausa, fin |
| 5 | `pantalla-carga` | #5 | Logo con fuente pixel, partida fantasma con piloto automático |
| 6 | `menu-principal` | #6 | Menú y navegación carga → menú → juego → menú; servidor de desarrollo |
| 7 | `modo-libre` | #7 | Oleadas infinitas con dificultad creciente, aviso de oleada, récord guardado |
| 8 | `configuracion` | #9 | Ajustes guardados (volúmenes, vibración, sensibilidad), borrar progreso con confirmación |

En el menú, **Modo Historia** muestra "PRÓXIMAMENTE". Para activarlo, en `escenas/menu.js` cambia el `destino: null` de su opción en `OPCIONES` por el nombre de la escena.

## 6. Features pendientes, en orden

Orden sugerido por dependencias: ~~8~~ → **9 → 10 → 11 → 12 → 13 → 14**. El audio usa los volúmenes de configuración; diálogos y jefes se montan sobre el Modo Historia; el guardado de progreso necesita los capítulos.

---

### ~~Feature 8 — `feature/configuracion`~~ (hecha, PR #9)

**Objetivo:** pantalla de ajustes con persistencia.

**Ajustes** (decididos en el diseño):
- Volumen de **música**, 0 a 100 (por defecto 70).
- Volumen de **efectos**, 0 a 100 (por defecto 80).
- **Vibración** on/off (por defecto on).
- **Sensibilidad** del control: 0,5 a 2 en pasos de 0,25 (por defecto 1).
- **Borrar progreso**, con confirmación ("¿Seguro?" → Sí / No).
- **Volver** al menú.
- Idioma: solo español, así que **no** lleva selector.

**Tareas:**
1. `sistemas/configuracion.js` (puro): `crearConfiguracion(guardado)` con `valores` y `cambiar(clave, valor)`. Debe acotar los rangos y guardar al cambiar. Claves sugeridas: `volMusica`, `volEfectos`, `vibracion` (1/0), `sensibilidad`. Pruebas: valores por defecto, acotado (por ejemplo, 150 → 100), persiste y relee.
2. `escenas/configuracion.js`: filas con `−` / `+` para los números y un interruptor para la vibración, dibujadas en el canvas; usa `botones()` como el resto. Pruebas con la misma técnica de `tests/menu.test.js`: tocar el botón por su texto.
3. **Borrar progreso**: por ahora borra `recordLibre`. En la feature 13 se suma el progreso de capítulos (agregar las claves a `CLAVES_PROGRESO` en `escenas/configuracion.js`). Conviene agregar `guardado.borrar(clave)`, con su prueba.
4. **Conectar la sensibilidad:** `jugador.update(dt, puntero, alto, disparar, sensibilidad)` ya la recibe. Hay que pasarla desde `partida.update`, por ejemplo con `crearPartida({ oleadas, sensibilidad })` o un getter de la configuración.
5. Activar la opción en el menú (`destino: 'configuracion'`) y registrar la escena en `main.js`.
6. **Vibración:** helper `vibrar(ms)` que use `navigator.vibrate?.(ms)` solo si está activada. Llámalo al recibir un golpe (en `partida.js`, donde está `jugador.recibirGolpe()`).

**Listo cuando:** los ajustes se guardan y siguen ahí al recargar, la sensibilidad cambia cómo responde la nave, borrar progreso pide confirmación y deja el récord en 0, y las pruebas pasan.

---

### Feature 9 — `feature/audio`

**Objetivo:** efectos y música sintetizados con **Web Audio API**, sin archivos, respetando la configuración.

**Tareas:**
1. `sistemas/audio.js` con un `AudioContext` y dos `GainNode` (música y efectos) conectados al volumen de la configuración (`configuracion.valores.volMusica` y `volEfectos`, de 0 a 100; ya se guardan pero todavía no suenan). Separa la lógica que se puede probar (por ejemplo, convertir 0–100 a ganancia, o qué sonido corresponde a cada evento) de la que necesita el navegador.
2. **El navegador solo permite sonido después de un toque:** crea o reanuda (`ctx.resume()`) el `AudioContext` en el primer toque, que puede ser el de "TOCA PARA EMPEZAR".
3. **Efectos** con osciladores y envolventes cortas:
   - Disparo: pitido agudo muy corto, a bajo volumen porque suena cada 0,18 s.
   - Explosión: ruido blanco con caída.
   - Golpe a la nave: tono grave.
   - Recoger power-up: arpegio ascendente.
   - Bomba: barrido grave largo.
   - Botón de menú: clic.
4. **Música:** un secuenciador simple en bucle (bajo y melodía con onda cuadrada o triangular, estilo chiptune). Un tema para el menú y otro para el juego.
5. Disparar los efectos desde los eventos que ya existen en `partida.js` (`destruir`, `recibirGolpe`, `aplicarPowerup`, `detonarBomba`). Lo más limpio es que la partida acepte un objeto `sonidos` opcional (en las pruebas, uno vacío), así la lógica sigue sin depender del navegador.
6. Pausar la música en segundo plano (`visibilitychange`, ya conectado en `main.js`) y con la pausa del juego.

**Listo cuando:** se escucha la música y cada efecto, los volúmenes de configuración funcionan (0 = silencio), no suena nada antes del primer toque y no hay errores en la consola.

---

### Feature 10 — `feature/modo-historia`

**Objetivo:** selector de capítulos y los 5 capítulos jugables, por ahora sin diálogos ni jefes.

**Capítulos** (del diseño):

| Cap. | Zona | Novedad de juego | Jefe (feature 12) |
|---|---|---|---|
| 1 | Órbita de Kepler | Tutorial, enemigos básicos | Crucero explorador Vex |
| 2 | Cinturón de asteroides | **Asteroides** como obstáculo indestructible o muy resistente | Minero Vex modificado |
| 3 | Nebulosa Carmesí | **Visibilidad reducida** (velo rojizo con un círculo de visión alrededor de la nave) y enemigos que **se camuflan** (se vuelven casi invisibles a ratos) | El Acechador |
| 4 | Faro Omega | **Oleadas densas** | Acorazado Vex |
| 5 | Nave Madre Vex | Final | La Reina del Enjambre (varias fases) |

**Tareas:**
1. `datos/capitulos.js`: por capítulo, `{ numero, nombre, zona, colorFondo, oleadas: [...] }` con una **lista fija** de oleadas (entre 5 y 8), diseñadas a mano con `linea`, `fila` y `ve`, de dificultad creciente entre capítulos. Prueba: todas ordenadas por `t`, con tipos válidos y 5 capítulos.
2. **El capítulo termina** al vaciar la última oleada (sin repetirla), no en ciclos como hoy. El director repite las listas: agrega una opción, por ejemplo `crearDirector(oleadas, { repetir: false })`, que exponga `terminado`. Ojo: `partida.js` y `fantasma.js` usan el comportamiento actual.
3. `escenas/capitulos.js` (selector): 5 tarjetas o botones con número y nombre. Por ahora todos desbloqueados; la feature 13 los bloquea.
4. `escenas/historia.js`: como `escenas/juego.js` (pausa, HUD, fin), pero con las oleadas del capítulo, sin récord, y al terminar muestra **"CAPÍTULO COMPLETADO"** con Siguiente y Menú. Si muere: Reintentar y Menú. Conviene reutilizar `juego.js` con opciones en lugar de copiarlo.
5. **Novedades de zona:** asteroide como nuevo tipo en `datos/enemigos.js` (por ejemplo `vida: 99`, `puntos: 0`, gris, en distintos tamaños); visibilidad y camuflaje como efectos de dibujo en la escena o en la flota (camuflaje = alfa bajo cuando `golpeado` es 0 y un temporizador lo indica).
6. Activar Modo Historia en el menú.

**Listo cuando:** se puede elegir y jugar cada capítulo de principio a fin, cada zona tiene su novedad y "CAPÍTULO COMPLETADO" lleva al siguiente.

---

### Feature 11 — `feature/dialogos`

**Objetivo:** cuadros de diálogo con retrato antes y después de cada capítulo.

**Tareas:**
1. `datos/dialogos.js`: por capítulo, `antes: [...]` y `despues: [...]`, cada línea `{ quien: 'nova' | 'iriarte' | 'reina', texto }`. Escribe el guion siguiendo la trama:
   - Cap. 1: Iriarte explica la misión y que los faros se están apagando; Nova despega.
   - Cap. 2: persecución por el cinturón.
   - Cap. 3: la nebulosa y el Acechador; se pierde la radio a ratos.
   - Cap. 4: recuperar el Faro Omega.
   - Cap. 5: la Reina del Enjambre habla por primera vez; final, la señal vuelve a la Tierra.
   - Líneas cortas: caben unas 3 líneas de 28 caracteres por cuadro.
2. Retratos en pixel art (alrededor de 16×16 a escala 3) en `graficos/sprites.js`: Nova (casco cian), Iriarte (uniforme y gorra) y la Reina (Vex roja y amarilla).
3. `escenas/dialogo.js`: cuadro abajo con retrato, nombre y texto que aparece **letra por letra**. Un toque completa el texto; otro toque pasa a la siguiente línea. Botón **Saltar**. Al terminar, `irA(destino, params)` (por ejemplo, al capítulo).
4. Pruebas: la lógica del texto progresivo (cuántas letras se ven en el tiempo t, toque para completar, toque para avanzar, fin), separada del dibujo.
5. Flujo: selector → diálogo `antes` → capítulo → diálogo `despues` → "CAPÍTULO COMPLETADO".

**Listo cuando:** cada capítulo tiene diálogo antes y después, se puede saltar y el texto se lee bien en un celular.

---

### Feature 12 — `feature/jefes`

**Objetivo:** un jefe al final de cada capítulo. El capítulo se completa al derrotarlo.

**Tareas:**
1. `entidades/jefes.js`: `crearJefe(tipo)` con `vida`, `vidaMax`, caja, `fase` y un `update(dt, entorno)` con patrones de movimiento y disparo. Debe poder recibir daño con `impactarEnemigos` (misma forma que un enemigo: `x, y, ancho, alto, vida`) o tener su propia función de colisión.
2. **Cinco jefes** (diseño libre; ideas):
   - Crucero: va de lado a lado y dispara en abanico de 3.
   - Minero: lanza asteroides.
   - Acechador: se teletransporta y se camufla.
   - Acorazado: mucha vida, torretas, ráfagas apuntadas.
   - Reina: 3 fases según la vida (75 % y 35 %), cada una más agresiva, e invoca exploradores.
3. **Barra de vida del jefe** arriba de la pantalla, con su nombre.
4. Al vaciar la última oleada del capítulo, aviso "¡ALERTA!" y entra el jefe desde arriba. Al morir: gran explosión, muchos puntos y fin del capítulo.
5. Sprites grandes (alrededor de 30×20 a escala 3).
6. Pruebas: cambio de fase por vida, patrones de disparo (con callback espía como en `tests/enemigos.test.js`), muerte que termina el capítulo.

**Listo cuando:** cada capítulo termina con su jefe y la Reina tiene fases visibles.

---

### Feature 13 — `feature/guardado-progreso`

**Objetivo:** que el progreso de la historia se guarde.

**Tareas:**
1. Claves en `guardado`: `capituloMax` (último capítulo desbloqueado, empieza en 1) y `mejorCap1` a `mejorCap5` (mejor puntaje de cada capítulo).
2. Completar el capítulo n desbloquea el n+1 y guarda el mejor puntaje si lo superó.
3. Selector: capítulos bloqueados con candado y atenuados (al tocarlos no pasa nada, o aparece "BLOQUEADO"); los demás muestran su mejor puntaje.
4. "Borrar progreso" de la configuración también reinicia estas claves: agrégalas a `CLAVES_PROGRESO` en `escenas/configuracion.js` y ajusta el texto "SE BORRARÁ TU RÉCORD".
5. Pruebas: desbloqueo, que no se desbloquee dos veces ni pase de 5, borrar progreso.
6. Si en el celular `localStorage` resulta poco confiable, se puede cambiar `obtenerAlmacen()` por `@capacitor/preferences` (es asíncrono: habría que cargar al inicio).

---

### Feature 14 — `feature/pulido-android`

**Objetivo:** que la app se sienta nativa en Android.

**Tareas:**
1. **Commitear `android/`** con un `.gitignore` adecuado: ignorar `android/build/`, `android/app/build/`, `android/.gradle/`, `android/local.properties`, `android/capacitor-cordova-android-plugins/build/` y `*.apk`. Revisar con `git status` antes de agregar.
2. **Orientación vertical fija:** en `android/app/src/main/AndroidManifest.xml`, `android:screenOrientation="portrait"` en la `activity`.
3. **Ícono y splash propios** con la nave AD-7 o el logo, por ejemplo con `@capacitor/assets` a partir de una imagen exportada del canvas.
4. **Botón "atrás" de Android** con `@capacitor/app` (`App.addListener('backButton', ...)`): en el juego, pausa; en submenús, vuelve; en el menú, sale de la app.
5. **Pantalla completa** u ocultar la barra de estado (`@capacitor/status-bar`). Revisar que el HUD no quede bajo el notch (`env(safe-area-inset-top)`).
6. **Vibración nativa** con `@capacitor/haptics`, si `navigator.vibrate` no funciona en el WebView.
7. **Prueba en un celular real:** rendimiento (60 fps), controles, sonido y pausa al recibir una llamada. Generar el APK.

---

## 7. Pendientes y cosas a tener en cuenta

- **Pausa con el dedo en pantalla:** mientras un dedo maneja la nave, un segundo dedo se ignora, así que no se puede tocar la pausa sin soltar. Es una decisión consciente (evita toques accidentales), pero si molesta en el celular, el botón de pausa puede aceptar cualquier dedo (`entrada/coordenadas.js`).
- **Balance:** con disparo triple el juego se vuelve fácil. Los números están en `datos/enemigos.js`, `sistemas/generador.js` (aceleración 4 % por oleada, tope 1,6×) y `entidades/powerups.js` (12 % de probabilidad de soltar). Hay que ajustarlos jugando en el celular.
- **`OLEADAS_PRUEBA`** sigue en uso para la partida fantasma de la carga y el menú.
- **`escenas/juego.js` es el Modo Libre** (registrado como `'juego'`). Si se generaliza para la historia, cuida que las pruebas de `tests/juego.test.js` sigan pasando.
- **Todavía no se ha probado en un Android real.** La primera prueba en dispositivo puede mostrar problemas de tamaño o rendimiento.
- Para probar en el navegador sin mouse táctil: en DevTools, modo dispositivo, el arrastre del mouse simula el dedo.
