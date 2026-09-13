/* Loads the content files.
 *
 * Paths are relative on purpose: Pages serves the app from /cowboy-chords/,
 * so a leading slash works at localhost and 404s on her laptop. */

import { validateAll } from "./validate-content.js";

let loaded = null;

export async function content() {
  if (loaded) return loaded;

  const [chords, pairs, patterns, songs] = await Promise.all(
    ["chords", "pairs", "patterns", "songs"].map((name) =>
      fetch(`content/${name}.json`).then((r) => {
        if (!r.ok) throw new Error(`content/${name}.json: ${r.status}`);
        return r.json();
      }),
    ),
  );

  const problems = validateAll({ chords, pairs, patterns, songs });
  if (problems.length) {
    // Hand-edited files with no build step between the edit and her app, so a
    // bad edit says what is wrong in the console rather than rendering a
    // silently wrong chord.
    console.error(`Content problems:\n  ${problems.join("\n  ")}`);
  }

  loaded = {
    chords: chords.chords,
    unlockOrder: chords.unlockOrder,
    pairs: pairs.pairs,
    patterns: patterns.patterns,
    songs: songs.songs,
    problems,
    byId: (id) => chords.chords.find((c) => c.id === id),
  };
  return loaded;
}
