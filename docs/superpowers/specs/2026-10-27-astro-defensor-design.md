# Astro Defensor — Documento de diseño

Fecha: 2026-10-27
Autor: David De La Cuesta Madrid (con Claude)

## 1. Intención

Astro Defensor es un shooter vertical arcade para celular (Android), hecho como app híbrida: HTML5 Canvas + JavaScript empaquetado con Capacitor. Es un proyecto académico (App Móviles, UPB), así que además del juego importa **cómo se construye**: por funcionalidades, cada una en su rama `feature/*` en GitHub, con varios commits y un PR a `main` que aprueba David.

## 2. Objetivos

- Pantalla de carga con el logo y una partida "fantasma" de fondo (naves volando y disparando solas).
- Menú principal: **Modo Historia**, **Modo Libre**, **Configuración**.
- Modo Historia con trama propia, 5 capítulos, diálogos y jefes.
- Modo Libre de supervivencia infinita con récord.
- Control táctil arrastrando el dedo, disparo automático.
- Progreso y configuración guardados en el teléfono.
- Funciona en navegador (para desarrollo) y como APK Android vía Capacitor.

## 3. No-objetivos

- Multijugador, tienda, compras, anuncios, cuentas o servidor.
- Imágenes o audio externos: todo se dibuja y sintetiza por código.
- iOS (no se configura; Capacitor lo permitiría más adelante).
- Varios idiomas (solo español).

## 4. Anti-objetivos (sería un fracaso aunque "funcione")

- Que el juego no se pueda jugar con una mano en un celular real (dedo tapando la nave, controles imprecisos, lag).
- Que la historia de Git sea un solo commit gigante o que se mezcle trabajo de varias features en una rama.
- Que se mergee algo a `main` sin que David apruebe el PR.

## 5. Restricciones

- Stack ya decidido en `main`: Capacitor 8, `webDir: www`, sin bundler. JS con módulos ES nativos (`<script type="module">`).
- Mundo lógico de ancho fijo 360 unidades; el alto se adapta a la pantalla (ya planteado en el código existente).
- Estilo visual neón sobre fondo oscuro (`#05060f`), pixel art.
- Sin dependencias de juego externas (sin Phaser, etc.).

## 6. Flujo de trabajo Git (decidido por David)

