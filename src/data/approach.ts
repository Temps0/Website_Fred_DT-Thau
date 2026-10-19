import type { IconName } from '../lib/icons';
import { area } from './site';

/**
 * The four principles of the approach. Titles and summaries come from the client's
 * catalogue (docs/V1 Ntebook Synthèse catalogue), details from the client brief.
 */

export interface Principle {
  id: string;
  icon: IconName;
  title: string;
  summary: string;
  /** Longer explanation, shown on the approach page only. */
  detail: string;
}

export const principles: Principle[] = [
  {
    id: 'accessible',
    icon: 'door-open',
    title: 'Accessible',
    summary: 'Des notions complexes expliquées simplement, sans prérequis.',
    detail:
      'Rendre les enjeux de la transition écologique compréhensibles, avec des explications simples, précises et adaptées aux réalités de chacun.',
  },
  {
    id: 'concrete',
    icon: 'briefcase',
    title: 'Concrète',
    summary: 'Exercices et cas d’entreprise pour passer de la théorie à la pratique.',
    detail:
      'Partir des problématiques concrètes de l’entreprise pour identifier les priorités et les premières actions réellement pertinentes.',
  },
  {
    id: 'locale',
    icon: 'map-pin',
    title: 'Locale',
    summary: `Une approche qui intègre directement les enjeux du ${area}.`,
    detail:
      'Intégrer les spécificités du territoire et favoriser une compréhension commune, pour permettre à chacun de contribuer à la transition.',
  },
  {
    id: 'flexible',
    icon: 'sliders-horizontal',
    title: 'Flexible',
    summary: 'Des modules adaptés au niveau et à la spécialité des participants.',
    detail:
      'En présentiel ou à distance, en inter ou en intra-entreprise : le format s’adapte à votre organisation, et le contenu à votre secteur.',
  },
];
