const section = document.querySelector('.blueprint-section');
const consoleElement = document.querySelector('.blueprint-console');
const stage = document.getElementById('blueprint-stage');
const canvas = document.getElementById('blueprint-canvas');
const ctx = canvas.getContext('2d');
const pauseButton = document.getElementById('blueprint-pause');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const tags = [...document.querySelectorAll('.blueprint-callout')];
const modes = {
  desk: {
    labels: ['DESK REACH', 'HEAD POSITION', 'SEATED BASE', 'SPINE LINE'],
    caption: '01 / SEATED POSTURE',
    start: {head:[528,158],neck:[507,207],shoulder:[498,231],rib:[474,291],hip:[447,369],elbow:[541,291],wrist:[597,311],knee:[541,425],ankle:[540,511],toe:[599,516]},
    end: {head:[481,149],neck:[480,204],shoulder:[479,231],rib:[466,294],hip:[447,369],elbow:[531,291],wrist:[597,311],knee:[541,425],ankle:[540,511],toe:[599,516]},
  },
  squat: {
    labels: ['ARM COUNTERBALANCE', 'HIP HINGE', 'FOOT ANCHOR', 'KNEE TRACK'],
    caption: '02 / BODYWEIGHT SQUAT',
    start: {head:[493,135],neck:[490,188],shoulder:[488,215],rib:[488,288],hip:[487,365],elbow:[543,266],wrist:[595,271],knee:[503,440],ankle:[514,519],toe:[577,524]},
    end: {head:[448,244],neck:[458,292],shoulder:[472,318],rib:[445,367],hip:[416,413],elbow:[539,334],wrist:[591,334],knee:[557,431],ankle:[516,519],toe:[577,524]},
  },
};

let mode = 'desk';
let sceneStart = 0;
let suspendedAt = 0;
let pausedAt = 0;
let paused = false;
let visible = false;
let seen = false;
let frameId = 0;
let layout = {width:0,height:0,scale:1,offsetX:0,offsetY:0,mobile:false};
let lastPhase = '';

const clamp = value => Math.min(1, Math.max(0, value));
const lerp = (a,b,t) => a + (b-a)*t;
const blendPoint = (a,b,t) => [lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
function blendPose(a,b,t) {
  return Object.fromEntries(Object.keys(a).map(key => [key,blendPoint(a[key],b[key],t)]));
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width*dpr);
  canvas.height = Math.round(rect.height*dpr);
  const mobile = rect.width < 760;
  const viewWidth = mobile ? 520 : 1000;
  const viewLeft = mobile ? 265 : 0;
  const scale = Math.min(rect.width/viewWidth,rect.height/600);
  layout = {
    width:rect.width,height:rect.height,scale,mobile,
    offsetX:(rect.width-viewWidth*scale)/2-viewLeft*scale,
    offsetY:(rect.height-600*scale)/2,
  };
  draw(performance.now(), !seen);
}

function line(a,b,opacity=1,width=1.4,progress=1,dashes=[]) {
  if (progress <= 0) return;
  ctx.beginPath();
  ctx.moveTo(a[0],a[1]);
  ctx.lineTo(lerp(a[0],b[0],progress),lerp(a[1],b[1],progress));
  ctx.strokeStyle = `rgba(231,230,220,${opacity})`;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.setLineDash(dashes);
  ctx.stroke();
  ctx.setLineDash([]);
}

function amberLine(a,b,opacity=.6,width=1) {
  ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);
  ctx.strokeStyle = `rgba(205,151,104,${opacity})`;
  ctx.lineWidth = width;ctx.stroke();
}

function ellipse(center,rx,ry,opacity=1,progress=1) {
  if (progress <= 0) return;
  ctx.beginPath();
  ctx.ellipse(center[0],center[1],rx,ry,0,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);
  ctx.strokeStyle = `rgba(231,230,220,${opacity})`;
  ctx.lineWidth = 1.4;ctx.stroke();
}

function node(point,radius=3.2,opacity=1) {
  ctx.beginPath();ctx.arc(...point,radius,0,Math.PI*2);
  ctx.fillStyle = `rgba(237,233,219,${opacity})`;ctx.fill();
  ctx.beginPath();ctx.arc(...point,radius+5,0,Math.PI*2);
  ctx.strokeStyle = `rgba(205,151,104,${opacity*.38})`;
  ctx.lineWidth = 1;ctx.stroke();
}

