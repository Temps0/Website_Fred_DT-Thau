import { z } from 'astro/zod';

/**
 * Survey definition format. A survey is data (src/content/surveys.json): the page renders
 * any survey that matches this schema, so questions change without touching the code.
 */

const baseQuestion = {
  /** Stable key used to store answers: lowercase letters, digits and dashes. */
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string(),
  help: z.string().optional(),
  required: z.boolean().default(false),
};

const choiceOptions = z.array(z.string()).min(2);

export const surveyQuestionSchema = z.discriminatedUnion('type', [
  z.object({ ...baseQuestion, type: z.literal('short-text') }),
  z.object({ ...baseQuestion, type: z.literal('long-text') }),
  z.object({ ...baseQuestion, type: z.literal('single-choice'), options: choiceOptions }),
  // HTML cannot require "at least one" checkbox, so multiple-choice questions are optional.
  z.object({
    ...baseQuestion,
    type: z.literal('multiple-choice'),
    options: choiceOptions,
    required: z.literal(false).default(false),
  }),
  z.object({
    ...baseQuestion,
    type: z.literal('scale'),
    min: z.number().int(),
    max: z.number().int(),
    minLabel: z.string(),
    maxLabel: z.string(),
  }),
]);

/** Field names the survey page uses itself, next to the questions. */
const RESERVED_QUESTION_IDS = new Set(['email']);

export const surveySchema = z
  .object({
    title: z.string(),
    intro: z.string(),
    duration: z.string(),
    sections: z
      .array(
        z.object({
          title: z.string(),
          questions: z.array(surveyQuestionSchema).min(1),
        }),
      )
      .min(1),
  })
  // The file is meant to be edited by hand: catch mistakes at build time, before two
  // questions silently share a form field or a stored answer.
  .superRefine((survey, ctx) => {
    const seenIds = new Set<string>();
    survey.sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        const path = ['sections', sectionIndex, 'questions', questionIndex];
        if (seenIds.has(question.id)) {
          ctx.addIssue({
            code: 'custom',
            path: [...path, 'id'],
            message: `Duplicate question id "${question.id}": each id names a stored answer.`,
          });
        }
        seenIds.add(question.id);
        if (RESERVED_QUESTION_IDS.has(question.id)) {
          ctx.addIssue({
            code: 'custom',
            path: [...path, 'id'],
            message: `Question id "${question.id}" is reserved by the survey page.`,
          });
        }
        if (question.type === 'scale' && question.max <= question.min) {
          ctx.addIssue({
            code: 'custom',
            path: [...path, 'max'],
            message: 'A scale needs max greater than min.',
          });
        }
      });
    });
  });

export type SurveyQuestion = z.infer<typeof surveyQuestionSchema>;
