# Movement Studio UI prototype

This is the first UI build for the team's camera-based movement coach. The product name is temporary. Desk and gym have equal prominence, with original movement visuals and interaction patterns designed for this project.

## Run

From this directory:

```bash
python3 -m http.server 8766 --bind 127.0.0.1
```

Open `http://127.0.0.1:8766/`. The static app has no build step. It includes a web manifest and service worker for the app shell. The optional Google Fonts request affects typography only.

## What works now

- Responsive landing page and studio for desktop and mobile.
- An illustrative wireframe movement blueprint for seated posture and bodyweight squats. The scene draws in, cycles through motion, and has scene and pause controls. It uses no camera input and is labeled accordingly.
- Interactive, **clearly labeled simulated** desk and gym experiences.
- Camera permission is requested only when the user clicks **Use camera**. The camera can be paused.
- Cue explanation and correction dialogs.
- A visual pose stage and an integration API for real model observations.
- The gym logic from `gym/coach.mjs` is exposed through the UI adapter.

## What still needs Mudit's model

The camera button shows a **real preview only**. It does not classify desk activity on its own. The UI never represents the preview as live AI inference. Mudit can connect his pose and activity pipeline using the API below. With a successful connection, the stage shows landmarks, activity, confidence, and cues from the actual model.

```js
// Once camera preview is active:
window.motionUI.setObservation({
  activity: 'Sitting',
  description: 'A sustained seated period is visible.',
  confidence: 0.86,
  status: 'tracking',
  cue: 'Would a short movement break feel good?',
  evidence: 'Based on 8 minutes of seated activity.'
});

// For real bodyweight squat frames in gym mode:
window.motionUI.updatePose(poseLandmarks, performance.now(), {
  aspectRatio: video.videoWidth / video.videoHeight
});
```

The UI emits `movement-action` and `movement-correction` window events for the model/session layer. It does not store video frames. The gym prototype uses angle thresholds and requires real-person camera testing before a competition demo. See `gym/README.md` and `AI_ML_WIN_PLAN.md`.

## UI review checklist

- Check the first click path on phone and laptop.
- Test both modes and the cue explanation.
- Try keyboard-only navigation and reduced motion.
- Test camera denied, camera paused, and model unavailable states.
- Confirm the final name, copy, and visual palette with the team.
