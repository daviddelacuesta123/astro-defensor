# Astro Defensor

Juego arcade de naves (shooter vertical) para móviles, construido como app híbrida con HTML5 Canvas + JavaScript y empaquetado para Android con [Capacitor](https://capacitorjs.com/).

## Requisitos

- Node.js 20+
- Android Studio (con Android SDK)

## Desarrollo

```bash
npm install      # instala Capacitor
npm run serve    # sirve www/ en http://localhost:8080 (usa la vista móvil del navegador)
npm test         # pruebas automáticas de la lógica del juego (node --test)
npm run android  # sincroniza www/ con Android y abre Android Studio
```

## Estructura

- `www/js/` — código del juego (módulos ES, sin bundler)
  - `escenas/` — gestor de escenas y pantallas (por ahora: `juego`)
  - `entrada/` — control táctil (coordenadas lógicas y estado del dedo)
  - `entidades/` — nave del jugador, enemigos, balas, power-ups y explosiones
  - `datos/` — tipos de enemigos y oleadas
  - `sistemas/` — director de oleadas y colisiones
  - `graficos/` — sprites en pixel art, HUD y botones
  - `fondo/` — fondo de estrellas
- `tests/` — pruebas de la lógica pura
- `docs/superpowers/` — documento de diseño y planes por funcionalidad
