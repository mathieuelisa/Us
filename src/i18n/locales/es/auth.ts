import type { Messages } from '../fr';

export const auth: Messages['auth'] = {
  tagline: {
    top: 'Crecer juntos',
    bottom: 'así de simple.',
  },
  mode: {
    signIn: {
      title: 'Qué bien verte de nuevo',
      subtitle: 'Inicia sesión para volver a vuestro espacio compartido.',
    },
    signUp: {
      title: 'Bienvenidos a US',
      subtitle: 'Crea tu cuenta en unos segundos.',
    },
  },
  toggle: {
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
  },
  accountCreated:
    '¡Cuenta creada! Confirma tu dirección con el enlace que te hemos enviado por email y luego inicia sesión.',
  enterEmailFirst: 'Escribe primero tu email arriba para recibir el enlace.',
  resetSent:
    'Si existe una cuenta con este email, acabamos de enviar un enlace de restablecimiento. Te conecta: después elige una nueva contraseña en Ajustes.',
  passwordMismatch: 'Las dos contraseñas no coinciden.',
  hidePassword: 'Ocultar la contraseña',
  showPassword: 'Mostrar la contraseña',
  youAre: 'Vuestra aventura empieza aquí',
  role: {
    pregnantTitle: 'Espero un bebé',
    pregnantSubtitle: 'Creo nuestro espacio',
    partnerTitle: 'Soy la pareja',
    partnerSubtitle: 'Me uno con un código',
  },
  emailPlaceholder: 'tu@email.com',
  password: 'Contraseña',
  confirmPassword: 'Confirmar la contraseña',
  forgotPassword: '¿Olvidaste tu contraseña?',
  creating: 'Creando…',
  signingIn: 'Iniciando sesión…',
  createAccount: 'Crear mi cuenta',
  signIn: 'Iniciar sesión',
  or: 'o',
  openingGoogle: 'Abriendo Google…',
  continueWithGoogle: 'Continuar con Google',
  strength: {
    tooShort: 'Demasiado corta',
    weak: 'Contraseña débil',
    fair: 'Contraseña aceptable',
    good: 'Buena contraseña',
    strong: 'Contraseña robusta',
    a11y: 'Seguridad de la contraseña: {{label}}',
    criteria: {
      length: 'Mín. {{count}} caracteres',
      case: 'Mayúscula y minúscula',
      digit: 'Número',
      symbol: 'Símbolo',
    },
  },
  errors: {
    invalidCredentials: 'Email o contraseña incorrectos.',
    emailNotConfirmed:
      'Confirma primero tu dirección: te hemos enviado un enlace por email.',
    userExists: 'Ya existe una cuenta con este email. Mejor inicia sesión.',
    weakPassword:
      'Contraseña demasiado débil: mínimo {{count}} caracteres, mezcla letras y números.',
    wrongCurrentPassword: 'La contraseña actual es incorrecta.',
    samePassword: 'La nueva contraseña debe ser distinta de la actual.',
    googleDisabled: 'El acceso con Google aún no está activado.',
    invalidEmail: 'Esta dirección de email no es válida.',
    rateLimit: 'Demasiados intentos. Vuelve a intentarlo en unos minutos.',
    signupDisabled: 'Los registros están cerrados por el momento.',
    reauthNeeded: 'Vuelve a iniciar sesión antes de cambiar tu contraseña.',
    network: 'No se puede conectar. Revisa tu red.',
    unknown: 'Ha ocurrido un error. Inténtalo de nuevo.',
  },
};
