/* The store, against a localStorage stand-in.
 *
 * node has no localStorage, and the point of these tests is the rules the app
 * relies on — that relocking keeps her numbers, that a corrupt value does not
 * take the app down — so a Map behind the same three methods is enough. */

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

class FakeStorage {
  constructor() {
    this.map = new Map();
    this.failWrites = false;
  }
  getItem(k) {
    return this.map.has(k) ? this.map.get(k) : null;
  }
  setItem(k, v) {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.map.set(k, String(v));
  }
  removeItem(k) {
    this.map.delete(k);
  }
}

globalThis.localStorage = new FakeStorage();

const store = await import("../src/store.js");

beforeEach(() => {
  globalThis.localStorage = new FakeStorage();
});

test("a fresh laptop starts empty and stamps the schema", () => {
  const { fresh, schema } = store.open();
  assert.equal(fresh, true);
  assert.equal(schema, store.SCHEMA);
  assert.deepEqual(store.unlocked(), []);
  assert.deepEqual(store.scores(), []);
});

test("the schema is written once and not overwritten after", () => {
  localStorage.setItem("cc:schema", "1");
  const { fresh } = store.open();
  assert.equal(fresh, false);
  assert.equal(localStorage.getItem("cc:schema"), "1");
});

test("she says what she can hold", () => {
  store.unlock("Em");
  store.unlock("A");
  store.unlock("Em"); // twice is not two
  assert.deepEqual(store.unlocked(), ["Em", "A"]);
  assert.equal(store.isUnlocked("Em"), true);
  assert.equal(store.isUnlocked("D"), false);
});

test("relocking keeps every score, so it costs her nothing", () => {
  // If D turns out to be beyond her this week, putting it back has to be free
  // — and re-unlocking has to find her history where she left it.
  store.unlock("Em");
  store.unlock("D");
  store.addScore("Em-D", 11);
  store.addScore("Em-D", 14);

  store.relock("D");
  assert.deepEqual(store.unlocked(), ["Em"]);
  assert.equal(store.scoresFor("Em-D").length, 2, "her numbers are still there");

  store.unlock("D");
  assert.deepEqual(
    store.scoresFor("Em-D").map((s) => s.count),
    [11, 14],
    "and they come back exactly as they were",
  );
});

test("scores are kept forever, oldest first, never averaged away", () => {
  for (let i = 1; i <= 25; i++) store.addScore("Em-A", i);
  const all = store.scoresFor("Em-A");
  assert.equal(all.length, 25);
  assert.equal(all[0].count, 1);
  assert.equal(all.at(-1).count, 25);
});

test("a day is recorded once, however many rounds she does", () => {
  store.markPractised("2026-09-13");
  store.markPractised("2026-09-13");
  store.markPractised("2026-09-14");
  assert.deepEqual(store.practisedDays(), ["2026-09-13", "2026-09-14"]);
});

test("the day is her local day, not UTC", () => {
  // A 9pm practice should not land on tomorrow.
  const late = new Date(2026, 8, 13, 21, 30);
  assert.equal(store.today(late), "2026-09-13");
});

test("her fingering choice is remembered, and only her departures are stored", () => {
  assert.equal(store.chosenFingering("Em"), null);
  store.chooseFingering("Em", "3-4");
  assert.equal(store.chosenFingering("Em"), "3-4");
  assert.deepEqual(store.fingeringChoices(), { Em: "3-4" });

  store.chooseFingering("Em", null);
  assert.deepEqual(store.fingeringChoices(), {}, "back to Justin's leaves nothing behind");
});

test("a corrupt value reads as a default rather than taking the app down", () => {
  localStorage.setItem("cc:scores", "{ not json");
  localStorage.setItem("cc:unlocked", '"Em"'); // valid JSON, wrong shape
  assert.deepEqual(store.scores(), []);
  assert.deepEqual(store.unlocked(), []);
});

test("a write that cannot happen loses a score rather than crashing mid-drill", () => {
  store.unlock("Em");
  localStorage.failWrites = true;
  assert.doesNotThrow(() => store.addScore("Em-A", 12));
  assert.doesNotThrow(() => store.markPractised("2026-09-13"));
});

test("the snapshot names every key, so Phase 7's export cannot miss one", () => {
  store.unlock("Em");
  store.addScore("Em-A", 9);
  store.markPractised("2026-09-13");
  store.chooseFingering("A", "in-a-row");

  assert.deepEqual(Object.keys(store.snapshot()).sort(), [
    "fingering",
    "schema",
    "scores",
    "sessions",
    "settings",
    "unlocked",
  ]);
});

/* --- a store written by newer code than the code now running ------------- */

test("a store from a newer version is read but never written to", () => {
  // The one thing a stale service worker cannot be allowed to paper over: old
  // code writing into a shape it does not understand. Reads still work.
  localStorage.setItem("cc:schema", "2");
  localStorage.setItem("cc:unlocked", '["Em","A"]');
  localStorage.setItem("cc:scores", '[{"pair":"Em-A","count":12,"at":"2026-09-13T00:00:00Z"}]');

  const { tooNew, schema } = store.open();
  assert.equal(tooNew, true);
  assert.equal(schema, 2);
  assert.equal(store.isReadOnly(), true);

  assert.deepEqual(store.unlocked(), ["Em", "A"], "her data still reads");
  assert.equal(store.scoresFor("Em-A").length, 1);

  store.addScore("Em-A", 99);
  store.unlock("D");
  assert.equal(store.scoresFor("Em-A").length, 1, "and nothing was written over it");
  assert.deepEqual(store.unlocked(), ["Em", "A"]);
});

test("the same schema, or an older one, writes normally", () => {
  localStorage.setItem("cc:schema", String(store.SCHEMA));
  const { tooNew } = store.open();
  assert.equal(tooNew, false);
  store.unlock("Em");
  assert.deepEqual(store.unlocked(), ["Em"]);
});

test("a hand-mangled schema does not lock her out of her own app", () => {
  localStorage.setItem("cc:schema", '"banana"');
  const { tooNew } = store.open();
  assert.equal(tooNew, false);
  store.unlock("Em");
  assert.deepEqual(store.unlocked(), ["Em"]);
});
