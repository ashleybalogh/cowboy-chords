/* The strum trainer.
 *
 * One pattern for the week, arrows on a four-beat grid, the current beat lit
 * in time with an audible click. Tempo hers to raise, starting slow.
 *
 * The lit beat is driven by the audio clock rather than by the timer that
 * books the beats: the booking happens up to a tenth of a second early, so
 * lighting the arrow at booking time would put the picture ahead of the
 * sound. Each beat is handed its exact audio time and the screen waits for it
 * on requestAnimationFrame. */

import { content } from "./content.js";
import { strings } from "./strings.js";
import { metronome, SLOTS_PER_BAR } from "./metronome.js";
import { patternForToday } from "./week.js";
import { settings, setSetting, thisWeek, setWeek, today } from "./store.js";

const s = strings.strum;

export const MINUTES = 3;

export async function mountStrum(root, { onDone } = {}) {
  const { patterns } = await content();

  const week = patternForToday(thisWeek(), patterns, today());
  setWeek(week);
  const pattern = patterns.find((p) => p.id === week.patternId) ?? patterns[0];

  let bpm = settings().tempo;
  let clock = null;
  let raf = null;
  const pending = [];

  const name = document.createElement("p");
  name.className = "label";
  name.textContent = s.thisWeek(pattern.name);

  const grid = document.createElement("ol");
  grid.className = "strum-grid";
  const cells = pattern.grid.map((stroke, i) => {
    const li = document.createElement("li");
    li.className = "strum-slot";
    if (i % 2 === 0) li.classList.add("is-beat");
    if (stroke) li.classList.add("is-struck");

    const arrow = document.createElement("span");
    arrow.className = "strum-arrow";
    // Down and up, drawn rather than lettered: this is a picture of a hand
    // moving, and the null slots still show the hand travelling.
    arrow.textContent = stroke === "D" ? "↓" : stroke === "U" ? "↑" : "";
    arrow.setAttribute("aria-hidden", "true");

    const count = document.createElement("span");
    count.className = "strum-count";
    count.textContent = i % 2 === 0 ? String(i / 2 + 1) : "&";

    li.append(arrow, count);
    grid.append(li);
    return li;
  });

  const keepMoving = para(s.keepMoving, "strum-note");

  const tempo = document.createElement("input");
  tempo.type = "range";
  tempo.className = "strum-tempo";
  tempo.min = "40";
  tempo.max = "140";
  tempo.step = "5";
  tempo.value = String(bpm);
  tempo.setAttribute("aria-label", s.tempoLabel);

  const tempoValue = document.createElement("span");
  tempoValue.className = "strum-bpm number";
  tempoValue.textContent = s.bpm(bpm);

  tempo.addEventListener("input", () => {
    bpm = Number(tempo.value);
    tempoValue.textContent = s.bpm(bpm);
    setSetting("tempo", bpm);
    clock?.setTempo(bpm);
  });

  const tempoRow = document.createElement("div");
  tempoRow.className = "strum-tempo-row";
  const tempoLabel = document.createElement("span");
  tempoLabel.className = "label";
  tempoLabel.textContent = s.tempoLabel;
  tempoRow.append(tempoLabel, tempo, tempoValue);

  const action = document.createElement("button");
  action.type = "button";
  action.className = "action";
  action.textContent = s.start;

  const done = document.createElement("button");
  done.type = "button";
  done.className = "action is-quiet";
  done.textContent = s.done;
  done.addEventListener("click", () => {
    stop();
    onDone?.();
  });

  const left = document.createElement("p");
  left.className = "strum-left number";
  left.textContent = "";

  action.addEventListener("click", () => (clock ? stop() : play()));

  root.replaceChildren(name, grid, keepMoving, tempoRow, action, left, done);

  /* --- running ---------------------------------------------------------- */

  let endsAt = 0;

  function play() {
    clock = metronome({
      onSlot: (slot, at) => pending.push({ slot, at }),
    });
    clock.start(bpm);
    endsAt = clock.now() + MINUTES * 60;
    action.textContent = s.stop;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    clock?.stop();
    clock = null;
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    pending.length = 0;
    for (const cell of cells) cell.classList.remove("is-now");
    action.textContent = s.start;
    left.textContent = "";
  }

  function frame() {
    const now = clock?.now() ?? 0;

    // Light the beat when its booked time actually arrives, not when it was
    // booked. Anything already past is dropped rather than queued up.
    let show = null;
    while (pending.length && pending[0].at <= now) show = pending.shift().slot;
    if (show !== null) {
      for (const cell of cells) cell.classList.remove("is-now");
      cells[show % SLOTS_PER_BAR].classList.add("is-now");
    }

    const remaining = Math.max(0, Math.round(endsAt - now));
    left.textContent = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
    if (remaining === 0) {
      stop();
      return;
    }

    raf = requestAnimationFrame(frame);
  }
}

function para(text, className) {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  return p;
}
