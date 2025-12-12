const CONFIG = {
  NODE_COUNT: 12, NODE_RADIUS: 12, ORBIT_SPEED: 0.0006,
  PATTERNS: {
    flora:    { color:'#FF6BCB', sound:392, name:'Dieta Consciente' },
    agua:     { color:'#2F9BFF', sound:523, name:'Agua Responsable' },
    tierra:   { color:'#8AFF80', sound:659, name:'Tierra Regenerativa' },
    transporte:{ color:'#FFAA33', sound:440, name:'Movilidad Sostenible' },
    reciclar: { color:'#9D6BFF', sound:587, name:'Reciclaje Consciente' },
    energia:  { color:'#FFFF80', sound:349, name:'Energía Limpia' }
  },
  CENTER_AWAKEN_THRESHOLD: 12
};

const STATE = {
  nodes: [], connections: [], totalConnections:0,
  isDrawing:false, startNode:null, currentMouse:null, activeMenu:false,
  audioCtx:null, masterGain:null, padNode:null
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha:true });
const habitMenu = document.getElementById('habitMenu');
const countDisplay = document.getElementById('count');

function init(){ resizeCanvas(); createNodes(); setupAudio(); setupListeners(); animate(); createFogLayer(); }
function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }
function createNodes(){
  STATE.nodes = [];
  const cx = canvas.width/2, cy = canvas.height/2;
  const radius = Math.min(cx,cy) * 0.62;
  for(let i=0;i<CONFIG.NODE_COUNT;i++){
    const angle = (i/CONFIG.NODE_COUNT)*Math.PI*2;
    STATE.nodes.push({
      id:i, baseAngle: angle, orbitRadius: radius,
      x: cx + Math.cos(angle)*radius, y: cy + Math.sin(angle)*radius,
      pulse:0, glow: Math.random()*0.25+0.75, wobble: Math.random()*0.6-0.3
    });
  }
}

function setupAudio(){
  try{
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    STATE.audioCtx = new AudioContext();
    STATE.masterGain = STATE.audioCtx.createGain();
    STATE.masterGain.gain.value = 0.7;
    STATE.masterGain.connect(STATE.audioCtx.destination);
  }catch(e){ console.warn('Audio no disponible', e); }
}

function playTone(freq, duration=0.7, type='sine', volume=0.06){
  if(!STATE.audioCtx) return;
  const o = STATE.audioCtx.createOscillator();
  const g = STATE.audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = volume;
  o.connect(g); g.connect(STATE.masterGain);
  g.gain.setValueAtTime(volume, STATE.audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, STATE.audioCtx.currentTime + duration);
  o.start(); o.stop(STATE.audioCtx.currentTime + duration + 0.02);
}

function setupListeners(){
  window.addEventListener('resize', ()=>{ resizeCanvas(); createNodes(); });
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart,{passive:false});
  canvas.addEventListener('touchmove', onTouchMove,{passive:false});
  canvas.addEventListener('touchend', onTouchEnd,{passive:false});
  document.addEventListener('click', (e)=>{ if(STATE.activeMenu && !habitMenu.contains(e.target)) closeMenu(); });
  ['pointerdown','touchstart','mousedown'].forEach(ev=>{
    document.addEventListener(ev, ()=>{ if(STATE.audioCtx && STATE.audioCtx.state === 'suspended') STATE.audioCtx.resume(); }, {passive:true});
  });
}

function getCanvasPos(clientX, clientY){
  const r = canvas.getBoundingClientRect();
  return { x: clientX - r.left, y: clientY - r.top };
}

function onMouseDown(e){ startConnection(getCanvasPos(e.clientX, e.clientY)); }
function onTouchStart(e){ if(e.touches.length===1){ e.preventDefault(); const t=e.touches[0]; startConnection(getCanvasPos(t.clientX,t.clientY)); } }
function startConnection(pos){
  if(STATE.activeMenu) return;
  for(const node of STATE.nodes){
    const d = Math.hypot(pos.x-node.x, pos.y-node.y);
    if(d < CONFIG.NODE_RADIUS*2.5){ STATE.isDrawing=true; STATE.startNode=node; STATE.currentMouse=pos; node.pulse=0.9; break; }
  }
}
function onMouseMove(e){ STATE.currentMouse = getCanvasPos(e.clientX, e.clientY); }
function onTouchMove(e){ if(e.touches.length===1 && STATE.isDrawing){ e.preventDefault(); const t=e.touches[0]; STATE.currentMouse = getCanvasPos(t.clientX, t.clientY); } }
function onMouseUp(e){ if(!STATE.isDrawing||!STATE.startNode) return; finishConnection(getCanvasPos(e.clientX,e.clientY)); }
function onTouchEnd(e){ if(STATE.isDrawing && STATE.startNode){ e.preventDefault(); finishConnection(STATE.currentMouse || {x:0,y:0}); } }

