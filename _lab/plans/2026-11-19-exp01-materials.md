# Lab Experiment 01: Materials Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `valorops.dev/lab/01-materials/`, a ValorOps package page that tests glass, brushed metal, grain and noise, plus the lab scaffolding and test harness every later experiment reuses.

**Architecture:** Static files under `lab/` (published) and `_lab/` (Jekyll skips it: notes, plans, tooling). Each experiment is one folder: `index.html`, `site.css`, `page.js`, `noise.svg`, `fonts/`. A Playwright suite in `_lab/tools/` serves the repo locally with valor-ops.com's real CSP header and runs shared checks against every lab page plus per-experiment checks.

**Tech Stack:** HTML, CSS, vanilla JS; `@playwright/test` driving the installed Google Chrome (`channel: 'chrome'`); `@axe-core/playwright`; `@fontsource-variable/archivo`, `@fontsource/geist`, `@fontsource/geist-mono` as WOFF2 sources.

**Spec:** `_lab/DESIGN.md`

## Global Constraints

- Only new files under `lab/` and `_lab/`. No existing file in the repo is modified (including `package.json`, `robots.txt`, `sitemap.xml`, nav).
- Every lab page has `<meta name="robots" content="noindex">`.
- Must run clean under valor-ops.com's CSP: `default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`. That means no inline `<script>`, no inline `<style>`, no `style=""` attributes in HTML (setting custom properties from JS via `el.style.setProperty` is fine).
- No third-party requests of any kind. Fonts self-hosted WOFF2, `font-display: swap`.
- No em dashes (U+2014) in any visible text.
- Copy comes from valor-ops.com verbatim or near-verbatim. No invented stats, clients or testimonials.
- Taste floor from `valorops-web-design`: body contrast 4.5:1, focus-visible ring 3:1, `transform`/`opacity`/`clip-path`/mask only for motion, hover effects gated to `(hover: hover) and (pointer: fine)`, reduced motion keeps all content reachable.
- Palette for 01 (deliberately not brass): `--canvas #0b0e11`, `--surface #141a1f`, `--ink #e8edf1`, `--ink-soft #9aa7b2`, `--accent #ff6b2c`, `--accent-ink #140802`.
- Fonts for 01: Archivo variable (display), Geist (text), Geist Mono (prices and durations only).

## Review Focus

1. Touch devices: the lens must be usable by tap, and a vertical swipe over a card must still scroll the page.
2. Browsers without `backdrop-filter`: the frost must fall back to an opaque textured surface, never to a clear pane that exposes everything with no meaning.
3. Keyboard and screen reader users: the deliverables are in the DOM and readable regardless of frost state; Inspect buttons are reachable and announce state.
4. Reduced motion: the lens does not follow the pointer; Inspect still clears the frost instantly.
5. Phones at 360px: three cards stack with no horizontal overflow and the hero headline stays at two lines or fewer.

Each has a test in the owning task below.

---

### Task 1: Lab scaffolding and shared test harness

**Files:**
- Create: `_lab/tools/package.json`, `_lab/tools/server.mjs`, `_lab/tools/playwright.config.mjs`, `_lab/tools/tests/shared.spec.mjs`, `_lab/tools/.gitignore` (`node_modules/`, `test-results/`, `shots/`)
- Create: `lab/index.html`, `lab/lab.css`
- Create: `_lab/NOTES.md`, `_lab/FINGERPRINTS.md`

**Interfaces:**
- Produces: `server.mjs` serves the repo root on `http://127.0.0.1:4500`, sets the Global Constraints CSP on every response. `LAB_PAGES` array exported from `tests/shared.spec.mjs` (`['/lab/', '/lab/01-materials/']`); later experiments append to it.
- Produces: npm script `test` = `playwright test`.

- [ ] **Step 1: Write the shared tests** in `tests/shared.spec.mjs`, one `describe` per entry in `LAB_PAGES`:
  - `has noindex`: `meta[name=robots]` content equals `noindex`.
  - `no CSP violations`: listen for `securitypolicyviolation` via an init script that pushes to `window.__csp`; after load, `window.__csp.length === 0`.
  - `no console errors and no failed requests`.
  - `same-origin only`: every request URL starts with `http://127.0.0.1:4500`.
  - `no em dash`: `document.body.innerText` does not contain `—`.
  - `no horizontal overflow` at 360x640 and 390x844: `scrollWidth <= innerWidth`.
  - `axe`: no violations with impact `serious` or `critical`.
