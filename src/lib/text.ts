/**
 * Text helpers for content written in data files (Markdown front matter, JSON).
 */

const PLACEHOLDER_PATTERN = /^\[À COMPLÉTER\s*:\s*(.+)\]$/s;

/** Returns the description inside a "[À COMPLÉTER : …]" value, or null for real content. */
export function placeholderText(value: string): string | null {
  return PLACEHOLDER_PATTERN.exec(value.trim())?.[1] ?? null;
}

/**
 * Applies French typographic spacing, so that content authors can type plain spaces:
 * non-breaking space before : ; ? ! and inside « ».
 */
export function frenchSpacing(text: string): string {
  return text.replace(/ +([:;?!»])/g, '\u00a0$1').replace(/« +/g, '«\u00a0');
}
