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
 *
 * Nearly empty on purpose: Phase 0 is scaffolding, and each phase adds the
 * strings for its own screens. */

export const strings = {
  appName: "Cowboy Chords",

  // Phase 0 only. The first real screen replaces this.
  scaffold: {
    heading: "Nothing to play yet",
    body: "This is the shell. The chord box comes first, then the changes drill — that one alone is enough to practise with.",
  },
};
