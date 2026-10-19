import type { IconName } from '../lib/icons';

/**
 * The three audiences of the CAP TRANSITION programmes, with the wording of the client's
 * catalogue (docs/V1 Ntebook Synthèse catalogue).
 */

export interface Audience {
  /** Anchor on the programmes page. */
  id: string;
  name: string;
  icon: IconName;
  summary: string;
}

export const audiences: Audience[] = [
  {
    id: 'ecoles',
    name: 'Écoles, universités & CFA',
    icon: 'graduation-cap',
    summary: 'Programme « CAP TRANSITION Étudiants » : donner les clés de l’action en entreprise.',
  },
  {
    id: 'pme',
    name: 'TPE / PME',
    icon: 'factory',
    summary: 'Engager les collaborateurs dans une stratégie RSE pragmatique.',
  },
  {
    id: 'collectivites',
    name: 'Collectivités & associations',
    icon: 'landmark',
    summary: 'Sensibiliser et structurer l’action territoriale et grand public.',
  },
];

/** Delivery modes listed in the catalogue, for every audience. */
export const modalities: { icon: IconName; label: string }[] = [
  { icon: 'monitor', label: 'Présentiel ou distanciel' },
  { icon: 'users', label: 'Inter ou intra-entreprise' },
];
