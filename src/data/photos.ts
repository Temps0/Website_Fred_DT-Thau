/**
 * Photographs of the site: openly licensed pictures of the work DT-Thau does (workshops,
 * climate data, companies acting) and four of the Thau basin. The licences cover the
 * photographers' rights, not the image rights of the people in a picture: two photographs
 * show recognisable people (repairCafe, workshop) and are kept by the site owner's
 * decision, the risk on image rights being accepted; replace them to remove it. Pictures of
 * recognisable people flagged for personality rights on Commons are not used.
 *
 * None of them shows DT-Thau, its trainers or its trainees: captions say what each picture
 * is, never that it is the client's own. Each one is credited on the legal notice page,
 * from src/assets/photos/credits.json (recorded when the file was downloaded).
 */
import type { ImageMetadata } from 'astro';
import atelierParticipatif from '../assets/photos/atelier-participatif.jpg';
import cargoEbikeDelivery from '../assets/photos/cargo-ebike-delivery.jpg';
import credits from '../assets/photos/credits.json';
import deadAleppoPineThau from '../assets/photos/dead-aleppo-pine-thau.jpg';
import fresqueDuClimatAtelier from '../assets/photos/fresque-du-climat-atelier.jpg';
import fresqueDuClimatEnsta from '../assets/photos/fresque-du-climat-ensta.jpg';
import lidoDeThau from '../assets/photos/lido-de-thau.jpg';
import repairCafe from '../assets/photos/repair-cafe.jpg';
import solarPanelsRoof from '../assets/photos/solar-panels-roof.jpg';
import strategyWorkshopStickyNotes from '../assets/photos/strategy-workshop-sticky-notes.jpg';
import thauOysterParksIfremer from '../assets/photos/thau-oyster-parks-ifremer.jpg';
import thauOysterTablesLoupian from '../assets/photos/thau-oyster-tables-loupian.jpg';
import warmingStripesFrance from '../assets/photos/warming-stripes-france.png';

export interface Photo {
  src: ImageMetadata;
  /** What the picture shows, for screen readers. */
  alt: string;
  /** Short visible caption: what the picture is, never a claim that it is DT-Thau's. */
  caption: string;
}

export const photos = {
  climateFresk: {
    src: fresqueDuClimatAtelier,
    alt: 'Cartes d’un atelier Fresque du Climat posées sur une grande feuille et reliées par des flèches tracées au feutre.',
    caption: 'Un atelier Fresque du Climat : relier les causes et les effets du dérèglement.',
  },
  climateFreskStudents: {
    src: fresqueDuClimatEnsta,
    alt: 'Cartes de la Fresque du Climat disposées et reliées sur une table, lors d’un atelier dans une école d’ingénieurs.',
    caption: 'Une Fresque du Climat menée dans une école d’ingénieurs (ENSTA).',
  },
  warmingStripes: {
    src: warmingStripesFrance,
    alt: 'Bandes de réchauffement de la France : une bande verticale par année, du bleu pour les années froides au rouge pour les plus chaudes, le rouge dominant à droite.',
    caption: 'Les températures moyennes de la France, une bande par année (Ed Hawkins).',
  },
  strategyWorkshop: {
    src: strategyWorkshopStickyNotes,
    alt: 'Mur couvert de post-it orange, jaunes et roses rédigés pendant un atelier de travail en équipe.',
    caption: 'Un mur de post-it en atelier : prioriser les enjeux, répartir les actions.',
  },
  cargoBike: {
    src: cargoEbikeDelivery,
    alt: 'Vélo-cargo électrique de livraison, avec son caisson, garé au bord d’un trottoir.',
    caption: 'Un vélo-cargo de livraison : une décision logistique qui change l’empreinte carbone.',
  },
  solarRoof: {
    src: solarPanelsRoof,
    alt: 'Rangées de panneaux solaires installées sur une toiture en pente.',
    caption: 'Des panneaux solaires sur une toiture.',
  },
  oysterTables: {
    src: thauOysterTablesLoupian,
    alt: 'Tables ostréicoles alignées sur l’étang de Thau, vues depuis Loupian, avec le mont Saint-Clair de Sète à l’horizon.',
    caption:
      'Les tables ostréicoles de l’étang vues de Loupian : les entreprises conchylicoles du bassin.',
  },
  lido: {
    src: lidoDeThau,
    alt: 'Le Lido de Thau : un chemin sur une digue herbeuse, entre l’étang de Thau et d’anciens salins.',
    caption: 'Le Lido de Thau, espace naturel protégé par le Conservatoire du littoral.',
  },
  repairCafe: {
    src: repairCafe,
    alt: 'Bénévoles et habitants penchés sur des objets à réparer autour d’une table, outils en main, lors d’un Repair Café.',
    caption: 'Un Repair Café : bénévoles et habitants réparent ensemble.',
  },
  workshop: {
    src: atelierParticipatif,
    alt: 'Une animatrice présente un écran à un petit groupe assis, lors d’un atelier en bibliothèque.',
    caption: 'Un atelier participatif en petit groupe.',
  },
  oysterParks: {
    src: thauOysterParksIfremer,
    alt: 'Tables ostréicoles alignées en rangées sur l’étang de Thau, avec la rive bâtie à l’arrière-plan.',
    caption:
      'Les parcs à huîtres de l’étang de Thau, une économie qui dépend de la qualité de l’eau (Ifremer).',
  },
  deadPine: {
    src: deadAleppoPineThau,
    alt: 'Un pin d’Alep mort, sans aiguilles, au premier plan ; l’étang de Thau en contrebas.',
    caption: 'Un pin d’Alep mort au bord de l’étang de Thau.',
  },
} satisfies Record<string, Photo>;

export interface PhotoCredit {
  title: string;
  creator: string;
  /** Licence name, e.g. "CC BY 4.0"; "CC0" is a public domain dedication. */
  license: string;
  licenseUrl: string;
  /** The picture's page in its source collection. */
  page: string;
  via: string;
}

/** Credits of every photograph, in the order they were downloaded. */
export const photoCredits: PhotoCredit[] = credits.map(
  ({ title, creator, license, licenseUrl, page, via }) => ({
    title,
    creator,
    license,
    licenseUrl,
    page,
    via,
  }),
);
