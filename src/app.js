/* Two screens and a way between them.
 *
 * Home answers two questions, in this order and with nothing else on it:
 * what now — one button — and where am I — one line. It is not a menu. The
 * one-button session loop that runs all four stages is Phase 6, and it
 * replaces what this button does rather than what this screen is. */

import { content } from "./content.js";
import { strings } from "./strings.js";
import { open, practisedDays, unlocked } from "./store.js";
import { daysPractised } from "./drill.js";
import { listChords, showDaysCount, standing } from "./progress.js";
import { mountChords } from "./chords-screen.js";
import { mountChanges } from "./changes-screen.js";
import { mountStrum } from "./strum-screen.js";

const s = strings.home;

export function start(root) {
  open();
  home();

  async function home() {
    setTitle(s.title);

    const go = document.createElement("button");
    go.type = "button";
    go.className = "start";
    go.append(span("start-name", s.start), span("start-note", s.startNote));
    // One button, and it runs the session. The session grows a stage per
    // phase and always in PRD §3's order, so Phase 6 assembles what is
    // already here rather than replacing it.
    const strum = () =>
      screen(strings.strum.title, (next) => mountStrum(next, { onDone: home }));

    go.addEventListener("click", () =>
      screen(strings.changes.title, (el) =>
        mountChanges(el, {
          onDone: strum,
          // The button at the end of the last round says where it goes. It
          // used to say "Done" and then move her on, which is how you lose
          // someone inside their own app.
          nextLabel: strings.changes.onToStrum,
          onPickChords: () =>
            screen(strings.chords.title, (el2) => mountChords(el2, { onChange: () => {} })),
        }),
      ),
    );

    // Where she is, and the way into the only thing she controls. The line is
    // the route to the chord list rather than there being a third thing on
    // the screen competing with the button.
    const where = document.createElement("button");
    where.type = "button";
    where.className = "standing";
    where.textContent = "";
    where.addEventListener("click", () =>
      screen(strings.chords.title, (el) => mountChords(el, { onChange: () => {} })),
    );

    root.replaceChildren(go, where);

    const { unlockOrder } = await content();
    const { held, next, all } = standing(unlockOrder, unlocked());
    where.textContent =
      held.length === 0
        ? s.standingNone
        : all
          ? s.standingAll(listChords(held))
          : s.standing(listChords(held), next);

    const days = practisedDays();
    const count = daysPractised(days);
    if (showDaysCount(days, count)) {
      const line = document.createElement("p");
      line.className = "home-days label";
      line.textContent = s.daysPractised(count);
      root.append(line);
    }
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
}

function span(className, text) {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

function setTitle(text) {
  const el = document.getElementById("title");
  if (el) el.textContent = text;
}
