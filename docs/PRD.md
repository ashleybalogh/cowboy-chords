# PRD — Guitar practice app (working title: **Cowboy Chords**)

**Audience:** one 13-year-old, one week into playing. Self-directed, at home.
**Instrument:** steel-string acoustic. No capo yet. Guitar has its own tuner.
**Platform:** static web app, runs in Google Chrome on her laptop. No backend.
**Profiles:** single local profile. No profile switcher, no multi-user.
**Maintainer:** Ash, ongoing. Content must be editable without a rebuild.
**Built by:** Claude Code.

---

## 1. Why this exists

She has a guitar and a letter from her uncle with good advice in it. The letter
is the pedagogy; this app is the scaffolding that makes it survivable.

Two things kill beginner guitarists, once the instrument is in tune:

1. She can hold G and C but can't *change* between them in time, and there's no
   visible progress, so it feels like standing still.
2. Nothing sounds like music for the first two months.

And a third thing that isn't a failure mode but is the actual goal: she needs
room to just play, without anything watching.

The app exists to solve those two and protect the third. It is not a course. It is not a tab
library. It's a short daily loop that drills the thing that's actually hard and
gets her to a real song fast.

---

## 2. Non-goals

- **No microphone. No audio input of any kind.** The guitar has a tuner, and
  polyphonic chord recognition isn't reliable enough to give a beginner
  feedback on. Audio input is a v2 question and only if she's still using the
  app in a month. See §7.
- No video lessons.
- No hosted tabs, chord charts for copyrighted songs, or lyrics. **Songs are
  link-outs to Ultimate Guitar search URLs only** — no scraping, no caching, no
  embedding, no iframes.
- No account, login, cloud sync, or social features.
- No scales, barre chords, or theory in v1. Scales are gated behind "can play
  three songs" and are a v2 concern.

---

## 3. The session loop

One button on the home screen: **Start practice.** It runs the same three
stages every time, in order. The first three take about 8 minutes; the last
one takes as long as she wants.

```
  CHANGES         2 min    timed chord-change drill. Scored.
    ↓
  STRUM           3 min    one pattern, visual arrows + metronome.
    ↓
  PLAY            ~5 min   today's song. Link out to UG.
    ↓
  MESS AROUND     open     no timer, no counter, no screen. Just play.
```

Before Changes, a single non-blocking line: **"Tune up — six strings."** The
app does not listen, verify, or ask. It's a reminder, she uses the tuner on the
guitar, she taps to continue.

Stage order never changes. Sameness is the point — she shouldn't have to decide
anything to start.

### 3.1 Changes — the core mechanic

This is the heart of the app, and with the mic gone it is most of the app.
Based on the one-minute-changes drill from JustinGuitar. **Before building,
fetch Justin Sandercoe's actual published description of the drill and follow
his prescription, not my summary of it.**

Roughly: pick a chord pair (G↔C). 60-second timer. Count every clean change.
Log the number. Beat it next time.

Requirements:
- Chord pair chosen by the app based on what's unlocked, not by her.
- Counting: she taps the spacebar on each change. Manual counting is what the
  original drill does and it's honest — she knows whether it rang clean.
- Store every score. Show the last 10 as a sparkline immediately after the
  timer ends. This is the progress signal that problem 1 in §1 is missing.
- Chord diagrams shown as **chord boxes**, not tab. (These are distinct
  notations and the app should never conflate them. Tab is a v2 concern.)
- **The root note is marked differently in every chord box** — a filled dot
  against open ones, or a ring, builder's choice, but consistent everywhere and
  never explained mid-drill.
- Two rounds per session: one pair she's good at, one she isn't.

### 3.2 Strum

- One pattern per week, not per session. Repetition is the mechanism.
- Visual: down/up arrows on a 4-beat grid, current beat highlighted, synced to
  an audible click. Tempo slider, default slow (60 bpm), her choice to raise it.
- Pattern progression: all downs → D-D-U-U-D-U → syncopated. Three weeks
  minimum before moving on.
