# BUILD PLAN — Cowboy Chords

Phased plan with acceptance gates for [docs/PRD.md](PRD.md). Work phases
strictly in order. Do not start a phase until the previous gate passes and Ash
confirms. One branch per phase, one PR, merged by Ash.

Last updated 2026-09-13, against the PRD's four-stage revision and its
voice-not-content revision of §6. Phase 0 is merged and live; Phase 1 is open
as a PR.

---

## What was settled before planning

**The One Minute Changes drill, from Justin's own page.** PRD §3.1 required
this be fetched rather than paraphrased. Read 2026-09-13 at
`justinguitar.com/guitar-lessons/one-minute-changes-exercise-b1-110`:

- Two chords, switch back and forth, one minute, count the switches.
- "The key point in this lesson is to focus on only one chord change during
  one minute." One pair per minute, never a mixture.
- The goal is around 60 changes a minute — one a second. His course asks for
  30 between D and A before moving on.
- "if the chords sound a bit wonky as you go through this exercise, don't
  worry. Our focus here is on getting the fingers into the basic chord shapes
  fast and on time." **This is narrower than the PRD's "count every clean
  change."** So the app teaches his rule: count it when the shape lands.
  Whether it rings clean is the §5.3 job, not this drill's.
- "Focus on the chord changes that you find the hardest" — which is what the
  PRD's second round is for, and why the app picks the pair and not her.
- A countdown timer and a note of the number is the entire apparatus.
- Progress arrives in jumps, and tension is usually what holds a number down.
  Worth an interstitial; it is also the letter's own point.

**Counting is in her head; she types the total** (Ash, 2026-09-13). The timer
runs, she counts, one big number field when it stops, then the line. No
spacebar tally: both hands are on a steel-string and reaching for a key
mid-change is its own obstacle. This supersedes the spacebar mechanic in
PRD §3.1, on PRD §3.1's own instruction to follow his prescription.

**She declares what she can hold, and can take it back** (Ash, 2026-09-13).
The PRD says what first run unlocks (§7) and that a song waits for its chords
(§3.3), but never how the ninth day unlocks D. A score threshold — Justin's 30
a minute — would turn the sparkline into a judgment, which §7 forbids. So the
chord list keeps the first-run control permanently: "I can hold this now."
The app cannot be wrong about her own hands.

**The declaration is reversible, and relocking is not a demotion.** If she
unlocks D and it turns out she can't hold it, she can put it back with no
consequence and no wording that implies one — not "removed", not a warning
dialog, not a count that goes down. Her scores for pairs involving that chord
are kept, not deleted, so relocking costs her nothing and re-unlocking finds
her history where she left it. Songs needing it simply go quiet again.

**The chord box is a light card, and the root is not a ring** (Ash,
2026-09-13, reviewing Phase 0). Two corrections to the design brief, both
recorded here because both are the kind of thing that gets quietly reverted by
someone who thinks they are tidying up:

- **A ring cannot mean "root".** An open circle above the nut already means
  "play this string open", and position does not disambiguate it: for Em, A
  and D the root *is* an open string. Root is hue plus the note's letter, on
  whatever marker the string already has.
- **The box is light on the dark ground.** Every chord box she meets outside
  this app — Ultimate Guitar, books, videos — is black on white. Inverted
  contrast here would mean learning each shape twice. The app gives way, not
  the notation.
- And one thing to check rather than assume: whether the high E, at 1/2.5 the
  width of the low E, is still legible with dots sitting on it at the size the
  drill renders. Verified at that size in Phase 1's gate.

**Her songs, from her** (Ash, 2026-09-13). Phase 4 seeds from these, not from
a list of correct beginner songs:

| playable on the eight open chords | |
|---|---|
| The Head and the Heart | Rivers and Roads, Lost in My Mind, Down in the Valley |
| Nirvana, the acoustic side | About a Girl, Polly, Something in the Way |

Folk built on G, C, D, Em and Am is exactly the unlock order, and the
*Unplugged* recordings give her a version that sounds like what she is
actually doing — which is the §1 problem, solved by choice of song rather than
by anything the app does.

