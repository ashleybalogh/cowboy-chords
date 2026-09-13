/* Checks the content files are internally consistent.
 *
 * These files are hand-edited at 11pm with no build step between the edit and
 * her app, so every mistake that can be caught by reading the files is caught
 * here. Pure functions, no I/O: the tests call them, and so can a script.
 *
 * Strings are numbered the standard way: 1 is the thinnest (high E), 6 is the
 * thickest (low E). */

export const STRINGS = [1, 2, 3, 4, 5, 6];

/** What each string sounds open, in standard tuning. */
export const OPEN_NOTES = { 6: "E", 5: "A", 4: "D", 3: "G", 2: "B", 1: "E" };

const CHROMATIC = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

/** The note a string sounds at a given fret. */
export function noteAt(string, fret) {
  const open = OPEN_NOTES[string];
  if (open === undefined) return null;
  return CHROMATIC[(CHROMATIC.indexOf(open) + fret) % 12];
}

/**
 * @returns {string[]} one message per problem, empty when the content is sound.
 */
export function validateChords(doc) {
  const problems = [];
  const say = (m) => problems.push(m);

  if (!Array.isArray(doc?.chords)) return ["chords.json has no chords array"];
  if (!Array.isArray(doc?.unlockOrder)) return ["chords.json has no unlockOrder array"];

  const ids = doc.chords.map((c) => c.id);

  for (const id of new Set(ids)) {
    if (ids.filter((x) => x === id).length > 1) say(`${id} is defined more than once`);
  }

  // The unlock order is the only ranking of difficulty in the app (there used
  // to be a difficulty field; two rankings can disagree and one has to win).
  // So it has to name every chord exactly once.
  const missing = ids.filter((id) => !doc.unlockOrder.includes(id));
  const unknown = doc.unlockOrder.filter((id) => !ids.includes(id));
  if (missing.length) say(`unlockOrder is missing: ${missing.join(", ")}`);
  if (unknown.length) say(`unlockOrder names chords that do not exist: ${unknown.join(", ")}`);
  if (new Set(doc.unlockOrder).size !== doc.unlockOrder.length) {
    say("unlockOrder lists the same chord twice");
  }

  for (const chord of doc.chords) {
    const where = chord.id ?? "a chord with no id";

    if (!chord.id) say("a chord has no id");
    if (!chord.name) say(`${where} has no name`);

    const fingered = chord.fingers?.map((f) => f.string) ?? [];
    const open = chord.open ?? [];
    const muted = chord.muted ?? [];
    const all = [...fingered, ...open, ...muted];

    // The verbose form can contradict itself in a way a terse fret array
    // cannot: a string in both fingers and open, or in neither. Either renders
    // a silently wrong chord, which is the worst bug this app can have.
    for (const string of STRINGS) {
      const times = all.filter((s) => s === string).length;
      if (times === 0) say(`${where}: string ${string} is not accounted for — it must be fingered, open or muted`);
      if (times > 1) say(`${where}: string ${string} appears ${times} times across fingers, open and muted`);
    }
    for (const string of all) {
      if (!STRINGS.includes(string)) say(`${where}: ${string} is not a string number (1–6)`);
    }

    for (const f of chord.fingers ?? []) {
      if (!Number.isInteger(f.fret) || f.fret < 1 || f.fret > 4) {
        say(`${where}: fret ${f.fret} on string ${f.string} is outside the first four frets`);
      }
      if (!Number.isInteger(f.finger) || f.finger < 1 || f.finger > 4) {
        say(`${where}: finger ${f.finger} is not 1–4 (thumb is not used in v1)`);
      }
    }

    // The root is on screen every single rep, so it is stored rather than
    // derived — and then checked against what string and fret actually sound.
    const root = chord.root;
    if (!root) {
      say(`${where} has no root`);
      continue;
    }
    if (!STRINGS.includes(root.string)) {
      say(`${where}: root is on string ${root.string}, which does not exist`);
      continue;
    }
    if (muted.includes(root.string)) {
      say(`${where}: the root is on string ${root.string}, which is muted`);
    }
    const sounds = noteAt(root.string, root.fret);
    if (sounds !== root.note) {
      say(`${where}: root says ${root.note} but string ${root.string} at fret ${root.fret} sounds ${sounds}`);
    }
    // And that the root's fret agrees with how that string is actually played.
    const fretted = chord.fingers?.find((f) => f.string === root.string);
    const playedAt = fretted ? fretted.fret : open.includes(root.string) ? 0 : null;
    if (playedAt !== null && playedAt !== root.fret) {
      say(`${where}: root is at fret ${root.fret} but string ${root.string} is played at fret ${playedAt}`);
    }
  }

  return problems;
}

