/* Days are her local calendar days. Mixing them with UTC instants is a bug
 * that only shows up in some timezones at some hours, which is the worst kind
 * to leave to chance. */

import { test } from "node:test";
import assert from "node:assert/strict";

import { daysAgo, daysBetween, localDay, parseDay } from "../src/days.js";
import { daysPractised } from "../src/drill.js";

test("a local day is the day she is in, whatever the hour", () => {
  assert.equal(localDay(new Date(2026, 8, 13, 0, 30)), "2026-09-13", "half past midnight");
  assert.equal(localDay(new Date(2026, 8, 13, 21, 45)), "2026-09-13", "quarter to ten at night");
  assert.equal(localDay(new Date(2026, 0, 5)), "2026-01-05", "single digits are padded");
});

test("a day string goes back to local midnight, not UTC midnight", () => {
  const d = parseDay("2026-09-17");
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 8);
  assert.equal(d.getDate(), 17, "new Date('2026-09-17') would be the 16th west of Greenwich");
  assert.equal(d.getHours(), 0);
});

test("counting between days is whole days, both local", () => {
  assert.equal(daysBetween("2026-09-13", new Date(2026, 8, 13, 23, 59)), 0);
  assert.equal(daysBetween("2026-09-13", new Date(2026, 8, 14, 0, 1)), 1);
  assert.equal(daysBetween("2026-08-31", new Date(2026, 8, 30)), 30);
});

test("daysAgo walks back over a month boundary", () => {
  assert.equal(daysAgo(1, new Date(2026, 8, 1)), "2026-08-31");
  assert.equal(daysAgo(29, new Date(2026, 8, 30)), "2026-09-01");
});

test("a practice just after midnight counts as today", () => {
  // This is the regression: with UTC dates, half past midnight in London
  // compares against yesterday's window and the day she just practised is not
  // in it.
  const now = new Date(2026, 8, 14, 0, 30);
  assert.equal(daysPractised([localDay(now)], 30, now), 1);
});

test("a practice late at night is not counted as tomorrow", () => {
  const now = new Date(2026, 8, 13, 21, 0);
  assert.equal(daysPractised(["2026-09-13"], 30, now), 1);
  assert.equal(daysPractised(["2026-09-14"], 30, now), 0, "tomorrow is not in the window");
});
