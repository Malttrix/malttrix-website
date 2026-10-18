/* Front-facing logo motion, suspended offscreen and for reduced motion. */
(() => {
  'use strict';
  const models = [...document.querySelectorAll('.bio-brand-model')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set(), interacted = new WeakMap(), failed = new WeakSet();
  let frame = 0;
  function tick(now) {
    frame = 0;
    models.forEach((model, index) => {
      if (!visible.has(model) || failed.has(model) || now - (interacted.get(model) ?? -Infinity) < 6000) return;
      const t = now / 1000 + index * 1.8;
      model.setAttribute('camera-orbit', `${(Math.sin(t * .38) * 12).toFixed(2)}deg ${(90 + Math.sin(t * .27) * 3).toFixed(2)}deg auto`);
    });
    if (visible.size && !reduced.matches && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function update() {
    cancelAnimationFrame(frame); frame = 0;
    models.forEach(model => {
      const active = visible.has(model) && !reduced.matches && !document.hidden && !failed.has(model);
      model.removeAttribute('auto-rotate');
      model.parentElement.classList.toggle('bio-model-active', active);
      if (reduced.matches) model.setAttribute('camera-orbit', '0deg 90deg auto');
    });
    if (visible.size && !reduced.matches && !document.hidden) frame = requestAnimationFrame(tick);
  }
  models.forEach(model => {
    const host = model.parentElement;
    model.addEventListener('camera-change', event => {
      if (event.detail?.source === 'user-interaction') interacted.set(model, performance.now());
    });
    model.addEventListener('pointerdown', () => interacted.set(model, performance.now()));
    model.addEventListener('error', () => { failed.add(model); update(); });
    host.addEventListener('pointermove', event => {
      if (reduced.matches || event.pointerType !== 'mouse') return;
      const rect = host.getBoundingClientRect();
      host.style.setProperty('--glow-x', `${100 * (event.clientX - rect.left) / rect.width}%`);
      host.style.setProperty('--glow-y', `${100 * (event.clientY - rect.top) / rect.height}%`);
    });
    host.addEventListener('pointerleave', () => {
      host.style.removeProperty('--glow-x'); host.style.removeProperty('--glow-y');
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      update();
    });
    models.forEach(model => observer.observe(model));
  }
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pageshow', update);
  update();
})();
