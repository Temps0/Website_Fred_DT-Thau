/**
 * Site-wide data: company identity and navigation.
 *
 * Company details come from the client brief, contact details from the client's
 * catalogue and offer decks (docs/). `null` means the value is not known yet and is
 * rendered as a visible "[À COMPLÉTER]" placeholder: never invent legal data.
 */

/** Name and baseline shown to visitors, as on the client's documents. */
export const brand = {
  name: 'DT-Thau',
  tagline: 'Durabilité & Transition',
} as const;

/** Legal identity, for the legal notice and the privacy policy. */
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
  phone: '07\u00a066\u00a069\u00a051\u00a042' as string | null,
  email: 'frederic.dessombs@gmail.com' as string | null,
  vatNumber: null as string | null,
  publicationDirector: null as string | null,
  /** Activity declaration number of the training provider (Code du travail). */
  trainingDeclarationNumber: null as string | null,
} as const;

export const founder = {
  name: 'Frédéric Dessombs',
  role: 'Dirigeant de DT-Thau',
  linkedin: 'https://www.linkedin.com/in/frederic-dessombs-066580156/',
} as const;

/**
 * `tel:` link in international format, from a number as shown to visitors: national
 * French ("07 66 …") or already international ("+33 7 66 …", "0033 7 66 …").
 */
export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return `tel:${digits}`;
  if (digits.startsWith('00')) return `tel:+${digits.slice(2)}`;
  return `tel:+33${digits.slice(1)}`;
}

export const area = 'Bassin de Thau';

export interface NavItem {
  href: string;
  label: string;
}

export const mainNav: NavItem[] = [
  { href: '/programmes/', label: 'Programmes' },
  { href: '/approche/', label: 'Notre approche' },
  { href: '/qui-sommes-nous/', label: 'Qui sommes-nous\u00a0?' },
];

export const contactNav: NavItem = { href: '/contact/', label: 'Contact' };

export const surveyNav: NavItem = { href: '/questionnaire/', label: 'Questionnaire entreprises' };

export const legalNav: NavItem[] = [
  { href: '/mentions-legales/', label: 'Mentions légales' },
  { href: '/confidentialite/', label: 'Politique de confidentialité' },
];
