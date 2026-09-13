/* Where she is. The home screen's second question, after "what now".
 *
 * No DOM, so the rules can be read and tested. Nothing here ranks, scores or
 * congratulates: it reports which chords she has and which one is next, and
 * that is the whole of the progression story. */

import { daysBetween } from "./days.js";

/** How long the app waits before saying anything about days practised.
 *
 * "Played 1 of the last 30 days" on day one is 1/30 — a percentage-complete
 * framing arriving by accident, and the one thing PRD §6 rules out. The line
 * was written for month three, where it is reassuring, so it stays hidden
 * until the window it measures is mostly a window she actually had the app
 * in. */
export const DAYS_BEFORE_COUNTING = 14;

/** Her chords, in unlock order, and the one after them. */
export function standing(unlockOrder, unlocked) {
  const held = unlockOrder.filter((id) => unlocked.includes(id));
  const next = unlockOrder.find((id) => !unlocked.includes(id)) ?? null;
  return { held, next, all: next === null && held.length > 0 };
}

/** "Em", "Em and A", "Em, A and D". */
export function listChords(ids) {
  if (ids.length === 0) return "";
  if (ids.length === 1) return ids[0];
  return `${ids.slice(0, -1).join(", ")} and ${ids.at(-1)}`;
}

/**
 * Whether the days-practised line means anything yet.
 *
 * Two reasons to say nothing: she has not had the app long enough for "the
 * last 30 days" to be about her, or the count is zero — which is the one
 * number in this app that could read as a reproach, and PRD §6 keeps guilt
 * mechanics out.
 */
export function showDaysCount(days, count, now = new Date()) {
  if (days.length === 0 || count === 0) return false;
  return daysBetween([...days].sort()[0], now) >= DAYS_BEFORE_COUNTING;
}
