import { SITE_INDEXABLE } from 'astro:env/server';
import type { APIRoute } from 'astro';

/**
 * robots.txt. Crawling stays allowed while the site is not indexable: the noindex tag on
 * every page is what keeps it out of search results, and a crawler blocked here would
 * never read that tag. The sitemap is announced only once the site may be indexed.
 */
export const GET: APIRoute = ({ site, url }) => {
  const lines = ['User-agent: *', 'Allow: /'];
  if (SITE_INDEXABLE)
    lines.push('', `Sitemap: ${new URL('/sitemap.xml', site ?? url.origin).href}`);
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
