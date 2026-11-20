import type { Messages } from '../fr';

export const together: Messages['together'] = {
  title: 'Juntos',
  subtitleSolo: 'Toma el pulso de tu día.',
  subtitle: 'Tomad el pulso de vuestro día, juntos.',
  howDoYouFeel: '¿Cómo te sientes hoy?',
  gesture: {
    badge: 'GESTO DEL DÍA',
    subtitle: 'Un pequeño detalle para regalar hoy',
    tomorrow: 'Mañana te espera un nuevo gesto.',
  },
  need: {
    prompt: 'Dinos qué necesitas,{{br}}estamos aquí para ti ✨',
    promptCoParent:
      'Comparte lo que necesitas,{{br}}{{name}} podrá cuidar de ti ✨',
    title: '¿Algún deseo en particular?',
    placeholder: 'O escribe tu propia necesidad…',
  },
  week: {
    title: 'Esta semana',
    dayMood: '{{day}}: {{mood}}',
    noCheckIn: '{{day}}: sin check-in',
    noted: '{{count}} / 7 días anotados',
  },
  needs: {
    sommeil: 'Dormir',
    calin: 'Un abrazo',
    parler: 'Solo hablar',
    massage: 'Un masaje',
    coup_de_main: 'Una mano práctica',
    calme: 'Un poco de calma',
    rassurée: 'Que me tranquilicen',
    attention: 'Un poco de atención',
    moment_a_deux: 'Un rato a solas los dos',
  },
};
