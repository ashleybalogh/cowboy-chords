# DESIGN BRIEF — Cowboy Chords

How it looks, sounds and feels. Governs every screen and every user-facing
string. Where this conflicts with a library default or a standard web pattern,
this wins. Derived from PRD §6, after the `frontend-design` skill.

She is 13, a week into playing, doing this alone in her room on a laptop, most
likely in the evening. That is the whole audience.

---

## 1. Where the look comes from

PRD §6 names the world: fretboards, string gauges, chord boxes, worn wood,
setlists on masking tape. So the app is made of **the instrument's own
materials**, not of paper and not of dashboard.

The obvious move — cream paper, a big serif, a terracotta accent — was
rejected on purpose. It is what every app reaches for when told "warm and
analogue", it looks like a recipe blog, and it is not what a guitar is made of.
A guitar is dark rosewood, nickel fret wire, pearl inlay dots, bronze-wound
strings that oxidise to a dull gold. That is the palette, and it is a dark
interface: correct for evening practice, and it reads as neither a kids' app
nor a SaaS dashboard within about a second.

Every colour is named after the thing it came from. If a value cannot be named,
it does not belong in `theme.css`.

| token | is |
|---|---|
| `--wood`, `--wood-deep`, `--wood-raised` | rosewood, in three depths. Grounds. |
| `--nickel`, `--nickel-dim` | fret wire. Structure, hairlines, borders. |
| `--pearl`, `--pearl-dim` | inlay dots. Primary and secondary text. |
| `--bronze`, `--bronze-dim` | a bronze-wound string. **The live thing** — current beat, active chord, the progress line. Used sparingly enough that it always means "this one, now". |
| `--tape`, `--ink` | masking tape and ballpoint. The song list only. |

`--pearl` is a text colour and never a background; the moment it becomes a
ground, this becomes the cream-paper app we rejected. `--nickel-dim` is for
hairlines, never for text — it does not carry enough contrast on wood.

## 2. The signature: the chord box

One bold element, everything else quiet (PRD §6). The chord box is it, and it
is **a slice of the fretboard, not a printed grid**:

- Vertical, dark wood panel. Nickel fret lines with a real highlight edge, so
  the frets read as metal sitting above wood rather than as table rules.
- **Six strings at their actual relative gauges** — `--gauge-1` through
  `--gauge-6`, scaled from a light acoustic set (.012–.053). The low E is
  visibly two and a half times the high E. This is the one real risk in the
  design, and it earns itself twice: it is true to the instrument, and it means
  she can tell which string is which by looking, which is half of learning to
  read a chord box at all.
- Fingertip dots in pearl, finger numbers inside them.
- **The root is a ring, not a filled dot** (PRD §3.1, §5.1). Same treatment
  everywhere in the app, always, never explained mid-drill. A ring reads as
  "this one is different" without reading as "this one is wrong".
- Open strings as a small ring above the nut, muted strings as a cross, both
  in `--nickel`.

Drawn once as one component from `chords.json`, used everywhere, never
reimplemented. Chord boxes are not tab and the app never conflates them.

## 3. Type

No web fonts: the app works offline with no network calls (PRD §5), so the
stacks are system faces chosen deliberately, in this order of preference.

| role | stack | why |
|---|---|---|
| `--font-label` | Bahnschrift → DIN Alternate → Franklin Gothic Medium → Arial Narrow | DIN is equipment lettering — amp panels, flight cases, string packets. Ships with Windows. Uppercase, letterspaced, for stage names and labels only. |
| `--font-body` | Segoe UI Variable Text → Segoe UI → system-ui | Quiet and invisible. Instructions and sentences. |
| `--font-number` | Cascadia Mono → Consolas → ui-monospace | Scores, tempo, counts. Tabular and mechanical, like a tally rather than a KPI. |

The score is the largest type in the app. It is a number on wood, and nothing
around it comments on it.

## 4. Structure and restraint

- Radius is near zero. Fret wire and nut edges are hard; the guitar's curves
  are not in the interface.
- Hairlines are one pixel of `--nickel-dim`. There is no shadow anywhere except
  the single highlight on a fret.
- Spacing is a plain 4px scale. It is deliberately unremarkable — the boldness
  is spent on the chord box and nowhere else.
- No gradients, no glass, no cards floating over cards. One panel depth.
- Progress is a **line going up over time** (PRD §6): 2px `--bronze`, the last
  point a small pearl dot, no filled area, no gridlines, no axis labels beyond
  what a number needs. Never a percentage, never a ring, never a bar. There is
  no "complete".

## 5. Motion

Almost none, and never decorative.

- The current beat lights on the click in Strum. That is function.
- The score line draws once, left to right, the first time it appears.
- Nothing else moves. No page transitions, no counting-up numbers, no reveals.
- `prefers-reduced-motion: reduce` removes both of the above.

## 6. Things that are not in this app

No confetti. No badges, medals, trophies or levels. No mascot. No streak, and
no visual that can break. No percentage anywhere. No "Great job!". No progress
ring. No empty state that sounds disappointed.

## 7. Voice

The register is her uncle's letter: warm, plain, a little rambling,
unmistakably a person rather than a product. Not instructional. Not encouraging
the way apps are encouraging. Someone who plays, talking to someone who's
starting.

The letter itself never appears in the app and nothing quotes it (PRD §6). A
verbatim excerpt is in `docs/voice-sample.local.md` — gitignored, because it is
private and this repo is public. **Read it before writing any copy.** If it is
missing, ask Ash rather than guessing at the voice.

Checkable rules:

- Every user-facing string lives in `src/strings.js`. None inline in a screen,
  so the voice can be read as a set.
- Sentence case. Plain verbs. No exclamation marks in the app's own voice.
- The app never characterises a score (PRD §7). Not "nice", not "keep going".
  It shows the number and the line.
- The app never says "press hard" or anything adjacent (PRD §5.2). Lightest
  pressure that still rings clean, fingertip just behind the fret. A test
  enforces this against `strings.js`.
- If it ever suggests stopping, the fingertips are the limit, not her.
- A missed day is factual: "played 14 of the last 30 days". Never "you haven't
  practised since Tuesday".
- Buttons say what happens: "Start practice", and the thing that follows is
  practice. The same action keeps its name everywhere.

## 8. Quality floor

Not announced, just met: keyboard focus visible on everything interactive
(`--bronze` outline, 2px, offset 2px), reduced motion respected, readable at
laptop and phone width even though she uses a laptop, and no colour carrying
meaning on its own — the live chord is larger as well as bronze.
