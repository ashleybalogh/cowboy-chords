/* Two screens and a way between them.
 *
 * The one-button session loop that runs all four stages in order is Phase 6.
 * Until then the drill and the chord list are reachable on their own, which is
 * what "each step independently runnable" means. */

import { strings } from "./strings.js";
import { open, practisedDays } from "./store.js";
import { daysPractised } from "./drill.js";
import { mountChords } from "./chords-screen.js";
import { mountChanges } from "./changes-screen.js";

const s = strings.home;

export function start(root) {
  open();
  home();

  function home() {
    const nav = document.createElement("nav");
    nav.className = "home";

    nav.append(
      tile(s.changes, s.changesNote, () => screen(strings.changes.title, (el) => mountChanges(el, { onDone: home }))),
      tile(s.chords, s.chordsNote, () => screen(strings.chords.title, (el) => mountChords(el, { onChange: () => {} }))),
    );

    const days = daysPractised(practisedDays());
    const count = document.createElement("p");
    count.className = "home-days label";
    count.textContent = days === 0 ? s.neverYet : s.daysPractised(days);

    setTitle(s.title);
    root.replaceChildren(nav, count);
  }

  function screen(title, mount) {
    const back = document.createElement("button");
    back.type = "button";
    back.className = "chord-back label";
    back.textContent = s.title;
    back.addEventListener("click", home);

    const body = document.createElement("div");
    setTitle(title);
    root.replaceChildren(back, body);
    mount(body);
  }

  function tile(name, note, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "home-tile";

    const heading = document.createElement("span");
    heading.className = "home-tile-name";
    heading.textContent = name;

    const sub = document.createElement("span");
    sub.className = "home-tile-note";
    sub.textContent = note;

    b.append(heading, sub);
    b.addEventListener("click", onClick);
    return b;
  }
}

function setTitle(text) {
  const el = document.getElementById("title");
  if (el) el.textContent = text;
}
