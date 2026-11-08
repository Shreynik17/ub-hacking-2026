# Gym slice: bodyweight squat coach

This folder is Aditya's working slice for the Radial Atoms camera-to-action demo. It accepts pose landmarks from a camera model, counts completed bodyweight squats, gives one explainable tempo cue, and exposes optional sourced cards.

## Integrate

```js
import { SquatCoach } from './gym/coach.mjs';
import { cardsFor } from './gym/cards.mjs';

const coach = new SquatCoach();
const result = coach.update(poseLandmarks, performance.now(), {
  aspectRatio: video.videoWidth / video.videoHeight
});

// result: { status, reps, phase, cue, event, kneeAngle, confidence, side }
// Show result.cue as text; do not force speech or notifications.
// Show cardsFor('after-squat') in a separate, dismissible panel.
```

The landmark input is the 33-point MediaPipe pose layout. Show the person side-on and fit hip, knee, and ankle in frame. The code uses the more visible leg and abstains when visibility is low. It counts a rep after the knee angle moves from standing (at least 150°), through the bottom (at most 115°), and back to standing. These are **prototype thresholds**, not universal squat standards or an assessment of safety. Two-dimensional camera views cannot reliably determine load, pain, spinal position, or whether a lift is safe.

## Judge demo

1. Show the camera view and full-body framing cue.
2. Perform two controlled bodyweight squats. Show live rep count and the measured knee angle.
3. Perform one faster rep. Show the specific descent-time cue, then demonstrate that the app allows the user to dismiss or correct it.
4. Briefly show a sourced `after-squat` card. Explain that straps only appear for pulling exercises, and caffeine is phrased with individual variation.

## Acceptance check

- Side-on person visible from hip to ankle: rep counter responds.
- Leg missing or low confidence: no rep is counted, and reposition guidance appears.
- Incomplete squat: no rep counted.
- Complete squat: exactly one rep counted.
- Refresh/restart resets the session; no camera frames are stored by this module.

Run `node --test gym/coach.test.mjs` from `movement-coach/`.

## Integration notes

- Keep the gym cards outside the live tracking region so the live cue remains the focus.
- Show the source behind each knowledge card. Do not treat cards as individualized medical or nutrition advice.
- The demo should state that this is movement feedback from a camera, not injury prevention or diagnosis.