function tube(a,b,r1,r2,opacity,progress) {
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1;
  const nx=-dy/length,ny=dx/length;
  const leftA=[a[0]+nx*r1,a[1]+ny*r1],rightA=[a[0]-nx*r1,a[1]-ny*r1];
  const leftB=[b[0]+nx*r2,b[1]+ny*r2],rightB=[b[0]-nx*r2,b[1]-ny*r2];
  line(leftA,leftB,opacity,1.35,progress);
  line(rightA,rightB,opacity,1.35,progress);
  line(leftA,rightA,opacity*.48,1,progress);
  line(leftB,rightB,opacity*.52,1,progress);
  line(a,b,opacity*.28,.9,progress,[5,8]);
  for (const t of [.28,.55,.8]) {
    if (progress<t) continue;
    line(blendPoint(leftA,leftB,t),blendPoint(rightA,rightB,t),opacity*.36,.8);
  }
  if (progress>.9) line(blendPoint(leftA,leftB,.28),blendPoint(rightA,rightB,.55),opacity*.18,.75);
}

function drawWirePose(p,opacity,progress) {
  ctx.save();ctx.globalAlpha*=opacity;
  // A second, offset contour gives the flat pose a drawn-in-space feel.
  ctx.save();ctx.translate(-13,-7);ctx.globalAlpha*=.27;
  tube(p.shoulder,p.elbow,12,9,.8,progress);
  tube(p.hip,p.knee,22,17,.75,progress);
  tube(p.knee,p.ankle,16,11,.75,progress);
  ctx.restore();
  tube(p.neck,p.shoulder,11,15,.85,progress);
  tube([p.head[0],p.head[1]+34],p.neck,7,11,.76,progress);
  tube(p.shoulder,p.rib,30,32,.82,progress);
  tube(p.rib,p.hip,32,26,.82,progress);
  tube(p.shoulder,p.elbow,12,10,.86,progress);
  tube(p.elbow,p.wrist,10,8,.86,progress);
  tube(p.hip,p.knee,22,18,.88,progress);
  tube(p.knee,p.ankle,17,11,.88,progress);
  tube(p.ankle,p.toe,10,6,.8,progress);
  ellipse(p.head,34,41,.96,progress);
  if (progress>.55) {
    ellipse(p.head,12,41,.23,progress);
    line([p.head[0]-28,p.head[1]+6],[p.head[0]+28,p.head[1]+6],.28,1);
    line(p.neck,p.hip,.28,1,1,[4,8]);
  }
  if (progress>.72) {
    for (const key of ['neck','shoulder','rib','hip','elbow','wrist','knee','ankle']) node(p[key],3.1,.95);
  }
  ctx.restore();
}

function box(x,y,w,h,dx,dy,opacity,progress) {
  const front=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  const back=front.map(([px,py])=>[px+dx,py+dy]);
  const edges=[];
  for (let i=0;i<4;i++) edges.push([front[i],front[(i+1)%4]]);
  for (let i=0;i<4;i++) edges.push([back[i],back[(i+1)%4]]);
  for (let i=0;i<4;i++) edges.push([front[i],back[i]]);
  edges.forEach(([a,b],index)=>line(a,b,opacity*(index<4?1:.6),1.25,clamp(progress*1.65-index*.055)));
}

function ground(progress) {
  for (let i=0;i<8;i++) {
    const x=120+i*110;
    line([x,542],[500+(x-500)*.62,475],.09,1,progress);
  }
  for (const y of [490,514,542,581]) line([85,y],[915,y],y===542?.28:.08,1,progress);
  line([85,542],[915,542],.28,1.3,progress);
}

function deskGeometry(progress) {
  // Desk, monitor and chair are drawn as open architectural frames.
  box(558,310,259,20,18,-12,.48,progress);
  line([578,329],[578,518],.39,1.25,progress);
  line([802,329],[802,518],.39,1.25,progress);
  line([578,518],[802,518],.18,1,progress);
  box(677,187,102,96,10,-8,.67,progress);
  line([728,283],[728,310],.45,1.2,progress);
  line([697,310],[759,310],.36,1.1,progress);
  box(588,300,83,7,7,-5,.4,progress);
  box(372,361,174,17,15,-10,.5,progress);
  box(373,251,14,125,14,-11,.48,progress);
  line([399,378],[399,518],.33,1.1,progress);
  line([531,378],[531,518],.33,1.1,progress);
  line([382,516],[548,516],.22,1,progress);
  line([481,112],[481,405],.24,1,progress,[4,9]);
}

