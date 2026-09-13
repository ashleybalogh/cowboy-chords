/* The click.
 *
 * Scheduled on the Web Audio clock with a lookahead, never setInterval: a
 * timer-driven click drifts audibly inside thirty seconds (PRD §3.2), and a
 * drifting click is worse than none, because she will follow it.
 *
 * The pattern is: a slow timer wakes up often, looks a little way into the
 * future, and books every beat that falls inside that window at an exact
 * audio-clock time. The timer can be late — a busy tab, a garbage collection
 * — and the sound still lands where it should, because the time was decided
 * in advance rather than at the moment of playing.
 *
 * Output only. No permission prompt of any kind (PRD §3.2, §5).
 *
 * The arithmetic is in beatsInWindow(), which has no audio in it and is
 * tested; this file's job is to turn those numbers into sound. */

/** How far ahead to book beats, in seconds. */
export const LOOKAHEAD = 0.12;

/** How often to wake up and look, in milliseconds. Comfortably shorter than
 *  the lookahead, so a late wake-up still catches the window. */
export const TICK_MS = 25;

export const SLOTS_PER_BAR = 8; // eighth notes

/** Seconds per eighth-note slot at a given tempo. */
export function slotSeconds(bpm) {
  return 60 / bpm / 2;
}

/**
 * Every slot due between `from` and `from + window`, as absolute times.
 *
 * Pure. `nextSlot` and `nextTime` are where the caller got to last time; the
 * result says what to book and where it got to now, so nothing is scheduled
 * twice and nothing is skipped when a wake-up is late.
 *
 * @returns {{due: {slot: number, at: number}[], nextSlot: number, nextTime: number}}
 */
export function beatsInWindow({ now, nextTime, nextSlot, bpm, window = LOOKAHEAD }) {
  const step = slotSeconds(bpm);
  const due = [];
  let slot = nextSlot;
  let at = nextTime;

  // A guard rather than a while(true): if something suspends the tab for a
  // minute, catching up on four hundred beats at once would be worse than
  // dropping them.
  let safety = 64;
  while (at < now + window && safety-- > 0) {
    due.push({ slot, at });
    at += step;
    slot = (slot + 1) % SLOTS_PER_BAR;
  }

  return { due, nextSlot: slot, nextTime: at };
}

/**
 * A click track for one pattern.
 *
 * @param {{onSlot?: (slot: number, at: number) => void}} [handlers]
 *   onSlot is called as each slot is *booked*, with the audio time it will
 *   sound at, so the screen can light the beat at the right moment rather
 *   than when the timer happened to run.
 */
export function metronome({ onSlot } = {}) {
  let context = null;
  let timer = null;
  let nextTime = 0;
  let nextSlot = 0;
  let bpm = 60;

  function click(at, accent) {
    // A short blip rather than a sample: no file to load, nothing to cache,
    // and it cannot be late. Accent on the downbeat so she can hear where the
    // bar starts without counting.
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.frequency.value = accent ? 1400 : 900;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.28, at + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
    osc.connect(gain).connect(context.destination);
    osc.start(at);
    osc.stop(at + 0.06);
  }

  function tick() {
    const result = beatsInWindow({
      now: context.currentTime,
      nextTime,
      nextSlot,
      bpm,
    });
    for (const { slot, at } of result.due) {
      click(at, slot === 0);
      onSlot?.(slot, at);
    }
    nextTime = result.nextTime;
    nextSlot = result.nextSlot;
  }

  return {
    /** The AudioContext is created on her click, never at load: a context made
     *  without a gesture starts suspended, and the first beat would be late. */
    start(startBpm) {
      if (timer !== null) return;
      bpm = startBpm;
      context ??= new (globalThis.AudioContext ?? globalThis.webkitAudioContext)();
      if (context.state === "suspended") context.resume();
      nextSlot = 0;
      nextTime = context.currentTime + 0.1;
      tick();
      timer = setInterval(tick, TICK_MS);
    },

    /** Tempo can change mid-bar; already-booked beats keep their times, so the
     *  change is heard from the next one rather than jerking what is playing. */
    setTempo(next) {
      bpm = next;
    },

    stop() {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    },

    /** Audio time, for a screen that wants to light a beat at the right
     *  moment. Zero when nothing has started. */
    now() {
      return context?.currentTime ?? 0;
    },
  };
}
