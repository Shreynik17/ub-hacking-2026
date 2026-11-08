# Best AI/ML build plan — camera movement coach

## The claim to prove

"A live camera model recognizes a person's movement state, tracks a squat across time, and chooses a specific, explainable cue when it has enough evidence."

The current `gym/coach.mjs` is a useful rule-based prototype. It is **not** a custom-trained activity model. MediaPipe Pose Landmarker itself uses pretrained ML to produce 33 landmarks, but the team should add and evaluate one learned model to make a stronger Best AI/ML case.

## One learned task

Classify a one-second window of pose landmarks as `seated`, `standing`, `squat_down`, `squat_up`, or `unknown`. Keep walking out of the first evaluation unless it can be captured clearly and validated. The `unknown` state is a product feature, not a failure.

Pipeline:

1. **Sense:** use the webcam and MediaPipe Pose Landmarker in `VIDEO` mode. Keep inference local in the browser if the team's setup allows it.
2. **Features:** for each valid frame, center landmarks on mid-hip and divide coordinates by torso length; include selected hip/knee/ankle/shoulder angles, landmark visibility, and changes in knee/hip position over the prior second. Do not feed raw pixel positions or a person's identity into the classifier.
3. **Learn:** train a small regularized logistic regression or random forest on labeled windows. Freeze the feature list and model parameters before the final held-out test. Save model weights and class names with the app.
4. **Infer:** smooth probabilities across several windows; return `unknown` when the relevant joints are hidden or the top probability is below a calibrated threshold. Use the existing squat state machine for rep counting after the learned model says the user is squatting.
5. **Act:** send one cue tied to an observed quantity, such as "descent took 0.5 seconds; try a more controlled descent." Do not claim to diagnose injury risk or spinal alignment.

## Collect data tonight

- Each of four teammates records short clips of every class, with explicit consent, from at least two camera positions or lighting conditions. Save **landmarks plus labels**, not video, unless clips are needed for debugging and everyone agrees.
- Label contiguous clips, then make one-second windows. Keep `person_id` and `session_id` with each window.
- Include real failures: partial body, people leaving the frame, camera at the wrong angle, and transitions. These should become `unknown`, not confident guesses.
- For the final test, hold out **one person entirely**. Never let adjacent windows from the same clip appear in both training and test data. With only four people this is a small proof of concept, so report counts and limits.

## Evidence judges can inspect

| Evidence | Show |
|---|---|
| Model | Inputs, features, training method, and saved weights |
| Generalization | Confusion matrix and per-class precision/recall on the held-out person |
| Baseline | Compare with fixed-angle rules or majority class on the same test clips |
| Failure handling | Live `unknown` when a joint leaves frame; no cue fired |
| Ablation | Run the same test without temporal movement features to show what they add |
| Latency | Measure camera-to-label delay on the actual demo laptop |

Do not report training accuracy as proof of generalization. Do not claim model accuracy until the held-out test has actually run.

## Demo script, 3 minutes

1. **0:00–0:25** — Problem: desk and gym tools often turn movement into generic reminders. This app responds to movement it sees.
2. **0:25–1:20** — Live webcam: seated → standing → one squat. Point to visible landmarks, state probability, and rep event.
3. **1:20–1:50** — Show a cue and its evidence: time/angle trend and a dismiss/correct control.
4. **1:50–2:15** — Step partly out of frame. Show `unknown` and no invented judgment.
5. **2:15–2:45** — Show held-out confusion matrix, baseline comparison, and one failure case.
6. **2:45–3:00** — Close: "Sense → understand → act" using the real camera; explain local processing and limits.

## Priority order

1. Make the live camera and pose landmarks work end to end.
2. Capture and label a small real dataset.
3. Train one model; evaluate on a held-out person.
4. Integrate the model into the PWA and show confidence/unknown.
5. Add the ablation and evidence panel.
6. Add diet, motivation, or sponsor APIs only after the above is reliable.

## References

- MediaPipe Pose Landmarker: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
- Grouped cross-validation rationale: https://scikit-learn.org/stable/modules/cross_validation.html
- Radial Atoms brief: https://docs.google.com/document/d/17GPaAlux3Zzja3y9LbfBpgyoZwT5m7Ao-hIHvsAmvtw/edit
- UB Hacking judging criteria and submission: https://ubhacking2026.devpost.com/
