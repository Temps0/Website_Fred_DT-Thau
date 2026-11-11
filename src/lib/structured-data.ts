import { area, brand, company, founder, phoneHref } from '../data/site';

/**
 * Schema.org description of DT-THAU for search engines (JSON-LD, home page only). Built
 * from the same data as the legal notice, so the name, address and phone stay identical
 * everywhere; missing values are left out rather than guessed.
 */
export function organizationJsonLd(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: brand.name,
    legalName: company.name,
    url: new URL('/', site).href,
    description: `Formations à la transition écologique et à la RSE pour les entreprises, les établissements d’enseignement et les collectivités du ${area}.`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      postalCode: company.address.postalCode,
      addressLocality: company.address.city,
      addressCountry: 'FR',
    },
    ...(company.phone && { telephone: phoneHref(company.phone).replace('tel:', '') }),
    ...(company.email && { email: company.email }),
    areaServed: { '@type': 'Place', name: area },
    founder: { '@type': 'Person', name: founder.name, sameAs: founder.linkedin },
  };
}
