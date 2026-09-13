/* The changes drill.
 *
 * Two chord boxes, sixty seconds, and one number afterwards. She counts in her
 * head — both hands are on a steel string and reaching for a key mid-change is
 * its own obstacle — and types the total when the timer stops, which is what
 * Justin's own version asks for.
 *
 * The app picks the pair (PRD §3.1) and says nothing at all about the number. */

import { content } from "./content.js";
import { chordBox } from "./chordbox.js";
import { asHeld } from "./fingerings.js";
import { sparkline } from "./sparkline.js";
import { strings } from "./strings.js";
import { addScore, markPractised, scores, unlocked } from "./store.js";
import { ROUND_SECONDS, chooseRounds, parseCount, sparklineData } from "./drill.js";
import { soundEnd, soundStart } from "./metronome.js";

const s = strings.changes;

export async function mountChanges(root, { onDone, onPickChords, nextLabel } = {}) {
  const { pairs, byId } = await content();
  const rounds = chooseRounds(pairs, unlocked(), scores());

  if (rounds.length === 0) {
    // Not a place to be stuck. Strumming needs no chords at all, and the one
    // thing that fixes this is two taps away.
    root.replaceChildren(
      para(s.nothingUnlocked),
      button(s.pickChords, () => onPickChords?.()),
      button(s.skipToNext, () => onDone?.(), "is-quiet"),
    );
    return;
  }

  let index = 0;
  showReady();

  /* --- before the minute ------------------------------------------------ */

  function showReady(note) {
    const pair = rounds[index];
    const start = button(s.start, () => runRound(pair));

    root.replaceChildren(
      roundLabel(),
      boxes(pair),
      para(note ?? (index === 0 ? s.tuneUp : s.secondRound), "changes-note"),
      start,
    );
    start.focus();
  }

  /* --- the minute ------------------------------------------------------- */

  function runRound(pair) {
    const clock = document.createElement("p");
    clock.className = "changes-clock number";

    const stop = button(s.stopEarly, abandon, "changes-stop");

    root.replaceChildren(roundLabel(), boxes(pair), clock, stop);

    // Wall-clock, not a tick count: a backgrounded tab throttles timers, and a
    // minute that quietly became ninety seconds would put a number on the line
    // that means something else.
    const endsAt = Date.now() + ROUND_SECONDS * 1000;
    let timer = null;

    const tick = () => {
      const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      clock.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      if (left === 0) finish();
    };

    function halt() {
      if (timer === null) return false;
      clearInterval(timer);
      timer = null;
      return true;
    }

    /** The minute ran out. This is the only way a number gets recorded. */
    function finish() {
      if (!halt()) return;
      soundEnd();
      askForCount(pair);
    }

    /** She stopped it early — sore fingers, a phone, anything. No number is
     *  asked for and nothing is recorded: a count over forty seconds is not
     *  the same measurement as a count over sixty, and putting it on the same
     *  line would quietly corrupt the one thing she is watching. */
    function abandon() {
      if (!halt()) return;
      showReady(s.stopped);
    }

    soundStart();
    tick();
    timer = setInterval(tick, 250);
  }

  /* --- her number ------------------------------------------------------- */

  function askForCount(pair) {
    const form = document.createElement("form");
    form.className = "changes-count";

    const label = document.createElement("label");
    label.className = "label";
    label.htmlFor = "count";
    label.textContent = s.howMany;

    const input = document.createElement("input");
    input.id = "count";
    input.className = "changes-input number";
    input.type = "text";
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.maxLength = 3;

    const save = button(s.save, null, "changes-save");
    save.type = "submit";

    const problem = para("", "changes-problem");
    problem.hidden = true;

    form.append(label, input, save, problem);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const count = parseCount(input.value);
      if (count === null) {
        problem.textContent = s.needANumber;
        problem.hidden = false;
        input.focus();
        return;
      }
      addScore(pair.id, count);
      // The day is written here, so the mess-around stage records nothing at
      // all, not even that it happened (PRD §3.4).
      markPractised();
      showLine(pair, count);
    });

    root.replaceChildren(roundLabel(), boxes(pair), form);
    input.focus();
  }

  /* --- the line --------------------------------------------------------- */

  function showLine(pair, justScored) {
    const counts = sparklineData(pair.id, scores());

    const number = document.createElement("p");
    number.className = "changes-score number";
    number.textContent = String(justScored);

    const line = document.createElement("div");
    line.className = "changes-line";
    line.append(sparkline(counts));

    const caption = para(
      counts.length === 1 ? s.firstOne : s.lastFew(counts.length),
      "changes-caption",
    );

    index += 1;
    const more = index < rounds.length;
    const next = button(more ? s.nextRound : (nextLabel ?? s.done), () => {
      if (more) showReady();
      else onDone?.();
    });

    root.replaceChildren(roundLabel(index - 1), number, line, caption, next);
    next.focus();
  }

  /* --- bits ------------------------------------------------------------- */

  function roundLabel(which = index) {
    const p = document.createElement("p");
    p.className = "label";
    p.textContent = s.roundOf(which + 1, rounds.length);
    return p;
  }

  function boxes(pair) {
    const row = document.createElement("div");
    row.className = "changes-boxes";
    for (const id of pair.chords) {
      const chord = byId(id);
      if (!chord) continue;
      const cell = document.createElement("div");
      cell.className = "changes-box";
      // asHeld: the box shows the hand she actually makes, not the one she was
      // first shown.
      cell.append(chordBox(asHeld(chord), { size: 176 }));
      const name = document.createElement("span");
      name.className = "chord-cell-name";
      name.textContent = chord.name;
      cell.append(name);
      row.append(cell);
    }
    return row;
  }
}

function para(text, className) {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.textContent = text;
  return p;
}

function button(text, onClick, className = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `action ${className}`.trim();
  b.textContent = text;
  if (onClick) b.addEventListener("click", onClick);
  return b;
}
