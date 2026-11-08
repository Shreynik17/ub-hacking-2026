# Best UI/UX direction — Motion Mirror

## Product idea

**Motion Mirror** turns camera movement into one calm, useful next step. The live view is the product: the user can see what the model sees, understand why a cue appeared, and correct it. The interface never grades a person as having “bad posture.”

Signature interaction: a thin **motion halo** surrounds the live silhouette. It traces a squat rep or a movement break as progress, while the activity label and cue remain readable text. The halo is decoration and reinforcement; color or animation never carries essential information alone. A subtle orbit motif can nod to the hackathon's theme without turning a wellness tool into a space dashboard.

## First-click-to-last-click flow

| Moment | Screen | Primary action | Required state |
|---|---|---|---|
| 1. Welcome | “Move with a little more awareness.” Two examples: desk and workout. | `Start camera check` | `Try sample demo` available |
| 2. Permission | Camera preview plus “Live analysis; no video saved by this prototype.” | `Allow camera` | Clear denied/retry path |
| 3. Framing | Silhouette guide; explain which joints need to be visible. | `I'm in frame` | Low visibility keeps cue as “Move back” |
| 4. Live | Large camera, skeleton/halo, activity word, one cue. | `Take a break` or `Start squats` | `Pause camera` always visible |
| 5. Evidence | “Why this cue?” shows observed movement or elapsed time. | `Got it` / `Not quite` | Low confidence says `Unsure` |
| 6. Completion | Small acknowledgment and one next action. | `Finish session` | No confetti that blocks controls |
| 7. Summary | Short timeline of detected activity and user actions. | `Start again` | Clearly separate measured from estimated |

## The two demo paths

**Desk, 40 seconds:** Welcome → permission → framing → sitting detected → gentle break suggestion → user accepts → standing detected → summary.

**Gym, 40 seconds:** Choose squat → framing → two reps with large count and phase halo → one descent-time cue → tap “Why?” → correction or finish.

Make both paths accessible from the home screen. No account, long onboarding, diet questionnaire, or notification request before first value.

## Screen hierarchy

### Live camera

1. **Top:** `LIVE • Camera on` and `Pause camera`.
2. **Center:** camera with a light, high-contrast skeleton overlay; avoid covering the face or joints with cards.
3. **Below video:** large activity label (`Sitting`, `Standing`, `Squatting`, `Unsure`) plus confidence language (`Tracking clearly`, `Need a clearer view`).
4. **Bottom:** one action card: observation, specific suggestion, primary action, `Why?`, and `Dismiss`.
5. **Gym variation:** large rep count, phase, and the latest movement-specific cue. Keep fact cards outside the active rep area.

### Tone and microcopy

| Situation | Copy |
|---|---|
| Camera prompt | “Your camera helps us follow movement. Start when you're ready.” |
| Good framing | “We can see your shoulders, hips, knees, and ankles.” |
| Low confidence | “We lost sight of your leg. Move back a little to continue.” |
| Desk cue | “You've been still for a while. Want a short movement break?” |
| Fast squat descent | “That descent was quick. Try a slower, controlled one next rep.” |
| Correction | “Thanks. We'll count that as a correction for this session.” |
| End | “You moved. That's the win.” |

## Visual system

- **Mood:** warm, energetic, non-clinical. Dark ink background (`#111827`), off-white text (`#F9FAFB`), mint action (`#8FE3C8`), amber attention (`#F6C56F`). Verify final color pairs in the built UI.
- **Type:** one clear display face for headlines and a highly readable UI face for controls; minimum 16px body copy on mobile.
- **Shape:** rounded cards and a continuous halo line; avoid tiny chart labels or stacked gauges.
- **Motion:** halo responds to actual movement, with a reduced-motion mode that shows static progress and text.
- **Feedback:** use text plus shape/icon changes, never color alone. Avoid red “failure” states for movement.
- **Touch:** large primary buttons and a fixed `Pause camera` control reachable with one hand.

## Trust and accessibility

- Ask for camera access only when the user chooses to start. Show whether the camera is on, paused, or unavailable.
- Provide a sample demo when permission is denied or camera hardware is unavailable. Clearly label it simulated.
- Every live status has visible text; screen-reader status updates should be rate-limited so each video frame is not announced.
- Keyboard users can start, pause, inspect a cue, dismiss it, and finish. Focus remains visible.
- Meet WCAG 2.2 AA contrast targets for text and controls; test the actual palette rather than assuming it passes.
- Honor reduced-motion preference and avoid automatic sound. Keep voice optional.
- Avoid diagnosis, injury-prevention, body-shaming, and “perfect posture” claims.

## One-hour user test

Ask five people who have not seen the screens to do three tasks without instructions: start the camera, explain why a cue appeared, and stop the camera. Record where they hesitate, which words they misunderstand, and whether they can recover from a denied camera permission. Fix the top three failures before adding decorative polish.

Judge-facing proof: show a 20-second before/after of one issue found in testing, plus the finished flow on both phone and laptop. This demonstrates thoughtful design rather than only visual styling.

## Implementation contract

The UI accepts `{ activity, confidence, cue, evidence, status }` from the movement model. The gym coach additionally returns `{ reps, phase, event, kneeAngle }`. Do not let the UI infer certainty from the visual overlay alone; display the model's status and evidence.

## References

- UB Hacking Best UI/UX description: https://ubhacking.cse.buffalo.edu/
- WCAG 2.2 quick reference: https://www.w3.org/WAI/WCAG22/quickref/
- Status messages: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
