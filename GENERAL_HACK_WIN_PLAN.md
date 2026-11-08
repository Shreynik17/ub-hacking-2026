# Best General Hack — finish one complete outcome

## Product sentence

**Motion Mirror helps students notice long periods of stillness, take a short movement break, and see that they actually moved.** A webcam and pose model observe the state; the interface explains a cue; the app verifies the next action. Gym squats are the second demonstration of the same movement engine.

## What makes the project competitive

The current broad idea—posture, exercise, diet, facts—risks looking like several partial features. The stronger project is a **closed loop**:

`Observe activity → identify a sustained pattern → offer one action → detect completion → show a small, honest result.`

This supports Radial Atoms, Best AI/ML, Best UI/UX, and Best General Hack with the same working core.

## Rubric proof

| UB Hacking criterion | Show judges |
|---|---|
| It Works | A live camera demo completes the entire loop without editing data or relying on a mock state. A recorded backup exists. |
| Usefulness | A student can start without an account and get a relevant break or workout cue. Test with five people and report what changed. |
| Technicality | Real pose landmarks, a trained movement classifier, temporal smoothing, uncertainty handling, and a rep state machine. |
| Effort | Public repository, clear contributions, tests, error states, accessible UI, evaluation, and run instructions. |
| Freshness | The app verifies whether a suggested action happened and explains why it suggested it; it does not merely send timer reminders. |
| Pitch | One person performs the live loop while another explains the model and results. Rehearse a three-minute version. |
| X-Factor | The “motion halo” makes movement legible and the uncertain model correctable without scolding the user. |

Do not claim an X-Factor score or a win; these are the team's proof targets.

## Scope lock

### Must work by tonight

1. Camera permission and live pose overlay.
2. `Sitting`, `Standing`, and `Unsure` states, with clear framing help.
3. One sustained-stillness cue, user acceptance, and standing/movement completion.
4. Bodyweight squat rep count and one explainable tempo cue.
5. A short session summary that distinguishes detected activity from user-entered information.
6. Public repository, run steps, and a video under three minutes.

### Only if the core is stable

- A learned classifier with held-out-person evaluation and baseline comparison.
- One nutrition or recovery card tied to the completed action.
- Installable/offline PWA behavior, after testing that the model assets also load offline.

### Cut from the judging demo

- Generic chatbot, long diet questionnaire, calorie estimates from video, “perfect posture” score, many exercise types, random facts during live tracking, unsupported medical claims, and sponsor APIs that do no essential work.

## Ownership

- **Mudit:** camera pose pipeline, activity state, confidence, completion event.
- **Aditya:** squat coach module, one tested cue, optional source-backed gym card.
- **Harsh:** one context-aware recovery or fuel card after the action, with source and preference caveat.
- **Shreynik:** all screens, camera states, accessibility, integration, and the pitch flow.

## Three-minute judging script

1. **0:00–0:20:** “Students lose track of movement during long work sessions. Motion Mirror responds to what the camera actually sees.”
2. **0:20–1:15:** Open the PWA, grant camera access, show sitting and the live model evidence. Trigger a preloaded **real** session history or wait for a cue; never pretend a thirty-second demo is a long sitting period.
3. **1:15–1:50:** Accept the movement break, stand and move, and show the app detect completion.
4. **1:50–2:20:** Switch to squats, count two reps, and explain the tempo cue.
5. **2:20–2:45:** Show the trained model's held-out evaluation, confidence/unknown state, and one error the team learned from.
6. **2:45–3:00:** Close with privacy, the practical user benefit, and the next validation step.

Have a local video of the exact live path if camera permissions, lighting, or venue Wi-Fi fail. Label any simulated or prerecorded portion clearly.

## Submission gate

Create the Devpost draft by the event site's 11 p.m. Saturday draft deadline. Aim to submit before the event site's 12:30 p.m. Sunday final deadline; Devpost displays a conflicting 1:30 p.m. time, so check the event Discord. Include all four accounts, public repository, run instructions, truthful limitations, selected prize categories, and the mandatory video.

## References

- Event tracks and schedule: https://ubhacking.cse.buffalo.edu/
- Devpost overview, requirements and judging criteria: https://ubhacking2026.devpost.com/
- Devpost rules: https://ubhacking2026.devpost.com/rules
- Radial Atoms brief: https://docs.google.com/document/d/17GPaAlux3Zzja3y9LbfBpgyoZwT5m7Ao-hIHvsAmvtw/edit
