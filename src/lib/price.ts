/**
 * Prices as shown to visitors: "1 490 € HT", "49,67 € HT". French formatting groups
 * thousands with a narrow no-break space (U+202F), which the title font lacks: it is
 * replaced by a regular no-break space (U+00A0).
 */
const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number): string {
  return `${euros.format(amount).replace(/ /g, ' ')} HT`;
}

/** Cost of a formula for a group: one session per group of `sessionSize` students at most. */
export function quote(amount: number, students: number, sessionSize: number) {
  const sessions = Math.max(1, Math.ceil(students / sessionSize));
  const total = sessions * amount;
  return { sessions, total, perStudent: total / students };
}
