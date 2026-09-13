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

**Her artists, from her** (Ash, 2026-09-13). Phase 4 builds `songs.json` from
these, not from a list of correct beginner songs. A song she chose will
outperform a song that was correct.

**Phase 4, now:** Nirvana, Lord Huron, The Head and the Heart, Olivia Rodrigo,
Katy Perry, Green Day, The Cranberries, Noah Kahan. Gregory Alan Isakov is
worth adding in the Head and the Heart lane — open chords with a capo, and the
one artist on Ash's side of the taste that overlaps cleanly with hers.

**Start with Green Day's "Good Riddance"**: open chords, no capo, and it
bridges what she likes to what she can play today.

**Held for Phase 8**, once power chords land: Blink-182, Taking Back Sunday,
Pearl Jam, Radiohead.

Rules for building the list:

- **Check every chord against Ultimate Guitar. Nothing from memory.** Same
  rule the fingerings followed, and for the same reason: a song listed as
  playable that turns out to need F is worse than one left out.
- **Drop anything needing F or a barre**, however well it fits her taste.
- **Capo songs are in.** `showCapoSongs` defaults on from now (the capo is
  being bought), which changes PRD §4 — see below.

Folk built on G, C, D, Em and Am is exactly the unlock order, and the
*Unplugged* recordings give her a version that sounds like what she is
actually doing — which is the §1 problem, solved by choice of song rather than
by anything the app does.

**The capo default flips, and takes a feature with it** (Ash, 2026-09-13).
PRD §4 hid capo songs behind a toggle defaulting off, because she did not have
a capo, and asked the app to surface the ten-pound argument once when hidden
songs outnumber visible ones. She is getting one, so the toggle defaults on
and **that one-time note has nothing left to do**. Phase 4 should not build
it. The toggle itself stays: it costs nothing and it is the honest way to say
"show me only what I can play right now" if a capo ever goes missing.

**Power chords are the first thing in v2, not a someday item** (Ash,
2026-09-13). Blink-182 and Taking Back Sunday are the other half of her taste
and they are built on power chords. The §2 ban is on *barre* chords, and a
5-shape is not one: two fingers, no barre, movable, physically easier than an
open G. The argument that carries it is that a power chord is a root and a
fifth — the most literal demonstration available of the root-note idea her
uncle singled out, and PRD §5.1 already puts the root in every chord box.
Slide the shape two frets and the name changes with the root.

**Superseded the same day: they are Phase 8, in v1.** See the phase below.
What changed is that this note assumed someone would teach them in person
while the app stayed pure, and there is no in-person teacher — so the app is
the only route to that half of her taste. "Dammit" and "All the Small Things"
on the horizon is still a better motivator than any interstitial; it is just
a nearer horizon now.

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
cc:settings    {tempo:60, showCapoSongs:true}   showCapoSongs defaults on: the capo is bought
cc:week        {patternId:"all-downs", since:"2026-09-13"}   name is a fossil of a one-week-per-pattern draft
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

- One pattern at a time from `cc:week`, not per session (PRD §3.2).

  **The three weeks is a guess, not a constraint** (Ash, 2026-09-13). It is
  not from the letter — his sequence is chords, picking, scales, and never
  mentions strumming — and it is not from Justin, who teaches all three steps
  on one page in one sitting. It came from PRD drafting, where the rule was
  originally *one week per pattern*, and the key name `cc:week` is the fossil
  of that.

  Checked against §3.2, and the current build loses: "One pattern **per
  week**, not per session" and "Three weeks minimum before moving on" are only
  consistent if the three weeks covers the whole progression. Twenty-one days
  *per pattern* makes it one pattern per three weeks, which contradicts §3.2's
  own first line and comes to **63 days for something the source teaches in a
  single lesson**.

  So the timing is a nudge and not a gate, and she can move herself — see the
  ladder below. The threshold is one named constant precisely because it is a
  guess.
- Down and up arrows on a four-beat grid, current beat lit, synced to the
  click. Tempo slider, default 60, hers to raise.
- Scheduled on the Web Audio clock with a lookahead, never `setInterval`.
  Output only; no permission prompt of any kind (PRD §3.2, §5).

