import type { Messages } from '../fr';

export const onboarding: Messages['onboarding'] = {
  next: 'Siguiente',
  start: 'Empezar',
  finish: 'Terminar',
  backToLogin: 'Volver al inicio de sesión',
  previousStep: 'Paso anterior',
  backToPreviousStep: 'Volver al paso anterior',
  quitToLogin: 'Salir de la configuración y volver al inicio de sesión',
  slides: {
    welcome: {
      title: 'Bienvenidos a US',
      description:
        'La app pensada para parejas que esperan un hijo. Simplificad vuestro día a día, juntos, desde el primer trimestre hasta los primeros meses.',
    },
    feelings: {
      title: 'Compartid vuestras emociones',
      description:
        'Con US sabrás cómo se siente tu pareja cada día — con un simple gesto, seguid conectados pese al cansancio y el estrés.',
    },
    together: {
      title: 'Seguid el embarazo juntos',
      description:
        'Citas, síntomas, tamaño del bebé semana a semana: toda la información esencial reunida y compartida entre los dos.',
    },
    paperwork: {
      title: 'No te pierdas ningún trámite',
      description:
        'Prestaciones familiares, seguridad social, registro del nacimiento… US te recuerda qué hacer y cuándo, para no olvidar nada tras la llegada del bebé.',
    },
  },
  intro: {
    title: 'Vamos a conocernos',
    subtitle:
      'Tu nombre y cómo referirnos a ti: solo sirven para personalizar la app para los dos.',
    howToRefer: '¿Cómo nos referimos a ti?',
    pronouns: {
      il: {
        label: 'Él',
        description: 'Ej.: «Bram está en plena forma, él…»',
      },
      elle: {
        label: 'Ella',
        description: 'Ej.: «Camille está en plena forma, ella…»',
      },
      neutre: {
        label: 'Solo con mi nombre',
        description: 'Sin «él» ni «ella»',
      },
    },
    saveError:
      'No se puede guardar por ahora. Revisa tu conexión y vuelve a intentarlo.',
  },
  firstName: 'Tu nombre',
  firstNameRequired: 'Tu nombre es obligatorio.',
  accompaniment: {
    title: '¿Quién te acompaña en esta aventura?',
    options: {
      couple: 'En pareja',
      coparentalite: 'Coparentalidad sin vivir juntos',
      seul: 'Sola / solo',
    },
    partnerUsesApp: '¿Tu pareja también usará la app?',
  },
  names: {
    title: 'Poco a poco, vamos a conocernos',
    subtitle:
      'Estos nombres solo sirven para personalizar vuestro espacio — nunca para identificaros.',
    partnerFirstName: 'Nombre de tu pareja',
    partnerFirstNameRequired: 'El nombre de tu pareja es obligatorio.',
  },
  dueDate: {
    title: '¿Cuál es la fecha prevista del parto?',
    mustBeFuture: 'La fecha del parto debe ser hoy o más adelante.',
    firstChild: '¿Es tu primer hijo?',
    today: 'Es hoy 💗',
    daysLeft_one: 'Solo falta un día para conoceros 💗',
    daysLeft_other: 'Faltan {{count}} días para conoceros 💗',
    weeks_one: 'Estás de {{count}} semana de amenorrea.',
    weeks_other: 'Estás de {{count}} semanas de amenorrea.',
  },
  status: {
    title: '¿Cuál es tu situación laboral?',
    subtitle: 'Para adaptar tus trámites',
    options: {
      salarie_prive: 'Asalariada/o del sector privado',
      fonctionnaire: 'Funcionaria/o',
      independant: 'Autónoma/o',
      sans_emploi: 'Sin empleo actualmente',
    },
  },
  priorities: {
    title: '¿Cuáles son tus prioridades?',
    subtitle: 'Puedes elegir varias',
    options: {
      demarches: 'Trámites administrativos',
      sante: 'Seguimiento de salud',
      partage: 'Compartir con tu pareja',
      rendez_vous: 'Fechas y citas importantes',
    },
  },
  reminders: {
    title: '¿Con qué frecuencia prefieres los recordatorios?',
    options: {
      realtime: {
        label: 'Sobre la marcha',
        description: 'Una notificación en cada paso',
      },
      weekly: {
        label: 'Resumen semanal',
        description: 'Un resumen cada semana',
      },
    },
  },
  reassurance: {
    title: 'Has tomado la decisión correcta',
    subtitle:
      'Miles de padres ya usan US para vivir esta etapa con tranquilidad',
    done: 'Configuración completada',
    downloadsValue: '50.000+',
    downloads: 'Descargas',
    ratingValue: '4,8',
    rating: 'Valoración media',
  },
  join: {
    title: 'Únete al espacio de tu pareja',
    subtitle:
      'Escribe el código de 6 caracteres que aparece en su app o escanea su código QR.',
    joining: 'Uniéndote…',
    join: 'Unirme',
    createOwn: 'Espero un bebé: creo mi espacio',
    switchError: 'No se ha podido cambiar de recorrido. Inténtalo de nuevo.',
    codeTitle: 'CÓDIGO DEL ESPACIO',
    codeLabel: 'Código del espacio',
    scanQr: 'Escanear un código QR',
  },
  signOut: 'Cerrar sesión',
  finalising: {
    failed: 'No se ha podido crear tu espacio',
    failedHint:
      'Tus respuestas se conservan. Revisa tu conexión y vuelve a intentarlo.',
    preparing: 'Estamos preparando tu espacio…',
  },
  leave: {
    signOutError: 'No se ha podido cerrar la sesión. Inténtalo de nuevo.',
    title: '¿Volver al inicio de sesión?',
    body: 'Se cerrará tu sesión. Tu cuenta se conserva: al volver a entrar, retomarás el registro desde el principio.',
    stay: 'Quedarme',
    signingOut: 'Cerrando sesión…',
    deleteAccount: 'Eliminar mi cuenta',
    deleteTitle: '¿Eliminar tu cuenta?',
    deleteBody:
      'Tu cuenta y tu perfil se borrarán. Podrás crear otra cuenta más adelante con la misma dirección de email.',
    final: 'Es definitivo: no se podrá recuperar nada.',
    deleteFailed:
      'No se ha podido eliminar. Revisa tu conexión e inténtalo de nuevo.',
    deleting: 'Eliminando…',
    deleteConfirm: 'Eliminar definitivamente',
  },
  qr: {
    title: 'Escanear el código QR',
    close: 'Cerrar el escáner',
    aim: 'Apunta al código QR que aparece en la app de tu pareja.',
    cameraAccess: 'Acceso a la cámara',
    denied:
      'Se ha denegado el acceso. Permítelo en los ajustes del teléfono o escribe el código a mano.',
    why: 'US la necesita para leer el código QR de tu pareja. No se guarda nada.',
    allow: 'Permitir la cámara',
  },
  stepOf: 'Paso {{step}} de {{total}}',
};