**Power chords are the first thing in v2, not a someday item** (Ash,
2026-09-13). Blink-182 and Taking Back Sunday are the other half of her taste
and they are built on power chords. The §2 ban is on *barre* chords, and a
5-shape is not one: two fingers, no barre, movable, physically easier than an
open G. The argument that carries it is that a power chord is a root and a
fifth — the most literal demonstration available of the root-note idea her
uncle singled out, and PRD §5.1 already puts the root in every chord box.
Slide the shape two frets and the name changes with the root.

It stays out of v1 anyway: it is a second notation to render and it breaks
cowboy-chords-first. But it is the head of the v2 list rather than an item on
it, and "Dammit" and "All the Small Things" on the horizon is a better
motivator than any interstitial. PRD §9 is Ash's to amend.

**Nothing ever reports anywhere.** No analytics, no telemetry, no crash
reporter, no "share your progress". This is already implied by PRD §2's no
account and §5's no network calls, but it is worth stating as its own rule:
the one pressure the app cannot design away is that her dad built it and could
know whether she opens it. Not being able to see that is a feature, and the
app must not quietly acquire the ability later.

**Ultimate Guitar's search URL scheme in PRD §4 is live.** Checked
2026-09-13: `search.php?search_type=title&value=horse+with+no+name` returns
36 results for that song. The link-out works exactly as specified.

**`file://` cannot host this app** (Ash, 2026-09-13). Chrome blocks `fetch()`
of local JSON, ES modules, service workers and PWA install on `file://`, so
PRD §5's "open the folder, edit JSON, refresh" and PRD §5's installable
offline PWA cannot both live there. Decided:

| for | how |
|---|---|
| her laptop | GitHub Pages. She installs the PWA once from that URL and it runs offline after. Ash edits JSON, commits, pushes; her app has it next launch. Nothing installed on her machine. |
| Ash editing | `node serve.js`, zero dependencies, `http://localhost:5173`. Edit JSON, refresh. |

No build step either way. The publishing repo must be public — Pages on a
private repo needs a paid plan — and nothing in `content/` is copyrighted:
titles, artists, chord shapes and UG search URLs only. Her progress never
leaves her laptop; there is nowhere for it to go.

**Checking** (Ash, 2026-09-13): `node:test`, built into node, no
dependencies, over the logic that rots silently — unlock order, song gating,
the score store, the localStorage schema and its migration, metronome beat
maths, content validation. Plus a written Chrome check at every gate.

**Framework: none.** PRD §5 leaves this to the builder. Vanilla ES modules
and plain CSS: every dependency is a build step waiting to happen, and this
app is a timer, a sparkline, eight chord boxes and a click track.

**The letter is voice, not content** (PRD §6, revised 2026-09-13). It does not
appear in the app, there is no `content/letter.json`, and no screen quotes it.
Everything it asks for is written fresh in its register — warm, plain, a
little rambling, unmistakably a person — including the mess-around line
(§3.4) and the plateau interstitial (§6).

**The excerpt is not committed** (Ash, 2026-09-13). It lives in
`docs/voice-sample.local.md`, which is gitignored; `docs/DESIGN_BRIEF.md`
points at it and quotes none of it. PRD §6 asks for the sample to be in the
repo's docs, but this repo has to be public for Pages, and a private letter
from her uncle to his niece — misspellings and all — is not a thing to put on
a findable URL. Local file, gitignored, brief points at it: whoever writes
copy has the voice, the internet does not.

Two consequences worth writing down, because the excerpt is a sample and not
a source of instructions:

- The letter says "press down pretty firm." **PRD §5.2 governs the app's
  copy**, always: lightest pressure that still rings clean. The excerpt is
  there to be sounded like, not obeyed.
- The letter says to learn to read tabs. PRD §2 and §9 keep tab in v2. The
  app teaches chord boxes and does not pretend otherwise.

The local sample is verbatim, typos and all — "chowboy chords", "ect." — on
the grounds that a register sample is only useful if it sounds like the
person. It never reaches a commit, so it never reaches a PR for review; Ash
has the file on disk.

---

## Shape of the thing

