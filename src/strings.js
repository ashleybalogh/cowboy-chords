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

  home: {
    title: "Cowboy Chords",
    changes: "Changes",
    changesNote: "Two minutes. One pair of chords, and how many times you can get between them.",
    chords: "Chords",
    chordsNote: "The shapes, and which ones you can hold.",
    daysPractised: (n) => (n === 1 ? "Played 1 of the last 30 days" : `Played ${n} of the last 30 days`),
    neverYet: "Nothing on the board yet",
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
    done: "Done",
    nothingUnlocked:
      "Nothing to change between yet. Go to Chords and say which ones you can hold — two is enough to start.",
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

  soreFingers:
    "Sore fingertips are the normal first month on a steel string, and calluses take a few weeks. The fingertips are the limit, not you — stop when they've had enough and come back tomorrow.",
};

function ordinal(n) {
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suffix}`;
}
