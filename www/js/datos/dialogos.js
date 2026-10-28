// Guion de "La Última Señal": lo que se dice antes y después de cada capítulo.
// quien: 'nova' (la piloto), 'iriarte' (la comandante, por radio) o 'reina' (la Reina del Enjambre).
// Cada línea cabe en un cuadro: 3 renglones de 28 caracteres.
const nova = (texto) => ({ quien: 'nova', texto });
const iriarte = (texto) => ({ quien: 'iriarte', texto });
const reina = (texto) => ({ quien: 'reina', texto });

export const DIALOGOS = {
  1: {
    antes: [
      iriarte('Nova, aquí Iriarte. El Enjambre Vex está apagando los faros de salto.'),
      iriarte('Si cae el último, Kepler-442 pierde el contacto con la Tierra.'),
      nova('Entendido, Comandante. El AD-7 está listo.'),
      iriarte('Despeja la órbita. Eres todo lo que nos queda.'),
      nova('AD-7 "Defensor", despegando.'),
    ],
    despues: [
      iriarte('Órbita despejada. Buen vuelo, piloto.'),
      nova('Los Vex que quedan huyen hacia el cinturón de asteroides.'),
      iriarte('Síguelos. Si escapan, volverán con más naves.'),
    ],
  },
  2: {
    antes: [
      nova('Entro al cinturón. Hay rocas por todas partes.'),
      iriarte('Las grandes no se rompen. Esquívalas y no pierdas a los Vex.'),
      nova('Ya los veo. Esta vez no se me escapan.'),
    ],
    despues: [
      nova('Perdí al último en una nube roja. ¿Qué es eso?'),
      iriarte('La Nebulosa Carmesí. Ciega los radares y corta la radio.'),
      iriarte('Dicen que ahí se esconde un cazador. Ten cuidado.'),
    ],
  },
  3: {
    antes: [
      iriarte('Nova, la nebulosa... interfiere con... la radio...'),
      nova('Casi no veo nada. Y algunas naves desaparecen.'),
      iriarte('...Vex camuflados... dispara cuando... brillen...'),
      nova('¿Comandante? ¿Me escucha? ...Sigo sola.'),
    ],
    despues: [
      iriarte('¡Nova! Recuperamos la señal. Pensé que te perdíamos.'),
      nova('Salí de la nebulosa. Veo una luz enorme: el Faro Omega.'),
      iriarte('Es el último faro encendido. Tienes que protegerlo.'),
    ],
  },
  4: {
    antes: [
      iriarte('El Enjambre lanzó todo lo que tiene contra el Faro Omega.'),
      nova('Son demasiados...'),
      iriarte('Aguanta, Nova. Mientras el faro brille, hay esperanza.'),
    ],
    despues: [
      nova('El faro sigue encendido. Lo logramos.'),
      iriarte('Rastreamos de dónde vienen: la Nave Madre Vex.'),
      nova('Entonces voy por ella.'),
    ],
  },
  5: {
    antes: [
      reina('Pequeña piloto. Mis hijos ya apagaron mil faros.'),
      reina('El tuyo será el último.'),
      nova('Eso ya lo veremos.'),
      iriarte('Nova, toda la colonia de Kepler está contigo.'),
    ],
    despues: [
      reina('Imposible... el Enjambre... no puede caer...'),
      iriarte('¡Los faros se encienden! La señal llega a la Tierra.'),
      nova('Aquí AD-7. Misión cumplida. Volviendo a casa.'),
      iriarte('Bienvenida, Nova. Kepler te debe todo.'),
    ],
  },
};
