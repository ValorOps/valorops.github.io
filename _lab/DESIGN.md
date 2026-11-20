# valorops.dev Lab: design

Status: draft for approval, 2026-11-19

## Intent

valorops.dev is the test bench, not the deliverable. The goal is range: get better at building distinctive websites together, and turn each technique that holds up into a tested entry in the `valorops-web-design` skill. The first real target for that skill is a redesign of valor-ops.com (ValorOps LLC), then other real sites.

This is a start from scratch. No palette, texture or aesthetic is locked, including the current brass, oxide and aged-metal direction. Every experiment is free to try a different look; the lab's job is to find out what works for ValorOps and what does not.

## Revision 2026-11-20

The ValorOps direction is settled (Oxide palette, light over texture, quote graph; see the "ValorOps Web Design Lab: Findings" doc). From experiment 02 on, the lab uses clearly fictional subjects again, with their own palettes, so techniques are judged without ValorOps bias. Fictional brands never imitate a real company and carry no invented stats, reviews or clients presented as real. Winning techniques are translated back into ValorOps and client work afterwards.

## Goals

- A `/lab/` section on valorops.dev with small standalone experiment pages, each pushing one technique family.
- Every experiment is ValorOps-branded and uses real ValorOps LLC subject matter (the services, the baseline, the process, as written on valor-ops.com), so winning patterns transfer straight to valor-ops.com. Each experiment picks its own palette and texture direction.
- After each experiment, record what worked, what broke, and the reusable code pattern, then fold the keepers into the skill as a technique library.
- Dillan reviews every experiment live at `valorops.dev/lab/...` on his own devices.

## Non-goals

- Redesigning the homepage, blog or existing pages now. The homepage borrows winners later, as its own request.
- Production polish on every experiment. One sitting each; good enough to judge the technique.

## Anti-goals (failure even if it works)

- Breaking or visibly changing any existing page.
- Invented stats, clients or testimonials. Copy comes from valor-ops.com or is plainly illustrative.
- Every experiment drifting back to the same look. The fingerprint gate, plus a palette column in NOTES.md, keeps them apart.
- Third-party CDNs, Google Fonts or inline scripts (breaks the CSP direction).
- Techniques that only look good on a desktop with a fast GPU and fall apart on a phone or under reduced motion.

## Constraints

- Hosting: GitHub Pages serves `main` only, so lab pages are pushed to `main`. Every change is new files under `lab/` and `_lab/`; existing files are not touched.
- Jekyll is active (no `.nojekyll`), so `_lab/` (this doc, notes, fingerprint log) is in the public repo but not served on the site.
- The Discord workflow only fires on `blog/*.html`, so lab pushes do not notify.
- Lab pages carry `<meta name="robots" content="noindex">`, are not in the nav or sitemap, and are not in robots.txt (listing them there would advertise them).
- Static, no build step per experiment: plain HTML, one CSS and one JS file each, self-hosted WOFF2 fonts (pulled from @fontsource via npm), no Tailwind dependency.
- The skill's taste floor still applies: contrast, reduced motion, phone layouts, no em dashes.

## Approaches considered

1. One big homepage redesign, then a write-up. Fast visible result, but teaches one style.
2. **Lab of small single-technique experiments. Chosen.** Each one is cheap, the skill grows by tested patterns, and the lab doubles as portfolio and blog material. Revised 2026-11-19: experiments stay ValorOps-branded with unlocked palettes, instead of fictional brands, because valor-ops.com is the first real target.
3. Full sample sites for fictional clients. Most realistic range, too slow per lesson.

## Structure

```
lab/index.html            lab index (itself experiment 0: a gallery/catalog)
lab/01-<slug>/index.html  one folder per experiment: index.html, site.css, page.js, assets/, fonts/
_lab/DESIGN.md            this doc
_lab/NOTES.md             per-experiment findings: technique, what held, what broke, code pattern, skill verdict
_lab/FINGERPRINTS.md      append-only fingerprint log; every experiment must differ from every row on 4 of 6
```

## Experiment queue (proposed order)

| # | Technique family | ValorOps subject | What it tests |
|---|---|---|---|
| 01 | Materials: glass, metal, grain, noise | the service packages | When glass is earned vs decoration; backdrop-filter cost on phones; SVG noise vs PNG grain |
| 02 | Scroll-driven motion | the engagement process, first call to handoff | Pinned acts, scrub, pan rail; CSS scroll-driven animations vs the `--p` script |
| 03 | Kinetic typography | the positioning statement | Masked line reveals, variable-font axes on scroll, typographic poster grammar |
| 04 | WebGL / shader ground | the homepage hero | A shader background with a real static fallback, DPR caps, battery cost |
| 05 | Live surface | the tenant baseline checks | Real interactive UI as the hero |

Each row's palette is chosen per experiment and logged; none is assigned in advance.

Order is a proposal. 01 goes first because glass and textures are what prompted this.

## Per-experiment loop

1. Short brief in NOTES.md: technique question, brand, grammar, signature move, fingerprint check.
2. Build in `lab/NN-slug/`.
3. Verify locally with Playwright: desktop, phone, 360x640, reduced motion. Fix.
4. Commit and push to `main`; Dillan checks it live.
5. Record findings in NOTES.md and append the fingerprint row.
6. Propose the skill update (technique library entry, and any rule that should change, such as the current blanket ban on glass) for Dillan to save.

## Left to the builder

Brand names, palettes, copy, exact signature moves, and whether an experiment needs a second pass, all decided per experiment and logged.