- Audio here is **output only** — a click track. No permissions, no prompts.
  Schedule it on the Web Audio clock, not `setInterval`, or it will drift
  audibly within about thirty seconds.

### 3.3 Play

- A song she can actually play with the chords she has. Two-chord songs exist
  in quantity; use them.
- The app stores: song title, artist, required chords, and an **Ultimate Guitar
  search URL**. Opens in a new tab. That's the entire integration.
- A song only appears once every chord it needs is unlocked.

### 3.4 Mess around

The letter's strongest point is that being free and creative is when you
actually excel, and that whatever you're feeling goes into the instrument and
comes back out. Three timed drills and a link does not honor that.

So the session ends with an untimed stage that measures nothing:

- No timer, no counter, no spacebar, no score, no log entry.
- The screen shows only the chord boxes she's unlocked, quietly. Nothing else.
- One line, in the voice of §6. Written, not quoted.
- She ends it whenever. There is no "done" state to reach.
- Nothing about this stage is recorded. Not even that it happened.

**This is the most important stage and the easiest one to ruin.** Any attempt to
gamify it, log it, or ask how it went defeats it entirely. If a future version
adds "how long did you play?" — that's the bug.

---

## 4. Content model

All content lives in flat JSON files in `/content/`, editable by hand. No CMS,
no build step to change them.

```
content/
  chords.json     shape, finger positions, root string + fret, difficulty, unlock order
  pairs.json      chord pairs for the changes drill
  patterns.json   strum patterns as beat grids
  songs.json      title, artist, chords[], capo, ultimate_guitar_search_url
```

`songs.json` entry:

```json
{
  "title": "Horse With No Name",
  "artist": "America",
  "chords": ["Em", "D6/9"],
  "capo": null,
  "ug_search": "https://www.ultimate-guitar.com/search.php?search_type=title&value=horse+with+no+name"
}
```

Unlock order for chords: **Em → A → D → G → C → Am → E → Dm**. Em and A first
because the change between them is physically easy and they unlock songs
immediately. F and barre chords are explicitly out of v1.

**Capo.** She doesn't have one. The `capo` field exists anyway (`null` or fret
number), and songs requiring a capo are stored but hidden behind a settings
toggle, default off. When the toggle is on they appear normally.

Build this now rather than later, because a capo is the cheapest unlock in the
whole project — roughly ten dollars, and it multiplies the playable song list
several times over by letting her play in any key with the five chords she
knows. The app should surface this once, factually, on the song screen when
hidden songs outnumber visible ones. Once. Not a recurring nag.

---

## 5. Technical

- Vanilla HTML/CSS/JS or a light framework — builder's choice, but **no build
  step required to run it.** Ash needs to open the folder, edit JSON, and
  refresh.
- State in `localStorage`. Keys namespaced `cc:`. Export/import as a JSON file
  so progress survives a laptop change.
- Ship as a PWA with a manifest so it can be installed to the Chrome taskbar
  and opened without a URL bar.
- Works offline after first load. No network calls except the UG link-out.
- No permission prompts of any kind on first run.

### 5.1 Root notes

Her uncle singled this out: knowing the root is how you learn what a chord is
made of. It costs almost nothing to build and she'll absorb it by repetition.

- `chords.json` carries the root's string and fret for every chord.
- Every chord box marks it distinctly, everywhere in the app, always.
- The chord detail view names it in one plain line — the root of G is G, on the
  low E string, third fret.
- No quiz, no lesson, no theory screen. It's just always marked, and after a
  few hundred reps she'll have noticed that the G chord's root is a G.

### 5.2 Finger pressure guidance

The copy must say: **lightest pressure that still rings clean**, fingertip just
behind the fret, thumb behind the neck. Do not write "press hard" anywhere. A
death grip causes fatigue, tension, and quitting. Pressing close to the fret is
what reduces the force needed — that's the actual lever.

Session length is capped at ~15 minutes in v1. On a steel-string acoustic this
matters more than it would on an electric — heavier strings and higher action
mean sore fingertips are the normal first-month experience, and calluses take a
few weeks. Longer sessions this early produce pain, not progress. If the app
ever suggests stopping, it should say the fingertips are the limit, not her.

