import type { Messages } from '../fr';

export const settings: Messages['settings'] = {
  title: 'Ajustes',
  subtitleSolo: 'Personales.',
  subtitle: 'Personales — no se comparten con tu pareja.',
  account: {
    section: 'Cuenta',
    noAccount: 'Modo DEV — ninguna cuenta conectada',
    signInToManage: 'Inicia sesión para gestionar tu cuenta.',
    viaGoogleOrPassword: 'Acceso con Google o contraseña',
    viaGoogle: 'Acceso con Google',
    viaPassword: 'Acceso con email y contraseña',
    changePassword: 'Cambiar la contraseña',
    signOut: 'Cerrar sesión',
    signingOut: 'Cerrando sesión…',
    deleteAccount: 'Eliminar mi cuenta',
  },
  notifications: {
    section: 'Notificaciones',
    appointments: 'Citas',
    appointmentsHint: 'La víspera a las 19 h y 1 h antes',
    procedures: 'Trámites',
    proceduresHint: 'Los que tienen «Recordármelo» activado',
    vaccines: 'Vacunas del bebé',
    vaccinesHint: '7 días antes y el mismo día, a las 9 h',
    mood: 'Ánimo del día',
    moodHint:
      'Un pequeño aviso en la app a las 9 h, 14 h y 19 h si no lo has rellenado',
    partner: 'Tu pareja',
    partnerHint: 'Ánimo, síntomas, cita compartida, nacimiento',
    toggleLabel: 'Notificaciones: {{label}}',
    webOnly: 'Las notificaciones solo funcionan en el teléfono.',
    blocked: 'Las notificaciones están bloqueadas en este teléfono.',
    openSettings: 'Abrir ajustes',
    enablePrompt:
      'Recibe tus recordatorios y las novedades del otro progenitor.',
    enable: 'Activar',
  },
  appearance: {
    section: 'Apariencia',
    themeLabel: 'Tema {{label}}',
    themes: {
      sauge: 'Salvia',
      corail: 'Coral',
      lavande: 'Lavanda',
      ocre: 'Ocre',
    },
  },
  language: {
    label: 'Idioma',
    a11y: 'Idioma: {{value}}',
    sheetTitle: 'Idioma de la aplicación',
    sheetHint:
      'Solo para ti: tu pareja conserva su propio idioma. Los trámites y algunos contenidos siguen en francés por ahora.',
  },
  tour: {
    label: 'Ver de nuevo la visita guiada',
    a11y: 'Ver de nuevo la visita guiada del inicio',
    hint: 'Redescubre el inicio en unos pocos pasos',
  },
  share: {
    titleBefore: 'Comparte',
    description: '¿Alguien cercano espera un bebé? Dale a conocer la app.',
    button: 'Compartir la app',
    message:
      'Te recomiendo US, la app para vivir el embarazo y los primeros meses del bebé en pareja.',
    unavailable: 'Compartir no está disponible en este dispositivo.',
  },
  privacy: {
    section: 'Privacidad',
    privacyPolicy: 'Política de privacidad',
    terms: 'Condiciones de uso',
    legalNotice: 'Aviso legal',
  },
  password: {
    title: 'Cambiar la contraseña',
    confirmCurrent: 'Por tu seguridad, confirma primero tu contraseña actual.',
    fromResetLink:
      'Vienes de un enlace de restablecimiento: elige directamente tu nueva contraseña.',
    updated: 'Contraseña actualizada.',
    current: 'Contraseña actual',
    resetSent: 'Se ha enviado un enlace de restablecimiento a {{email}}.',
    forgot: '¿Olvidaste tu contraseña?',
    new: 'Nueva contraseña',
    confirm: 'Confirmar la contraseña',
    minLength: 'Mínimo {{count}} caracteres.',
    sameAsCurrent: 'La nueva contraseña debe ser distinta de la actual.',
    mismatch: 'Las dos contraseñas no coinciden.',
  },
  deleteAccount: {
    title: '¿Eliminar tu cuenta?',
    pregnant:
      'Tu espacio compartido se eliminará con todos sus datos — diario, citas, trámites, bolsas, información —, también para tu pareja.',
    partner:
      'Tus estados de ánimo, tus citas y tu acceso al espacio compartido se eliminarán. El espacio y sus datos se quedan con el otro progenitor.',
    final: 'Es definitivo: no se podrá recuperar nada.',
    confirm: 'Eliminar definitivamente',
    failed:
      'No se ha podido eliminar. Revisa tu conexión e inténtalo de nuevo.',
  },
};
