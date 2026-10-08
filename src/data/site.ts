/**
 * Site-wide data: company identity and navigation.
 *
 * Company details come from the client brief. `null` means the value is not known yet
 * and is rendered as a visible "[À COMPLÉTER]" placeholder: never invent legal data.
 */

export const company = {
  name: 'DT-THAU',
  legalForm: 'Société par actions simplifiée à associé unique (SASU)',
  capital: '1\u00a0000,00\u00a0€',
  address: {
    street: '23 Rue de la Farigoulette',
    postalCode: '34140',
    city: 'Mèze',
  },
  registration: '109\u00a0526\u00a0293 R.C.S. Montpellier',
  euid: 'FR3405.109526293',
  phone: null as string | null,
  email: null as string | null,
  vatNumber: null as string | null,
  publicationDirector: null as string | null,
  /** Activity declaration number of the training provider (Code du travail). */
  trainingDeclarationNumber: null as string | null,
} as const;

export const area = 'Bassin de Thau';

export interface NavItem {
  href: string;
  label: string;
}

export const mainNav: NavItem[] = [
  { href: '/formations/', label: 'Formations' },
  { href: '/approche/', label: 'Notre approche' },
  { href: '/qui-sommes-nous/', label: 'Qui sommes-nous\u00a0?' },
];

export const contactNav: NavItem = { href: '/contact/', label: 'Contact' };

export const surveyNav: NavItem = { href: '/questionnaire/', label: 'Questionnaire entreprises' };

export const legalNav: NavItem[] = [
  { href: '/mentions-legales/', label: 'Mentions légales' },
  { href: '/confidentialite/', label: 'Politique de confidentialité' },
];
