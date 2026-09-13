/* Which way she holds a chord.
 *
 * Justin's fingering is the default everywhere. Where he offers another and
 * she finds it easier, the app remembers and draws hers from then on — in the
 * list, in the detail view, and in the drill, so the box always shows the hand
 * she actually makes rather than the one she was first shown.
 *
 * He is the one who says this is hers to pick: "choose the easiest one for
 * you", and on Em, that she'll end up choosing by what comes before and after
 * it in a song. */

import { chosenFingering } from "./store.js";

/**
 * The chord as she holds it. Same strings, same frets, her fingers.
 * @param {object} chord an entry from chords.json
 * @param {string|null} [alternateId] defaults to whatever she has chosen
 */
export function asHeld(chord, alternateId = chosenFingering(chord.id)) {
  if (!alternateId) return chord;
  const alt = chord.alternates?.find((a) => a.id === alternateId);
  if (!alt) return chord; // her choice refers to an alternate that has since gone
  return { ...chord, fingers: alt.fingers };
}

/** Every way to hold it, hers marked, Justin's first. */
export function options(chord, alternateId = chosenFingering(chord.id)) {
  const all = [
    { id: null, label: "The way Justin teaches it", fingers: chord.fingers, isDefault: true },
    ...(chord.alternates ?? []).map((a) => ({ ...a, isDefault: false })),
  ];
  return all.map((o) => ({ ...o, chosen: o.id === (alternateId ?? null) }));
}

export function hasAlternates(chord) {
  return (chord.alternates?.length ?? 0) > 0;
}
