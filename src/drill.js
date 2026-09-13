/* The rules of the changes drill, with no DOM and no clock in them, so they
 * can be tested and read.
 *
 * The drill is Justin's One Minute Changes, and his prescription governs:
 * one pair for one minute, never a mixture; focus on the changes you find
 * hardest; a countdown timer and a note of the number is the whole apparatus.
 * justinguitar.com/guitar-lessons/one-minute-changes-exercise-b1-110 */

import { daysAgo, localDay } from "./days.js";

export const ROUND_SECONDS = 60;
export const ROUNDS = 2;
export const SPARKLINE_WINDOW = 10;

/** Pairs she could be given: both chords unlocked. */
export function availablePairs(pairs, unlocked) {
  return pairs.filter((p) => p.chords.every((id) => unlocked.includes(id)));
}

/** The middle score of her recent attempts at a pair, or null if she has never
 *  done it. A median rather than a mean because one bad minute — a phone
 *  ringing, a fingertip that had had enough — should not define a pair. */
export function recentMedian(pair, scores, window = SPARKLINE_WINDOW) {
  const counts = scores
    .filter((s) => s.pair === pair)
    .slice(-window)
    .map((s) => s.count)
    .sort((a, b) => a - b);
  if (counts.length === 0) return null;
  const mid = Math.floor(counts.length / 2);
  return counts.length % 2 ? counts[mid] : (counts[mid - 1] + counts[mid]) / 2;
}

/**
 * Two rounds: one pair she is good at, one she isn't (PRD §3.1).
 *
 * Round one is her best recent median — start on a win. Round two is her worst,
 * and an unplayed pair counts as the worst there is, because "practise what you
 * can't do" is the drill's whole point and a pair she has never tried is the
 * least known thing on the list.
 *
 * With one pair available she gets it twice, which is honest: on day one she
 * has Em and A and there is exactly one change to make.
 */
export function chooseRounds(pairs, unlocked, scores, rounds = ROUNDS) {
  const available = availablePairs(pairs, unlocked);
  if (available.length === 0) return [];

  const ranked = available
    .map((pair) => ({ pair, median: recentMedian(pair.id, scores) }))
    .sort((a, b) => {
      // Unplayed sorts to the hard end; ties keep the unlock order the file is
      // already in, so the choice is stable rather than arbitrary.
      const av = a.median ?? -1;
      const bv = b.median ?? -1;
      return bv - av;
    });

  const best = ranked[0].pair;
  const worst = ranked[ranked.length - 1].pair;

  if (rounds === 1) return [best];
  if (available.length === 1) return Array(rounds).fill(best);
  return [best, worst, ...ranked.slice(1, -1).map((r) => r.pair)].slice(0, rounds);
}

/** The last few scores for a pair, oldest first — what the line draws. */
export function sparklineData(pair, scores, window = SPARKLINE_WINDOW) {
  return scores
    .filter((s) => s.pair === pair)
    .slice(-window)
    .map((s) => s.count);
}

/** What she typed, turned into a number the store will accept, or null.
 *  Generous about what it takes and strict about what it stores. */
export function parseCount(input) {
  const text = String(input ?? "").trim();
  if (!/^\d{1,3}$/.test(text)) return null;
  const n = Number(text);
  return n >= 0 && n <= 999 ? n : null;
}

/** "Played 14 of the last 30 days" — factual, never a streak (PRD §6).
 *
 *  Local days throughout: the store writes the day she was in, and comparing
 *  those against UTC dates would drop a practice at half past midnight in
 *  London and count one at 8pm in New York as tomorrow's. */
export function daysPractised(days, windowDays = 30, now = new Date()) {
  const from = daysAgo(windowDays - 1, now);
  const to = localDay(now);
  return days.filter((d) => d >= from && d <= to).length;
}
