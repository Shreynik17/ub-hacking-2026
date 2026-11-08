import { SquatCoach } from './gym/coach.mjs';

const $ = id => document.getElementById(id);
const canvas = $('pose-canvas');
const ctx = canvas.getContext('2d');
const stage = $('stage');
const video = $('camera');
const dialog = $('detail-dialog');
const squatCoach = new SquatCoach();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  mode: 'desk', source: 'demo', running: false, elapsed: 0,
  breakActive: false, breakSeconds: 0, breakDone: false,
  setActive: false, reps: 0, cue: null, external: null,
  cameraStream: null, cameraPaused: false, landmarks: null,
  cameraError: null, cueDismissed: false, lastAnnouncedCue: '', lastAnnouncedAt: 0,
};

function clock(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function setText(id, value) {
  const element = $(id);
  if (element.textContent === value) return;
  element.textContent = value;
  if (!reducedMotion.matches && ['activity-title', 'cue-title'].includes(id)) {
    element.animate?.([
      { opacity: .35, transform: 'translateY(9px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }
}

function stopCamera() {
  state.cameraStream?.getTracks().forEach(track => track.stop());
  state.cameraStream = null;
  video.srcObject = null;
  stage.classList.remove('has-camera');
}

function resetSession() {
  state.running = false;
  state.elapsed = 0;
  state.breakActive = false;
  state.breakSeconds = 0;
  state.breakDone = false;
  state.setActive = false;
  state.reps = 0;
  state.cue = null;
  state.external = null;
  state.landmarks = null;
  state.cameraError = null;
  state.cueDismissed = false;
  squatCoach.reset();
}

function selectMode(mode) {
  if (!['desk', 'gym'].includes(mode)) return;
  state.mode = mode;
  resetSession();
  document.querySelectorAll('.mode-button').forEach(button => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  render();
}

function selectDemo() {
  stopCamera();
  state.source = 'demo';
  state.cameraPaused = false;
  resetSession();
  render();
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    state.cameraError = 'This browser does not offer camera access here. Try the interactive demo.';
    render();
    return;
  }
  try {
    stopCamera();
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    resetSession();
    state.source = 'camera';
    state.cameraStream = stream;
    state.cameraPaused = false;
    video.srcObject = stream;
    stage.classList.add('has-camera');
    await video.play();
    render();
  } catch (error) {
    state.cameraError = error?.name === 'NotAllowedError'
      ? 'Camera access was not granted. You can still explore the interactive demo.'
      : 'The camera could not start. Check that it is connected and available.';
    render();
  }
}

function pauseCamera() {
  stopCamera();
  state.cameraPaused = true;
  state.external = null;
  state.landmarks = null;
  render();
}

function primaryAction() {
  state.cueDismissed = false;
  if (state.source === 'camera') {
    if (state.cameraPaused || !state.cameraStream) { startCamera(); return; }
    window.dispatchEvent(new CustomEvent('movement-action', { detail: { mode: state.mode, action: 'primary' } }));
    state.cue = 'Action sent to the movement model.';
    render();
    return;
  }
  if (!state.running) {
    state.running = true;
    state.elapsed = 0;
    state.cue = null;
  } else if (state.mode === 'desk' && !state.breakActive && !state.breakDone) {
    state.breakActive = true;
    state.breakSeconds = 0;
    state.cue = null;
  } else if (state.mode === 'desk' && state.breakActive) {
    state.breakActive = false;
    state.breakDone = true;
  } else if (state.mode === 'gym' && !state.setActive) {
    state.setActive = true;
    state.reps = 0;
    state.cue = null;
  } else {
    resetSession();
  }
  render();
}

function demoCopy() {
  if (state.mode === 'desk') {
    if (!state.running) return {
      title: 'Ready to begin.', description: 'Explore a desk session from stillness to a movement break.',
      cueTitle: 'Start where you are.', cue: 'See how a gentle, explainable cue appears during a work session.',
      action: 'Start desk demo', evidence: 'This is an interactive sample. No camera observations are being made.',
    };
    if (state.breakDone) return {
      title: 'You made a move.', description: 'The sample break is complete. A live model would verify movement from camera landmarks.',
      cueTitle: 'A small reset counts.', cue: 'A short movement break can be a useful change in a long desk session.',
      action: 'Restart demo', evidence: 'This completion was simulated for the product preview. It is not a measured result.',
    };
    if (state.breakActive) return {
      title: 'Time to reset.', description: `Sample movement break · ${Math.max(0, 5 - state.breakSeconds)} seconds remaining`,
      cueTitle: 'Move at your own pace.', cue: 'Stand, stretch, or walk a little. This sample will finish after five seconds.',
      action: 'Finish early', evidence: 'The countdown is part of the interactive demo. Live completion requires pose-model input.',
    };
    if (state.elapsed >= 5) return {
      title: 'Seated & focused.', description: 'The sample session has reached a natural pause point.',
      cueTitle: 'A moment to move?', cue: 'You have been still in this sample. Would a short movement break feel good?',
      action: 'Take a break', evidence: `The sample timer reached ${clock(state.elapsed)}. No camera analysis is being claimed.`,
    };
    return {
      title: 'Seated & focused.', description: 'A sample work session is unfolding.',
      cueTitle: 'Settle in.', cue: 'The experience waits for a meaningful moment instead of interrupting every few seconds.',
      action: 'Take a break', evidence: `The sample session has run for ${clock(state.elapsed)}. The state is simulated.`,
    };
  }
  if (!state.running) return {
    title: 'Find your rhythm.', description: 'A focused squat session with one cue at a time.',
    cueTitle: 'Before the first rep.', cue: 'Stand side-on with hip, knee, and ankle in frame. Choose a comfortable stance.',
    action: 'Start gym demo', evidence: 'This is an interactive sample. The squat coach can also accept real 33-point pose landmarks.',
  };
  if (!state.setActive) return {
    title: 'Squat session.', description: 'The sample is ready for a three-rep set.',
    cueTitle: 'The set is yours.', cue: 'Watch the motion trace respond through the set.',
    action: 'Start 3-rep set', evidence: 'The set in this preview is simulated. The live rep counter uses visible hip, knee, and ankle landmarks.',
  };
  if (state.reps >= 3) return {
    title: 'Set complete.', description: 'Three sample reps. One measured idea: focus on controlled movement.',
    cueTitle: 'Keep the good rhythm.', cue: 'You completed the sample set. The live coach can show a cue tied to descent time.',
    action: 'Restart demo', evidence: 'These three reps are simulated. Real rep events are counted only from pose landmark input.',
  };
  return {
    title: 'In your set.', description: `Sample rep ${Math.min(3, state.reps + 1)} of 3 is in motion.`,
    cueTitle: state.reps >= 2 ? 'Control the descent.' : 'Find a steady pace.',
    cue: state.reps >= 2 ? 'The sample shows how a cue can respond to tempo after a rep.' : 'One complete down-and-up movement becomes one rep.',
    action: 'Finish set', evidence: 'The rep count shown here comes from the sample animation. Real counts require the camera pose model.',
  };
}

function render() {
  const isDemo = state.source === 'demo';
  const isGym = state.mode === 'gym';
  stage.dataset.mode = state.mode;
  document.querySelector('.mode-switch').dataset.mode = state.mode;
  document.querySelectorAll('.source-button').forEach(button => {
    const active = button.id === (isDemo ? 'demo-button' : 'camera-button');
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  setText('panel-kicker', isGym ? 'GYM / 02' : 'DESK / 01');
  setText('stage-target', isGym ? 'OWN YOUR RHYTHM' : 'MOVE WITH INTENTION');
  setText('stage-time', clock(state.elapsed));
  setText('metric-label', isGym ? 'REPS IN SET' : 'SESSION TIME');
  setText('metric-value', isGym ? String(isDemo ? state.reps : (state.external?.reps ?? 0)).padStart(2, '0') : clock(state.elapsed));
  $('pause-button').disabled = isDemo || !state.cameraStream;
  setText('pause-button', state.cameraPaused ? 'Camera paused' : 'Pause camera');
  if (isDemo) {
    const copy = demoCopy();
    setText('session-state', state.running ? '●  DEMO IN MOTION' : '●  DEMO READY');
    setText('stage-source', 'INTERACTIVE DEMO');
    setText('stage-caption-text', 'A simulated movement scene');
    setText('tracking-label', 'SIMULATED');
    setText('activity-title', copy.title);
    setText('activity-description', copy.description);
    setText('metric-tracking', 'Demo');
    setText('cue-title', copy.cueTitle);
    setText('cue-description', copy.cue);
    $('primary-action').innerHTML = `${copy.action} <span aria-hidden="true">↗</span>`;
    setText('session-footnote', 'Demo movement is simulated.');
  } else {
    const obs = state.external;
    setText('session-state', state.cameraPaused ? '●  CAMERA PAUSED' : obs ? '●  MODEL CONNECTED' : '●  CAMERA ON');
    setText('stage-source', state.cameraPaused ? 'CAMERA PAUSED' : obs ? 'CAMERA / MODEL' : 'CAMERA PREVIEW');
    setText('stage-caption-text', state.cameraPaused ? 'Camera is off' : obs ? 'Pose model observations active' : 'Camera preview · model awaiting connection');
    setText('tracking-label', obs ? (obs.status === 'reposition' ? 'REPOSITION' : 'OBSERVING') : 'PREVIEW ONLY');
    setText('activity-title', obs?.activity || (state.cameraPaused ? 'Camera paused.' : 'Camera preview.'));
    setText('activity-description', obs?.description || (state.cameraPaused ? 'Your camera is off. Resume when ready.' : 'The preview is live. Activity detection will appear when the pose model is connected.'));
    setText('metric-tracking', obs?.confidence != null ? `${Math.round(obs.confidence * 100)}%` : 'Waiting');
    setText('cue-title', obs?.cue ? 'A moment for you.' : 'You are in control.');
    setText('cue-description', obs?.cue || state.cameraError || (state.cameraPaused ? 'Resume the camera to continue.' : 'No movement judgment is made from the preview alone.'));
    $('primary-action').innerHTML = `${state.cameraPaused ? 'Resume camera' : 'Acknowledge'} <span aria-hidden="true">↗</span>`;
    setText('session-footnote', obs ? 'Camera observation from connected model.' : 'Preview only · no movement model connected.');
  }
  if (state.cameraError && isDemo) {
    setText('cue-title', 'Camera unavailable.');
    setText('cue-description', state.cameraError);
  }
  if (state.cueDismissed) {
    setText('cue-title', 'Cue dismissed.');
    setText('cue-description', 'You can continue the session at your own pace.');
  }
  const liveCue = $('cue-title').textContent;
  const now = performance.now();
  if (liveCue !== state.lastAnnouncedCue && now - state.lastAnnouncedAt > 5000) {
    $('announcer').textContent = liveCue;
    state.lastAnnouncedCue = liveCue;
    state.lastAnnouncedAt = now;
  }
}

function openDetail(kind) {
  const isDemo = state.source === 'demo';
  const copy = demoCopy();
  const evidence = isDemo ? copy.evidence : (state.external?.evidence || 'The live camera preview is visible, but a movement model has not supplied evidence yet.');
  setText('dialog-kicker', kind === 'feedback' ? '[ CORRECT THE MOMENT ]' : '[ THE REASON ]');
  setText('dialog-title', kind === 'feedback' ? 'Your view matters.' : 'Why this cue?');
  setText('dialog-description', kind === 'feedback'
    ? 'A model can be wrong. For this prototype, you can dismiss the cue. A future version can learn from your correction without saving the video.'
    : 'A useful cue should always have an understandable reason. Here is what this moment is based on.');
  setText('dialog-evidence', evidence);
  dialog.querySelector('.dialog-done').textContent = kind === 'feedback' ? 'Dismiss cue ↗' : 'Got it ↗';
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function tick() {
  if (state.source !== 'demo' || !state.running) return;
  state.elapsed += 1;
  if (state.mode === 'desk' && state.elapsed === 5) state.cueDismissed = false;
  if (state.mode === 'desk' && state.breakActive) {
    state.breakSeconds += 1;
    if (state.breakSeconds >= 5) { state.breakActive = false; state.breakDone = true; }
  }
  if (state.mode === 'gym' && state.setActive && state.reps < 3 && state.elapsed % 3 === 0) {
    state.reps += 1;
    state.cueDismissed = false;
  }
  render();
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawFigure(points, w, h, alpha, width) {
  const limbs = [[0,1],[1,2],[2,3],[3,4],[1,5],[5,6],[6,7],[1,8],[1,11],[8,9],[9,10],[11,12],[12,13],[8,11]];
  const map = p => [p[0] * w, p[1] * h];
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#e0d6a5';
  ctx.fillStyle = '#e0d6a5';
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = '#e0d6a5';
  ctx.shadowBlur = alpha > .5 ? 5 : 0;
  for (const [a,b] of limbs) {
    if (!points[a] || !points[b]) continue;
    ctx.beginPath(); ctx.moveTo(...map(points[a])); ctx.lineTo(...map(points[b])); ctx.stroke();
  }
  points.forEach((p,i) => {
    if (!p) return;
    const [x,y] = map(p);
    ctx.beginPath(); ctx.arc(x,y,i===0?13:4.5,0,Math.PI*2);
    if (i===0) ctx.stroke(); else ctx.fill();
  });
  ctx.restore();
}

function demoPoints(t) {
  const sway = reducedMotion.matches ? 0 : Math.sin(t * .75) * .008;
  if (state.mode === 'desk') {
    const rise = state.breakActive || state.breakDone ? .13 : 0;
    return [[.5,.25-rise],[.5,.35-rise],[.45,.38-rise],[.39,.48-rise],[.43,.57-rise],[.55,.38-rise],[.62,.48-rise],[.66,.57-rise],[.47,.56-rise],[.6,.63-rise],[.6,.82-rise],[.54,.56-rise],[.71,.63-rise],[.71,.82-rise]].map(([x,y]) => [x+sway,y]);
  }
  const active = state.setActive && state.reps < 3;
  const depth = active && !reducedMotion.matches ? Math.pow(Math.sin(t * 2.4),2) * .18 : .03;
  return [[.5,.19+depth*.35],[.5,.31+depth*.5],[.45,.34+depth*.5],[.39,.45+depth*.5],[.42,.53+depth*.5],[.55,.34+depth*.5],[.61,.45+depth*.5],[.58,.53+depth*.5],[.45,.52+depth],[.39,.68+depth*.3],[.38,.86],[.55,.52+depth],[.61,.68+depth*.3],[.62,.86]];
}

function drawFrame(now) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) { requestAnimationFrame(drawFrame); return; }
  ctx.clearRect(0,0,w,h);
  const t = reducedMotion.matches ? 0 : now / 1000;
  if (state.source === 'demo') {
    const pts = demoPoints(t);
    drawFigure(pts.map(([x,y]) => [x-.025,y]),w,h,.09,2);
    drawFigure(pts.map(([x,y]) => [x+.023,y]),w,h,.14,2);
    drawFigure(pts,w,h,.91,2.1);
  } else if (state.landmarks?.length) {
    const p = state.landmarks;
    const neck = p[11] && p[12] ? { x: (p[11].x + p[12].x) / 2, y: (p[11].y + p[12].y) / 2, visibility: Math.min(p[11].visibility ?? 1, p[12].visibility ?? 1) } : null;
    const ids = [0,null,11,13,15,12,14,16,23,25,27,24,26,28];
    const pts = ids.map(i => {
      const point = i == null ? neck : p[i];
      return point && (point.visibility ?? 1) >= .55 ? [1-point.x,point.y] : null;
    });
    drawFigure(pts,w,h,.83,2.1);
  }
  requestAnimationFrame(drawFrame);
}

document.querySelectorAll('.mode-button').forEach(button => button.addEventListener('click', () => selectMode(button.dataset.mode)));
$('demo-button').addEventListener('click', selectDemo);
$('camera-button').addEventListener('click', startCamera);
$('pause-button').addEventListener('click', pauseCamera);
$('primary-action').addEventListener('click', primaryAction);
$('why-button').addEventListener('click', () => openDetail('why'));
$('feedback-button').addEventListener('click', () => openDetail('feedback'));
dialog.querySelector('.dialog-close').addEventListener('click', () => {
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
});
dialog.querySelector('.dialog-done').addEventListener('click', () => {
  if ($('dialog-kicker').textContent.includes('CORRECT')) {
    state.cueDismissed = true;
    if (state.source === 'camera') window.dispatchEvent(new CustomEvent('movement-correction', { detail: { mode: state.mode, observation: state.external } }));
    render();
  }
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
});
setInterval(tick, 1000);
new ResizeObserver(resizeCanvas).observe(stage);
resizeCanvas();
requestAnimationFrame(drawFrame);
render();

// Entrance and scroll motion leave content visible if scripting or observers fail.
const revealTargets = document.querySelectorAll('.intro-strip .section-marker, .intro-strip h2, .intro-foot, .method-grid article, .studio-heading > div, .studio-heading > p, .studio-shell, .studio-note, .principles-title, .principles-list article');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  revealTargets.forEach((element, index) => {
    element.dataset.reveal = '';
    if (element.matches('.method-grid article, .principles-list article')) element.style.setProperty('--reveal-delay', `${(index % 3) * 110}ms`);
  });
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -28px 0px' });
  revealTargets.forEach(element => observer.observe(element));
}

const progress = document.querySelector('.reading-progress');
let scrollQueued = false;
function updateScrollProgress() {
  scrollQueued = false;
  const available = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${available > 0 ? Math.min(1, scrollY / available) : 0})`;
}
addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateScrollProgress);
}, { passive: true });
addEventListener('resize', updateScrollProgress);
updateScrollProgress();

if (!reducedMotion.matches && matchMedia('(pointer: fine)').matches) {
  const hero = document.querySelector('.hero');
  const art = document.querySelector('.hero-art');
  hero.addEventListener('pointermove', event => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    art.style.setProperty('--parallax-x', `${(x * 18).toFixed(1)}px`);
    art.style.setProperty('--parallax-y', `${(y * 12).toFixed(1)}px`);
  });
  hero.addEventListener('pointerleave', () => {
    art.style.setProperty('--parallax-x', '0px');
    art.style.setProperty('--parallax-y', '0px');
  });
}

// Integration point for Mudit's live pose/activity model. The camera preview
// alone never produces a claim. Set observations only from actual inference.
window.motionUI = {
  setObservation(observation) {
    if (state.source !== 'camera' || !state.cameraStream) return;
    if (observation?.cue !== state.external?.cue) state.cueDismissed = false;
    state.external = observation;
    render();
  },
  updatePose(landmarks, timestampMs = performance.now(), options = {}) {
    if (state.source !== 'camera' || !state.cameraStream) return null;
    state.landmarks = landmarks;
    if (state.mode !== 'gym') return null;
    const result = squatCoach.update(landmarks, timestampMs, options);
    if (result.cue && result.cue !== state.external?.cue) state.cueDismissed = false;
    state.external = {
      activity: result.status === 'reposition' ? 'Need a clearer view.' : 'Squatting.',
      description: result.status === 'reposition' ? 'Keep one leg visible from hip to ankle.' : `Phase: ${result.phase.replace('-', ' ')}`,
      confidence: result.confidence,
      status: result.status,
      reps: result.reps,
      cue: result.cue,
      evidence: result.event ? `Rep ${result.event.number} · descent ${Math.round(result.event.descentMs / 100) / 10}s` : `Observed knee angle: ${result.kneeAngle ?? 'unavailable'}°`,
    };
    render();
    return result;
  },
};

if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