function squatGeometry(progress) {
  line([389,527],[618,527],.42,1.2,progress);
  line([389,537],[618,537],.16,1,progress);
  line([577,516],[577,538],.44,1.1,progress);
  line([486,91],[486,525],.17,1,progress,[4,9]);
  ctx.save();ctx.strokeStyle='rgba(225,226,211,.23)';ctx.lineWidth=1.1;ctx.setLineDash([5,9]);
  ctx.beginPath();ctx.moveTo(487,365);ctx.quadraticCurveTo(453,374,416,413);ctx.stroke();
  ctx.restore();
  for (const x of [416,486,557]) line([x,534],[x,543],.29,1,progress);
}

function angleArc(p,opacity) {
  ctx.save();ctx.globalAlpha*=opacity;
  ctx.beginPath();ctx.arc(p.knee[0],p.knee[1],47,-2.78,-1.22);
  ctx.strokeStyle='rgba(205,151,104,.85)';ctx.lineWidth=1.3;ctx.stroke();
  amberLine([p.knee[0]-53,p.knee[1]-24],[p.knee[0]-68,p.knee[1]-31],.55);
  ctx.restore();
}

function drawLeaders(p,opacity) {
  if (layout.mobile || opacity<=0) return;
  const anchorKeys = mode==='desk' ? ['wrist','head','hip','rib'] : ['wrist','hip','ankle','knee'];
  const stageRect=stage.getBoundingClientRect();
  ctx.save();ctx.globalAlpha*=opacity;
  tags.forEach((tag,index)=>{
    const rect=tag.getBoundingClientRect();
    const leftSide=rect.left+rect.width/2 < stageRect.left+stageRect.width/2;
    const px=(leftSide?rect.right:rect.left)-stageRect.left;
    const py=rect.top+rect.height/2-stageRect.top;
    const target=[(px-layout.offsetX)/layout.scale,(py-layout.offsetY)/layout.scale];
    const anchor=p[anchorKeys[index]];
    const midX=lerp(anchor[0],target[0],.58);
    amberLine(anchor,[midX,anchor[1]],.45);
    amberLine([midX,anchor[1]],[midX,target[1]],.45);
    amberLine([midX,target[1]],target,.45);
    ctx.beginPath();ctx.arc(...anchor,6,0,Math.PI*2);
    ctx.strokeStyle='rgba(205,151,104,.78)';ctx.lineWidth=1;ctx.stroke();
  });
  ctx.restore();
}

function updateReadout(amount,cycle) {
  let phase,cue;
  if (mode==='desk') {
    if (amount>.64) {phase='POSTURE / RESET';cue='The head returns closer to the shoulder line.';}
    else {phase='POSTURE / FORWARD DRIFT';cue='A small shift forward changes the line through the neck and back.';}
  } else if (amount>.88) {phase='SQUAT / LOW POSITION';cue='The feet stay planted as the hips reach the bottom of the rep.';}
  else if (cycle<.5) {phase='SQUAT / DESCENT';cue='The hip hinge and knee bend move together through the descent.';}
  else {phase='SQUAT / ASCENT';cue='The figure rises with the foot kept flat on the floor.';}
  if (phase!==lastPhase) {
    document.getElementById('blueprint-phase').textContent=phase;
    document.getElementById('blueprint-cue').textContent=cue;
    lastPhase=phase;
  }
}