- [ ] **Step 2: Install and run; expect failure** (`cd _lab/tools && npm install && npx playwright test`): FAIL, `/lab/` returns 404.
- [ ] **Step 3: Build `lab/index.html`**: title "ValorOps Lab", one sentence ("Small experiments in how ValorOps pages could look and behave. Not indexed, not final."), a list linking `01-materials/` as "01 Materials: glass, metal, grain". Styled by `lab/lab.css` with system fonts; it gets its real design as experiment 00 later.
- [ ] **Step 4: Seed `_lab/FINGERPRINTS.md`** with the header and the two rows copied from `valor-ops-site/design/FINGERPRINTS.md`, marked "(valor-ops.com, reference)". Seed `_lab/NOTES.md` with the columns: Experiment, Technique question, Palette, What held, What broke, Reusable pattern, Skill verdict.
- [ ] **Step 5: Run `npx playwright test --grep "/lab/ "`**: PASS for `/lab/`. (`/lab/01-materials/` still fails; Task 2 fixes it.)
- [ ] **Step 6: Commit** `lab/ _lab/` with message `lab: scaffold lab index, notes, fingerprints and test harness`.

### Task 2: Experiment 01 page, structure, tokens, metal and grain

**Files:**
- Create: `lab/01-materials/index.html`, `lab/01-materials/site.css`, `lab/01-materials/noise.svg`, `lab/01-materials/fonts/*.woff2`
- Test: `_lab/tools/tests/exp01.spec.mjs`

**Interfaces:**
- Produces: each package card is `article.pkg[data-pkg]` containing `h3`, `.pkg-price`, `.pkg-time`, `.pkg-summary`, a `.pkg-detail` list of deliverables, a `.frost` element over `.pkg-detail`, and `button.inspect[aria-pressed="false"][aria-controls=<detail id>]`. Task 3 binds to these.

- [ ] **Step 1: Write content tests** in `exp01.spec.mjs`:
  - three `article.pkg`, `h3` texts exactly: "M365 Security Baseline", "AI Readiness and Governance", "Full Assessment plus 30-day recheck".
  - prices contain "$1,500", "$2,000", "$3,500".
  - every `.pkg-detail` has at least 3 `li` and is not `aria-hidden`.
  - CTA `a.cta` text "Book a 30-minute call", href `https://valor-ops.com/contact/`.
  - hero `h1` at 360x640 renders in at most 2 lines (height / computed line-height <= 2.1).
- [ ] **Step 2: Run; expect FAIL** (page missing).
- [ ] **Step 3: Copy fonts** from the three @fontsource packages (latin subsets only) into `fonts/`; declare `@font-face` in `site.css`; preload Archivo.
- [ ] **Step 4: Build `index.html`** with this journey, copy from valor-ops.com:
  1. Hero: a brushed-metal nameplate. `h1` "Three fixed-scope packages", sub "Published prices, so you know the number before we talk." Back link to `/lab/` as a small folio, no site nav.
  2. Tray: the three cards with summary, price, duration, deliverables (verbatim from valor-ops.com).
  3. Note: the remediation paragraph ("Remediation is separate, at $150 per hour...") as a quiet flow section.
  4. Close: "Thirty minutes to find out which package fits, or whether you need one at all." plus the CTA; the last screen holds.
  5. Small footer: "Lab experiment 01. Materials study." 
- [ ] **Step 5: Build `site.css`** tokens from Global Constraints plus the skill's type, spacing and elevation tokens. Materials:
  - Grain: `noise.svg` (an `feTurbulence` fractalNoise, baseFrequency about 0.8, 2 octaves) as a fixed full-page overlay at 4 to 5% opacity.
  - Brushed metal (hero plate, close plate): stacked `repeating-linear-gradient` hairlines plus `noise.svg` stretched horizontally (`background-size` wide and short) for the brushed streak, a soft diagonal sheen gradient, `--edge` top highlight, `--e3` shadow. Etched heading via a 1px light `text-shadow` below and a dark one above.
  - Cards: `--surface` with grain, `--e2`, one radius scale.
- [ ] **Step 6: Run full suite** (`npx playwright test`): content tests and shared tests for `/lab/01-materials/` PASS.
- [ ] **Step 7: Commit** `lab: experiment 01 structure, metal plates and grain`.

### Task 3: Frosted glass and the inspection lens (signature move)

**Files:**
- Create: `lab/01-materials/page.js`
- Modify: `lab/01-materials/site.css`, `lab/01-materials/index.html` (script tag only)
- Test: `_lab/tools/tests/exp01.spec.mjs`

**Interfaces:**
- Consumes: Task 2 card markup.
- Produces: card gets `--lx`, `--ly` (px, relative to the card) and class `is-clear` when inspected.

The idea: each card's deliverables sit behind frosted glass. The pointer is a clear lens through the frost; pressing Inspect clears the whole pane. Glass is doing a job (hiding detail until you look), which is what this experiment tests against the skill's "glass as decoration" ban.

