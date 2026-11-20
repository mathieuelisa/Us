import type { Messages } from '../fr';

export const profile: Messages['profile'] = {
  dueDateUpdated: 'Tu fecha prevista del parto está actualizada.',
  dueDateError:
    'No se ha podido guardar la fecha prevista del parto. Inténtalo de nuevo.',
  avatarUpdated: 'Tu avatar está actualizado.',
  avatarError: 'No se ha podido guardar tu avatar.',
  nameUpdated: '¡{{name}}, qué bonito! Tu nombre está actualizado.',
  nameError: 'No se ha podido guardar tu nombre. Inténtalo de nuevo.',
  title: 'Mi perfil',
  subtitle: 'Gestiona tu información personal.',
  tapToChooseAvatar: 'Toca para elegir un avatar',
  editDisplayedName: 'Editar el nombre mostrado',
  displayedName: 'Nombre mostrado',
  yourFirstName: 'Tu nombre',
  email: 'Email',
  editDueDate: 'Editar la fecha prevista del parto',
  editDueDateCurrent:
    'Editar la fecha prevista del parto, actualmente el {{date}}',
  dueDate: 'Fecha prevista del parto',
  toFill: 'Por indicar',
  saving: 'Guardando…',
  saved: 'Guardado',
  save: 'Guardar',
  changeAvatar: 'Cambiar de avatar',
  changeAvatarCurrent: 'Cambiar de avatar, actualmente {{avatar}}',
  avatarPicker: {
    initial: 'Inicial',
    title: 'Elige un avatar',
    hint: 'Se muestra en tu perfil.',
  },
  dueDateSheet: {
    hint: 'Corrígela si hace falta: semanas, meses de embarazo y trámites se recalculan para los dos.',
    tooFar: 'Esta fecha está demasiado lejos para un embarazo en curso.',
    weeks_one: 'Es decir, {{count}} semana de amenorrea hoy.',
    weeks_other: 'Es decir, {{count}} semanas de amenorrea hoy.',
    save: 'Guardar la fecha',
  },
  avatars: {
    ourson: 'Osito',
    lapin: 'Conejito',
    renard: 'Zorro',
    panda: 'Panda',
    koala: 'Koala',
    lion: 'León',
    chat: 'Gato',
  },
};
