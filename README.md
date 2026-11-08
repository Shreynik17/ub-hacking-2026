# Movement Studio

**UB Hacking 2026 · Camera-based movement coaching**

Movement Studio is a PWA for desk time and workouts. It pairs a clear view of movement with one useful next step: take a break, adjust your form, or keep going. The experience is designed around a simple loop: **sense → understand → act**.

## Try the demo

1. Explore the animated movement blueprint. Switch between seated posture and a bodyweight squat, or pause the motion.
2. Open the studio and try **Desk mode** and **Gym mode**. Each sample session shows how observations become short, explainable cues.
3. Open **Why this?** to see the reason behind a cue, or use **Tell us** to correct it.
4. Choose **Use camera** to see a real webcam preview. Camera access begins only after you choose it and can be paused at any time.

The blueprint and sample sessions are **illustrative demos**. The camera preview is real, but it does not claim to classify posture or count reps on its own.

## What is built

| Part | Current state |
| --- | --- |
| PWA and UI | Responsive desk and gym experience, installable app shell, reduced-motion support |
| Movement blueprint | Original animated wireframe scenes for sitting and squatting |
| Demo flows | Interactive sample sessions, cues, explanations, and correction controls |
| Camera | Opt-in live preview with pause control |
| Squat engine | Landmark-based rep and tempo logic in `gym/coach.mjs`; waits for a connected pose model |
| Desk activity recognition | Integration point ready for the team's posture model |

The squat engine accepts MediaPipe-style 33-point pose landmarks, counts a completed down-and-up rep, and asks for a clearer view when leg visibility is low. Its thresholds are prototype values, not a safety assessment.

## Run locally

```bash
python3 -m http.server 8766 --bind 127.0.0.1
```

Open [http://127.0.0.1:8766/](http://127.0.0.1:8766/). No build step is required. Run the squat engine checks with:

```bash
node --test gym/coach.test.mjs
```

## Team

- **Shreynik:** PWA and UI/UX
- **Mudit Jain:** posture and activity recognition
- **Aditya Gupta:** exercise form and coaching
- **Harsh Deshmukh:** nutrition and recovery