```
index.html            the app; one page, stages swapped in place
serve.js              zero-dependency static server for editing
content/              hand-editable, no build step (PRD §4)
  chords.json         shape, fingers, root string + fret, difficulty, unlock order
  pairs.json          chord pairs for the changes drill
  patterns.json       strum patterns as beat grids
  songs.json          title, artist, chords[], capo, ug_search
src/
  theme.css           every colour, size and spacing value. Screens invent none.
  strings.js          every user-facing string, reviewable as a set
  chordbox.js         the signature object (PRD §6)
  content.js          loads and validates the four files
  validate-content.js the rules a hand-edit can break
  chords-screen.js    the chord list, and one chord up close
  store.js            localStorage, cc: keys, schema version, export/import
  changes.js          the drill
  strum.js            grid + Web Audio clock
  songs.js            list, gating, capo toggle
  messaround.js       the stage that does nothing
  session.js          the four stages, in order
test/                 node:test, pure logic only
docs/                 PRD, this plan, DESIGN_BRIEF
```

**State.** `localStorage`, keys namespaced `cc:` (PRD §5):

```
cc:schema      integer, so a later shape change can migrate rather than wipe
cc:unlocked    ["Em","A"]              chords she can hold
cc:scores      [{pair:"Em-A", count:11, at:"2026-09-13T18:02:00Z"}, ...]
cc:sessions    ["2026-09-13", ...]     dates only, for "14 of the last 30 days"
cc:settings    {tempo:60, showCapoSongs:false, capoNoteSeen:false}
cc:week        {patternId:"all-downs", since:"2026-09-13"}
cc:firstRun    done, so the chord picker asks once and never again
```

Export and import is that object as one JSON file (PRD §5). It ships in the
last phase, but `cc:schema` is written from Phase 2, or her first fortnight
of scores is exactly what gets thrown away.

**Mess around writes nothing** (PRD §3.4). Not a key, not a timestamp, not a
count. The day goes into `cc:sessions` when the first Changes round is
logged, so the stage leaves no trace even of having happened.

---

## Phase 0 — repo, origin, tokens

Scaffolding only. No feature code.

- `CLAUDE.md`: **delete the stray, write a new one.** Checked 2026-09-13
  before planning to touch it, because "rewrite" would have been the wrong
  verb in two of the three possible situations. What is actually true here:
  the file is a byte-identical stray copy of SamePage's (both 22,103 bytes),
  SamePage keeps its own at `C:\dev\SamePage\CLAUDE.md`, this copy is
  untracked so it is not in this repo's history either, and there is no
  user-level `~/.claude/CLAUDE.md` to endanger. Deleting it here costs
  nothing and SamePage does not notice. Left in place, any session that reads
  it starts out believing this is a React Native app on Supabase.
- `docs/DESIGN_BRIEF.md`: PRD §6 turned into something checkable, after the
  `frontend-design` skill. Fretboards, string gauges, chord boxes, worn wood,
  setlists on masking tape. Not a kids' app, not a dashboard. No confetti, no
  badges, no streak. Progress is a line, never a percentage. It points at
  `docs/voice-sample.local.md` for the voice and quotes none of it.
- `.gitignore` with `docs/voice-sample.local.md` in it, **written and
  committed before the sample file is created**, so the letter cannot reach
  the remote even by accident.
- `src/theme.css`, and `src/strings.js` empty but real.
- `serve.js` and `npm start`. `npm test` wired to `node --test`.
- First commit, then Pages publishing `main`. **The repo and remote already
  exist** — `ashleybalogh/cowboy-chords`, private and empty, `origin`
  configured — so nothing here runs `git init` or `git remote add`. It was
  renamed from `uncledustinsguitarcoach` on 2026-09-13, while still private and
  empty, so that a public URL never carried her uncle's name. The local folder
  is still `C:\dev\uncledustinsguitarcoach`; renaming it is cosmetic and can
  happen whenever nothing is open.
- The first push is the moment the contents become public, so `.gitignore`
  lands in that commit or earlier and `git ls-files` — not `git status` — is
  the check before the visibility flip. Visibility flips to public for Pages;
  Ash approved that on condition of the voice-sample fix above.

**Gate.** `npm start` serves a styled holding page at localhost; the same page
is live on the Pages URL; `npm test` runs green with zero tests; `CLAUDE.md`
describes this project.

## Phase 1 — content and the chord box

PRD §8.1. Everything else draws on this.

- All four content files, real data. Eight chords in PRD §4's unlock order:
  Em → A → D → G → C → Am → E → Dm. No F, no barre chords.
