// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // HTML whitespace semantics: a line break between text and a tag or expression renders as
  // a space. The "jsx" default would silently glue words together in prose.
  compressHTML: true,
  // Pages are served as /page/ directories; internal links always end with a slash.
  build: { format: 'directory' },
});
