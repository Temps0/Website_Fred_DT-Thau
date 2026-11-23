/**
 * Progress of the questionnaire, in its index of parts: how many questions are filled in,
 * and a check beside each part whose questions are all answered. A visual aid only: the
 * count is not announced on every keystroke, and without JavaScript it stays hidden.
 */
const form = document.querySelector<HTMLFormElement>('[data-survey-form]');
const progress = document.querySelector<HTMLElement>('[data-survey-progress]');

if (form && progress) {
  const questions = [...form.querySelectorAll<HTMLElement>('.question')];

  const isAnswered = (question: HTMLElement) =>
    [...question.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')].some(
      (field) =>
        field instanceof HTMLInputElement && (field.type === 'radio' || field.type === 'checkbox')
          ? field.checked
          : field.value.trim() !== '',
    );

  const parts = [...document.querySelectorAll<HTMLAnchorElement>('[data-survey-part]')].map(
    (link) => ({
      link,
      questions: [
        ...(document
          .getElementById(link.hash.slice(1))
          ?.closest('section')
          ?.querySelectorAll<HTMLElement>('.question') ?? []),
      ],
    }),
  );

  const update = () => {
    const answered = questions.filter(isAnswered).length;
    const plural = answered > 1 ? 's' : '';
    progress.textContent = `${answered} question${plural} sur ${questions.length} remplie${plural}`;
    for (const part of parts) {
      const complete = part.questions.length > 0 && part.questions.every(isAnswered);
      part.link.classList.toggle('is-complete', complete);
    }
  };

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  progress.hidden = false;
  update();
}
