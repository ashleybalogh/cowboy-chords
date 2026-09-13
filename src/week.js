/* Which pattern this week.
 *
 * One pattern per week, not per session, and three weeks minimum before the
 * next one (PRD §3.2). Repetition is the mechanism, so there is deliberately
 * no way to skip ahead: the app does not offer a "next pattern" button, and
 * this is the only thing that decides.
 *
 * Pure — the caller passes in what the store holds and the day it is. */

import { daysBetween } from "./days.js";

export const WEEKS_PER_PATTERN = 3;
export const DAYS_PER_PATTERN = WEEKS_PER_PATTERN * 7;

/**
 * @param {{patternId: string, since: string}|null} week what the store holds
 * @param {{id: string}[]} patterns in progression order
 * @param {string} today her local day
 * @returns {{patternId: string, since: string}} what the store should hold now
 */
export function patternForToday(week, patterns, today) {
  const first = patterns[0]?.id ?? null;
  if (!week?.patternId || !patterns.some((p) => p.id === week.patternId)) {
    // Nothing recorded, or a pattern that has since been renamed or removed
    // from the file. Start again at the beginning rather than guessing.
    return { patternId: first, since: today };
  }

  const elapsed = daysBetween(week.since, parseLocal(today));
  if (elapsed < DAYS_PER_PATTERN) return week;

  const index = patterns.findIndex((p) => p.id === week.patternId);
  const next = patterns[index + 1];
  if (!next) return week; // the last one is where she stays

  // Dated from the change, not from the calendar: three weeks each, however
  // late she comes back to it.
  return { patternId: next.id, since: today };
}

/** Whole days she has had this pattern. Only for saying so, never for a
 *  progress bar — there is no "complete" here either. */
export function daysOnPattern(week, today) {
  if (!week?.since) return 0;
  return daysBetween(week.since, parseLocal(today));
}

function parseLocal(day) {
  const [y, m, d] = String(day).split("-").map(Number);
  return new Date(y, m - 1, d);
}
