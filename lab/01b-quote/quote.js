// Lab 01b: live price builder drawn as a node graph.
// Prices are valor-ops.com's published prices. Remediation stays a separate estimate.
const PACKAGES = {
  baseline: { name: 'M365 Security Baseline', le25: 1500, le50: 2500, time: '5 business days from access' },
  ai: { name: 'AI Readiness and Governance', le25: 2000, le50: 2000, time: '5 business days from access' },
  full: { name: 'Full Assessment plus 30-day recheck', le25: 3500, le50: 4500, time: '10 business days from access, plus the recheck' },
};
const SIZE_LABEL = { le25: 'up to 25 users', le50: '26 to 50 users', gt50: 'over 50 users' };
const CORE11 = 3900;
const HOURLY = 150;

const form = document.getElementById('quote');
const node = document.getElementById('quote-node');
const lines = node.querySelector('.q-lines');
const total = node.querySelector('.q-total');
const remed = node.querySelector('.q-remed');
const time = node.querySelector('.q-time');
const hoursOut = document.getElementById('hours-out');
const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** Fixed price for a package at a team size, or null when it is quoted. */
function price(size, pkg) {
  return size === 'gt50' ? null : PACKAGES[pkg][size];
}

function line(label, value) {
  const li = document.createElement('li');
  const a = document.createElement('span');
  const b = document.createElement('span');
  a.textContent = label;
  b.textContent = value;
  li.append(a, b);
  return li;
}

function render() {
  const data = new FormData(form);
  const size = data.get('size');
  const pkg = data.get('package');
  const core11 = data.get('core11') === 'on';
  const hours = Number(data.get('hours'));
  const base = price(size, pkg);

  lines.replaceChildren(line(`${PACKAGES[pkg].name}, ${SIZE_LABEL[size]}`, base === null ? 'Quoted' : usd(base)));
  if (core11) lines.append(line('Core 11 security policy program', usd(CORE11)));

  const label = document.createElement('span');
  const amount = document.createElement('span');
  label.className = 'q-label';
  amount.className = 'q-amount';
  if (base === null) {
    label.textContent = 'Price';
    amount.textContent = 'Quoted after a short scoping call';
    total.classList.add('is-quoted');
  } else {
    label.textContent = 'Fixed price';
    amount.textContent = usd(base + (core11 ? CORE11 : 0));
    total.classList.remove('is-quoted');
  }
  total.replaceChildren(label, amount);

  hoursOut.textContent = `${hours} hours`;
  remed.textContent = hours
    ? `Remediation estimate: ${hours} hours, about ${usd(hours * HOURLY)}, billed separately at $150 per hour.`
    : 'No remediation estimate added. Remediation is billed separately at $150 per hour.';
  time.textContent = PACKAGES[pkg].time;
}

// ---------- wires ----------
const svg = document.getElementById('wires');
const canvas = svg.parentElement;
const wires = [...svg.querySelectorAll('path.wire')];
const WIRE_FOR = { size: 'n-size', package: 'n-package', core11: 'n-addons', hours: 'n-addons' };

function drawWires() {
  const c = canvas.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${c.width} ${c.height}`);
  svg.setAttribute('width', c.width);
  svg.setAttribute('height', c.height);
  const q = node.getBoundingClientRect();
  const stacked = q.top >= document.getElementById('n-addons').getBoundingClientRect().bottom - 1;
  wires.forEach((w, i) => {
    const n = document.getElementById(w.dataset.from).getBoundingClientRect();
    let d;
    if (stacked) {
      // run down the left gutter into the quote node's top-left port
      const x0 = n.left - c.left;
      const y0 = n.top - c.top + 22;
      const gx = Math.max(6, x0 - 14 + i * 4);
      const x1 = q.left - c.left;
      const y1 = q.top - c.top + 22 + i * 6;
      d = `M${x0} ${y0} C${gx} ${y0} ${gx} ${y0} ${gx} ${y0 + 12} L${gx} ${y1 - 12} C${gx} ${y1} ${gx} ${y1} ${x1} ${y1}`;
    } else {
      const x0 = n.right - c.left;
      const y0 = n.top - c.top + 22;
      const x1 = q.left - c.left;
      const y1 = q.top - c.top + 22 + (i - 1) * 10;
      const k = Math.max(40, (x1 - x0) * 0.5);
      d = `M${x0} ${y0} C${x0 + k} ${y0} ${x1 - k} ${y1} ${x1} ${y1}`;
    }
    w.setAttribute('d', d);
  });
}

function heat(name) {
  const w = wires.find((p) => p.dataset.from === WIRE_FOR[name]);
  if (!w) return;
  w.classList.remove('is-hot');
  void w.getBoundingClientRect();
  w.classList.add('is-hot');
  clearTimeout(w._t);
  w._t = setTimeout(() => w.classList.remove('is-hot'), 700);
}

form.addEventListener('input', (e) => {
  render();
  heat(e.target.name);
});
form.addEventListener('submit', (e) => e.preventDefault());
addEventListener('resize', drawWires);
new ResizeObserver(drawWires).observe(canvas);
document.fonts.ready.then(drawWires);
render();
drawWires();
