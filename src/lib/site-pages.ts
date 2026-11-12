import { contactNav, legalNav, mainNav, surveyNav } from '../data/site';

/** Every public page, in the order of the sitemap. The 404 page is left out on purpose. */
export const sitePages: string[] = [
  '/',
  ...mainNav.map((item) => item.href),
  contactNav.href,
  surveyNav.href,
  ...legalNav.map((item) => item.href),
];
