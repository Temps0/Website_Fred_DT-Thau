/**
 * Entrance of the sections: the children of each [data-reveal] block rise into place, one
 * after the other, the first time the block enters the screen (styles in base.css).
 *
 * Only blocks still below the screen are hidden, and only by this script: without
 * JavaScript, with reduced motion, or for what is visible on load, nothing is ever hidden.
 */
const blocks = document.querySelectorAll<HTMLElement>('[data-reveal]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (blocks.length > 0 && !reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  for (const block of blocks) {
    if (block.getBoundingClientRect().top < window.innerHeight) continue;
    block.classList.add('is-pending');
    observer.observe(block);
  }
}
