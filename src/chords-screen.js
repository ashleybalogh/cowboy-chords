/* The chord list, and one chord up close.
 *
 * Phase 1's whole screen. The session loop replaces the home page later; this
 * becomes the thing the loop links to. */

import { content } from "./content.js";
import { chordBox, describe } from "./chordbox.js";
import { strings } from "./strings.js";

const s = strings.chords;
const detail = strings.chord;

export async function mountChords(root) {
  const { chords, unlockOrder, byId } = await content();

  const list = document.createElement("section");
  list.className = "chord-list";

  const intro = document.createElement("p");
  intro.className = "chord-list-intro";
  intro.textContent = s.intro;
  list.append(intro);

  const grid = document.createElement("ul");
  grid.className = "chord-grid";

  // Unlock order is the only ordering in the app, and it is roughly
  // easiest-first, so it is also the order to meet them in.
  for (const id of unlockOrder) {
    const chord = byId(id);
    if (!chord) continue;

    const li = document.createElement("li");
    const button = document.createElement("button");
    button.className = "chord-cell";
    button.type = "button";
    button.append(chordBox(chord, { size: 150 }));

    const name = document.createElement("span");
    name.className = "chord-cell-name";
    name.textContent = chord.name;
    button.append(name);

    button.addEventListener("click", () => show(chord));
    li.append(button);
    grid.append(li);
  }

  list.append(grid);

  const panel = document.createElement("section");
  panel.className = "chord-detail";
  panel.hidden = true;

  root.replaceChildren(list, panel);

  function show(chord) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "chord-back label";
    back.textContent = detail.back;
    back.addEventListener("click", () => {
      panel.hidden = true;
      list.hidden = false;
      grid.querySelector("button")?.focus();
    });

    const heading = document.createElement("h2");
    heading.className = "chord-detail-name";
    heading.textContent = chord.name;

    const figure = document.createElement("div");
    figure.className = "chord-detail-box";
    figure.append(chordBox(chord, { size: 232 }));

    const rootLine = para(
      detail.rootLine(chord.root.note, chord.root.string, chord.root.fret),
      "chord-detail-root",
    );

    panel.replaceChildren(
      back,
      heading,
      figure,
      rootLine,
      para(detail.pressure),
      para(detail.ringClean),
      legend(),
      para(strings.soreFingers, "chord-detail-quiet"),
    );

    panel.hidden = false;
    list.hidden = true;
    back.focus();
    // Screen readers get the same facts the drawing gives, in the same order.
    figure.firstChild?.setAttribute("aria-label", describe(chord));
  }
}

function para(text, className) {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  return p;
}

function legend() {
  const p = document.createElement("p");
  p.className = "chord-detail-quiet";
  p.textContent = `${detail.fingers} ${detail.strung}`;
  return p;
}
