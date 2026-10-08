import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { trainingNeedIds } from './data/training-needs';
import { surveySchema } from './lib/survey';

/**
 * Training courses, one Markdown file each. Adding a course only takes a new file.
 *
 * The optional fields are the public information the Qualiopi quality framework requires
 * (indicator 1). They are hidden while empty, so certification needs no redesign.
 */
const formations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/formations' }),
  schema: z.object({
    title: z.string(),
    need: z.enum(trainingNeedIds),
    /** Position within its need, ascending. */
    order: z.number().int().default(0),
    objective: z.string(),
    audience: z.string(),
    duration: z.string(),
    format: z.string(),
    benefit: z.string(),
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

export const collections = { formations, surveys };
