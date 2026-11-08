/**
 * Bodyweight squat coach for MediaPipe-style 33-point pose landmarks.
 * This is movement feedback, not a safety or injury assessment.
 */

const LEFT = { hip: 23, knee: 25, ankle: 27 };
const RIGHT = { hip: 24, knee: 26, ankle: 28 };

function angle(a, b, c, aspect) {
  const ax = (a.x - b.x) * aspect;
  const ay = a.y - b.y;
  const cx = (c.x - b.x) * aspect;
  const cy = c.y - b.y;
  const norm = Math.hypot(ax, ay) * Math.hypot(cx, cy);
  if (norm < 1e-6) return null;
  return Math.acos(Math.max(-1, Math.min(1, (ax * cx + ay * cy) / norm))) * 180 / Math.PI;
}

function legObservation(points, side, aspect) {
  const p = [points?.[side.hip], points?.[side.knee], points?.[side.ankle]];
  if (p.some(v => !v || !Number.isFinite(v.x) || !Number.isFinite(v.y))) return null;
  const confidence = Math.min(...p.map(v => v.visibility ?? v.score ?? 1));
  if (confidence < 0.65) return null;
  const kneeAngle = angle(p[0], p[1], p[2], aspect);
  return kneeAngle == null ? null : { kneeAngle, confidence };
}

export class SquatCoach {
  constructor() {
    this.reset();
  }

  reset() {
    this.reps = 0;
    this.phase = 'find-standing';
    this.side = null;
    this.filteredAngle = null;
    this.lastTime = null;
    this.descentStart = null;
    this.bottomTime = null;
    this.lastCueTime = -Infinity;
    this.lastResult = { status: 'ready', reps: 0, phase: this.phase, cue: 'Stand side-on with your full leg visible.' };
    return this.lastResult;
  }

  update(landmarks, timeMs, options = {}) {
    const aspect = options.aspectRatio ?? 1;
    if (!Array.isArray(landmarks) || !Number.isFinite(timeMs) || aspect <= 0) {
      return this.#result('unavailable', 'Pose data is unavailable.');
    }
    if (this.lastTime != null && (timeMs <= this.lastTime || timeMs - this.lastTime > 1500)) {
      this.phase = 'find-standing';
      this.filteredAngle = null;
      this.descentStart = null;
      this.bottomTime = null;
    }
    this.lastTime = timeMs;

    const legs = {
      left: legObservation(landmarks, LEFT, aspect),
      right: legObservation(landmarks, RIGHT, aspect),
    };
    const preferred = this.side && legs[this.side] ? this.side :
      (legs.left?.confidence ?? 0) >= (legs.right?.confidence ?? 0) ? 'left' : 'right';
    const observed = legs[preferred];
    if (!observed) {
      this.filteredAngle = null;
      this.phase = 'find-standing';
      return this.#result('reposition', 'Move back until one full leg is visible from hip to ankle.');
    }
    this.side = preferred;
    const a = this.filteredAngle == null ? observed.kneeAngle :
      0.55 * observed.kneeAngle + 0.45 * this.filteredAngle;
    this.filteredAngle = a;
    let cue = null;
    let event = null;

    if (this.phase === 'find-standing' && a >= 150) {
      this.phase = 'standing';
      cue = 'Ready when you are. Lower at a comfortable pace.';
    } else if (this.phase === 'standing' && a < 135) {
      this.phase = 'descending';
      this.descentStart = timeMs;
    } else if (this.phase === 'descending' && a <= 115) {
      this.phase = 'bottom';
      this.bottomTime = timeMs;
    } else if (this.phase === 'bottom' && a > 125) {
      this.phase = 'ascending';
    } else if (this.phase === 'ascending' && a >= 150) {
      this.reps += 1;
      this.phase = 'standing';
      const descentMs = this.bottomTime - this.descentStart;
      event = { type: 'rep', number: this.reps, descentMs, observedKneeAngle: Math.round(a) };
      cue = descentMs < 700
        ? 'Rep counted. Try a slower, controlled descent next time.'
        : 'Rep counted. Nice controlled movement.';
    }

    if (cue && timeMs - this.lastCueTime < 2500 && event?.type !== 'rep') cue = null;
    if (cue) this.lastCueTime = timeMs;
    return this.#result('tracking', cue, event, Math.round(a), observed.confidence);
  }

  #result(status, cue, event = null, kneeAngle = null, confidence = null) {
    this.lastResult = {
      status,
      reps: this.reps,
      phase: this.phase,
      cue,
      event,
      kneeAngle,
      confidence,
      side: this.side,
    };
    return this.lastResult;
  }
}
