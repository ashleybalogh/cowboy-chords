/* The content files are hand-edited with no build step between the edit and
 * her app, so anything a reader can catch is caught here. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  validateAll,
  validateChords,
  validatePairs,
  validateSongs,
  noteAt,
} from "../src/validate-content.js";

const load = async (name) =>
  JSON.parse(await readFile(new URL(`../content/${name}.json`, import.meta.url), "utf8"));

const chords = await load("chords");
const pairs = await load("pairs");
const patterns = await load("patterns");
const songs = await load("songs");

test("the content we ship is sound", () => {
  assert.deepEqual(validateAll({ chords, pairs, patterns, songs }), []);
});

test("all eight chords are there, in the PRD's unlock order", () => {
  assert.deepEqual(chords.unlockOrder, ["Em", "A", "D", "G", "C", "Am", "E", "Dm"]);
  assert.equal(chords.chords.length, 8);
});

test("no chord needs a barre or anything above the fourth fret", () => {
  for (const chord of chords.chords) {
    const byFinger = new Map();
    for (const f of chord.fingers) {
      assert.ok(f.fret <= 4, `${chord.id} reaches fret ${f.fret}`);
      assert.ok(!byFinger.has(f.finger), `${chord.id}: finger ${f.finger} is on two strings — that is a barre`);
      byFinger.set(f.finger, f);
    }
  }
});

test("every string is accounted for exactly once, on every chord", () => {
  // The verbose form can contradict itself where a fret array cannot: a string
  // in both fingers and open, or in neither. Either renders a silently wrong
  // chord, which is the worst bug this app can have.
  for (const chord of chords.chords) {
    const all = [...chord.fingers.map((f) => f.string), ...chord.open, ...chord.muted].sort();
    assert.deepEqual(all, [1, 2, 3, 4, 5, 6], `${chord.id} does not account for every string once`);
  }
});

test("every stored root matches what its string and fret actually sound", () => {
  // The root letter is on screen every rep. It is stored rather than derived,
  // and this is the belt to that braces.
  for (const chord of chords.chords) {
    assert.equal(
      noteAt(chord.root.string, chord.root.fret),
      chord.root.note,
      `${chord.id}: root says ${chord.root.note}`,
    );
  }
});

test("every root is on a string the chord actually plays", () => {
  for (const chord of chords.chords) {
    assert.ok(!chord.muted.includes(chord.root.string), `${chord.id}: root is on a muted string`);
  }
});

test("the chord names agree with their roots", () => {
  // Em's root is E, Am's is A, and so on. A typo in either shows up here.
  for (const chord of chords.chords) {
    const expected = chord.id.replace(/m$/, "");
    assert.equal(chord.root.note, expected, `${chord.id} has root ${chord.root.note}`);
  }
});

test("every pair is two different unlockable chords, listed once", () => {
  const ids = chords.chords.map((c) => c.id);
  assert.deepEqual(validatePairs(pairs, ids), []);
  // Eight chords, so twenty-eight pairs: the drill is never short of one.
  assert.equal(pairs.pairs.length, 28);
});

test("songs.json is empty but valid, ready for Phase 4", () => {
  assert.deepEqual(songs.songs, []);
  assert.deepEqual(validateSongs(songs, [], []), []);
});

/* --- the validator itself, against content designed to be wrong ---------- */

const good = () => structuredClone(chords);

test("catches a string that is in two places at once", () => {
  const doc = good();
  doc.chords[0].open.push(doc.chords[0].fingers[0].string);
  assert.match(validateChords(doc).join("\n"), /appears 2 times/);
});

test("catches a string nobody mentioned", () => {
  const doc = good();
  doc.chords[0].open.pop();
  assert.match(validateChords(doc).join("\n"), /is not accounted for/);
});

test("catches a root letter that does not match the fret", () => {
  const doc = good();
  doc.chords.find((c) => c.id === "G").root.note = "A";
  assert.match(validateChords(doc).join("\n"), /root says A but string 6 at fret 3 sounds G/);
});

test("catches a root marked at a fret the string is not played at", () => {
  const doc = good();
  const g = doc.chords.find((c) => c.id === "G");
  g.root.fret = 0;
  g.root.note = "E";
  assert.match(validateChords(doc).join("\n"), /root is at fret 0 but string 6 is played at fret 3/);
});

test("catches a root on a muted string", () => {
  const doc = good();
  const a = doc.chords.find((c) => c.id === "A");
  a.root = { string: 6, fret: 0, note: "E" };
  assert.match(validateChords(doc).join("\n"), /root is on string 6, which is muted/);
});

test("catches an unlock order that has drifted from the chords", () => {
  const doc = good();
  doc.unlockOrder = doc.unlockOrder.slice(0, 7);
  assert.match(validateChords(doc).join("\n"), /unlockOrder is missing: Dm/);

  const other = good();
  other.unlockOrder.push("F");
  assert.match(validateChords(other).join("\n"), /chords that do not exist: F/);
});

test("catches a song needing a chord that will never be unlocked", () => {
  const doc = {
    songs: [
      {
        title: "Something",
        artist: "Someone",
        chords: ["F"],
        capo: null,
        ug_search: "https://www.ultimate-guitar.com/search.php?search_type=title&value=something",
      },
    ],
  };
  assert.match(validateSongs(doc, ["F"], ["Em"]).join("\n"), /needs F, which can never be unlocked/);
});

test("catches a song link that does not go to Ultimate Guitar", () => {
  const doc = {
    songs: [
      { title: "T", artist: "A", chords: ["Em"], capo: null, ug_search: "https://example.com/tab" },
    ],
  };
  assert.match(validateSongs(doc, ["Em"], ["Em"]).join("\n"), /must be an ultimate-guitar\.com URL/);
});
