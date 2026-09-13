/* The chord list, and one chord up close.
 *
 * Two things she controls here: which chords she can hold, and which way she
 * holds them. Both are hers to say and hers to take back, and the app has no
 * opinion about either. */

import { content } from "./content.js";
import { chordBox, describe } from "./chordbox.js";
import { asHeld, options, hasAlternates } from "./fingerings.js";
import { strings } from "./strings.js";
import { chooseFingering, isUnlocked, relock, unlock } from "./store.js";

const s = strings.chords;
const detail = strings.chord;

export async function mountChords(root, { onChange } = {}) {
  const { unlockOrder, byId } = await content();

  const list = document.createElement("section");
  list.className = "chord-list";

  const panel = document.createElement("section");
  panel.className = "chord-detail";
  panel.hidden = true;

  drawList();
  root.replaceChildren(list, panel);

  function drawList() {
    const intro = document.createElement("p");
    intro.className = "chord-list-intro";
    intro.textContent = s.intro;

    const grid = document.createElement("ul");
    grid.className = "chord-grid";

    // Unlock order is the only ordering in the app, and it is roughly
    // easiest-first, so it is also the order to meet them in. Locked chords
    // are shown, quietly: seeing what is coming is not the same as being
    // nagged about it.
    for (const id of unlockOrder) {
      const chord = byId(id);
      if (!chord) continue;

      const li = document.createElement("li");
      const button = document.createElement("button");
      button.className = isUnlocked(id) ? "chord-cell" : "chord-cell is-locked";
      button.type = "button";
      button.append(chordBox(asHeld(chord), { size: 150 }));

      const name = document.createElement("span");
      name.className = "chord-cell-name";
      name.textContent = chord.name;
      button.append(name);

      button.addEventListener("click", () => show(chord));
      li.append(button);
      grid.append(li);
    }

    list.replaceChildren(intro, grid);
  }

  function show(chord) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "chord-back label";
    back.textContent = detail.back;
    back.addEventListener("click", () => {
      drawList();
      panel.hidden = true;
      list.hidden = false;
      list.querySelector("button")?.focus();
    });

    const heading = document.createElement("h2");
    heading.className = "chord-detail-name";
    heading.textContent = chord.name;

    const figure = document.createElement("div");
    figure.className = "chord-detail-box";
    const held = asHeld(chord);
    const box = chordBox(held, { size: 232 });
    box.setAttribute("aria-label", describe(held));
    figure.append(box);

    panel.replaceChildren(
      back,
      heading,
      figure,
      holdControl(chord),
      para(detail.rootLine(chord.root.note, chord.root.string, chord.root.fret), "chord-detail-root"),
      para(detail.pressure),
      para(detail.ringClean),
      ...(hasAlternates(chord) ? [alternates(chord)] : []),
      legend(),
      para(strings.soreFingers, "chord-detail-quiet"),
    );

    panel.hidden = false;
    list.hidden = true;
    back.focus();
  }

  /** She says what she can hold, and can take it back. */
  function holdControl(chord) {
    const wrap = document.createElement("div");
    wrap.className = "chord-hold";

    const held = isUnlocked(chord.id);
    const b = document.createElement("button");
    b.type = "button";
    b.className = held ? "action is-quiet" : "action";
    b.textContent = held ? s.putBack : s.canHold;
    b.addEventListener("click", () => {
      if (held) relock(chord.id);
      else unlock(chord.id);
      onChange?.();
      show(chord);
    });

    wrap.append(b);
    if (held) wrap.append(para(s.putBackNote, "chord-detail-quiet"));
    return wrap;
  }

  /** The other ways to hold it. Justin's first and always the default. */
  function alternates(chord) {
    const section = document.createElement("section");
    section.className = "chord-alternates";

    const title = document.createElement("p");
    title.className = "label";
    title.textContent = detail.otherWays;

    const note = para(detail.otherWaysNote, "chord-detail-quiet");

    const row = document.createElement("ul");
    row.className = "chord-alternates-row";

    for (const option of options(chord)) {
      const li = document.createElement("li");
      li.className = option.chosen ? "chord-alternate is-chosen" : "chord-alternate";

      li.append(chordBox({ ...chord, fingers: option.fingers }, { size: 150 }));

      const label = document.createElement("p");
      label.className = "chord-alternate-label";
      label.textContent = option.label;
      li.append(label);

      if (option.chosen) {
        const mark = document.createElement("p");
        mark.className = "label chord-alternate-mark";
        mark.textContent = detail.inUse;
        li.append(mark);
      } else {
        const pick = document.createElement("button");
        pick.type = "button";
        pick.className = "action is-quiet";
        pick.textContent = option.isDefault ? detail.backToDefault : detail.useThis;
        pick.addEventListener("click", () => {
          chooseFingering(chord.id, option.id);
          onChange?.();
          show(chord);
        });
        li.append(pick);
      }

      row.append(li);
    }

    section.append(title, note, row);
    return section;
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