export function validatePairs(doc, chordIds) {
  const problems = [];
  if (!Array.isArray(doc?.pairs)) return ["pairs.json has no pairs array"];

  const seen = new Set();
  for (const pair of doc.pairs) {
    if (!Array.isArray(pair.chords) || pair.chords.length !== 2) {
      problems.push(`${pair.id ?? "a pair"} does not name exactly two chords`);
      continue;
    }
    for (const id of pair.chords) {
      if (!chordIds.includes(id)) problems.push(`${pair.id}: no chord called ${id}`);
    }
    if (pair.chords[0] === pair.chords[1]) problems.push(`${pair.id} is a chord with itself`);

    const key = [...pair.chords].sort().join("-");
    if (seen.has(key)) problems.push(`${pair.id} is the same pair as one already listed`);
    seen.add(key);
  }
  return problems;
}

export function validatePatterns(doc) {
  const problems = [];
  if (!Array.isArray(doc?.patterns)) return ["patterns.json has no patterns array"];

  for (const pattern of doc.patterns) {
    if (!pattern.id) problems.push("a pattern has no id");
    if (!Array.isArray(pattern.grid) || pattern.grid.length !== 8) {
      problems.push(`${pattern.id}: a grid is eight slots, one per eighth note`);
      continue;
    }
    for (const slot of pattern.grid) {
      if (slot !== "D" && slot !== "U" && slot !== null) {
        problems.push(`${pattern.id}: ${JSON.stringify(slot)} is not "D", "U" or null`);
      }
    }
  }
  return problems;
}

export function validateSongs(doc, chordIds, unlockable) {
  const problems = [];
  if (!Array.isArray(doc?.songs)) return ["songs.json has no songs array"];

  for (const song of doc.songs) {
    const where = song.title ?? "a song with no title";
    if (!song.title) problems.push("a song has no title");
    if (!song.artist) problems.push(`${where} has no artist`);
    if (!Array.isArray(song.chords) || song.chords.length === 0) {
      problems.push(`${where} names no chords`);
    } else {
      for (const id of song.chords) {
        if (!chordIds.includes(id)) problems.push(`${where}: no chord called ${id}`);
        else if (!unlockable.includes(id)) problems.push(`${where} needs ${id}, which can never be unlocked`);
      }
    }
    if (song.capo !== null && !Number.isInteger(song.capo)) {
      problems.push(`${where}: capo is null or a fret number`);
    }
    if (typeof song.ug_search !== "string" || !song.ug_search.startsWith("https://www.ultimate-guitar.com/")) {
      problems.push(`${where}: ug_search must be an ultimate-guitar.com URL`);
    }
  }
  return problems;
}

/** Everything, against everything else. */
export function validateAll({ chords, pairs, patterns, songs }) {
  const chordIds = chords?.chords?.map((c) => c.id) ?? [];
  return [
    ...validateChords(chords),
    ...validatePairs(pairs, chordIds),
    ...validatePatterns(patterns),
    ...validateSongs(songs, chordIds, chords?.unlockOrder ?? []),
  ];
}
