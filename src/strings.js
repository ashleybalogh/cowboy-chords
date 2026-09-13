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

  chords: {
    title: "Chords",
    intro: "The shapes, in the order they come. Pick one to see it up close.",
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
  },

  soreFingers:
    "Sore fingertips are the normal first month on a steel string, and calluses take a few weeks. The fingertips are the limit, not you — stop when they've had enough and come back tomorrow.",
};

function ordinal(n) {
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suffix}`;
}