- [ ] **Step 1: Write interaction tests:**
  - `inspect toggles`: click `.inspect` in card 1, `aria-pressed` becomes `true`, card has `is-clear`; click again reverts.
  - `keyboard`: focus `.inspect` via Tab, press Space, same result.
  - `pointer lens`: with `hasTouch: false`, hover the middle of card 2's `.frost`, card 2's `--lx` is a nonzero px value.
  - `tap lens`: in a touch context (`hasTouch: true, isMobile: true`), tap card 3's `.frost`, `--lx` is set and the page `scrollY` is unchanged; then a vertical swipe on the card changes `scrollY` (frost has `touch-action: pan-y`).
  - `reduced motion`: with `reducedMotion: 'reduce'`, hovering does not set `--lx`; Inspect still sets `is-clear`.
  - `no backdrop-filter fallback`: inject a stylesheet forcing `.frost { backdrop-filter: none !important; -webkit-backdrop-filter: none !important }` and add class `no-backdrop` on `html` (as page.js does when `CSS.supports('backdrop-filter','blur(1px)')` is false); `.frost` computed background alpha is 1.
- [ ] **Step 2: Run; expect FAIL.**
- [ ] **Step 3: Implement `page.js`:** feature-detect backdrop-filter (add `html.no-backdrop` when unsupported); per card, `pointermove` (only when `matchMedia('(hover: hover) and (pointer: fine)')` and not reduced motion) and `pointerdown` (touch, any motion setting except reduced, where tap does nothing) write `--lx/--ly` with rAF throttling; Inspect click toggles `aria-pressed` and `is-clear`.
- [ ] **Step 4: Style the glass in `site.css`:**
  - `.frost`: `backdrop-filter: blur(14px) saturate(1.3)` with `-webkit-` prefix, a faint ink tint, `noise.svg` overlay inside the glass, 1px inner edge highlight, `touch-action: pan-y`.
  - Lens: `mask-image: radial-gradient(circle 72px at var(--lx) var(--ly), transparent 0 62px, #000 72px)` (and `-webkit-mask-image`); a sibling `.lens-rim` ring positioned at `--lx/--ly` via `transform` with a subtle specular highlight, shown only while hovered.
  - `.is-clear .frost`: mask fully transparent with a 220ms `--ease-out` opacity transition; instant under reduced motion.
  - `html.no-backdrop .frost`: opaque `--surface` plus grain, so frosted means hidden, never see-through.
  - Glass boundary (from vectorlab `anti-slop`): every `.frost` and the lens rim carry a visible 1px border at least 3:1 against what shows through, and text on or near glass meets 4.5:1.
  - Inspect button: all states, focus ring in `--accent` with offset.
- [ ] **Step 5: Run full suite; expect PASS.**
- [ ] **Step 6: Commit** `lab: experiment 01 frosted glass and inspection lens`.

### Task 4: Visual verification, notes, push

**Files:**
- Create: `_lab/tools/verify.mjs` (the skill's section 10 harness, `channel: 'chrome'`, writes to `_lab/tools/shots/`)
- Modify: `_lab/NOTES.md`, `_lab/FINGERPRINTS.md`

- [ ] **Step 1: Run `node verify.mjs http://127.0.0.1:4500/lab/01-materials/`** with the server up; output shows no errors and `horizontalOverflow: false` for all four runs.
- [ ] **Step 2: Look at the frames** (desktop, phone, 360x640, reduced motion): headline lines, metal plate legibility, contrast of text over glass at its brightest, lens rim placement, held close. Fix anything found, rerun the suite and verify.
- [ ] **Step 2b: Measure glass cost** (per `cloudflare:web-perf`): in `verify.mjs`, a `perf` run at 390x844 with CDP `Emulation.setCPUThrottlingRate` 4, sweep the pointer across all three cards for 3 seconds while collecting frame timestamps via `requestAnimationFrame`; report median and p95 frame time and the share of frames over 16.7ms. Repeat with `html.no-backdrop` forced for comparison.
- [ ] **Step 3: Write the 01 entry in `NOTES.md`** with the technique question, palette, the frame-time numbers from 2b, and first findings (a real phone check is still pending). Append the fingerprint row: Gallery / catalog; folio back link, no nav; brushed-metal nameplate; plate, tray, note, plate; held CTA on metal plate; frosted panes with a clear lens and Inspect toggle; graphite with signal orange. Confirm it differs from each row on 4 of 6.
- [ ] **Step 4: Commit** `lab: experiment 01 notes and fingerprint`, then push: `git -c push.negotiate=true push origin main`.
- [ ] **Step 5: Confirm live** once Pages finishes: `https://valorops.dev/lab/01-materials/` returns 200 and contains the h1.
- [ ] **Step 6: Critique pass** with `website-design:web-review` against the screenshots; add its top three findings to the 01 entry in `NOTES.md` as candidates for a second pass (not fixed in this plan).
