/* Which pattern she is on.
 *
 * One pattern at a time, not one per session (PRD §3.2): repetition is the
 * mechanism. But the timing is a nudge rather than a gate — she can move
 * herself up or down the ladder whenever she likes, and the app moving her on
 * by itself only exists so that a passive month still goes somewhere.
 *
 * Pure — the caller passes in what the store holds and the day it is. */

import { daysBetween } from "./days.js";

/* Both thresholds are guesses, and they are constants so that saying so costs
 * one edit.
 *
 * The three weeks is not from the letter — its sequence is chords, picking,
 * scales, and it never mentions strumming — and not from Justin, who teaches
 * all three patterns on one page in a single sitting. It came from PRD
 * drafting, and §3.2's own two bullets ("one pattern per week" and "three
 * weeks minimum before moving on") only agree with each other if the three
 * weeks covers the whole progression rather than each rung of it.
 *
 * Which is survivable precisely because this is a nudge: a wrong number costs
 * her one tap. */
export const DAYS_PER_PATTERN = 21;

/* Days actually practised, not days elapsed. §3.2's reason for waiting is
 * repetition, and three weeks on a wall calendar provides none — without this,
 * a fortnight off would promote her past something she has never played. */
export const SESSIONS_PER_PATTERN = 10;

/**
 * @param {{patternId: string, since: string}|null} week what the store holds
 * @param {{id: string}[]} patterns in progression order
 * @param {string} today her local day
 * @param {string[]} [practised] the days she has practised, for the nudge
 * @returns {{patternId: string, since: string}} what the store should hold now
 */
export function patternForToday(week, patterns, today, practised = []) {
  const first = patterns[0]?.id ?? null;
  if (!week?.patternId || !patterns.some((p) => p.id === week.patternId)) {
    // Nothing recorded, or a pattern that has since been renamed or removed
    // from the file. Start again at the beginning rather than guessing.
    return { patternId: first, since: today };
  }

  const elapsed = daysBetween(week.since, parseLocal(today));
  const sessions = practised.filter((day) => day >= week.since).length;
  if (elapsed < DAYS_PER_PATTERN || sessions < SESSIONS_PER_PATTERN) return week;

  const index = patterns.findIndex((p) => p.id === week.patternId);
  const next = patterns[index + 1];
  if (!next) return week; // the last one is where she stays

  // Dated from the change, not from the calendar: a full run at each one,
  // however late she comes back to it.
  return { patternId: next.id, since: today };
}

/** She moved herself. The clock restarts wherever she lands, so the nudge
 *  never immediately undoes her choice — and retreating is as free as
 *  advancing, which is exactly what makes advancing safe. */
export function choosePattern(patternId, today) {
  return { patternId, since: today };
}

/** The ladder, for drawing: every pattern in order, with hers marked. */
export function ladder(patterns, week) {
  return patterns.map((pattern, i) => ({
    ...pattern,
    here: pattern.id === week?.patternId,
    step: i + 1,
  }));
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
