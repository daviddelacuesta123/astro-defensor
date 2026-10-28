# Astro Defensor

Juego arcade de naves (shooter vertical) para móviles, construido como app híbrida con HTML5 Canvas + JavaScript y empaquetado para Android con [Capacitor](https://capacitorjs.com/).

## Requisitos

- Node.js 20+
- Android Studio (con Android SDK)

## Desarrollo

```bash
npm install      # instala Capacitor
npm run serve    # sirve www/ en http://localhost:8080 (en el PC se juega directo; Ctrl+C para detener)
npm test         # pruebas automáticas de la lógica del juego (node --test)
npm run android  # sincroniza www/ con Android y abre Android Studio
```

## Jugar en el PC

En pantallas anchas el juego se muestra como una columna centrada, con paneles de información y controles a los lados (si caben). Mouse: mantén el clic y arrastra para mover la nave. Teclado: flechas o WASD para mover, Esc o P para pausar.

## Estructura

- `www/js/` — código del juego (módulos ES, sin bundler)
  - `escenas/` — gestor de escenas y pantallas (`carga`, `menu`, `juego` (Modo Libre y Modo Historia), `capitulos`, `dialogo`, `configuracion`, `creditos`)
  - `entrada/` — control táctil (coordenadas lógicas y estado del dedo)
  - `entidades/` — nave del jugador, enemigos, jefes, balas, power-ups y explosiones
  - `datos/` — tipos de enemigos y jefes, oleadas, los cinco capítulos de la campaña y su guion
  - `sistemas/` — partida, partida fantasma, director y generador de oleadas, colisiones, piloto automático, guardado, configuración, vibración y audio sintetizado (Web Audio)
  - `graficos/` — sprites y fuente pixel, logo, HUD y botones
  - `fondo/` — fondo de estrellas
- `scripts/` — servidor de desarrollo
- `tests/` — pruebas de la lógica pura
- `docs/superpowers/` — documento de diseño y planes por funcionalidad
