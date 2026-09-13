/* The chord box. The one bold object in the app (design brief §2).
 *
 * A pale printed card sitting on the dark, because every chord box she meets
 * outside this app — Ultimate Guitar, books, videos — is black on white, and
 * inverted contrast here would mean learning each shape twice.
 *
 * Two things it does that most chord boxes do not:
 *
 *   - the six strings are drawn at their real relative gauges, .012 to .053,
 *     so she can tell which string is which by looking;
 *   - the root is marked by hue and by its letter, never by a ring, because an
 *     open ring above the nut already means "play this string open" — and for
 *     Em, A and D the root *is* an open string, so a root-ring would land
 *     exactly on top of that meaning.
 *
 * Drawn from chords.json and nowhere else. */

const FRETS = 4; // enough for every chord in v1; no barre chords, nothing above the 4th

/* Gauges, thickest to thinnest, matching --gauge-6 … --gauge-1. Kept here in
 * the same numbers as the tokens rather than read from CSS, because this is an
 * SVG in user units and the ratio is the point. The floor is 1: a high E that
 * disappears takes the whole idea with it. */
const GAUGES = { 6: 2.6, 5: 2.2, 4: 1.8, 3: 1.5, 2: 1.2, 1: 1 };

const NS = "http://www.w3.org/2000/svg";

function el(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/**
 * @param {object} chord an entry from chords.json
 * @param {{size?: number}} [opts] size is the card's width in px; everything
 *   scales from it, so the drill and the song list ask for different numbers
 *   and get the same drawing.
 * @returns {SVGSVGElement}
 */
export function chordBox(chord, { size = 168 } = {}) {
  const scale = size / 168;
  const pad = 20 * scale; // room for the X/O row and the fret marker
  const top = 30 * scale;
  const gridW = size - pad * 2;
  const gridH = gridW * 1.15;
  const stringGap = gridW / 5;
  const fretGap = gridH / FRETS;
  const dot = 13 * scale;

  // Strings run left to right thickest to thinnest, the way a chord box is
  // read and the way the guitar looks from the player's side.
  const order = [6, 5, 4, 3, 2, 1];
  const x = (string) => pad + order.indexOf(string) * stringGap;
  const y = (fret) => top + (fret - 0.5) * fretGap;

  const svg = el("svg", {
    class: "chordbox",
    viewBox: `0 0 ${size} ${top + gridH + 14 * scale}`,
    width: size,
    height: top + gridH + 14 * scale,
    role: "img",
    "aria-label": describe(chord),
  });

  svg.append(
    el("rect", {
      class: "chordbox-card",
      x: 0,
      y: 0,
      width: size,
      height: top + gridH + 14 * scale,
      rx: 2,
    }),
  );

  // Nut: a thick bar, the way it is on paper.
  svg.append(
    el("line", {
      class: "chordbox-nut",
      x1: pad - 1,
      y1: top,
      x2: size - pad + 1,
      y2: top,
      "stroke-width": 6 * scale,
    }),
  );

  for (let f = 1; f <= FRETS; f++) {
    svg.append(
      el("line", {
        class: "chordbox-fret",
        x1: pad,
        y1: top + f * fretGap,
        x2: size - pad,
        y2: top + f * fretGap,
      }),
    );
  }

  for (const string of order) {
    svg.append(
      el("line", {
        class: "chordbox-string",
        x1: x(string),
        y1: top,
        x2: x(string),
        y2: top + gridH,
        "stroke-width": Math.max(1, GAUGES[string] * scale),
      }),
    );
  }

  // Above the nut: O for open, X for don't play. Both standard, both in the
  // dimmer ink so the fingering reads first.
  for (const string of chord.open ?? []) {
    const isRoot = chord.root?.string === string && chord.root?.fret === 0;
    svg.append(
      el("circle", {
        class: isRoot ? "chordbox-open is-root" : "chordbox-open",
        cx: x(string),
        cy: top - 11 * scale,
        r: 4.5 * scale,
      }),
    );
    if (isRoot) svg.append(rootLetter(chord.root.note, x(string), top - 11 * scale, scale));
  }

  for (const string of chord.muted ?? []) {
    const cx = x(string);
    const cy = top - 11 * scale;
    const r = 4 * scale;
    svg.append(el("line", { class: "chordbox-muted", x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r }));
    svg.append(el("line", { class: "chordbox-muted", x1: cx + r, y1: cy - r, x2: cx - r, y2: cy + r }));
  }

  for (const f of chord.fingers ?? []) {
    const isRoot = chord.root?.string === f.string && chord.root?.fret === f.fret;
    const cx = x(f.string);
    const cy = y(f.fret);

    svg.append(
      el("circle", {
        class: isRoot ? "chordbox-dot is-root" : "chordbox-dot",
        cx,
        cy,
        r: dot / 2,
      }),
    );

    // The finger number lives in the dot. On the root, the note's letter takes
    // that place instead — the root is named as well as marked, which is
    // PRD §5.1 done without a theory screen.
    const inside = el("text", {
      class: isRoot ? "chordbox-inside is-root" : "chordbox-inside",
      x: cx,
      y: cy,
      "font-size": 9 * scale,
    });
    inside.textContent = isRoot ? chord.root.note : String(f.finger);
    svg.append(inside);
  }

  return svg;
}

/** The root's letter above an open string: no dot behind it, so it is drawn in
 *  the root's own colour rather than reversed out. */
function rootLetter(note, cx, cy, scale) {
  const text = el("text", {
    class: "chordbox-inside is-root above-nut",
    x: cx,
    y: cy - 9 * scale,
    "font-size": 9 * scale,
  });
  text.textContent = note;
  return text;
}

/** What a screen reader says. The same facts, in the same order, as the box. */
export function describe(chord) {
  const parts = [`${chord.name} chord.`];
  for (const f of chord.fingers ?? []) {
    parts.push(`Finger ${f.finger} on string ${f.string}, fret ${f.fret}.`);
  }
  if (chord.open?.length) parts.push(`Strings ${chord.open.join(", ")} open.`);
  if (chord.muted?.length) parts.push(`Strings ${chord.muted.join(", ")} not played.`);
  if (chord.root) {
    parts.push(
      `The root is ${chord.root.note}, on string ${chord.root.string}` +
        (chord.root.fret === 0 ? ", open." : `, fret ${chord.root.fret}.`),
    );
  }
  return parts.join(" ");
}
