// @ts-check
import node from '@astrojs/node';
import { defineConfig, envField } from 'astro/config';

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
    // Strict CSP: Astro adds hashes for its own scripts and styles, nothing else may run.
    // Prerendered pages carry it in a <meta> tag, server-rendered pages in a response
    // header. frame-ancestors cannot live in a <meta> tag: it is sent by the reverse proxy
    // with the other security headers (deploy/Caddyfile.example).
    // The adapter's staticHeaders option is not used: its route lookup matches paths by
    // substring and serves the wrong policy (or none) for /page/ URLs and for "/".
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
  env: {
    schema: {
      // Directory of the SQLite database holding form submissions (a volume in production).
      // Declared "secret" so that it is read when the server starts: "public" server
      // variables are frozen into the bundle at build time.
      DATA_DIR: envField.string({ context: 'server', access: 'secret', default: './data' }),
      // Search engines may index the site only when this is "true" at build time. It stays
      // off while legal or factual content is still "[À COMPLÉTER]": every page then carries
      // a noindex tag and robots.txt does not announce the sitemap.
      SITE_INDEXABLE: envField.boolean({ context: 'server', access: 'public', default: false }),
    },
  },
  // HTML whitespace semantics: a line break between text and a tag or expression renders as
  // a space. The "jsx" default would silently glue words together in prose.
  compressHTML: true,
  // Pages are served as /page/ directories; internal links always end with a slash.
  build: { format: 'directory' },
});
