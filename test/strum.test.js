/* The click's arithmetic, and which pattern this week.
 *
 * No audio in either: the metronome's scheduling maths is separated from the
 * sound precisely so it can be checked, because "does it drift" is not a
 * question you can answer by listening for thirty seconds and hoping. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { beatsInWindow, slotSeconds, SLOTS_PER_BAR } from "../src/metronome.js";
import { DAYS_PER_PATTERN, daysOnPattern, patternForToday } from "../src/week.js";

const patterns = JSON.parse(
  await readFile(new URL("../content/patterns.json", import.meta.url), "utf8"),
).patterns;

/* --- the click ---------------------------------------------------------- */

test("an eighth note at 60 bpm is half a second", () => {
  assert.equal(slotSeconds(60), 0.5);
  assert.equal(slotSeconds(120), 0.25);
  assert.equal(slotSeconds(80), 0.375);
});

test("beats are booked ahead, never twice, and never skipped", () => {
  let state = { nextSlot: 0, nextTime: 1 };
  const booked = [];

  // Wake up sixty times over three seconds, the way the real timer does.
  for (let i = 0; i < 60; i++) {
    const result = beatsInWindow({ now: 1 + i * 0.05, ...state, bpm: 60 });
    booked.push(...result.due);
    state = { nextSlot: result.nextSlot, nextTime: result.nextTime };
  }

  const times = booked.map((b) => b.at);
  assert.deepEqual(times, [...new Set(times)], "nothing booked twice");
  for (let i = 1; i < times.length; i++) {
    assert.ok(
      Math.abs(times[i] - times[i - 1] - 0.5) < 1e-9,
      `gap ${i} is ${times[i] - times[i - 1]}, not half a second`,
    );
  }
});

test("three minutes at 60 bpm does not drift by so much as a sample", () => {
  // The whole reason this is not setInterval (PRD §3.2). Each beat's time is
  // computed from the last one rather than from when a timer happened to run,
  // so error cannot accumulate — and this is the test that says so.
  let state = { nextSlot: 0, nextTime: 0 };
  let count = 0;
  let last = 0;

  for (let now = 0; now < 180; now += 0.025) {
    const result = beatsInWindow({ now, ...state, bpm: 60 });
    for (const beat of result.due) {
      last = beat.at;
      count++;
    }
    state = { nextSlot: result.nextSlot, nextTime: result.nextTime };
  }

  // 180 seconds at two slots a second, give or take the lookahead window.
  assert.ok(count >= 360 && count <= 362, `booked ${count}`);
  assert.ok(Math.abs(last - (count - 1) * 0.5) < 1e-9, "the last beat is exactly where it should be");
});

test("a late wake-up catches up rather than losing the beats", () => {
  // A busy tab, a garbage collection. The timer is late; the beats are not.
  const result = beatsInWindow({ now: 5, nextTime: 1, nextSlot: 0, bpm: 60 });
  assert.equal(result.due.length, 9, "every beat that fell in the gap");
  assert.equal(result.due[0].at, 1);
  assert.equal(result.nextSlot, 9 % SLOTS_PER_BAR);
});

test("a tab suspended for a minute drops beats rather than firing hundreds", () => {
  const result = beatsInWindow({ now: 600, nextTime: 1, nextSlot: 0, bpm: 60 });
  assert.ok(result.due.length <= 64, `booked ${result.due.length}`);
});

test("slots cycle through the bar, so the downbeat stays the downbeat", () => {
  const result = beatsInWindow({ now: 4.1, nextTime: 0, nextSlot: 0, bpm: 60 });
  assert.deepEqual(
    result.due.map((b) => b.slot),
    [0, 1, 2, 3, 4, 5, 6, 7, 0],
  );
});

/* --- which pattern this week -------------------------------------------- */

test("the patterns are Justin's three steps, in order", () => {
  assert.deepEqual(
    patterns.map((p) => p.id),
    ["all-downs", "backbeat", "old-faithful"],
  );
  assert.deepEqual(patterns[0].grid, ["D", null, "D", null, "D", null, "D", null]);
  // Ups on the backbeat after 2 and 3.
  assert.deepEqual(patterns[1].grid, ["D", null, "D", "U", "D", "U", "D", null]);
  // And then the down on beat 3 goes, which is where the syncopation is.
  assert.deepEqual(patterns[2].grid, ["D", null, "D", "U", null, "U", "D", null]);
});

test("a first visit starts at the beginning", () => {
  assert.deepEqual(patternForToday(null, patterns, "2026-09-13"), {
    patternId: "all-downs",
    since: "2026-09-13",
  });
});

test("the pattern does not change for three weeks", () => {
  const week = { patternId: "all-downs", since: "2026-09-01" };
  // Repetition is the mechanism (PRD §3.2), so nothing moves early.
  assert.deepEqual(patternForToday(week, patterns, "2026-09-14"), week);
  assert.deepEqual(patternForToday(week, patterns, "2026-09-21"), week);
  assert.equal(patternForToday(week, patterns, "2026-09-22").patternId, "backbeat");
});

test("the new pattern is dated from the change, not from the calendar", () => {
  // However late she comes back to it, she gets three weeks of it.
  const week = { patternId: "all-downs", since: "2026-09-01" };
  const next = patternForToday(week, patterns, "2026-11-30");
  assert.equal(next.patternId, "backbeat");
  assert.equal(next.since, "2026-11-30");
});

test("the last pattern is where she stays", () => {
  const week = { patternId: "old-faithful", since: "2026-01-01" };
  assert.deepEqual(patternForToday(week, patterns, "2026-09-13"), week);
});

test("a pattern that has been renamed in the file starts her again rather than breaking", () => {
  const week = { patternId: "one-ash-deleted", since: "2026-09-01" };
  assert.equal(patternForToday(week, patterns, "2026-09-13").patternId, "all-downs");
});

test("days on a pattern counts up and has no ceiling to reach", () => {
  assert.equal(daysOnPattern({ since: "2026-09-13" }, "2026-09-13"), 0);
  assert.equal(daysOnPattern({ since: "2026-09-01" }, "2026-09-13"), 12);
  assert.equal(daysOnPattern(null, "2026-09-13"), 0);
  assert.equal(DAYS_PER_PATTERN, 21);
});
