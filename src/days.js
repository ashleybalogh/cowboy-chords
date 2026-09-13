/* Days, her local ones.
 *
 * Every date in this app is a calendar day in the room she is sitting in, not
 * a UTC instant. Mixing the two is the bug this file exists to prevent, and it
 * bites in both directions:
 *
 *   - `new Date("2026-09-17")` parses as UTC midnight. Read back with local
 *     getters, that is the 16th anywhere west of Greenwich.
 *   - `new Date().toISOString().slice(0, 10)` is tomorrow's date after 7pm in
 *     New York, and yesterday's before 1am in London. A practice at half past
 *     midnight would not count as today.
 *
 * So: one way in, one way out, and nothing in the app calls toISOString on a
 * date it means as a day. */

/** A calendar day as "YYYY-MM-DD", in her timezone. */
export function localDay(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The other direction: "YYYY-MM-DD" back to local midnight. */
export function parseDay(iso) {
  const [year, month, day] = String(iso).split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Whole days from one calendar day to another, both local. */
export function daysBetween(fromIso, to = new Date()) {
  const start = parseDay(fromIso).getTime();
  const end = parseDay(localDay(to)).getTime();
  return Math.round((end - start) / 86_400_000);
}

/** The day N days before this one, as "YYYY-MM-DD". */
export function daysAgo(n, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() - n);
  return localDay(d);
}