- **The ladder, and who holds the lever** (Ash, 2026-09-13). The three
  patterns are shown as a ladder with her position marked, and **she can tap
  any of them, forward or back**. Not Ash: he does not play, so putting the
  only override in devtools would route a judgement through the person least
  able to make it. Movement in both directions is what makes it safe — if she
  jumps ahead and it is too hard, retreating costs one tap and she will
  self-correct within a session.

  Framed as *where she is*, never as skipping ahead. It also removes the need
  for a "new pattern this week" banner: a ladder with her position on it makes
  the change explain itself.

- **When the app moves her on by itself**: 21 days *and* about 10 days
  practised since the pattern started. Days practised rather than the calendar
  alone, because §3.2 cares about repetition and three weeks on a wall
  calendar provides none — a fortnight off would otherwise promote her past
  something she has not played. It needs no new state; the session dates are
  already there.

- **"Old Faithful" names two different patterns in the wild** (Ash,
  2026-09-13). Justin's is five strums. The common version elsewhere —
  including most Ultimate Guitar comments, which is exactly where the song
  links go — is D-DU-UDU, with the up on 4&. One line in the UI acknowledges
  the variation, so the app disagreeing with a tab page does not read as the
  app being wrong.

- **The session grows a stage; the home screen does not grow a button.**
  Start practice now runs Changes then Strum, in PRD §3's order. A second tile
  would have broken the home rule the day after it was written, and this way
  Phase 6 assembles what is already there rather than replacing it.

**What the drift evidence is, and what it is not** (Ash, 2026-09-13). The
claim that the click does not drift rests on **the simulation and the audio
timestamps**: three minutes of scheduling books 361 beats with the last within
a nanosecond of where it belongs, because each beat's time is computed from
the previous one rather than from when a timer fired.

The Chrome measurements of the highlight — 519, 451, 527, 523, 449 ms against
a nominal 500 — are **a separate observation about visual jitter**, not
evidence about the clock. They are the sampling granularity of the observer
plus the frame rate, and they would look like that even if the audio were
perfect, which it is. Do not cite them as accuracy figures.

**Gate.** Only Ash can close this one; nothing here can hear itself.

1. Three minutes at 60 bpm against a phone metronome, no audible drift, and
   the lit beat still agreeing with the click at the end.
2. **Resume after a couple of minutes in a background tab**, and check the
   highlight and the click still agree. This is the seam where the
   `requestAnimationFrame` stall lives: the click keeps time on the audio
   clock while the screen stops painting, so this is where they can come
   apart without either being wrong on its own.
3. **A run at a faster tempo** — 100 or 120. Sixty is the least demanding
   case for the scheduler, since the gaps are widest and a late wake-up has
   the most room to recover.

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
- Capo songs are shown: the toggle stays but defaults on (PRD §4 as amended
  2026-09-13). **Do not build the one-time capo note.** It existed to make the
  ten-pound argument, and the capo is bought.

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
- **The service worker serves from the cache and revalidates behind it.**
  Measured 2026-09-13: GitHub Pages sends `Cache-Control: max-age=600` on
  every file and does not let you change it, so a tab that already had the
  page open serves its own copy for up to ten minutes after a push. That is a
  shrug. A cache-first service worker would be the same failure with no upper
  bound — the version it first saw, forever — and Ash's JSON edits would stop
  reaching her laptop, which is the one promise the whole no-build-step
  arrangement rests on.

  Network-first was the first answer here and it was **wrong** (Ash,
  2026-09-13). It makes every launch wait on a round trip that, on a bedroom
  laptop with indifferent wifi, does not fail fast — the failure mode is not
  "old content", it is nothing happening for eight seconds before she has
  played a note. So: **stale-while-revalidate.** Serve the cached copy
  instantly, fetch the new one behind it, use it next launch. An edit reaches
  her one session later than the push rather than immediately, which is fine,
  because nothing in `content/` is urgent. She never waits, and **offline is
  the same code path as online** rather than a fallback that only ever runs
  when something has already gone wrong.

