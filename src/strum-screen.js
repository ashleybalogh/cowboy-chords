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
import { chordBox } from "./chordbox.js";
import { asHeld } from "./fingerings.js";
import { strings } from "./strings.js";
import { metronome, SLOTS_PER_BAR } from "./metronome.js";
import { choosePattern, ladder, patternForToday } from "./week.js";
import { settings, setSetting, thisWeek, setWeek, today, unlocked, practisedDays } from "./store.js";

const s = strings.strum;

export const MINUTES = 3;

export async function mountStrum(root, { onDone } = {}) {
  const { patterns, byId } = await content();

  // The nudge. It moves her on by itself, and she can overrule it either way
  // from the ladder below — the timing is a guess and she is not.
  let week = patternForToday(thisWeek(), patterns, today(), practisedDays());
  setWeek(week);
  let pattern = patterns.find((p) => p.id === week.patternId) ?? patterns[0];

  let bpm = settings().tempo;
  let clock = null;
  let raf = null;
  const pending = [];

  const name = document.createElement("p");
  name.className = "label";
  name.textContent = s.thisWeek(pattern.name);

  /* What to strum.
   *
   * The PRD says what the pattern is and never what to play it on, and Justin
   * teaches this in a video, so there is no source to settle it. Decided
   * here: one chord, held the whole way through, because the point of this
   * stage is the right hand and the left one already has a drill of its own.
   *
   * The pattern is fixed for the week (PRD §3.2) but the chord is not — it
   * moves through what she can hold, so the hand that matters repeats while
   * the other gets some variety. With nothing unlocked the open strings do
   * the job and sound fine. */
  const held = unlocked();
  const chordToday = held.length ? byId(held[practisedDays().length % held.length]) : null;

  const what = para(s.whatThisIs, "strum-note");
  const holdThis = document.createElement("div");
  holdThis.className = "strum-hold";
  if (chordToday) {
    holdThis.append(chordBox(asHeld(chordToday), { size: 150 }));
    holdThis.append(para(s.chordToday(chordToday.name), "strum-hold-line"));
  } else {
    holdThis.append(para(s.noChordYet, "strum-hold-line"));
  }

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

  /* "Old Faithful" names two different patterns in the wild. Justin's is five
   * strums; the version she will meet in most Ultimate Guitar comments — and
   * the song links go straight there — has an extra up strum on 4&. Saying so
   * once means the app disagreeing with a tab page does not read as the app
   * being wrong. */
  const variation = pattern.id === "old-faithful" ? para(s.oldFaithfulVaries, "strum-note") : null;

  /* The ladder. Where she is, and every rung tappable in both directions.
   *
   * She holds this lever rather than Ash: he does not play, so the only
   * override cannot live in devtools. Retreating is what makes jumping ahead
   * safe — if a pattern is too hard it costs one tap to go back, and she will
   * work that out in a session. */
  const rungs = document.createElement("ol");
  rungs.className = "ladder";
  for (const step of ladder(patterns, week)) {
    const li = document.createElement("li");
    li.className = step.here ? "ladder-step is-here" : "ladder-step";

    const pick = document.createElement("button");
    pick.type = "button";
    pick.className = "ladder-pick";
    pick.disabled = step.here;

    const label = document.createElement("span");
    label.className = "ladder-name";
    label.textContent = step.name;

    const shape = document.createElement("span");
    shape.className = "ladder-shape";
    shape.setAttribute("aria-hidden", "true");
    shape.textContent = step.grid.map((x) => (x === "D" ? "↓" : x === "U" ? "↑" : "·")).join(" ");

    pick.append(label, shape);
    if (step.here) {
      const mark = document.createElement("span");
      mark.className = "ladder-here label";
      mark.textContent = s.youreHere;
      pick.append(mark);
    }

    pick.addEventListener("click", () => {
      stop();
      setWeek(choosePattern(step.id, today()));
      mountStrum(root, { onDone });
    });

    li.append(pick);
    rungs.append(li);
  }

  const ladderTitle = document.createElement("p");
  ladderTitle.className = "label";
  ladderTitle.textContent = s.ladderTitle;

  const ladderNote = para(s.ladderNote, "strum-note");

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

  root.replaceChildren(
    what,
    holdThis,
    name,
    grid,
    keepMoving,
    ...(variation ? [variation] : []),
    tempoRow,
    action,
    left,
    ladderTitle,
    ladderNote,
    rungs,
    done,
  );

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
