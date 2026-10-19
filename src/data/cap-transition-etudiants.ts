/**
 * The CAP TRANSITION Étudiants offer, from the client's commercial deck
 * (docs/Visuel Notebook offre commerciale CAP-TRANSITION-ETUDIANTS). Prices are shown
 * without the struck-through reference prices of the deck until the client confirms them.
 */

export const studentProgramme = {
  name: 'CAP TRANSITION Étudiants',
  promise: 'Donner aux étudiants les clés de la transition écologique en entreprise.',
  quote:
    'Préparer la nouvelle génération aux réalités de l’entreprise de demain n’est plus une option. C’est notre responsabilité partagée.',
  highlights: [
    '3\u00a0modules courts',
    'Concrets et orientés entreprise',
    'Accessibles à toutes les filières',
  ],
  offers: [
    {
      name: 'Découverte',
      content: '1\u00a0module au choix',
      duration: '3\u00a0h',
      price: '600\u00a0€\u00a0HT',
    },
    {
      name: 'Intermédiaire',
      content: '2\u00a0modules au choix',
      duration: '6\u00a0h',
      price: '990\u00a0€\u00a0HT',
    },
    {
      name: 'Intégral',
      content: 'Parcours complet',
      duration: '9\u00a0h',
      price: '1\u00a0490\u00a0€\u00a0HT',
    },
  ],
  perStudent: 'Soit 20\u00a0€\u00a0HT par étudiant',
  perStudentBasis: 'base : module de 3\u00a0h pour 30\u00a0étudiants',
  conditions:
    'Tarifs valables jusqu’au 31\u00a0janvier 2027, pour des sessions présentielles de 30\u00a0étudiants au maximum.',
  included: ['Supports pédagogiques inclus', 'Quiz et évaluation des acquis'],
  custom: {
    question: 'Vous souhaitez adapter ce parcours aux spécialités de vos étudiants ?',
    answer:
      'Coconstruisons une offre sur mesure (sur devis), parfaitement intégrée à vos programmes.',
  },
} as const;
