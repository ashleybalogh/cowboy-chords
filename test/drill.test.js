/* The drill's rules. No DOM, no clock. */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  availablePairs,
  chooseRounds,
  daysPractised,
  parseCount,
  recentMedian,
  sparklineData,
  SPARKLINE_WINDOW,
} from "../src/drill.js";

const pairs = [
  { id: "Em-A", chords: ["Em", "A"] },
  { id: "Em-D", chords: ["Em", "D"] },
  { id: "A-D", chords: ["A", "D"] },
  { id: "D-G", chords: ["D", "G"] },
];

const score = (pair, count, at = "2026-09-13T18:00:00Z") => ({ pair, count, at });

test("a pair is offered only when both its chords are unlocked", () => {
  assert.deepEqual(
    availablePairs(pairs, ["Em", "A"]).map((p) => p.id),
    ["Em-A"],
  );
  assert.deepEqual(
    availablePairs(pairs, ["Em", "A", "D"]).map((p) => p.id),
    ["Em-A", "Em-D", "A-D"],
  );
  assert.deepEqual(availablePairs(pairs, ["Em"]), []);
});

test("day one: one pair available, and she gets it twice", () => {
  // Honest rather than clever. She has Em and A and there is one change to
  // make; two rounds of it is what the drill actually is that day.
  const rounds = chooseRounds(pairs, ["Em", "A"], []);
  assert.deepEqual(
    rounds.map((r) => r.id),
    ["Em-A", "Em-A"],
  );
});

test("nothing unlocked means no rounds, not a crash", () => {
  assert.deepEqual(chooseRounds(pairs, [], []), []);
  assert.deepEqual(chooseRounds(pairs, ["Em"], []), []);
});

test("round one is her best pair, round two her worst", () => {
  const scores = [
    score("Em-A", 30),
    score("Em-D", 12),
    score("A-D", 21),
  ];
  const rounds = chooseRounds(pairs, ["Em", "A", "D"], scores);
  assert.equal(rounds[0].id, "Em-A", "starts on a win");
  assert.equal(rounds[1].id, "Em-D", "then the one she cannot do");
});

test("a pair she has never tried is treated as the hardest thing on the list", () => {
  // "Practise what you can't do" — and a pair she has never attempted is the
  // least known thing available.
  const scores = [score("Em-A", 30), score("Em-D", 12)];
  const rounds = chooseRounds(pairs, ["Em", "A", "D"], scores);
  assert.equal(rounds[1].id, "A-D", "the unplayed pair, not the low-scoring one");
});

test("the median ignores one bad minute", () => {
  // A phone ringing, or a fingertip that had had enough. One minute does not
  // define a pair.
  const scores = [score("Em-A", 20), score("Em-A", 2), score("Em-A", 22)];
  assert.equal(recentMedian("Em-A", scores), 20);
});

test("the median only looks at recent attempts", () => {
  const old = Array.from({ length: 12 }, () => score("Em-A", 5));
  const recent = Array.from({ length: 10 }, () => score("Em-A", 40));
  assert.equal(recentMedian("Em-A", [...old, ...recent]), 40);
});

test("a pair with no scores has no median", () => {
  assert.equal(recentMedian("Em-A", []), null);
});

test("the line shows the last ten, oldest first", () => {
  const scores = Array.from({ length: 14 }, (_, i) => score("Em-A", i + 1));
  const data = sparklineData("Em-A", scores);
  assert.equal(data.length, SPARKLINE_WINDOW);
  assert.deepEqual(data, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
});

test("the line only shows this pair", () => {
  const scores = [score("Em-A", 10), score("A-D", 99), score("Em-A", 12)];
  assert.deepEqual(sparklineData("Em-A", scores), [10, 12]);
});

test("what she can type", () => {
  assert.equal(parseCount("14"), 14);
  assert.equal(parseCount(" 7 "), 7);
  assert.equal(parseCount("0"), 0, "zero is a real answer and is not rejected");
  assert.equal(parseCount("999"), 999);
  assert.equal(parseCount(""), null);
  assert.equal(parseCount("-3"), null);
  assert.equal(parseCount("12.5"), null);
  assert.equal(parseCount("1000"), null);
  assert.equal(parseCount("twenty"), null);
  assert.equal(parseCount(null), null);
});

test("days practised counts a window, never a streak", () => {
  const now = new Date("2026-09-30T12:00:00Z");
  const days = ["2026-08-31", "2026-09-01", "2026-09-02", "2026-09-29", "2026-09-30"];
  // The window is 30 days counting today, so it reaches back to 1 September
  // and 31 August falls outside it. The 26-day gap in the middle is not a
  // failure and nothing in the app measures it.
  assert.equal(daysPractised(days, 30, now), 4);
});

test("days practised does not count tomorrow", () => {
  const now = new Date("2026-09-30T12:00:00Z");
  assert.equal(daysPractised(["2026-10-01"], 30, now), 0);
});

test("a minute stopped early is not a score", () => {
  // Enforced in the screen rather than here, but the reason belongs with the
  // drill's rules: a count over forty seconds is not the same measurement as
  // a count over sixty. Putting both on one line would quietly corrupt the
  // only number she is watching, which is the whole app.
  const full = [score("Em-A", 20), score("Em-A", 22)];
  assert.deepEqual(sparklineData("Em-A", full), [20, 22]);
  // Nothing in the store distinguishes a short round from a full one, which
  // is exactly why a short one must never reach it.
  assert.equal(Object.keys(full[0]).sort().join(","), "at,count,pair");
});