- `chordbox.js`: SVG, drawn entirely from the JSON, one component used
  everywhere. Nut, frets, dots, finger numbers, open and muted strings.
  Chord boxes, never tab; the app does not conflate the two (PRD §3.1).
- **A light printed card on the dark ground**, not a slice of fretboard
  (design brief §2). She reads black-on-white chord boxes everywhere else;
  inverting them here would mean learning every shape twice.
- **The root marked distinctly in every box, always** (PRD §3.1, §5.1), by
  hue and by the note's letter — **never by a ring**, which already means
  "play this string open" and collides immediately, since for Em, A and D the
  root *is* an open string.
- **Delete the Phase 0 token specimen** from `index.html`. It existed to prove
  `theme.css` renders before there was a component to render. There is one
  now.
- Chord detail view: the root named in one plain line (PRD §5.1), the
  ring-clean diagnostic (PRD §5.3), and the pressure copy (PRD §5.2) —
  lightest pressure that still rings clean, fingertip just behind the fret,
  thumb behind the neck. The string "press hard" exists nowhere in the repo.
- `validate-content.js`: every chord a pair names exists, every chord a song
  needs exists, unlock order is a permutation of the chord list, every chord
  has a root string and fret that its own shape agrees with, no song needs a
  chord that can never be unlocked, capo is null or a fret number.

**Gate.** A chord gallery shows all eight as chord boxes and they are worth
looking at; the root reads at a glance without a legend; tests cover the
validator and the unlock-order rules; editing a finger position in
`chords.json` and refreshing moves the dot; the Phase 0 specimen is gone.

**And one thing checked by looking, at the size that matters:** two boxes side
by side at the size they will be in the drill, sharing the screen with a timer.
The high E and the dots sitting on it have to be legible there, and the note
letter inside the root marker has to be readable. If the letter is not, the
fallback is hue plus a thin inner outline with the letter only in the detail
view — decided at that size, not in advance.

## Phase 2 — the drill and the line

PRD §8.2: "This alone is a usable app — ship it and let her use it before
building anything else." So this phase ends on her laptop, not in a PR.

- One pair, sixty seconds, countdown. Both chord boxes on screen throughout.
- Timer ends → one large number field → save → sparkline of the last 10 for
  that pair. Not a word about whether the number is good (PRD §7).
- The app picks the pair (PRD §3.1). Proposed rule: round one is the unlocked
  pair with the best recent median — start on a win; round two is the worst,
  or an unplayed one if there is one. Justin's "practice what you can't do"
  is round two's whole job.
- Every score kept forever, per pair. Nothing averaged away, and nothing
  deleted when a chord is relocked.
- The chord list's "I can hold this now" and its reverse, both silent about
  whether either was a good idea. Tests cover that pair selection ignores
  relocked chords while their scores survive a relock-and-unlock round trip.

**Gate.** She runs the drill twice on her own laptop from the Pages URL, and
both numbers read back out of `cc:scores`. Tests cover pair selection, the
sparkline's window, and the store surviving a schema bump.

## Phase 3 — strum and the click

PRD §8.3.

- One pattern per week from `cc:week`, not per session (PRD §3.2). Three
  weeks minimum on a pattern: all downs → D-D-U-U-D-U → syncopated.
- Down and up arrows on a four-beat grid, current beat lit, synced to the
  click. Tempo slider, default 60, hers to raise.
- Scheduled on the Web Audio clock with a lookahead, never `setInterval`.
  Output only; no permission prompt of any kind (PRD §3.2, §5).

**Gate.** Three minutes at 60 bpm with no audible drift against a phone
metronome, and the lit beat still agreeing with the click at the end. Tests
cover the beat-time maths at 60, 80 and 120 bpm. Verified in Chrome on her
laptop, with sound.

## Phase 4 — songs

PRD §8.4.

- `songs.json` starts from **her six** (settled above), not from a list of
  correct beginner songs. For each: which chords it actually needs, whether
  it is playable as-is, needs one more chord, or needs a capo. Then fill out
  to a couple of dozen in the same direction — the neighbours of what she
  named, not the neighbours of "beginner guitar songs". Title, artist, chords,
  capo, UG search URL, and nothing else: no lyrics, no chord sheets, no
  iframes, no caching (PRD §2).
