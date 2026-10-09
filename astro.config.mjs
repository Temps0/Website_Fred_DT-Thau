// @ts-check
import node from '@astrojs/node';
import { defineConfig } from 'astro/config';

/**
 * Public domain of the site (e.g. "dt-thau.fr"), read at build time. Behind the reverse
 * proxy it lets Astro trust the forwarded host, protocol and client IP; without it, form
 * submissions would fail the origin check. Leave unset for local development.
 */
const siteDomain = process.env.SITE_DOMAIN?.trim() || undefined;
if (siteDomain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(siteDomain)) {
  throw new Error(`SITE_DOMAIN must be a bare domain such as "dt-thau.fr", got "${siteDomain}"`);
}

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: siteDomain ? `https://${siteDomain}` : undefined,
  // Pages stay prerendered; only routes that opt out (forms) run on the Node server.
  adapter: node({
    mode: 'standalone',
    // Form posts are a few kilobytes: refuse anything bigger instead of buffering 1 GB.
    bodySizeLimit: 100 * 1024,
  }),
  security: {
    allowedDomains: siteDomain
      ? [
          { hostname: siteDomain, protocol: 'https' },
          { hostname: `www.${siteDomain}`, protocol: 'https' },
        ]
      : [],
  },
  // HTML whitespace semantics: a line break between text and a tag or expression renders as
  // a space. The "jsx" default would silently glue words together in prose.
  compressHTML: true,
  // Pages are served as /page/ directories; internal links always end with a slash.
  build: { format: 'directory' },
});
