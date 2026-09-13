# Cowboy Chords

A guitar practice app for one 13-year-old, one week into playing. It exists to
solve exactly two things (PRD §1): she can hold chords but can't *change*
between them and can't see herself improving, and nothing sounds like music for
the first two months. A third thing it protects rather than solves: room to just
play, with nothing watching.

It is not a course and not a tab library. It is a short daily loop — four
stages, about eight minutes plus however long she wants — that drills the hard
thing and gets her to a real song fast.

## Read these first, every session

- `docs/PRD.md` — product requirements. Source of truth for scope and behaviour.
- `docs/BUILD_PLAN.md` — phases, gates, and every decision already settled with
  its reason. Read it before re-deriving anything.
- `docs/DESIGN_BRIEF.md` — how it looks and sounds. Governs every screen and
  every user-facing string. Where it conflicts with a library default or a
  standard web pattern, it wins.

## Rules

- Do not start a phase until the previous gate passes and Ash confirms.
- If the PRD is silent on a product decision, stop and ask. Do not choose.
- Non-goals in PRD §2 and §9 are hard. No microphone or audio input of any
  kind, no scales, no tab, no barre chords, no account, no hosted tabs or
  lyrics. Nothing scaffolded "for later" — except `capo`, which PRD §4 asks for
  by name.
- **Nothing instruments the mess-around stage** (PRD §3.4). No timer, no
  counter, no log entry, not even a record that it happened. It is the most
  important stage and the easiest one to ruin.
- **Nothing reports anywhere.** No analytics, no telemetry, no crash reporter,
  no "share your progress". Her practice lives in her own browser and has
  nowhere else to go. The one pressure this app cannot design away is that her
  dad built it; not being able to see whether she opened it is the feature.
- The app never says a score is good or bad (PRD §7). It shows the number and
  the line.
- No streak. "Played 14 of the last 30 days" is factual; a broken streak is a
  guilt mechanic and out of scope.
- Progress is a line going up over time, never a percentage. There is no
  "complete".
- Every user-facing string lives in `src/strings.js`, never inline in a screen,
  so the voice can be reviewed as a set. Every colour, size and spacing value
  lives in `src/theme.css`. No screen invents either.
- The chord box is the signature object. One component, drawn from JSON, used
  everywhere, with the root always marked the same way (PRD §3.1, §5.1). Chord
  boxes are not tab and the app never conflates them.
- Never write "press hard", or anything like it (PRD §5.2). Lightest pressure
  that still rings clean, fingertip just behind the fret.
- No dependency that has to be installed to run the app, and no build step to
  change content. Ash edits JSON and refreshes.
- Decisions and state go in `docs/`, not in Claude Code memory.
- Before writing code in a new phase, propose the plan and wait for approval.
- PRs under ~400 lines; one phase per branch; branches cut from a freshly
  pulled `origin/main`. Ash merges on GitHub — that is her review step. Claude
  never merges. Once a PR is called ready it gets no more commits.

## Stack

Vanilla HTML, CSS and ES modules. No framework, no bundler, no dependencies.
`node:test` for logic. Content is flat JSON in `content/`. State is
`localStorage` under `cc:` keys. Shipped as a PWA.

Update this section if the stack changes.

## Current state

Phase 0 not started. The repo carries the PRD, the build plan and this file.
See `docs/BUILD_PLAN.md` for what is settled and what is still open.

## The letter

The app's voice is her uncle's letter (PRD §6): warm, plain, a little
rambling, unmistakably a person rather than a product. It does **not** appear in
the app and nothing quotes it. A verbatim excerpt sits in
`docs/voice-sample.local.md`, which is gitignored — this repo is public so
Pages can serve the app, and the letter is private. If that file is missing,
ask Ash for it rather than writing copy without it.

## Running things

```bash
npm start        # node serve.js — static server at http://localhost:5173
npm test         # node --test, no dependencies, no network
```

`file://` does not work and is not a fallback: Chrome blocks `fetch()` of local
JSON, ES modules, service workers and PWA install there. That is why the server
exists and why the app is also published to Pages — see the build plan.

## Two audiences for the same files

| who | how they get it |
|---|---|
| her | the GitHub Pages URL, installed once as a PWA, offline after that |
| Ash | `npm start`, edit JSON, refresh |

## Things that cost time to learn

- **Pages serves from `/cowboy-chords/`, not from `/`.** Every path in the app
  must be relative (`src/theme.css`, `content/chords.json`), never
  root-absolute (`/src/theme.css`), or it works at localhost and 404s for her.
  The service worker in Phase 7 has to register with an explicit relative
  scope for the same reason.
- `justinguitar.com` returns 403 to WebFetch. The in-app browser reads it fine;
  use that when the PRD asks for a source to be fetched rather than paraphrased.
- Ultimate Guitar's search URL scheme in PRD §4 is live as of 2026-09-13:
  `search.php?search_type=title&value=horse+with+no+name` returns results. The
  link-out is the entire integration — no scraping, no caching, no iframes.
- The metronome must be scheduled on the Web Audio clock with a lookahead.
  `setInterval` drifts audibly inside thirty seconds (PRD §3.2).
- `cc:schema` is written from the first phase that stores anything, so a later
  shape change can migrate rather than wipe her scores.
