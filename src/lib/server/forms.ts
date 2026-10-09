import type { z } from 'astro/zod';

/** Result of handling a form post, rendered by the page that owns the form. */
export type FormOutcome<Values> =
  | { status: 'sent' }
  | {
      status: 'invalid';
      values: Values;
      errors: Record<string, string>;
      /** Original render time, kept so that a quick correction is not taken for a bot. */
      startedAt: number | null;
    }
  | { status: 'too-fast'; values: Values }
  | { status: 'rate-limited'; values: Values; limit: 'client' | 'global' }
  | { status: 'failed'; values: Values }
  | { status: 'unreadable' };

/**
 * Parses a form post. Returns null when the body cannot be read, for instance when it
 * exceeds the adapter's size limit: such a request comes from a script, not from the form.
 */
export async function readForm(request: Request): Promise<FormData | null> {
  try {
    return await request.formData();
  } catch {
    return null;
  }
}

/**
 * Reads a text field, trimmed, with line breaks normalised to LF: browsers count
 * maxlength with LF but send CRLF. Missing fields and file uploads become "".
 */
export function readText(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.replaceAll('\r\n', '\n').trim() : '';
}

/** Keeps the first validation message of each field, keyed by field name. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    errors[field] ??= issue.message;
  }
  return errors;
}
