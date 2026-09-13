/* Voice rules that are easier to enforce than to remember.
 *
 * These are not style opinions: each one is a line in the PRD that costs
 * something real if it slips into a screen. The design brief §7 lists them. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { strings } from "../src/strings.js";

/* Copy that lives in content/ rather than in strings.js, because it belongs to
 * a chord and Ash edits it there. It is user-facing all the same, so it is
 * held to the same rules — otherwise the one file that is hand-edited most
 * often is the one file the voice rules do not reach. */
const chords = JSON.parse(
  await readFile(new URL("../content/chords.json", import.meta.url), "utf8"),
);
const fromContent = chords.chords.flatMap((c) => [
  [`chords.json ${c.id}.watchFor`, c.watchFor ?? ""],
  ...(c.alternates ?? []).map((a) => [`chords.json ${c.id}.${a.id}.label`, a.label]),
]);

/* Some strings take arguments — a root line needs a note, a string and a fret.
 * They are called with both shapes that matter, an open root and a fretted
 * one, so the rules below check what she actually reads. */
const SAMPLE_ARGS = [
  ["G", 6, 3],
  ["E", 6, 0],
];

/** Every string in the object, flattened, with the path that got there. */
function* everyString(node, path = "strings") {
  for (const [key, value] of Object.entries(node)) {
    const here = `${path}.${key}`;
    if (typeof value === "string") yield [here, value];
    else if (typeof value === "function") {
      for (const args of SAMPLE_ARGS) yield [`${here}(${args.join(", ")})`, value(...args)];
    } else if (value && typeof value === "object") yield* everyString(value, here);
    else assert.fail(`${here} is neither a string, a function nor an object`);
  }
}

const all = [...everyString(strings), ...fromContent];

test("there is something to check", () => {
  assert.ok(all.length > 0);
});

test("no string tells her to press hard (PRD §5.2)", () => {
  // A death grip causes fatigue, tension and quitting. The lever is pressing
  // close to the fret, not pressing harder.
  const banned = [/press(ing|es)?\s+(down\s+)?(really\s+|very\s+)?hard/i, /\bpress\s+firm/i, /\bfirmly\b/i, /squeeze/i, /\bgrip\s+(it|hard|tight)/i];
  for (const [path, value] of all) {
    for (const pattern of banned) {
      assert.ok(!pattern.test(value), `${path} matches ${pattern}: ${value}`);
    }
  }
});

test("no string characterises a score (PRD §7)", () => {
  // It shows the number and the line. It does not have an opinion.
  const banned = [/\bgreat job\b/i, /\bwell done\b/i, /\bnice work\b/i, /\bkeep it up\b/i, /\byou'?re improving\b/i, /\bgood (score|result|number)\b/i, /\bpersonal best\b/i];
  for (const [path, value] of all) {
    for (const pattern of banned) {
      assert.ok(!pattern.test(value), `${path} matches ${pattern}: ${value}`);
    }
  }
});

test("no streak language, no completion percentage (PRD §6)", () => {
  // A missed day is not a failure state, and there is no "complete".
  const banned = [/\bstreak\b/i, /\bdon'?t break\b/i, /\bdays in a row\b/i, /\b\d+%\s*(complete|done)\b/i, /\bcomplete!?\b/i];
  for (const [path, value] of all) {
    for (const pattern of banned) {
      assert.ok(!pattern.test(value), `${path} matches ${pattern}: ${value}`);
    }
  }
});

test("the app does not shout in its own voice (design brief §7)", () => {
  for (const [path, value] of all) {
    assert.ok(!value.includes("!"), `${path} has an exclamation mark: ${value}`);
  }
});
