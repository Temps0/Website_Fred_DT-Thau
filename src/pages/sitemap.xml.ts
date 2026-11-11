import type { APIRoute } from 'astro';
import { sitePages } from '../lib/site-pages';

/** sitemap.xml, generated at build time from the site's own page list. */
export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? url.origin;
  const entries = sitePages
    .map((path) => `  <url><loc>${new URL(path, base).href}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
