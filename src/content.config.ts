import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { type IconName, icons } from './lib/icons';
import { surveySchema } from './lib/survey';

/**
 * Modules of the CAP TRANSITION programmes, one Markdown file each, from the client's
 * catalogue. Adding a module only takes a new file.
 *
 * The optional fields are the public information the Qualiopi quality framework requires
 * (indicator 1). They are hidden while empty, so certification needs no redesign.
 */
const modules = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/modules' }),
  schema: z.object({
    title: z.string(),
    /** Short theme shown as a badge, e.g. "Climat". */
    theme: z.string(),
    /** Verb of the learning path, e.g. "Décoder". */
    verb: z.string(),
    tagline: z.string(),
    /** What this step of the path brings, e.g. "Comprendre la menace". */
    pathStep: z.string(),
    icon: z.custom<IconName>((value) => typeof value === 'string' && Object.hasOwn(icons, value), {
      message: `Unknown icon: add it to src/lib/icons.ts first`,
    }),
    /** Position in the learning path, ascending. */
    order: z.number().int(),
    duration: z.string(),
    objective: z.string(),
    topics: z.array(z.string()).min(1),
    /** "Compétence acquise": what participants can do afterwards. */
    skill: z.string(),
    prerequisites: z.string().optional(),
    access: z.string().optional(),
    price: z.string().optional(),
    methods: z.string().optional(),
    assessment: z.string().optional(),
    accessibility: z.string().optional(),
  }),
});

/** Questionnaires, defined as data so questions can change without code changes. */
const surveys = defineCollection({
  loader: file('src/content/surveys.json'),
  schema: surveySchema,
});

export const collections = { modules, surveys };
