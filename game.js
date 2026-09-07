(() => {
'use strict';
const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay'), bubble = document.getElementById('bubble');
const cols = 30, rows = 20, colors = ['#b8aad6', '#9dc7b3', '#e3c087'];
let snake, rivals, berries, dir, score, caught, state = 'ready', last = 0, particles = [], bubbleTimer, best = 0, sound = false, audio;
try { best = Number(localStorage.getItem('petal-best')) || 0; } catch (_) {}
document.getElementById('best').textContent = best;
const STEP = 1000 / 120, SPEED = 6.5, TURN_SPEED = 4.5, SPACING = .78;
let accumulator = 0, angle = 0, targetAngle = 0, pointerTarget = null;
const heldKeys = new Set();
const wrap = (value, size) => ((value % size) + size) % size;
const difference = (a, b, size) => wrap(b - a + size / 2, size) - size / 2;
const distance = (a,b) => Math.hypot(difference(a.x,b.x,cols),difference(a.y,b.y,rows));
function rotateToward(current, target, limit) {
  const delta = Math.atan2(Math.sin(target-current), Math.cos(target-current));
  return current + Math.max(-limit, Math.min(limit, delta));
}
function moveBody(body, heading, speed, dt) {
  body[0] = {x:wrap(body[0].x+Math.cos(heading)*speed*dt,cols),y:wrap(body[0].y+Math.sin(heading)*speed*dt,rows)};
  for(let i=1;i<body.length;i++) {
    const p=body[i], ahead=body[i-1];
    const dx=difference(p.x,ahead.x,cols),dy=difference(p.y,ahead.y,rows),gap=Math.hypot(dx,dy);
    if(gap>SPACING) { const amount=(gap-SPACING)/gap; p.x=wrap(p.x+dx*amount,cols);p.y=wrap(p.y+dy*amount,rows); }
  }
}
const randomCell = () => ({x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)});
const same = (a,b) => distance(a,b) < .85;
function freeCell() { for(let i=0;i<1000;i++){ const p=randomCell(); if(!snake.some(s=>same(s,p)) && !rivals.some(r=>r.body.some(s=>same(s,p))) && !berries.some(b=>same(b,p))) return p; } return null; }
function makeRival(i) {
  const length = 2 + Math.floor(Math.random() * 7);
  for (let attempt = 0; attempt < 300; attempt++) {
    const head = randomCell(), heading = Math.random()*Math.PI*2;
    const direction = {x:Math.cos(heading),y:Math.sin(heading)};
    const body = Array.from({length}, (_, j) => ({x:wrap(head.x-direction.x*j*SPACING,cols),y:wrap(head.y-direction.y*j*SPACING,rows)}));
    if (body.some(p => snake.some(s=>same(s,p)) || rivals.some(r=>r.body.some(s=>same(s,p))) || berries.some(b=>same(b,p)))) continue;
    rivals.push({body, angle:heading, target:heading, wander:0, dir:direction, color:colors[i%3]});
    return;
  }
}
function reset(){snake=[{x:12,y:10},{x:11,y:10},{x:10,y:10},{x:9,y:10},{x:8,y:10}];rivals=[];berries=[];dir={x:1,y:0};score=0;caught=0;particles=[];accumulator=0;angle=0;targetAngle=0;pointerTarget=null;heldKeys.clear();for(let i=0;i<3;i++)makeRival(i);for(let i=0;i<13;i++){const p=freeCell();if(p)berries.push(p);}updateScore();bubble.classList.remove('show');clearTimeout(bubbleTimer);}
function updateScore(){document.getElementById('score').textContent=String(score).padStart(3,'0');document.getElementById('caught').textContent=caught;if(score>best){best=score;document.getElementById('best').textContent=best;try{localStorage.setItem('petal-best',best);}catch(_){}}}
function tone(){if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();[523,659,784].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=f;g.gain.setValueAtTime(.07,audio.currentTime+i*.08);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+i*.08+.2);o.start(audio.currentTime+i*.08);o.stop(audio.currentTime+i*.08+.21);});}catch(_){}}
let cheerPosition = null;
function positionCheer() {
  if (!cheerPosition) return;
  const board = document.getElementById('playfield');
  const padding = 12, width = board.clientWidth, height = board.clientHeight;
  const x = (cheerPosition.x + .5) / cols * width;
  const y = (cheerPosition.y + .5) / rows * height;
  const left = Math.max(padding, Math.min(x - bubble.offsetWidth / 2, width - bubble.offsetWidth - padding));
  const above = y - bubble.offsetHeight - 16;
  const top = Math.max(padding, Math.min(above < padding ? y + 16 : above, height - bubble.offsetHeight - padding - 8));
  bubble.style.left = left + 'px';
  bubble.style.top = top + 'px';
}
window.addEventListener('resize', positionCheer);
function cheer(p){const words=['You grow, girl! ✨','A little snack, a big slay ♡','Look at you bloom! ✿','Main character moment ✧','Sweet catch, sunshine! ♡','You’re doing berry well! ✨'];bubble.textContent=words[Math.floor(Math.random()*words.length)];cheerPosition={...p};positionCheer();bubble.classList.add('show');clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>bubble.classList.remove('show'),2100);for(let i=0;i<22;i++)particles.push({x:p.x+.5,y:p.y+.5,vx:(Math.random()-.5)*.14,vy:(Math.random()-.7)*.14,life:1,color:['#dda3b6','#acbda0','#b9a2cf','#ebc47f'][i%4]});tone();}
function start(){reset();state='playing';overlay.hidden=true;document.getElementById('pause').innerHTML='Ⅱ <span>Pause</span>';last=performance.now();}
function showOverlay(title,description,label){overlay.innerHTML='<div class="overlay-flower">✿</div><div class="eyebrow">A LITTLE MOMENT FOR YOU</div><h2>'+title+'</h2><p>'+description+'</p><button class="primary" id="start">'+label+' <span>↗</span></button><span class="overlay-hint">Mouse or drag to steer · Arrow keys / WASD also work</span>';overlay.hidden=false;document.getElementById('start').onclick=state==='paused'?togglePause:start;}
function togglePause(){if(state==='playing'){state='paused';showOverlay('Take a little breather.','Your garden will be right here.','Keep growing');document.getElementById('pause').innerHTML='▷ <span>Resume</span>';}else if(state==='paused'){state='playing';overlay.hidden=true;last=performance.now();document.getElementById('pause').innerHTML='Ⅱ <span>Pause</span>';}}
function tick() {
  const dt=STEP/1000;
  if(pointerTarget) {
    // Aim toward the visible pointer; wrapping still happens at the edges.
    const dx=pointerTarget.x-snake[0].x,dy=pointerTarget.y-snake[0].y;
    if(Math.hypot(dx,dy)>.3) targetAngle=Math.atan2(dy,dx);
  }
  angle=rotateToward(angle,targetAngle,TURN_SPEED*dt);
  dir={x:Math.cos(angle),y:Math.sin(angle)};
  moveBody(snake,angle,SPEED,dt);
  const head=snake[0];
  if(snake.slice(4).some(p=>distance(head,p)<.55)) {
    state='over';
    showOverlay('Still a little star.','You grew to '+score+' points and caught '+caught+' little snakes.<br>There’s always room for another happy wiggle.','Play again');
    return;
  }
  rivals.forEach(r=>{
    r.wander-=dt;
    if(r.wander<=0){r.target=r.angle+(Math.random()-.5)*2.4;r.wander=.6+Math.random()*1.5;}
    r.angle=rotateToward(r.angle,r.target,2*dt);
    r.dir={x:Math.cos(r.angle),y:Math.sin(r.angle)};
    moveBody(r.body,r.angle,2.6,dt);
  });
  const berryIndex=berries.findIndex(b=>distance(head,b)<.62);
  const rivalIndex=rivals.findIndex(r=>r.body.length<snake.length && r.body.some(b=>distance(head,b)<.75));
  if(berryIndex>=0 || rivalIndex>=0) {
    snake.push({...snake[snake.length-1]});
    if(berryIndex>=0){berries.splice(berryIndex,1);score+=10;const p=freeCell();if(p)berries.push(p);}
    if(rivalIndex>=0){rivals.splice(rivalIndex,1);score+=50;caught++;cheer(head);makeRival(caught);}
    updateScore();
  }
}
function draw(delta = 0){const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);const w=rect.width,h=rect.height,cw=w/cols,ch=h/rows;ctx.clearRect(0,0,w,h);ctx.fillStyle='#dce3d1';for(let x=0;x<cols;x++)for(let y=0;y<rows;y++){ctx.beginPath();ctx.arc((x+.5)*cw,(y+.5)*ch,.8,0,Math.PI*2);ctx.fill();}
function oval(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
[[3,3],[26,16],[4,17],[25,3],[18,5]].forEach(([x,y],i)=>{for(let j=0;j<5;j++){const a=j*Math.PI*2/5;oval((x+.5)*cw+Math.cos(a)*4,(y+.5)*ch+Math.sin(a)*4,3,3,i%2?'#e0dbeb':'#eadbdd');}oval((x+.5)*cw,(y+.5)*ch,2,2,'#e4c893');});
berries.forEach(b=>{oval((b.x+.5)*cw,(b.y+.56)*ch,cw*.19,ch*.23,'#d795a3');oval((b.x+.59)*cw,(b.y+.3)*ch,cw*.13,ch*.07,'#a1b58b');oval((b.x+.45)*cw,(b.y+.48)*ch,cw*.045,ch*.05,'#fae3e8');});
function drawSnake(body,color,d){body.slice().reverse().forEach((p,i)=>{oval((p.x+.5)*cw,(p.y+.5)*ch,cw*.43,ch*.43,color);if(i<body.length-1)oval((p.x+.42)*cw,(p.y+.37)*ch,cw*.10,ch*.07,'#ffffff35');});const p=body[0],x=(p.x+.5)*cw,y=(p.y+.5)*ch;[-1,1].forEach(s=>{const ex=x+d.x*cw*.17-d.y*s*cw*.17,ey=y+d.y*ch*.17+d.x*s*ch*.17;oval(ex,ey,cw*.09,ch*.10,'#fffaf8');oval(ex+d.x,ey+d.y,cw*.042,ch*.05,'#555447');});}
// Neighboring copies let segments slide through the garden edges.
function wrappedSnake(body,color,d){for(const ox of [-cols,0,cols])for(const oy of [-rows,0,rows])drawSnake(body.map(p=>({x:p.x+ox,y:p.y+oy})),color,d);}
rivals.forEach(r=>wrappedSnake(r.body,r.color,r.dir));wrappedSnake(snake,'#dfa0b5',dir);particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life);oval(p.x*cw,p.y*ch,3,3,p.color);if(state==='playing'){p.x+=p.vx*delta/16.667;p.y+=p.vy*delta/16.667;p.life-=.018*delta/16.667;}});ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);}
function frame(now){
  const delta = Math.min(Math.max(now-last,0), 100);
  last=now;
  if(state==='playing'){
    let remaining=delta;
    while(remaining>0 && state==='playing'){
      const advance=Math.min(remaining, STEP-accumulator);
      accumulator+=advance;
      remaining-=advance;
      if(accumulator>=STEP){accumulator-=STEP;tick();}
    }
  }
  draw(state==='playing'?delta:0);
  requestAnimationFrame(frame);
}
const keyDirections={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
function turn(name) {
  const headings={up:-Math.PI/2,down:Math.PI/2,left:Math.PI,right:0};
  if(name in headings){pointerTarget=null;targetAngle=headings[name];}
}
function keyboardAim() {
  const names=new Set([...heldKeys].map(k=>keyDirections[k]));
  const x=Number(names.has('right'))-Number(names.has('left'));
  const y=Number(names.has('down'))-Number(names.has('up'));
  if(x||y){pointerTarget=null;targetAngle=Math.atan2(y,x);}
}
document.addEventListener('keydown',e=>{
  if(e.target instanceof HTMLButtonElement && (e.key===' '||e.key==='Enter'))return;
  const key=e.key.toLowerCase();
  if(keyDirections[key]){e.preventDefault();heldKeys.add(key);keyboardAim();}
  if(e.code==='Space'&&!e.repeat){e.preventDefault();if(state==='ready'||state==='over')start();else togglePause();}
});
document.addEventListener('keyup',e=>{heldKeys.delete(e.key.toLowerCase());keyboardAim();});
window.addEventListener('blur',()=>{heldKeys.clear();pointerTarget=null;if(state==='playing')togglePause();});
document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>turn(b.dataset.dir));
function aimPointer(e) {
  if(state!=='playing')return;
  const rect=canvas.getBoundingClientRect();
  pointerTarget={x:(e.clientX-rect.left)/rect.width*cols-.5,y:(e.clientY-rect.top)/rect.height*rows-.5};
}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);aimPointer(e);});
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons)aimPointer(e);});
canvas.addEventListener('pointerup',()=>{pointerTarget=null;});
canvas.addEventListener('pointercancel',()=>{pointerTarget=null;});
canvas.addEventListener('pointerleave',e=>{if(!e.buttons)pointerTarget=null;});
document.getElementById('start').onclick=start;document.getElementById('pause').onclick=togglePause;document.getElementById('sound').onclick=()=>{sound=!sound;const b=document.getElementById('sound');b.innerHTML='♫ <span>Sound '+(sound?'on':'off')+'</span>';b.setAttribute('aria-label',sound?'Disable sound':'Enable sound');b.setAttribute('aria-pressed',String(sound));if(sound)tone();};document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});reset();requestAnimationFrame(frame);
})();
