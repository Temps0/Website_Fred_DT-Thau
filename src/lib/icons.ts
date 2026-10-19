/**
 * Pictograms used on the site, from Lucide (ISC licence, lucide-static). Only the icons
 * imported here end up in the build: add an import to use a new one.
 */
import check from 'lucide-static/icons/check.svg?raw';
import factory from 'lucide-static/icons/factory.svg?raw';
import footprints from 'lucide-static/icons/footprints.svg?raw';
import graduationCap from 'lucide-static/icons/graduation-cap.svg?raw';
import handshake from 'lucide-static/icons/handshake.svg?raw';
import landmark from 'lucide-static/icons/landmark.svg?raw';
import monitor from 'lucide-static/icons/monitor.svg?raw';
import thermometerSun from 'lucide-static/icons/thermometer-sun.svg?raw';
import users from 'lucide-static/icons/users.svg?raw';

export const icons = {
  check,
  factory,
  footprints,
  'graduation-cap': graduationCap,
  handshake,
  landmark,
  monitor,
  'thermometer-sun': thermometerSun,
  users,
} as const;

export type IconName = keyof typeof icons;
