/* Everything the app remembers. localStorage, keys namespaced cc: (PRD §5).
 *
 * It all lives on her laptop and has nowhere else to go. Nothing here is ever
 * sent anywhere — see CLAUDE.md, and do not let that change.
 *
 * Pure-ish: every read tolerates a missing or corrupt value and returns the
 * default, because a thrown error here would take the whole app down and the
 * cost of a lost setting is a shrug. */

export const SCHEMA = 1;

const KEYS = {
  schema: "cc:schema",
  unlocked: "cc:unlocked",
  scores: "cc:scores",
  sessions: "cc:sessions",
  settings: "cc:settings",
  fingering: "cc:fingering",
};

/* --- the raw layer ------------------------------------------------------ */

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Private window, or a full disk. Losing a score is better than a crash
    // mid-drill.
    return false;
  }
}

/** Called once at startup. Nothing to migrate yet; the version is written from
 *  the first phase that stores anything so that a later shape change can
 *  migrate rather than wipe her scores. */
export function open() {
  const found = read(KEYS.schema, null);
  if (found === null) write(KEYS.schema, SCHEMA);
  return { schema: found ?? SCHEMA, fresh: found === null };
}

/* --- what she can hold -------------------------------------------------- */

/** She says what she can hold. The app never decides it from a score: a
 *  threshold would turn the drill into pass/fail, which PRD §7 forbids, and
 *  the app cannot be wrong about her own hands. */
export function unlocked() {
  const value = read(KEYS.unlocked, null);
  return Array.isArray(value) ? value : [];
}

export function unlock(id) {
  const next = [...new Set([...unlocked(), id])];
  write(KEYS.unlocked, next);
  return next;
}

/** The reverse, and it costs her nothing: scores are kept, so re-unlocking
 *  finds her history where she left it. Not a demotion, and nothing in the
 *  app says otherwise. */
export function relock(id) {
  const next = unlocked().filter((x) => x !== id);
  write(KEYS.unlocked, next);
  return next;
}

export function isUnlocked(id) {
  return unlocked().includes(id);
}

/* --- the numbers -------------------------------------------------------- */

/** @returns {{pair: string, count: number, at: string}[]} oldest first. */
export function scores() {
  const value = read(KEYS.scores, null);
  return Array.isArray(value) ? value : [];
}

export function addScore(pair, count, at = new Date().toISOString()) {
  const next = [...scores(), { pair, count, at }];
  write(KEYS.scores, next);
  return next;
}

/** Every score for one pair, oldest first. Nothing is ever averaged away or
 *  deleted, including when a chord is relocked. */
export function scoresFor(pair, all = scores()) {
  return all.filter((s) => s.pair === pair);
}

/* --- days practised ----------------------------------------------------- */

/** Dates only, for "played 14 of the last 30 days". No streak: a missed day is
 *  not a failure state (PRD §6). Written when the first round is logged, so
 *  the mess-around stage still records nothing at all. */
export function markPractised(day = today()) {
  const days = read(KEYS.sessions, null);
  const list = Array.isArray(days) ? days : [];
  if (list.includes(day)) return list;
  const next = [...list, day];
  write(KEYS.sessions, next);
  return next;
}

export function practisedDays() {
  const value = read(KEYS.sessions, null);
  return Array.isArray(value) ? value : [];
}

export function today(date = new Date()) {
  // Her local day, not UTC: a 9pm practice should not land on tomorrow.
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* --- which fingering she uses ------------------------------------------- */

/** Justin's fingering is the default for every chord. Where he offers another
 *  and she finds it easier, the app remembers that and draws it everywhere —
 *  including in the drill, so the box always shows the hand she actually
 *  makes. Only her departures are stored. */
export function fingeringChoices() {
  const value = read(KEYS.fingering, null);
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function chosenFingering(chordId) {
  return fingeringChoices()[chordId] ?? null;
}

export function chooseFingering(chordId, alternateId) {
  const next = { ...fingeringChoices() };
  if (alternateId === null) delete next[chordId];
  else next[chordId] = alternateId;
  write(KEYS.fingering, next);
  return next;
}

/* --- settings ----------------------------------------------------------- */

export function settings() {
  const value = read(KEYS.settings, null);
  return { tempo: 60, showCapoSongs: false, capoNoteSeen: false, ...(value ?? {}) };
}

export function setSetting(key, value) {
  write(KEYS.settings, { ...settings(), [key]: value });
}

/** Everything, for Phase 7's export. Kept here so there is one list of keys. */
export function snapshot() {
  return {
    schema: read(KEYS.schema, SCHEMA),
    unlocked: unlocked(),
    scores: scores(),
    sessions: practisedDays(),
    settings: settings(),
    fingering: fingeringChoices(),
  };
}
