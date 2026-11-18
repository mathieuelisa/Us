import type { Messages } from '../fr';

export const premium: Messages['premium'] = {
  features: {
    names: 'Match de nombres',
    contractions: 'Asistente de contracciones y salida a la maternidad',
    feeding:
      'Alimentación y ritmos (diario de lactancia, biberones y estadísticas)',
    sleepRhythm: 'Seguimiento del ritmo de sueño del bebé',
    growth: 'Cuaderno de crecimiento (curvas de peso/talla)',
    dailyCare: 'Diario de sueño, baño y cuidados diarios',
    vaccines: 'Espacio de salud y calendario de vacunas',
  },
  paywall: {
    title: 'Desbloquea el seguimiento completo del bebé',
    oneTime: 'Un solo pago, acceso de por vida',
    price: '14,99 € — pago único',
    noSubscription: 'Sin suscripción ni renovación',
    forBoth: 'Válido para los dos',
    partnerFree: ': tu pareja no tiene que pagar nada.',
    unlockLater: 'Desbloqueable desde tu espacio',
    later: 'Más tarde',
  },
  benefits: {
    title: 'Tus ventajas Premium',
    subtitle: 'Disfruta de todas las funciones exclusivas.',
    active: 'ACTIVO',
    hero: 'Acceso ilimitado a todas las funciones esenciales de tu embarazo.',
    baby: 'Tu bebé',
    babySubtitle: 'Crecimiento, biberones, lactancia, sueño',
    names: 'El match de nombres',
    namesSubtitleSolo: 'Encuentra el nombre perfecto',
    namesSubtitle: 'Encontrad juntos el nombre perfecto',
    contractions: 'Asistente de contracciones y salida a la maternidad',
    contractionsSubtitle: 'Cronométralas y te diremos cuándo salir',
    openA11y: 'Abrir {{title}}, incluido en tu Premium',
    included: 'Incluido',
  },
  locked: {
    unlockA11y: 'Desbloquear con Premium',
  },
  teaser: {
    badge: 'Premium',
  },
  purchase: {
    pending:
      'Pago recibido. El premium se activará en unos instantes para los dos.',
    canceled: 'Pago cancelado. Puedes volver a intentarlo cuando quieras.',
    active: 'Premium activo',
    mobileOnly: 'Compra disponible en la app móvil',
    processing: 'Procesando el pago…',
    unlock: 'Desbloquear — 14,99 €',
  },
};