- Chords are checked against a real source per song, not assumed from memory.
  A song listed as playable that turns out to need F is worse than one left
  out.
- A song appears only when every chord it needs is unlocked.
- Capo songs stored, hidden behind a settings toggle, default off (PRD §4).
- When hidden songs outnumber visible ones, one factual line about what a
  capo costs and what it unlocks. Once, tracked by `cc:settings.capoNoteSeen`,
  never again.

**Gate.** With only Em and A unlocked, the list holds only songs playable
with Em and A, and each link opens UG's results in a new tab. Tests cover
gating, the capo toggle, and the note firing exactly once.

## Phase 5 — mess around

PRD §8.5, PRD §3.4. Small, and the session does not ship without it.

- Her unlocked chord boxes, quietly, and one line written in §6's voice —
  written, not quoted (PRD §3.4). Drafted here, reviewed in the PR.
- No timer, no counter, no score, no log entry, no "done" state. She leaves
  when she leaves.
- **Nothing recorded. Not even that it happened.** No key written, no event,
  no duration. The tests assert this: run the stage, and `localStorage` is
  byte-identical afterwards.

**Gate.** Enter the stage, play for five minutes, leave. Nothing in
`localStorage` changed, and the app never asked how it went.

## Phase 6 — the session loop

PRD §8.6. The one button.

- **Start practice** → "Tune up — six strings." (non-blocking; the app does
  not listen, verify or ask) → Changes, two rounds → Strum → Play → Mess
  around. Always this order (PRD §3).
- The plateau interstitial (PRD §6): weeks where everything clicks, months
  where nothing does, both normal. Written fresh in that voice, shown between
  stages, never as a reaction to a low number.
- Today's date into `cc:sessions` when the first Changes round is logged.
  "Played 14 of the last 30 days" — factual. No streak. A missed day is not
  a failure state (PRD §6).
- The ~15 minute cap (PRD §5.2) governs the three timed stages and Play. Mess
  around is untimed and uncapped, because the app records nothing about it
  and so cannot know. If it ever suggests stopping, the fingertips are the
  limit, not her.

**Gate.** A full session start to finish on her laptop with no decision to
make anywhere in it, ending in a stage that does not end, and the day
appearing in the count once.

## Phase 7 — first run, install, export

PRD §8.7.

- Chord picker: which of the eight can she already hold. Fewer than two
  unlocks Em and A anyway and starts her on that pair (PRD §7). No tutorial.
- `manifest.webmanifest`, icons, service worker. Installable to the Chrome
  taskbar, opens without a URL bar, works offline after first load. The UG
  link-out stays the only network call the app makes.
- Export and import progress as a JSON file.

**Gate.** She installs it from the Pages URL, goes through first run once,
practises with Wi-Fi off, and an export from the installed app imports into
localhost with every score intact.

---

## Open questions

1. **She names it.** "Cowboy Chords" is the letter's own phrase and it is
   good, but it will be on her taskbar for as long as she uses this, and a
   name she chose is one she owns. Until she does, "Cowboy Chords" is the
   working title in the docs only. It reaches `strings.js` and the manifest in
   Phase 7 and is one string in one file either way — so nothing waits on it
   before then. The repo is `cowboy-chords` regardless; a repo name and an app
   name do not have to agree.

## Rules this plan runs under

- PRD §8's build order is fixed. Each phase is independently runnable in
  Chrome, and the phase that ends on her laptop ends there before the next
  one starts.
- Non-goals in PRD §2 and §9 are hard. No microphone, no audio input, no
  scales, no tab, no barre chords, no account, no hosted tabs. Nothing
  scaffolded "for later" — except `capo`, which PRD §4 asks for by name.
- Nothing instruments the mess-around stage, in any phase, for any reason.
- Nothing reports anywhere, in any phase, for any reason. No analytics, no
  telemetry, no crash reporter, no share affordance.
- If the PRD is silent on a product decision, stop and ask. Do not choose.
- Every user-facing string lives in `src/strings.js`; every colour, size and
  spacing value in `src/theme.css`. No screen invents either.
- No dependency that needs installing to run the app, and no build step to
  change content.
- One branch per phase, cut from a freshly pulled `origin/main`, under about
  400 lines, opened with `gh`, merged by Ash. Claude never merges.