function draw(now,forceStatic=false) {
  if (!layout.width || !layout.height) return;
  const dpr=Math.min(devicePixelRatio||1,2);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,layout.width,layout.height);
  ctx.setTransform(dpr*layout.scale,0,0,dpr*layout.scale,dpr*layout.offsetX,dpr*layout.offsetY);
  const staticView=forceStatic||reducedMotion.matches;
  const elapsed=staticView ? 3700 : Math.max(0,(paused?pausedAt:now)-sceneStart);
  const reveal=staticView?1:clamp((elapsed-120)/1550);
  const figureReveal=staticView?1:clamp((elapsed-390)/1450);
  const cycle=staticView ? .32 : Math.max(0,elapsed-1900)%5000/5000;
  const amount=staticView ? (mode==='desk'?.74:.67) : (elapsed<1900?0:(1-Math.cos(cycle*Math.PI*2))/2);
  const scene=modes[mode];
  const pose=blendPose(scene.start,scene.end,amount);
  ground(reveal);
  if(mode==='desk') deskGeometry(reveal);
  else squatGeometry(reveal);
  drawWirePose(scene.end,.13,figureReveal);
  drawWirePose(pose,.9,figureReveal);
  if (mode==='squat' && figureReveal>.8) angleArc(pose,clamp((figureReveal-.8)*5));
  drawLeaders(pose,clamp((figureReveal-.75)*4));
  updateReadout(amount,cycle);
  document.getElementById('blueprint-cycle-fill').style.transform=`scaleX(${staticView?1:cycle})`;
}

function stopLoop() {
  if (frameId) cancelAnimationFrame(frameId);
  frameId=0;
}
function frame(now) {
  frameId=0;
  if (!visible || paused || reducedMotion.matches || document.hidden) return;
  draw(now);
  frameId=requestAnimationFrame(frame);
}
function startLoop() {
  if (!visible || paused || reducedMotion.matches || document.hidden || frameId) return;
  if (suspendedAt) {sceneStart+=performance.now()-suspendedAt;suspendedAt=0;}
  frameId=requestAnimationFrame(frame);
}

function setMode(next) {
  if (!modes[next] || next===mode) return;
  mode=next;sceneStart=performance.now();suspendedAt=0;pausedAt=0;paused=false;lastPhase='';
  pauseButton.innerHTML='Ⅱ <span>Pause motion</span>';
  pauseButton.setAttribute('aria-pressed','false');
  pauseButton.setAttribute('aria-label','Pause motion');
  document.querySelectorAll('.blueprint-mode').forEach(button=>{
    const active=button.dataset.blueprintMode===mode;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  modes[mode].labels.forEach((label,index)=>document.getElementById(`blueprint-label-${'abcd'[index]}`).textContent=label);
  document.getElementById('blueprint-stage-caption').textContent=modes[mode].caption;
  consoleElement.classList.remove('is-animating');
  void consoleElement.offsetWidth;
  consoleElement.classList.add('is-animating');
  draw(performance.now(),reducedMotion.matches);
  startLoop();
}

document.querySelectorAll('.blueprint-mode').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.blueprintMode)));
pauseButton.addEventListener('click',()=>{
  if (reducedMotion.matches) return;
  paused=!paused;
  if (paused) {pausedAt=performance.now();stopLoop();draw(pausedAt);}
  else {sceneStart+=performance.now()-pausedAt;pausedAt=0;startLoop();}
  pauseButton.innerHTML=paused?'▶ <span>Resume motion</span>':'Ⅱ <span>Pause motion</span>';
  pauseButton.setAttribute('aria-pressed',String(paused));
  pauseButton.setAttribute('aria-label',paused?'Resume motion':'Pause motion');
});

if (reducedMotion.matches) {
  pauseButton.disabled=true;
  pauseButton.innerHTML='— <span>Motion reduced</span>';
  pauseButton.setAttribute('aria-label','Motion reduced');
}
reducedMotion.addEventListener?.('change',event=>{
  if (event.matches) {stopLoop();pauseButton.disabled=true;pauseButton.innerHTML='— <span>Motion reduced</span>';draw(performance.now(),true);}
  else {pauseButton.disabled=false;pauseButton.innerHTML='Ⅱ <span>Pause motion</span>';sceneStart=performance.now();paused=false;startLoop();}
});
new ResizeObserver(resizeCanvas).observe(stage);
resizeCanvas();
new IntersectionObserver(entries=>{
  const entry=entries[0];
  visible=entry.isIntersecting;
  if (visible) {
    if (!seen) {seen=true;sceneStart=performance.now();consoleElement.classList.add('is-animating');}
    startLoop();
  } else {
    if (frameId) suspendedAt=performance.now();
    stopLoop();
  }
},{threshold:.08}).observe(section);
document.addEventListener('visibilitychange',()=>{
  if (document.hidden) {if (frameId) suspendedAt=performance.now();stopLoop();}
  else startLoop();
});
