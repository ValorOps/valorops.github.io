// Lab 01 signature move: deliverables sit behind frosted glass.
// A fine pointer is a clear lens through the frost; a tap places the lens;
// Inspect clears the whole pane. Under reduced motion the lens never moves.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');

if (!CSS.supports('backdrop-filter', 'blur(1px)') && !CSS.supports('-webkit-backdrop-filter', 'blur(1px)')) {
  root.classList.add('no-backdrop');
}

for (const card of document.querySelectorAll('article.pkg')) {
  const frost = card.querySelector('.frost');
  const button = card.querySelector('.inspect');
  let raf = 0;
  let pending = null;

  const place = (e) => {
    const r = frost.getBoundingClientRect();
    pending = [e.clientX - r.left, e.clientY - r.top];
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      card.style.setProperty('--lx', `${pending[0].toFixed(1)}px`);
      card.style.setProperty('--ly', `${pending[1].toFixed(1)}px`);
      card.classList.add('is-lensing');
    });
  };
  const clear = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    card.style.removeProperty('--lx');
    card.style.removeProperty('--ly');
    card.classList.remove('is-lensing');
  };

  frost.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' && fine.matches && !reduce.matches) place(e);
  });
  frost.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') clear();
  });
  frost.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' && !reduce.matches) place(e);
  });

  button.addEventListener('click', () => {
    const on = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(on));
    card.classList.toggle('is-clear', on);
    if (on) clear();
  });
}
