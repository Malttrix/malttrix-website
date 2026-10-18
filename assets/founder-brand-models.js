/* Keep brand sculptures still when motion is reduced or the page is hidden. */
(() => {
  'use strict';
  const models = [...document.querySelectorAll('.bio-brand-model')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  const update = () => models.forEach(model => {
    model.toggleAttribute('auto-rotate', !reduced.matches && !document.hidden && visible.has(model));
    model.setAttribute('rotation-per-second', '8deg');
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      update();
    });
    models.forEach(model => observer.observe(model));
  }
  models.forEach(model => model.addEventListener('error', () => {
    model.removeAttribute('auto-rotate');
    model.parentElement.classList.add('bio-model-unavailable');
  }));
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  update();
})();