- Cada funcionalidad = una rama `feature/<nombre>` creada **desde `main` actualizado**.
- Cada rama tiene **varios commits** pequeños y con sentido (convención `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, en español).
- Al terminar la feature: push y PR a `main` con `gh pr create`, descripción en español.
- **Se espera a que David apruebe y mergee el PR antes de empezar la siguiente feature.** No se trabaja en paralelo ni se apilan ramas.
- Claude nunca mergea PRs ni hace push a `main`.

## 7. Trama — "Astro Defensor: La Última Señal"

Año 2387. La colonia humana del sistema **Kepler-442** depende de una cadena de **faros de salto** que la conecta con la Tierra. El **Enjambre Vex**, una flota alienígena, empieza a apagarlos uno a uno para aislarla. La piloto **Nova Ríos**, a bordo del caza experimental **AD-7 "Defensor"**, es la única defensa operativa. La guía por radio la **Comandante Iriarte**.

| Cap. | Zona | Novedad de juego | Jefe |
|---|---|---|---|
| 1 | Órbita de Kepler | Tutorial, enemigos básicos | Crucero explorador Vex |
| 2 | Cinturón de asteroides | Asteroides como obstáculo | Minero Vex modificado |
| 3 | Nebulosa Carmesí | Visibilidad reducida, enemigos que se camuflan | El Acechador |
| 4 | Faro Omega | Oleadas densas | Acorazado Vex |
| 5 | Nave Madre Vex | Final | La Reina del Enjambre (multifase) |

Antes y después de cada capítulo hay diálogos en cuadros de texto con retrato (Nova, Iriarte, a veces la Reina). Completar un capítulo desbloquea el siguiente.

## 8. Jugabilidad

- **Control:** la nave sigue al dedo con un desplazamiento hacia arriba (para que el dedo no la tape), con suavizado según la sensibilidad configurada. Disparo automático. En navegador también funciona con el mouse.
- **Enemigos:** varios tipos con patrones de movimiento y disparo distintos; aparecen en oleadas.
- **Power-ups:** disparo doble/triple, escudo, bomba (limpia la pantalla), vida extra.
- **HUD:** puntaje, vidas, botón de pausa.
- **Pausa:** menú con continuar / salir al menú. El juego se pausa solo si la app pasa a segundo plano.
- **Modo Libre:** oleadas infinitas con dificultad creciente; al morir se muestra puntaje y récord.

## 9. Pantallas

1. **Carga / título:** logo "ASTRO DEFENSOR" animado, fondo de estrellas, partida fantasma de fondo con IA simple. "Toca para empezar".
2. **Menú principal:** Modo Historia, Modo Libre, Configuración (la partida fantasma sigue de fondo).
3. **Selector de capítulos** (Modo Historia): capítulos bloqueados/desbloqueados.
4. **Diálogo:** cuadros de texto con retrato pixel art, avance tocando.
5. **Juego**, **Pausa**, **Fin de partida / Capítulo completado**.
6. **Configuración:** volumen de música, volumen de efectos, vibración on/off, sensibilidad del control, borrar progreso (con confirmación). Idioma fijo en español (no se muestra selector).

La interfaz se dibuja en el canvas (no DOM), para un estilo uniforme.

## 10. Arquitectura (decisión de Claude)

- `www/js/` organizado por módulos: `config`, `render`, `input`, `escenas/` (máquina de escenas: carga, menú, juego, diálogo, configuración…), `entidades/` (jugador, enemigos, balas, power-ups, jefes), `datos/` (capítulos, oleadas, diálogos), `audio`, `guardado`.
- Un gestor de escenas simple con `enter / update / draw / exit`.
- **Guardado:** `localStorage` envuelto en try/catch (progreso, récord, configuración). En Android vía Capacitor `localStorage` persiste en el WebView. Si se ve frágil, se puede pasar a `@capacitor/preferences` en la feature de guardado.
- **Audio:** Web Audio API, efectos y música sintetizados.
- **Vibración:** `navigator.vibrate` (o `@capacitor/haptics` en la feature de pulido Android).

## 11. Funcionalidades (ramas), en orden

1. `feature/lienzo-base` — canvas escalable, game loop, fondo de estrellas, gestor de escenas. (Incluye este documento.)
2. `feature/nave-jugador` — nave pixel art, control arrastrando el dedo, disparo automático.
3. `feature/enemigos-y-disparos` — tipos de enemigos, oleadas, balas enemigas.
4. `feature/colisiones-y-hud` — colisiones, vidas, puntaje, explosiones, power-ups, HUD, pausa, fin de partida.
5. `feature/pantalla-carga` — logo animado y partida fantasma.
6. `feature/menu-principal` — menú y navegación entre escenas.
7. `feature/modo-libre` — supervivencia infinita, dificultad creciente, récord.
8. `feature/configuracion` — pantalla de ajustes y su persistencia.
9. `feature/audio` — efectos, música, vibración conectados a la configuración.
10. `feature/modo-historia` — selector de capítulos y los 5 capítulos con sus oleadas y zonas.
11. `feature/dialogos` — sistema de diálogos con retratos y guion de la trama.
12. `feature/jefes` — los 5 jefes.
13. `feature/guardado-progreso` — desbloqueo de capítulos persistente.
14. `feature/pulido-android` — ícono, splash, orientación vertical, pausa en segundo plano, prueba en dispositivo.

El orden puede ajustarse si al construir conviene, pero siempre una feature a la vez.

## 12. Estado actual y cómo se parte

- `main` tiene un commit con la configuración de Capacitor (`package.json`, `capacitor.config.json`, `README.md`).
- `www/` y `android/` existen sin commitear. El lienzo existente en `www/` se reescribe dentro de `feature/lienzo-base`. `android/` se commitea en la feature correspondiente (se revisará qué ignorar: `build/`, `local.properties`, etc.).

## 13. Verificación

- Cada feature se prueba en navegador (`npm run serve`, vista móvil) antes de abrir el PR; el PR describe cómo probarla.
- Se deja la prueba en dispositivo Android real/emulador para David cuando no sea posible desde aquí.

## 14. Queda a criterio del constructor

Balance (velocidades, vida de enemigos, puntajes), diseño exacto de sprites, textos de diálogo concretos, patrones de oleadas y de jefes, paleta dentro del estilo neón.
