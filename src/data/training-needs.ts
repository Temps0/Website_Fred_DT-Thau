/**
 * The four needs the training offer is organised by (client brief). Each training file in
 * src/content/formations declares one of these ids in its `need` field.
 */

export const trainingNeedIds = ['comprendre', 'demarche-rse', 'priorites', 'action'] as const;

export type TrainingNeedId = (typeof trainingNeedIds)[number];

export interface TrainingNeed {
  id: TrainingNeedId;
  title: string;
  intro: string;
}

export const trainingNeeds: TrainingNeed[] = [
  {
    id: 'comprendre',
    title: 'Comprendre les enjeux',
    intro: 'Pour savoir de quoi on parle et ce que cela change pour votre activité.',
  },
  {
    id: 'demarche-rse',
    title: 'Engager une démarche RSE',
    intro:
      'Pour structurer votre engagement et répondre aux attentes de vos clients et partenaires.',
  },
  {
    id: 'priorites',
    title: 'Identifier les priorités',
    intro: 'Pour concentrer vos efforts là où ils comptent vraiment.',
  },
  {
    id: 'action',
    title: 'Passer à l’action',
    intro: 'Pour transformer vos priorités en actions concrètes.',
  },
];
