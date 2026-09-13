/* The click's arithmetic, and which pattern this week.
 *
 * No audio in either: the metronome's scheduling maths is separated from the
 * sound precisely so it can be checked, because "does it drift" is not a
 * question you can answer by listening for thirty seconds and hoping. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { beatsInWindow, slotSeconds, SLOTS_PER_BAR } from "../src/metronome.js";
import {
  DAYS_PER_PATTERN,
  SESSIONS_PER_PATTERN,
  choosePattern,
  daysOnPattern,
  ladder,
  patternForToday,
} from "../src/week.js";

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

/** Days she practised, starting the day the pattern did. */
const sessions = (from, count) => {
  const out = [];
  const d = new Date(`${from}T12:00:00`);
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
};

test("the pattern waits for both the days and the sessions", () => {
  const week = { patternId: "all-downs", since: "2026-09-01" };
  const played = sessions("2026-09-01", 20);
  // Repetition is the mechanism (PRD §3.2), so nothing moves early.
  assert.deepEqual(patternForToday(week, patterns, "2026-09-14", played), week);
  assert.deepEqual(patternForToday(week, patterns, "2026-09-21", played), week);
  assert.equal(patternForToday(week, patterns, "2026-09-22", played).patternId, "backbeat");
});

test("a fortnight off does not promote her past something she has not played", () => {
  // The whole reason the nudge counts sessions rather than the calendar:
  // three weeks on a wall clock is not three weeks of practice.
  const week = { patternId: "all-downs", since: "2026-09-01" };
  assert.deepEqual(
    patternForToday(week, patterns, "2026-10-30", sessions("2026-09-01", 3)),
    week,
    "sixty days elapsed, three days played, so she stays",
  );
  assert.equal(SESSIONS_PER_PATTERN, 10);
});

test("sessions before this pattern started do not count toward it", () => {
  const week = { patternId: "all-downs", since: "2026-09-20" };
  const beforeAndAfter = [...sessions("2026-08-01", 30), ...sessions("2026-09-20", 4)];
  assert.deepEqual(patternForToday(week, patterns, "2026-10-20", beforeAndAfter), week);
});

/* --- the ladder --------------------------------------------------------- */

test("the ladder is every pattern in order, with hers marked", () => {
  const rungs = ladder(patterns, { patternId: "backbeat", since: "2026-09-13" });
  assert.deepEqual(rungs.map((r) => r.id), ["all-downs", "backbeat", "old-faithful"]);
  assert.deepEqual(rungs.map((r) => r.here), [false, true, false]);
  assert.deepEqual(rungs.map((r) => r.step), [1, 2, 3]);
});

test("she can move to any rung, and the clock restarts where she lands", () => {
  // Retreating is what makes advancing safe: if she jumps to the hard one and
  // it is too hard, going back costs one tap and nothing is lost.
  assert.deepEqual(choosePattern("old-faithful", "2026-09-13"), {
    patternId: "old-faithful",
    since: "2026-09-13",
  });
  assert.deepEqual(choosePattern("all-downs", "2026-09-14"), {
    patternId: "all-downs",
    since: "2026-09-14",
  });
});

test("the nudge never immediately undoes her choice", () => {
  // She drops back to the first pattern after months of practice. The nudge
  // must not shove her forward again on the same visit.
  const chosen = choosePattern("all-downs", "2026-09-13");
  assert.deepEqual(patternForToday(chosen, patterns, "2026-09-13", sessions("2026-01-01", 200)), chosen);
});

test("the new pattern is dated from the change, not from the calendar", () => {
  // However late she comes back to it, she gets a full run at the new one.
  const week = { patternId: "all-downs", since: "2026-09-01" };
  const next = patternForToday(week, patterns, "2026-11-30", sessions("2026-09-01", 40));
  assert.equal(next.patternId, "backbeat");
  assert.equal(next.since, "2026-11-30");
});

test("the last pattern is where she stays", () => {
  // With the sessions supplied, so this tests the end of the ladder rather
  // than passing because the nudge never fired.
  const week = { patternId: "old-faithful", since: "2026-01-01" };
  const played = sessions("2026-01-01", 200);
  assert.ok(played.length > SESSIONS_PER_PATTERN, "the nudge would otherwise fire");
  assert.deepEqual(patternForToday(week, patterns, "2026-09-13", played), week);
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
