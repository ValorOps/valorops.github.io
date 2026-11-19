# Lab Experiment 01b: Quote Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship `valorops.dev/lab/01b-quote/`, version 2 of experiment 01: a live price builder drawn as a node graph, lit by one grainy glow, with every price also visible as plain text.

**Architecture:** Same lab structure and harness as 01 (`_lab/tools`, valor-ops.com CSP, shared tests). New folder `lab/01b-quote/` with `index.html`, `site.css`, `quote.js` (pricing + wires), `noise.svg`, `fonts/` (copied from 01). 01 stays up as the record of what did not work.

**Tech Stack:** HTML, CSS, vanilla JS, inline SVG for wires; Playwright + axe as before.

**Spec:** `_lab/DESIGN.md`, plus Dillan's review of 01 (2026-11-19): no buying information behind an interaction; cards read flat. References: Pizzalio (live builder), vercel.com and raycast.com (light as material, grain on light), linear.app (two-tone statements, real UI as hero), reactflow.dev (node graph hero, wires, dot-grid canvas, accent word).

## Global Constraints

- Everything from the 01 plan's Global Constraints (new files only, noindex, valor-ops.com CSP, same-origin, no em dashes, real copy, taste floor).
- No `backdrop-filter` anywhere on the page. No metal plates.
- Every price is readable as static text without touching a control.
- Prices (valor-ops.com, verbatim): Baseline $1,500 up to 25 users, $2,500 for 26 to 50. AI Readiness $2,000 any size up to 50. Full Assessment plus recheck $3,500 up to 25, $4,500 for 26 to 50. Over 50 users: quoted after a short scoping call. Core 11 policy program $3,900. Remediation $150 per hour, separate from the assessment.
- Remediation is shown as a separate estimate, never folded into the fixed total (keeping it separate is what makes the assessment independent).
- One radius family: 12px surfaces, 10px controls and buttons. No pills.
- Big prices in Archivo with `tabular-nums`; Geist Mono only for small labels.
- Palette: canvas #0b0e11, surface #141a1f, ink #e8edf1, ink-soft #9aa7b2, accent #ff6b2c, accent-ink #140802.

## Review Focus

1. Over 50 users: no dollar total appears; the Quote node says it is quoted after a scoping call.
2. Keyboard: arrow keys inside a radio group update the total.
3. Screen readers: the total is announced (`aria-live="polite"`).
4. Phones: the graph stacks vertically with no horizontal overflow, wires still connect.
5. Reduced motion: wires do not animate.

## Task 1: Graph markup, pricing logic and wires

**Files:** create `lab/01b-quote/index.html`, `lab/01b-quote/quote.js`, `_lab/tools/tests/exp01b.spec.mjs`; add `/lab/01b-quote/` to `LAB_PAGES`; link it from `lab/index.html`.

**Interfaces:** form `#quote` with fieldsets `size` (radios `le25`, `le50`, `gt50`), `package` (radios `baseline`, `ai`, `full`), checkbox `core11`, range `hours` (0 to 40, step 4) with `<output>`. Quote node `#quote-node` contains `.q-lines` (one `li` per line item), `.q-total` (`aria-live="polite"`), `.q-remed`. SVG `#wires` holds three `path.wire` with `data-from` = node id.

- [ ] Write tests: default total `$1,500`; 26 to 50 + Full = `$4,500`; 26 to 50 + AI = `$2,000`; Baseline + Core 11 = `$5,400` with a Core 11 line; 8 hours shows remediation estimate `$1,200` and total unchanged; over 50 shows no `$` in `.q-total` and contains "scoping call"; ArrowRight in the package group changes the total; `.q-total` has `aria-live="polite"`; static price list contains $1,500, $2,500, $2,000, $3,500, $4,500, $3,900, $150 with no interaction; three `path.wire` with non-empty `d` at 1440 and at 390; no element has a computed `backdrop-filter` other than `none`; CTA text and href as in 01; hero h1 at most two lines at 360.
- [ ] Run, expect RED.
- [ ] Build markup and `quote.js`: `price(size, pkg) -> number | null`, `render()` on `input` events, `drawWires()` on load, resize and `fonts.ready` (cubic bezier from the right edge of each input node to the left edge of the Quote node on desktop; vertical drop on stacked layouts). A wire gets class `is-hot` for 600ms after its input changes.
- [ ] Run, expect GREEN. Commit.

## Task 2: Light, canvas and surfaces

**Files:** `lab/01b-quote/site.css`, `noise.svg`, `fonts/`.

- [ ] Add test: under `reducedMotion: 'reduce'`, a wire's computed `animation-name` is `none`.
- [ ] Build: one glow behind the graph (stacked radial gradients in accent and a cool blue, grain overlay via noise at low opacity, `mix-blend-mode: overlay`); dot-grid canvas panel (`radial-gradient` 1px dots on 22px grid); nodes with hairline border, lit top edge, tinted shadow; dashed wires with dash-offset animation on `.is-hot`; headline with one accent word; Linear-style two-tone statement; package cards with deliverables visible, Full card with a gradient border; close with CTA.
- [ ] Run full suite GREEN. Commit.

## Task 3: Verify, notes, push

- [ ] `verify.mjs` on `/lab/01b-quote/`: no errors, no overflow. Look at desktop, 768, 390, 360 and reduced-motion frames; fix what is wrong.
- [ ] NOTES.md: Dillan's 01 verdict, references, 01b entry. FINGERPRINTS.md row (Live surface grammar).
- [ ] Commit, push `main`, confirm live.

## Execution rulings

- Built Task 1 and Task 2 together: the wire and layout tests depend on the CSS grid, so markup and CSS landed in one pass. Cost if wrong: none.
- Glow clipped on `main` with `overflow-clip-margin` to stop a 1px overflow at 390px. Cost if wrong: glow edge cut in the gutter on very wide screens.
- Test timeouts lowered to 15s per test, 4s per expect, so RED runs on missing pages finish quickly. Cost if wrong: slow CI machines could flake.
- Fingerprint check: vs 01 differs on grammar, hero, sequence, close, signature (5/6); vs valor-ops.com homepage differs on grammar, nav, hero, sequence, close, signature; vs AI tool catalog differs on grammar, nav, hero, sequence, close (signature: both build a running total, so counted as same) 5/6. Pass.
