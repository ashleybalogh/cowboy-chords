/* The line. The whole point of the drill (PRD §1, §7).
 *
 * A line going up over time, never a percentage, never a target, never a
 * verdict. No axis, no gridlines, no "best" marker — the shape is the message
 * and anything else invites a comparison the app has no business making. */

const NS = "http://www.w3.org/2000/svg";

/**
 * @param {number[]} counts oldest first
 * @param {{width?: number, height?: number}} [opts]
 */
export function sparkline(counts, { width = 260, height = 64 } = {}) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "sparkline");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    counts.length < 2
      ? `One score so far: ${counts[0] ?? 0}.`
      : `The last ${counts.length} scores for this pair: ${counts.join(", ")}.`,
  );

  if (counts.length === 0) return svg;

  const pad = 6;
  const top = pad;
  const bottom = height - pad;

  // The line is scaled to her own range, not to a target. A floor of zero and
  // a ceiling a little above her best keeps a good minute from touching the
  // edge, which would read as a limit.
  const max = Math.max(...counts, 1);
  const x = (i) => (counts.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (counts.length - 1));
  const y = (n) => bottom - (n / max) * (bottom - top);

  if (counts.length > 1) {
    const path = document.createElementNS(NS, "polyline");
    path.setAttribute("class", "sparkline-line");
    path.setAttribute("points", counts.map((n, i) => `${x(i)},${y(n)}`).join(" "));
    svg.append(path);
  }

  // The most recent one, so she can find today on the line.
  const last = document.createElementNS(NS, "circle");
  last.setAttribute("class", "sparkline-last");
  last.setAttribute("cx", x(counts.length - 1));
  last.setAttribute("cy", y(counts.at(-1)));
  last.setAttribute("r", 3.5);
  svg.append(last);

  return svg;
}
