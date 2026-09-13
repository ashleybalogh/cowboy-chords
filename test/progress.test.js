/* What the home screen says about where she is. */

import { test } from "node:test";
import assert from "node:assert/strict";

import { DAYS_BEFORE_COUNTING, listChords, showDaysCount, standing } from "../src/progress.js";

const order = ["Em", "A", "D", "G", "C", "Am", "E", "Dm"];

test("her chords come back in unlock order, whatever order she unlocked them", () => {
  const { held, next } = standing(order, ["D", "Em", "A"]);
  assert.deepEqual(held, ["Em", "A", "D"]);
  assert.equal(next, "G");
});

test("the next chord is the first she has not got", () => {
  assert.equal(standing(order, []).next, "Em");
  assert.equal(standing(order, ["Em"]).next, "A");
  // A gap does not change the answer: next is next in the order, not next
  // after the last one she happened to take.
  assert.equal(standing(order, ["Em", "D"]).next, "A");
});

test("when she has all eight there is no next, and the app says so once", () => {
  const { next, all } = standing(order, [...order]);
  assert.equal(next, null);
  assert.equal(all, true);
});

test("nothing unlocked is not 'all of them'", () => {
  const { held, all } = standing(order, []);
  assert.deepEqual(held, []);
  assert.equal(all, false, "an empty list must not read as finished");
});

test("chords are listed the way a person would say them", () => {
  assert.equal(listChords([]), "");
  assert.equal(listChords(["Em"]), "Em");
  assert.equal(listChords(["Em", "A"]), "Em and A");
  assert.equal(listChords(["Em", "A", "D"]), "Em, A and D");
});

/* --- the days line ------------------------------------------------------ */

const now = new Date(2026, 8, 30); // 30 September

test("day one says nothing about days practised", () => {
  // "Played 1 of the last 30 days" is 1/30 — a percentage arriving by
  // accident, and bleak on the day she starts.
  assert.equal(showDaysCount(["2026-09-30"], 1, now), false);
});

test("it stays quiet until the window is mostly a window she had the app in", () => {
  // Local days, the way the store writes them — toISOString here would land a
  // day early west of Greenwich and quietly hide the off-by-one it is meant
  // to catch.
  const started = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    const pad = (n) => String(n).padStart(2, "0");
    return [`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`];
  };
  assert.equal(showDaysCount(started(DAYS_BEFORE_COUNTING - 1), 5, now), false);
  assert.equal(showDaysCount(started(DAYS_BEFORE_COUNTING), 5, now), true);
  assert.equal(showDaysCount(started(60), 9, now), true);
});

test("a count of zero is never shown", () => {
  // The one number here that could read as a reproach. PRD §6 keeps guilt
  // mechanics out, so the app says nothing rather than saying nought.
  assert.equal(showDaysCount(["2026-01-01"], 0, now), false);
});

test("no history at all says nothing", () => {
  assert.equal(showDaysCount([], 0, now), false);
});
