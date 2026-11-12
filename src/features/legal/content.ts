import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Contenu des documents légaux (Réglages › Confidentialité), séparé de la
 * mise en page (`(tabs)/legal.tsx`) pour pouvoir le réécrire sans toucher à
 * l'écran.
 *
 * ⚠️ TEXTE PROVISOIRE (demande explicite : « mets du texte pour la mise en
 * forme, je modifierai en temps voulu »). Tout ce qui est entre crochets
 * `[…]` est à compléter, et l'ensemble doit être relu par un juriste avant
 * la mise en production — point bloquant n°3 de
 * DOCS/05-DETTE-ET-POINTS-OUVERTS.md (consentement RGPD, données de santé).
 * Seule la liste des données collectées décrit fidèlement l'app actuelle.
 */

export type LegalDocId = 'privacy' | 'terms' | 'legal-notice';

export type LegalSection = {
  icon: IoniconName;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDoc = {
  title: string;
  subtitle: string;
  icon: IoniconName;
  updatedAt: string;
  /** Points clés en tête de document (« En bref »), facultatifs. */
  summary?: string[];
  sections: LegalSection[];
};

const CONTACT_EMAIL = '[adresse e-mail de contact]';

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  'legal-notice': {
    title: 'Mentions légales',
    subtitle: 'Qui édite et héberge l’application US.',
    icon: 'document-text-outline',
    updatedAt: '[date de mise à jour]',
    sections: [
      {
        icon: 'business-outline',
        title: 'Éditeur de l’application',
        paragraphs: [
          'L’application US est éditée par [nom de la société ou de l’éditeur], [forme juridique] au capital de [montant] €.',
        ],
        bullets: [
          'Siège social : [adresse complète]',
          'RCS : [ville] [numéro]',
          'SIRET : [numéro]',
          'TVA intracommunautaire : [numéro]',
        ],
      },
      {
        icon: 'person-outline',
        title: 'Directeur de la publication',
        paragraphs: ['[Prénom Nom], en qualité de [fonction].'],
      },
      {
        icon: 'server-outline',
        title: 'Hébergement',
        paragraphs: [
          'Les données de l’application sont hébergées par [nom de l’hébergeur], [adresse de l’hébergeur], sur des serveurs situés dans l’Union européenne ([pays / région]).',
        ],
      },
      {
        icon: 'color-palette-outline',
        title: 'Propriété intellectuelle',
        paragraphs: [
          'L’ensemble des éléments de l’application (textes, illustrations, logos, interface) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou réutilisation sans autorisation préalable est interdite.',
          'Crédits des illustrations : [à compléter].',
        ],
      },
      {
        icon: 'mail-outline',
        title: 'Contact',
        paragraphs: [
          `Pour toute question sur l’application, écrivez-nous à ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },

  privacy: {
    title: 'Politique de confidentialité',
    subtitle: 'Comment nous protégeons les données de votre famille.',
    icon: 'shield-checkmark-outline',
    updatedAt: '[date de mise à jour]',
    summary: [
      'Vos données restent dans votre espace, partagé uniquement avec votre partenaire.',
      'Nous ne vendons ni ne louons aucune donnée, et l’app n’affiche pas de publicité.',
      'Vos données sont hébergées dans l’Union européenne.',
      'Vous pouvez supprimer votre compte à tout moment depuis Réglages.',
    ],
    sections: [
      {
        icon: 'id-card-outline',
        title: 'Responsable du traitement',
        paragraphs: [
          `[Nom de la société ou de l’éditeur], [adresse]. Contact : ${CONTACT_EMAIL}.`,
        ],
      },
      {
        icon: 'albums-outline',
        title: 'Données collectées',
        paragraphs: [
          'Nous collectons uniquement ce dont l’application a besoin pour fonctionner :',
        ],
        bullets: [
          'Compte : adresse e-mail, mot de passe chiffré ou connexion Google.',
          'Profil : prénom et thème de couleur choisi.',
          'Foyer : date de terme, date de naissance déclarée, type d’accompagnement, e-mail de votre partenaire invité.',
          'Suivi au quotidien : humeurs, symptômes notés dans le Journal, rendez-vous, contacts utiles, démarches et listes de préparation.',
          'Informations importantes : groupe sanguin, allergies, points de vigilance, numéros utiles, numéro de sécurité sociale si vous le saisissez.',
          'Suivi de bébé : mesures, biberons, allaitement, bains et soins.',
        ],
      },
      {
        icon: 'medkit-outline',
        title: 'Données de santé',
        paragraphs: [
          'Certaines informations (symptômes, groupe sanguin, allergies, suivi de bébé) sont des données de santé. Elles ne sont traitées qu’avec votre consentement explicite, et ne sont visibles que par les membres de votre foyer.',
          '[Modalités de recueil du consentement et hébergement de données de santé à valider juridiquement.]',
        ],
      },
      {
        icon: 'flag-outline',
        title: 'Pourquoi nous les utilisons',
        bullets: [
          'Vous permettre de suivre la grossesse et les premiers mois de bébé.',
          'Partager ces informations avec votre partenaire, en temps réel.',
          'Vous envoyer les e-mails liés à votre compte (confirmation, mot de passe oublié).',
          '[Autres finalités éventuelles : statistiques anonymes, notifications…]',
        ],
      },
      {
        icon: 'people-outline',
        title: 'Avec qui elles sont partagées',
        paragraphs: [
          'Vos données ne sont visibles que par vous et votre partenaire, une fois qu’il a rejoint votre espace. Elles ne sont ni vendues, ni louées, ni utilisées à des fins publicitaires.',
          'Nos prestataires techniques y accèdent uniquement pour faire fonctionner le service :',
        ],
        bullets: [
          'Hébergement et base de données : [nom de l’hébergeur].',
          'Connexion avec Google, si vous choisissez cette option.',
          '[Autres prestataires éventuels]',
        ],
      },
      {
        icon: 'time-outline',
        title: 'Durée de conservation',
        paragraphs: [
          'Vos données sont conservées tant que votre compte est actif. Lorsque vous supprimez votre compte, elles sont effacées dans un délai de [durée].',
        ],
      },
      {
        icon: 'hand-left-outline',
        title: 'Vos droits',
        paragraphs: [
          'Conformément au RGPD, vous disposez à tout moment des droits suivants :',
        ],
        bullets: [
          'Accéder à vos données et en obtenir une copie.',
          'Les rectifier ou les compléter.',
          'Les effacer, notamment en supprimant votre compte depuis Réglages.',
          'Retirer votre consentement au traitement de vos données de santé.',
          'Vous opposer à un traitement ou en demander la limitation.',
        ],
      },
      {
        icon: 'lock-closed-outline',
        title: 'Sécurité',
        paragraphs: [
          'Les échanges entre l’application et nos serveurs sont chiffrés, et l’accès aux données est limité aux seuls membres de chaque foyer.',
        ],
      },
      {
        icon: 'chatbubbles-outline',
        title: 'Nous contacter',
        paragraphs: [
          `Pour exercer vos droits ou poser une question, écrivez-nous à ${CONTACT_EMAIL}. Vous pouvez aussi adresser une réclamation à la CNIL (www.cnil.fr).`,
        ],
      },
    ],
  },

  terms: {
    title: 'Conditions d’utilisation',
    subtitle: 'Les règles d’utilisation de l’application US.',
    icon: 'reader-outline',
    updatedAt: '[date de mise à jour]',
    sections: [
      {
        icon: 'construct-outline',
        title: 'En cours de rédaction',
        paragraphs: [
          'Les conditions d’utilisation seront ajoutées avant la mise en ligne de l’application.',
        ],
      },
    ],
  },
};
