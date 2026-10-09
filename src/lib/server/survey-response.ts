import { z } from 'astro/zod';
import {
  SURVEY_CONSENT_FIELD,
  SURVEY_EMAIL_FIELD,
  type SurveyAnswer,
  type SurveyQuestion,
} from '../survey';
import { saveSurveyResponse } from './db';
import { type FormOutcome, readForm, readText } from './forms';
import { createSubmissionLimiter, readStartedAt, spamCheck } from './spam';

export interface SurveyValues {
  answers: Record<string, SurveyAnswer>;
  email: string;
  contactConsent: boolean;
}

const MAX_LENGTH = { 'short-text': 300, 'long-text': 3000 } as const;
const emailSchema = z.email().max(254);
// 5 responses per visitor every 10 minutes, 50 per hour for everybody.
const checkSubmission = createSubmissionLimiter(
  { limit: 5, windowMs: 10 * 60_000 },
  { limit: 50, windowMs: 60 * 60_000 },
);

function readAnswer(form: FormData, question: SurveyQuestion): SurveyAnswer {
  if (question.type !== 'multiple-choice') return readText(form, question.id);
  const values = form.getAll(question.id).filter((value) => typeof value === 'string');
  return [...new Set(values.map((value) => value.trim()))];
}

/** Checks one answer against its question; returns the error message, if any. */
function answerError(question: SurveyQuestion, answer: SurveyAnswer): string | undefined {
  switch (question.type) {
    case 'short-text':
    case 'long-text': {
      const text = answer as string;
      const max = MAX_LENGTH[question.type];
      if (question.required && text === '') return 'Répondez à cette question.';
      if (text.length > max) return `Votre réponse est trop longue : ${max} caractères au maximum.`;
      return undefined;
    }
    case 'single-choice': {
      const choice = answer as string;
      if (choice === '') return question.required ? 'Choisissez une réponse.' : undefined;
      return question.options.includes(choice)
        ? undefined
        : 'Choisissez une des réponses proposées.';
    }
    case 'multiple-choice': {
      const choices = answer as string[];
      return choices.every((choice) => question.options.includes(choice))
        ? undefined
        : 'Choisissez parmi les réponses proposées.';
    }
    case 'scale': {
      const note = answer as string;
      if (note === '') return question.required ? 'Choisissez une note.' : undefined;
      const value = Number(note);
      return Number.isInteger(value) && value >= question.min && value <= question.max
        ? undefined
        : `Choisissez une note entre ${question.min} et ${question.max}.`;
    }
  }
}

/** Answers ready to store: empty optional answers left out, notes as numbers. */
function storedAnswers(questions: SurveyQuestion[], answers: Record<string, SurveyAnswer>) {
  const stored: Record<string, string | string[] | number> = {};
  for (const question of questions) {
    const answer = answers[question.id];
    if (answer === '' || (Array.isArray(answer) && answer.length === 0)) continue;
    stored[question.id] = question.type === 'scale' ? Number(answer) : answer;
  }
  return stored;
}

/** Validates and stores a survey post. */
export async function handleSurveyPost(
  request: Request,
  clientAddress: string,
  survey: { id: string; questions: SurveyQuestion[] },
): Promise<FormOutcome<SurveyValues>> {
  const form = await readForm(request);
  if (!form) return { status: 'unreadable' };

  const values: SurveyValues = {
    answers: Object.fromEntries(survey.questions.map((q) => [q.id, readAnswer(form, q)])),
    email: readText(form, SURVEY_EMAIL_FIELD),
    contactConsent: form.get(SURVEY_CONSENT_FIELD) === 'yes',
  };

  const spam = spamCheck(form);
  // Pretend success to bots, so they do not learn how to get through.
  if (spam === 'honeypot') return { status: 'sent' };

  const errors: Record<string, string> = {};
  for (const question of survey.questions) {
    const error = answerError(question, values.answers[question.id] ?? '');
    if (error) errors[question.id] = error;
  }
  if (values.email !== '' && !emailSchema.safeParse(values.email).success) {
    errors[SURVEY_EMAIL_FIELD] =
      'Indiquez une adresse e-mail valide, par exemple nom@entreprise.fr.';
  } else if (values.email !== '' && !values.contactConsent) {
    errors[SURVEY_CONSENT_FIELD] =
      'Cochez la case pour nous autoriser à vous recontacter, ou effacez votre adresse e-mail.';
  } else if (values.email === '' && values.contactConsent) {
    errors[SURVEY_EMAIL_FIELD] = 'Indiquez votre adresse e-mail, ou décochez la case.';
  }
  if (Object.keys(errors).length > 0) {
    return { status: 'invalid', values, errors, startedAt: readStartedAt(form) };
  }
  // Never a fake success here: a quick person would lose the answers without knowing.
  if (spam === 'too-fast') return { status: 'too-fast', values };
  // Count only valid posts: correcting an answer must not lock a respondent out.
  const limit = checkSubmission(clientAddress);
  if (limit !== 'ok') return { status: 'rate-limited', values, limit };

  try {
    saveSurveyResponse({
      surveyId: survey.id,
      answers: storedAnswers(survey.questions, values.answers),
      contactEmail: values.contactConsent ? values.email : null,
    });
    return { status: 'sent' };
  } catch (error) {
    // Log the failure without the respondent's answers.
    console.error('Could not store survey response:', (error as Error).message);
    return { status: 'failed', values };
  }
}
