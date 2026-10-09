import { z } from 'astro/zod';
import { saveContactMessage } from './db';
import { type FormOutcome, fieldErrors, readForm, readText } from './forms';
import { createSubmissionLimiter, readStartedAt, spamCheck } from './spam';

export interface ContactValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

const contactSchema = z.object({
  name: z.string().min(1, 'Indiquez votre nom.').max(120, 'Votre nom est trop long.'),
  company: z
    .string()
    .min(1, 'Indiquez le nom de votre entreprise.')
    .max(160, 'Le nom de l’entreprise est trop long.'),
  email: z
    .string()
    .max(254, 'L’adresse e-mail est trop longue.')
    .pipe(z.email('Indiquez une adresse e-mail valide, par exemple nom@entreprise.fr.')),
  phone: z
    .string()
    .max(30, 'Le numéro de téléphone est trop long.')
    .regex(
      /^[0-9+().\s-]*$/,
      'Indiquez un numéro de téléphone valide, par exemple 04 67 00 00 00.',
    ),
  message: z
    .string()
    .min(1, 'Écrivez votre message.')
    .max(5000, 'Votre message est trop long : 5 000 caractères au maximum.'),
});

// 5 messages per visitor every 10 minutes, 50 per hour for everybody.
const checkSubmission = createSubmissionLimiter(
  { limit: 5, windowMs: 10 * 60_000 },
  { limit: 50, windowMs: 60 * 60_000 },
);

/** Validates and stores a contact form post. */
export async function handleContactPost(
  request: Request,
  clientAddress: string,
): Promise<FormOutcome<ContactValues>> {
  const form = await readForm(request);
  if (!form) return { status: 'unreadable' };
  const values: ContactValues = {
    name: readText(form, 'name'),
    company: readText(form, 'company'),
    email: readText(form, 'email'),
    phone: readText(form, 'phone'),
    message: readText(form, 'message'),
  };

  const spam = spamCheck(form);
  // Pretend success to bots, so they do not learn how to get through.
  if (spam === 'honeypot') return { status: 'sent' };

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return { status: 'invalid', values, errors, startedAt: readStartedAt(form) };
  }
  // Never a fake success here: a quick person would lose the message without knowing.
  if (spam === 'too-fast') return { status: 'too-fast', values };
  // Count only valid posts: correcting a typo must not lock a visitor out.
  const limit = checkSubmission(clientAddress);
  if (limit !== 'ok') return { status: 'rate-limited', values, limit };

  try {
    saveContactMessage({ ...parsed.data, phone: parsed.data.phone || null });
    return { status: 'sent' };
  } catch (error) {
    // Log the failure without the visitor's data.
    console.error('Could not store contact message:', (error as Error).message);
    return { status: 'failed', values };
  }
}
