/* Every user-facing string in the app. None inline in a screen, so the voice
 * can be read as a set.
 *
 * The register is her uncle's letter: warm, plain, a little rambling,
 * unmistakably a person. Read docs/voice-sample.local.md before adding
 * anything here. The letter itself never appears in the app.
 *
 * Rules, enforced by test/strings.test.js:
 *   - no "press hard" or anything adjacent (PRD §5.2)
 *   - nothing that characterises a score as good or bad (PRD §7)
 *   - no streak language, no percentages of completion (PRD §6)
 *   - no exclamation marks in the app's own voice
 *
 * Each phase adds the strings for its own screens. */

export const strings = {
  appName: "Cowboy Chords",

  /* Home answers two questions and no more: what now, then where am I.
   * One button for the first, one line for the second. */
  home: {
    title: "Cowboy Chords",

    start: "Start practice",
    // What actually happens, not a time budget. Two rounds of sixty seconds
    // with a number typed between them (PRD §3.1).
    startNote: "Two rounds of a minute on chord changes, then three minutes of strumming to a click. About eight minutes.",

    // Where she is. Factual, and it makes the one way the app grows visible
    // from the first screen rather than buried in a list.
    // A dash rather than a full stop: "Em and A. D when you're ready" puts a
    // chord name straight after a stop and reads as an abbreviation.
    standing: (held, next) => `${held} — ${next} when you're ready.`,
    standingAll: (held) => `${held}. That's all of them.`,
    standingNone: "No chords yet — say which ones you can hold.",

    daysPractised: (n) => `Played ${n} of the last 30 days`,
  },

  chords: {
    title: "Chords",
    intro: "The shapes, in the order they come. Pick one to see it up close.",
    canHold: "I can hold this",
    canHoldAlready: "You can hold this",
    putBack: "Put it back",
    // Relocking is not a demotion and nothing here implies one.
    putBackNote: "Nothing is lost if you do — your numbers stay where they are, and it comes back the same.",
  },

  changes: {
    title: "Changes",
    roundOf: (n, of) => `Round ${n} of ${of}`,
    // The tune-up line: a reminder, not a check. The app does not listen.
    tuneUp: "Tune up first — six strings. Then get the first shape under your fingers, and start when you're ready.",
    secondRound: "Different pair this time. Get it under your fingers first.",
    start: "Start the minute",
    stopEarly: "Stop",
    howMany: "How many changes",
    save: "Save it",
    needANumber: "A number, up to three digits.",
    firstOne: "That's the first one on the line.",
    lastFew: (n) => `The last ${n} for this pair.`,
    nextRound: "Next round",
    // Where the last round actually goes. A button that says "Done" and then
    // takes you somewhere is how you lose someone inside their own app.
    onToStrum: "On to strumming",
    done: "Done",
    nothingUnlocked:
      "Nothing to change between yet. Say which chords you can hold — two is enough to start.",
    pickChords: "Pick your chords",
    skipToNext: "Skip to strumming",

    // Stopping early records nothing, and says so plainly rather than leaving
    // her to wonder where the number went.
    stopped:
      "Stopped, and nothing went on the line — a count only means something over a full minute. Go again whenever you're ready.",
  },

  chord: {
    // PRD §5.1: the root named in one plain line, no theory screen.
    rootLine: (note, string, fret) =>
      fret === 0
        ? `The root is ${note} — string ${string}, open. It's the note the chord is named after, and it's marked in every diagram.`
        : `The root is ${note} — string ${string}, ${ordinal(fret)} fret. It's the note the chord is named after, and it's marked in every diagram.`,

    // PRD §5.2. The lever is where the finger sits, not how hard it pushes.
    pressure:
      "Lightest pressure that still rings clean. Fingertip just behind the fret, not on top of it and not halfway back — that's what makes it take less effort. Thumb behind the neck.",

    // PRD §5.3. The diagnostic she can do herself, which is the point.
    ringClean:
      "To find out whether it's clean, play it one string at a time, slowly, and listen for the one that's dead or buzzing. Then look at which finger is leaning on it. That's usually the whole answer.",

    // The label over the per-chord failure mode. The text itself is in
    // chords.json, because it belongs to the chord.
    watchFor: "What usually goes wrong",

    fingers: "Fingers are numbered 1 for the index to 4 for the little finger.",
    strung: "Strings are numbered 1 for the thinnest to 6 for the thickest.",
    back: "All chords",

    // Three of the eight are fingered differently here than on most charts she
    // will find — Em, A and Dm — and one of them is the first chord she ever
    // looks up. Without this she decides the app is broken and says nothing.
    otherWays: "If that's not working for you",
    otherWaysNote:
      "This is the fingering Justin teaches, and it's the one to start with. Charts elsewhere often show it another way, and that's not a mistake on either side — which fingers you use depends on your hand and on what comes before and after it in a song. Try the other one, and if it suits you better, keep it. Every diagram in the app will follow.",
    useThis: "Use this one",
    inUse: "Yours",
    backToDefault: "Back to Justin's",
  },

  strum: {
    title: "Strum",
    // She has just spent two minutes on her left hand. This stage is the other
    // one, and saying so is the difference between a drill and a mystery.
    whatThisIs:
      "This one is all about the strumming hand. Hold down one chord and leave it there — which chord barely matters, because the thing you're practising is keeping time.",
    chordToday: (name) => `Hold ${name} and let it ring the whole way through.`,
    noChordYet:
      "No chords yet, so strum the open strings. The right hand is the whole point here.",

    thisWeek: (name) => `This week: ${name}`,
    // Justin's point, and the pattern does not work without it.
    keepMoving:
      "Keep your hand moving the whole way through, even on the beats with no arrow. It swings like a pendulum and the strings just happen to be in the way sometimes.",
    // Justin's Old Faithful is five strums. Most of the internet's is six.
    // She will meet the other one the first time she opens a tab page, and
    // this is here so that reads as a variation rather than as the app being
    // wrong.
    oldFaithfulVaries:
      "You'll see this one written a few different ways. Plenty of people add one more up strum right at the end, after the 4. Both are called old faithful and both are right — this is the one Justin teaches.",

    ladderTitle: "The three patterns",
    // Where she is, not a menu of levels. Nothing here says "unlocked",
    // "next" or "skip".
    ladderNote:
      "These are the three, in the order they get harder. You're on one of them and you can move to any of the others whenever you like — going back is as easy as going forward, so it's worth trying the next one to see how it feels.",
    youreHere: "You're here",

    tempoLabel: "Tempo",
    bpm: (n) => `${n} bpm`,
    start: "Start the click",
    stop: "Stop",
    done: "Done",
  },

  soreFingers:
    "Sore fingertips are the normal first month on a steel string, and calluses take a few weeks. The fingertips are the limit, not you — stop when they've had enough and come back tomorrow.",
};

function ordinal(n) {
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suffix}`;
}