function finishConnection(endPos){
  let target=null;
  for(const node of STATE.nodes){
    if(node===STATE.startNode) continue;
    const d = Math.hypot(endPos.x-node.x, endPos.y-node.y);
    if(d < CONFIG.NODE_RADIUS*2.5){ target=node; break; }
  }
  if(target){
    const exists = STATE.connections.some(c => (c.from===STATE.startNode && c.to===target) || (c.from===target && c.to===STATE.startNode));
    if(!exists) showHabitMenu(STATE.startNode, target);
  }
  STATE.isDrawing=false; STATE.startNode=null;
}

function showHabitMenu(nodeA,nodeB){
  STATE.activeMenu = true;
  const midX = (nodeA.x+nodeB.x)/2, midY=(nodeA.y+nodeB.y)/2;
  habitMenu.style.left = Math.max(8, midX-110)+'px';
  habitMenu.style.top  = Math.max(8, midY-110)+'px';
  habitMenu.classList.add('show');
  habitMenu.innerHTML = '';
  const habits = [
    {emoji:'🍃',pattern:'flora'}, {emoji:'💧',pattern:'agua'}, {emoji:'🌱',pattern:'tierra'},
    {emoji:'🚲',pattern:'transporte'}, {emoji:'♻️',pattern:'reciclar'}, {emoji:'💡',pattern:'energia'}
  ];
  habits.forEach((h,i)=>{
    const angle = (i/habits.length)*Math.PI*2;
    const btn = document.createElement('div');
    btn.className = 'habit-btn';
    btn.textContent = h.emoji;
    btn.style.left = (110 + Math.cos(angle)*75 - 28) + 'px';
    btn.style.top  = (110 + Math.sin(angle)*75 - 28) + 'px';
    btn.style.borderColor = CONFIG.PATTERNS[h.pattern].color;
    btn.style.color = CONFIG.PATTERNS[h.pattern].color;
    btn.onclick = ()=>{ createConnection(nodeA,nodeB,h.pattern); closeMenu(); };
    habitMenu.appendChild(btn);
  });
}

function closeMenu(){ habitMenu.classList.remove('show'); STATE.activeMenu=false; }

function createConnection(nodeA,nodeB,pattern){
  STATE.connections.push({ from: nodeA, to: nodeB, pattern, age:0, thickness:3 + Math.random()*2, resonate:1 });
  STATE.totalConnections++;
  countDisplay.textContent = STATE.totalConnections;
  playTone(CONFIG.PATTERNS[pattern].sound, 0.9, 'sine', 0.08);
  if(STATE.totalConnections >= CONFIG.CENTER_AWAKEN_THRESHOLD) awakenCenter();
}

let centerAwakened = false;
function awakenCenter(){
  if(centerAwakened) return; centerAwakened = true;
  if(STATE.audioCtx) playTone(220,1.8,'sine',0.12);
}

function createFogLayer(){ const fog = document.createElement('div'); fog.id='fog'; document.body.appendChild(fog); }

function animate(now=0){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // BG
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,'rgba(5,6,26,0.6)'); g.addColorStop(1,'rgba(2,4,10,0.95)');
  ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width,canvas.height);
  
  // Connections
  for(const conn of STATE.connections){
    ctx.beginPath(); ctx.moveTo(conn.from.x, conn.from.y); ctx.lineTo(conn.to.x, conn.to.y);
    ctx.strokeStyle = CONFIG.PATTERNS[conn.pattern].color;
    ctx.lineWidth = Math.max(1.2, conn.thickness);
    ctx.globalAlpha = 0.6; ctx.stroke();
  }
  
  // Nodes
  for(const node of STATE.nodes){
    node.baseAngle += CONFIG.ORBIT_SPEED;
    const cx = canvas.width/2, cy = canvas.height/2;
    node.x = cx + Math.cos(node.baseAngle)*node.orbitRadius;
    node.y = cy + Math.sin(node.baseAngle)*node.orbitRadius;
    ctx.beginPath(); ctx.arc(node.x,node.y,CONFIG.NODE_RADIUS,0,Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.shadowBlur=15; ctx.shadowColor='#2F9BFF'; ctx.fill();
  }
  
  // Drawing line
  if(STATE.isDrawing && STATE.startNode && STATE.currentMouse){
    ctx.beginPath(); ctx.moveTo(STATE.startNode.x, STATE.startNode.y);
    ctx.lineTo(STATE.currentMouse.x, STATE.currentMouse.y);
    ctx.setLineDash([6,6]); ctx.strokeStyle='#fff'; ctx.stroke(); ctx.setLineDash([]);
  }
  
  requestAnimationFrame(animate);
}

window.addEventListener('load', init);
