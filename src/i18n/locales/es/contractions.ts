import type { Messages } from '../fr';

export const contractions: Messages['contractions'] = {
  description:
    'Cronometrad vuestras contracciones juntos, seguid su ritmo y sabed cuándo ir a la maternidad.',
  descriptionSolo:
    'Cronometra tus contracciones, sigue su ritmo y sabe cuándo ir a la maternidad.',
  lockedTitle: 'Asistente de contracciones',
  unlock: 'Desbloquea el asistente de contracciones',
  title: 'Contracciones y salida',
  errors: {
    end: 'No se ha guardado el final de la contracción.',
    start: 'No se ha guardado la contracción.',
    finish: 'No se ha podido terminar el seguimiento.',
    delete: 'No se ha podido eliminar la contracción.',
  },
  loading: 'Cargando…',
  hint: {
    stop: 'Toca de nuevo cuando termine la contracción.',
    next: 'Toca en cuanto empiece la siguiente contracción.',
    first:
      'Toca en cuanto empiece una contracción:{{br}}el seguimiento empieza con ella.',
  },
  stats: {
    count: 'Contracciones',
    avgDuration: 'Duración media',
    avgInterval: 'Intervalo medio',
  },
  session: {
    ongoing: 'SEGUIMIENTO EN CURSO',
    last: 'ÚLTIMO SEGUIMIENTO',
    none: 'NINGÚN SEGUIMIENTO EN CURSO',
    summary_one: '{{duration}} · {{count}} contracción',
    summary_other: '{{duration}} · {{count}} contracciones',
    startsWithFirst: 'Empieza con la primera contracción',
    finishA11y: 'Terminar el seguimiento de las contracciones',
    finish: 'Terminar',
  },
  button: {
    endA11y: 'Fin de la contracción, en curso desde hace {{duration}}',
    startA11y: 'Inicio de contracción',
    end: 'Fin',
    start: 'Inicio de{{br}}contracción',
    endCaps: 'CONTRACCIÓN',
  },
  rule: {
    text: 'Contracciones cada {{interval}} o menos desde hace {{window}}{{who}}.',
    firstChild: ' (primer bebé)',
    nextChild: ' (siguientes bebés)',
    title: '¿Cuándo ir a la maternidad?',
    timeToGo: 'Es el momento de salir.',
    regularFor: 'Regulares desde hace {{duration}}',
    notRegular: 'Aún sin ritmo regular',
    see: 'Ver',
  },
  history: {
    ongoing: 'En curso',
    first: 'Primera contracción',
    after: '{{duration}} después de la anterior',
    delete: 'Eliminar la contracción {{number}}',
    title: 'HISTORIAL',
  },
  departure: {
    title: 'Es hora de salir{{br}}hacia la maternidad',
    every: 'Tus contracciones vuelven cada {{duration}} más o menos',
    regular: 'Tus contracciones son regulares',
    since: 'desde hace {{duration}}',
    lasting: 'y duran {{duration}} de media.',
    advice:
      'Ponte en camino con calma y avisa a la maternidad si te lo han pedido.',
    bagA11y: 'Bolsa de maternidad, {{checked}} de {{total}} listos',
    bag: 'Bolsa de maternidad',
    checkBag: 'Comprueba que no falte nada',
    bagProgress: '{{checked}} de {{total}} listos',
    understood: 'Entendido',
    disclaimer:
      'Referencia orientativa: no sustituye la opinión de tu matrona ni de la maternidad.',
  },
};