### 5.3 Checking whether a chord rings clean

Without a mic, this is a human job, and for the first month a human does it
better anyway. In the chord detail view, include a short static instruction:
play the chord one string at a time, slowly, and listen for the dead or buzzing
one — then look at which finger is leaning on it.

That's the actual diagnostic, and it teaches her to hear it herself rather than
wait for a green light.

---

## 6. Tone and design direction

**The uncle's letter is the app's voice, not its content.** It does not appear
in the app. It is the register everything else is written in, and the source of
what the app believes — cowboy chords first, hours on one thing, plateaus are
normal, the point is to have fun.

Practically, that means: warm, plain, a little rambling, unmistakably a person
rather than a product. Not instructional. Not encouraging in the way apps are
encouraging. Someone who plays, talking to someone who's starting.

The plateau point in particular should exist somewhere as an interstitial —
weeks where everything clicks, months where nothing does, both normal — written
fresh, in that voice.

Keep a short excerpt in `docs/DESIGN_BRIEF.md` as a voice sample for whoever is
writing copy. It stays in the repo's docs, not in the app, and not in
`content/`.

Design constraints:
- Not a kids' app. She's 13. No cartoon mascots, no confetti, no badges with
  medals on them.
- Not a SaaS dashboard either. The subject's world is fretboards, string
  gauges, chord boxes, worn wood, setlists on masking tape — take the visual
  language from there, not from generic app defaults.
- The chord box is the app's core repeating object. It should be beautifully
  drawn and consistent everywhere. That's the signature element; spend the
  boldness there and keep the rest quiet.
- Progress is shown as a line going up over time, never as a percentage
  complete. There is no "complete."
- The mess around stage is instrumented by nothing. Resist every instinct here.
- No streak that can be broken. A missed day is not a failure state, and
  guilt-based retention mechanics are out of scope for a 13-year-old learning
  an instrument for fun. Show "played 14 of the last 30 days" — factual, not
  judgmental.

Consult the `frontend-design` skill before making visual decisions.

---

## 7. Starting state

She is one week in, so the app should not open as if she's never touched the
guitar. First run:

- Ask which chords she can already hold, from the unlock list. Whatever she
  picks is marked unlocked; everything after it stays locked.
- If she picks fewer than two, unlock **Em and A** anyway and start her on that
  pair. Em is one finger short of nothing and A is three fingers in a row on
  one fret — the change between them is about as easy as guitar gets, and it
  gets her a score on the board on day one.
- Do not run a tutorial. The four stages explain themselves as she hits them.

The first Changes score will be low — single digits is normal at one week. The
app should never characterize a score as good or bad. It shows the number and
the line. The line is the whole point.

---

## 8. Build order

1. Content JSON + chord box rendering component. Everything else draws on this.
2. Changes drill + score history. This alone is a usable app — ship it and let
   her use it before building anything else.
3. Strum trainer with metronome.
4. Song list + UG link-out.
5. Mess around stage. Trivial to build, and the session shouldn't ship
   without it — the drills are the vegetables.
6. Session loop wiring the four stages together.
7. Chord picker, PWA manifest, export/import.

Each step should be independently runnable in Chrome.

---

## 9. Deferred to v2

Do not build these. Revisit only if she's still opening the app after a month
of regular use — and if she isn't, none of it would have helped.

- **Microphone features.** A tuner (monophonic pitch detection via YIN is
  reliable and would work), and a string-by-string chord check where she
  arpeggiates and each string is marked. Both were cut because the guitar has a
  tuner and the chord check doesn't earn the whole audio subsystem on its own.
  Note for whoever picks this up: full polyphonic chord recognition stays out
  regardless — a false "that's wrong" to a kid who played it right is worse
  than no feedback.
- Tab notation, and reading single-note lines.
- Scales, gated behind three playable songs.
- Barre chords and F.
- Capo mode, if she gets one — the data model already supports it.
- Her sister, if she picks it up.