- **Revalidate by version, not by file.** With no build step there are no
  hashes, and refreshing files one at a time can leave a launch running
  `app.js` from this week against `store.js` from last — worse than being a
  week stale. So the worker keeps one cache named for a version constant,
  fills it completely before it becomes current, and swaps whole. A launch
  gets one consistent set of files or the previous one, never a mixture.

- **The schema is the one thing that cannot be a session stale** (Ash,
  2026-09-13). If `cc:schema` is bumped and older code is still running, it
  reads a store it does not understand. `store.open()` therefore checks the
  stored schema against its own and **refuses to write when the store is
  newer than the code**, rather than trusting the cache to be in step. That
  guard is in from Phase 2, before there is a service worker to get it wrong.
- Export and import progress as a JSON file.

**Gate.** She installs it from the Pages URL, goes through first run once,
practises with Wi-Fi off, and an export from the installed app imports into
localhost with every score intact.

---

## Phase 8 — power chords

Promoted out of v2 (Ash, 2026-09-13). The reasoning that moved it: power
chords were treated as something taught in person while the app stayed pure,
and there is no in-person teacher. The app is the only route to the half of
her taste that is built on them — Blink-182, Taking Back Sunday, and the rest
of that shelf.

The pedagogy holds on its own. A 5-shape is two fingers and no barre, which
makes it physically easier than an open G; the PRD §2 ban is on *barre*
chords and a power chord is not one. And it is the clearest demonstration
available of the root note her uncle singled out and PRD §5.1 already marks in
every box: slide the shape two frets and the root changes, and the chord's
name changes with it.

- A second box type: a **movable** shape with a fret-position marker. Every
  box in v1 sits at the nut, so this is a real change to the renderer rather
  than a variant of it — budget for that rather than discovering it.
- A small set of songs, from her list, that the shape unlocks.
- **No drills** (Ash, 2026-09-13). Power chords get songs, not rounds.
  Sliding one shape and switching between two shapes are different skills,
  and mixing them would flood `pairs.json` and muddy the one number she is
  watching go up. Nothing about power chords enters the changes drill.
- **The gate is Ash's to set**, and worth setting low. "Behind all eight open
  chords" could be three months, and Blink is the motivation now — PRD §1's
  own second problem is that nothing sounds like music for the first two
  months, which power chords are the fastest available answer to. Three
  playable songs, or the first five chords, keeps it a reward she can see
  rather than a fork over the horizon.

Needs a PRD amendment to §9, drafted in this branch for Ash to accept or
rewrite.

## The microphone: a live question, not a graveyard entry

Moved out of "do not build" (Ash, 2026-09-13) because it was cut partly on an
assumption that did not hold: PRD §5.3 says "for the first month a human does
it better anyway", and the app is used alone.

**It is not the first thing to reach for.** The gap §5.3 actually left was not
a missing pair of ears — it was that the instruction stopped after "look at
which finger is leaning on it" and never said what to look for. That is now
filled by `watchFor` in `chords.json`, sourced from Justin, at no cost.

If the microphone is revisited, the question is the wrong shape in the PRD and
should be restated first:

- The PRD frames it as pitch detection, and pitch is the hard part — YIN is
  reliable on one clean note and much less so mid-arpeggio on a steel-string
  acoustic, where the string before it is still ringing.
- **She does not need to know the note is right. She needs to know the string
  sounded at all.** Dead versus ringing is an onset-and-amplitude question,
  not a pitch one, and it is far more tractable. It also maps exactly onto
  §5.3, which is about dead strings rather than wrong notes, and it keeps the
  rule that matters: the app never says a note is wrong, only that string six
  did not ring.
- Before it becomes a phase, that has to be shown to work on a real
  steel-string in a real bedroom, in a throwaway page. It also needs a
  permission prompt, which PRD §5 bans on first run — so where the prompt
  goes is a product decision, not an implementation detail.

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
- One branch per phase, cut from a freshly pulled `origin/main`, opened with
  `gh`, merged by Ash. Claude never merges.
- Under about 400 lines of **hand-written code** per PR. Generated data and
  tests are not counted: the number is a cap on how much there is to read, and
  counting `pairs.json` against it made the rule meaningless. Each PR names
  the files that are its reviewable surface.
