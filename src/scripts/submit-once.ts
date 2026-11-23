/**
 * Forms marked `data-submit-once`: on the first submit, the button says the form is being
 * sent and further clicks are ignored, so a slow connection does not send it twice.
 *
 * The button is marked aria-disabled rather than disabled, so the focus stays on it and a
 * screen reader user hears the new label. Without JavaScript the form works as before.
 */
const pendingLabel = 'Envoi en cours…';

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-submit-once]')) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!button) continue;
  const label = button.textContent?.trim() ?? '';

  // ARIA states take the value "true"; an empty attribute would read as false.
  const setPending = (pending: boolean) => {
    form.toggleAttribute('data-pending', pending);
    for (const [element, state] of [
      [form, 'aria-busy'],
      [button, 'aria-disabled'],
    ] as const) {
      if (pending) element.setAttribute(state, 'true');
      else element.removeAttribute(state);
    }
    button.textContent = pending ? pendingLabel : label;
  };

  form.addEventListener('submit', (event) => {
    if (form.hasAttribute('data-pending')) {
      event.preventDefault();
      return;
    }
    setPending(true);
  });

  // Back to the form from the next page (back/forward cache): it is usable again.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) setPending(false);
  });
}
