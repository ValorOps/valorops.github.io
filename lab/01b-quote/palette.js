// Lab palette switcher. Loads in <head> (not deferred) so the page paints in the chosen palette.
// Order of precedence: ?palette= in the URL, then the last choice on this device, then the default.
(() => {
  const PALETTES = ['arctic', 'signal', 'phosphor', 'oxide'];
  const DEFAULT = 'arctic';
  const root = document.documentElement;
  let p = new URLSearchParams(location.search).get('palette');
  if (!PALETTES.includes(p)) {
    try { p = localStorage.getItem('lab-palette'); } catch { p = null; }
  }
  if (!PALETTES.includes(p)) p = DEFAULT;
  root.dataset.palette = p;

  document.addEventListener('DOMContentLoaded', () => {
    const box = document.querySelector('.palette');
    if (!box) return;
    const current = box.querySelector(`input[value="${p}"]`);
    if (current) current.checked = true;
    box.addEventListener('change', (e) => {
      const v = e.target.value;
      if (!PALETTES.includes(v)) return;
      root.dataset.palette = v;
      try { localStorage.setItem('lab-palette', v); } catch { /* storage unavailable: URL still carries it */ }
      const u = new URL(location.href);
      u.searchParams.set('palette', v);
      history.replaceState(null, '', u);
    });
  });
})();
