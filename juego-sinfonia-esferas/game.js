// game.js - VERSIÓN FINAL: METAMORFOSIS + SECUENCIA + ESTRELLA
const CONFIG = {
  NODE_COUNT: 12, 
  NODE_RADIUS: 25,
  ORBIT_SPEED: 0.001,
  PATTERNS: {
    flora:    { color:'#FF6BCB', sound:392, name:'FLORA' },
    agua:     { color:'#2F9BFF', sound:523, name:'AGUA' },
    tierra:   { color:'#8AFF80', sound:659, name:'TIERRA' },
    transporte:{ color:'#FFAA33', sound:440, name:'MOVILIDAD' },
    reciclar: { color:'#9D6BFF', sound:587, name:'RECICLAJE' },
    energia:  { color:'#FFFF80', sound:349, name:'ENERGÍA' }
  },
  // EL ORDEN SAGRADO (12 Pasos)
  SEQUENCE: [
    'agua', 'agua',         // Etapa 1: Caos -> Esperanza
    'tierra', 'tierra',     
    'flora', 'flora',       // Etapa 2: Esperanza -> Paraíso
    'energia', 'energia',   
    'transporte', 'transporte', 
    'reciclar', 'reciclar'  
  ],
  CENTER_AWAKEN_THRESHOLD: 12
};

const STATE = {
  nodes: [], connections: [], totalConnections:0,
  selectedNode: null, activeMenu: false, audioCtx: null, masterGain: null,
  errorLines: []
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha:true });
const habitMenu = document.getElementById('habitMenu');
const countDisplay = document.getElementById('count');
const maskGrid = document.getElementById('mask-grid');
const oracleCard = document.getElementById('oracle-card');
const hint = document.getElementById('hint');

function init(){
  createMaskTiles(); 
  resizeCanvas(); 
  setTimeout(resizeCanvas, 100); 
  createNodes(); 
  setupAudio(); 
  setupListeners(); 
  updateMissionHint(); 
  animate();
}

// Actualizar texto de misión
function updateMissionHint(){
  if(STATE.totalConnections >= CONFIG.SEQUENCE.length) return;
  
  const currentKey = CONFIG.SEQUENCE[STATE.totalConnections];
  const target = CONFIG.PATTERNS[currentKey];
  
  const habits = [
    {e:'🍃',p:'flora'}, {e:'💧',p:'agua'}, {e:'🌱',p:'tierra'},
    {e:'🚲',p:'transporte'}, {e:'♻️',p:'reciclar'}, {e:'💡',p:'energia'}
  ];
  const icon = habits.find(h => h.p === currentKey).e;

  if(hint){
    hint.innerHTML = `Misión ${STATE.totalConnections + 1}/12: <br> 
    Conecta la energía de <strong style="color:${target.color}">${target.name} ${icon}</strong>`;
  }
}

// Crear rejilla negra
function createMaskTiles(){
  if(!maskGrid) return;
  maskGrid.innerHTML = '';
  for(let i=0; i<12; i++){
    const tile = document.createElement('div');
    tile.className = 'mask-tile';
    tile.id = 'tile-' + i;
    maskGrid.appendChild(tile);
  }
}

// --- ESTA ES LA FUNCIÓN QUE FALTABA ---
function revealNextTile(){
  const tileIndex = STATE.totalConnections - 1;
  const tile = document.getElementById('tile-' + tileIndex);
  if(tile) tile.classList.add('revealed');
}
// --------------------------------------

function resizeCanvas(){ 
  const parent = canvas.parentElement;
  if(parent){
    canvas.width = parent.clientWidth; 
    canvas.height = parent.clientHeight; 
    createNodes();
  }
}

function createNodes(){
  STATE.nodes = [];
  const cx = canvas.width/2;
  const cy = canvas.height/2;
  const radius = Math.min(cx,cy) * 0.65;
  for(let i=0;i<CONFIG.NODE_COUNT;i++){
    const angle = (i/CONFIG.NODE_COUNT)*Math.PI*2;
    STATE.nodes.push({
      id:i, baseAngle: angle, orbitRadius: radius,
      x: cx + Math.cos(angle)*radius, y: cy + Math.sin(angle)*radius, pulse:0
    });
  }
}

function setupAudio(){
  try{
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    STATE.audioCtx = new AudioContext();
    STATE.masterGain = STATE.audioCtx.createGain();
    STATE.masterGain.gain.value = 0.5;
    STATE.masterGain.connect(STATE.audioCtx.destination);
  }catch(e){}
}

function playTone(freq, type='sine'){
  if(!STATE.audioCtx) return;
  const o = STATE.audioCtx.createOscillator();
  const g = STATE.audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.1, STATE.audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, STATE.audioCtx.currentTime + 0.5);
  o.connect(g); g.connect(STATE.masterGain);
  o.start(); o.stop(STATE.audioCtx.currentTime + 0.6);
}

function playErrorSound(){
  if(!STATE.audioCtx) return;
  const o = STATE.audioCtx.createOscillator();
  const g = STATE.audioCtx.createGain();
  o.type = 'sawtooth'; o.frequency.value = 100;
  g.gain.setValueAtTime(0.2, STATE.audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, STATE.audioCtx.currentTime + 0.4);
  o.connect(g); g.connect(STATE.masterGain);
  o.start(); o.stop(STATE.audioCtx.currentTime + 0.5);
}

function setupListeners(){
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('click', onCanvasClick);
  document.addEventListener('click', (e)=>{ 
    if(STATE.activeMenu && !habitMenu.contains(e.target) && e.target !== canvas) closeMenu(); 
  });
  window.addEventListener('click', ()=>{ if(STATE.audioCtx?.state === 'suspended') STATE.audioCtx.resume(); }, {once:true});
}

function onCanvasClick(e){
  if(STATE.activeMenu) return; 
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let clickedNode = null;
  for(const node of STATE.nodes){
    const dist = Math.hypot(mouseX - node.x, mouseY - node.y);
    if(dist < CONFIG.NODE_RADIUS * 1.8){ clickedNode = node; break; }
  }
  if(clickedNode) handleNodeClick(clickedNode);
  else STATE.selectedNode = null;
}

function handleNodeClick(node){
  if(!STATE.selectedNode){
    STATE.selectedNode = node; node.pulse = 1.5; playTone(300); return;
  }
  if(STATE.selectedNode === node){ STATE.selectedNode = null; return; }

  // REGLA 1: ESTRELLA (No vecinos)
  const diff = Math.abs(STATE.selectedNode.id - node.id);
  const isNeighbor = (diff === 1) || (diff === (CONFIG.NODE_COUNT - 1));
  if(isNeighbor){
    triggerError(STATE.selectedNode, node);
    STATE.selectedNode = null; return;
  }

  const exists = STATE.connections.some(c => (c.from === STATE.selectedNode && c.to === node) || (c.from === node && c.to === STATE.selectedNode));
  if(!exists) showHabitMenu(STATE.selectedNode, node);
  STATE.selectedNode = null; 
}

function triggerError(nodeA, nodeB){
  playErrorSound();
  STATE.errorLines.push({ from: nodeA, to: nodeB, life: 1.0 });
}

function showHabitMenu(nodeA, nodeB){
  STATE.activeMenu = true;
  const rect = canvas.getBoundingClientRect();
  const midX = (nodeA.x + nodeB.x)/2 + rect.left; 
  const midY = (nodeA.y + nodeB.y)/2 + rect.top;
  
  habitMenu.style.left = (midX - 110) + 'px';
  habitMenu.style.top  = (midY - 110) + 'px';
  habitMenu.classList.add('show');
  habitMenu.innerHTML = ''; 

  const habits = [
    {emoji:'🍃', p:'flora'}, {emoji:'💧', p:'agua'}, {emoji:'🌱', p:'tierra'},
    {emoji:'🚲', p:'transporte'}, {emoji:'♻️', p:'reciclar'}, {emoji:'💡', p:'energia'}
  ];
  habits.forEach((h, i)=>{
    const angle = (i/6) * Math.PI * 2;
    const btn = document.createElement('div');
    btn.className = 'habit-btn';
    btn.textContent = h.emoji;
    btn.style.left = (110 + Math.cos(angle)*75 - 25) + 'px';
    btn.style.top  = (110 + Math.sin(angle)*75 - 25) + 'px';
    btn.style.borderColor = CONFIG.PATTERNS[h.p].color;
    btn.style.color = CONFIG.PATTERNS[h.p].color;
    
    btn.onclick = (e)=>{ e.stopPropagation(); checkSelection(nodeA, nodeB, h.p); };
    habitMenu.appendChild(btn);
  });
}

// REGLA 2: SECUENCIA CORRECTA
function checkSelection(nodeA, nodeB, pattern){
  const required = CONFIG.SEQUENCE[STATE.totalConnections];
  
  if(pattern === required){
    // ¡CORRECTO!
    createConnection(nodeA, nodeB, pattern);
    closeMenu();
  } else {
    // ¡INCORRECTO!
    playErrorSound();
    if(hint) {
        hint.style.color = 'red';
        setTimeout(()=> hint.style.color = '', 400);
    }
  }
}

function closeMenu(){ habitMenu.classList.remove('show'); STATE.activeMenu = false; }

function createConnection(nodeA, nodeB, pattern){
  STATE.connections.push({ from: nodeA, to: nodeB, pattern, age:0 });
  STATE.totalConnections++;
  if(countDisplay) countDisplay.textContent = STATE.totalConnections;
  
  playTone(CONFIG.PATTERNS[pattern].sound);
  
  // === METAMORFOSIS VISUAL ===
  const imageContainer = document.querySelector('.image-container');
  if(imageContainer){
      // Cambio a etapa 2 (Esperanza) tras 4 conexiones
      if(STATE.totalConnections === 4){
           imageContainer.classList.add('stage-recovery');
           playTone(440, 'triangle'); 
      }
      // Cambio a etapa 3 (Paraíso) tras 8 conexiones
      if(STATE.totalConnections === 8){
           imageContainer.classList.remove('stage-recovery');
           imageContainer.classList.add('stage-final');
           playTone(523, 'triangle');
      }
  }
  
  // Revelar cuadro negro
  revealNextTile();
  // Siguiente misión
  updateMissionHint();

  // Victoria
  if(STATE.totalConnections >= CONFIG.CENTER_AWAKEN_THRESHOLD){
    setTimeout(()=>{
      if(oracleCard) oracleCard.classList.add('visible');
      playTone(880, 'sine');
    }, 1500);
  }
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const c of STATE.connections){
    ctx.beginPath(); ctx.moveTo(c.from.x, c.from.y); ctx.lineTo(c.to.x, c.to.y);
    ctx.strokeStyle = CONFIG.PATTERNS[c.pattern].color; ctx.lineWidth = 3; ctx.stroke();
  }
  for(let i=STATE.errorLines.length-1; i>=0; i--){
    const err = STATE.errorLines[i];
    ctx.beginPath(); ctx.moveTo(err.from.x, err.from.y); ctx.lineTo(err.to.x, err.to.y);
    ctx.strokeStyle = `rgba(255, 50, 50, ${err.life})`; ctx.lineWidth = 4; ctx.stroke();
    err.life -= 0.05; if(err.life <= 0) STATE.errorLines.splice(i, 1);
  }
  if(STATE.selectedNode){
    ctx.beginPath(); ctx.arc(STATE.selectedNode.x, STATE.selectedNode.y, CONFIG.NODE_RADIUS + 10, 0, Math.PI*2);
    ctx.strokeStyle = "white"; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
  }
  for(const node of STATE.nodes){
    node.baseAngle += CONFIG.ORBIT_SPEED;
    const cx = canvas.width/2, cy = canvas.height/2;
    node.x = cx + Math.cos(node.baseAngle)*node.orbitRadius;
    node.y = cy + Math.sin(node.baseAngle)*node.orbitRadius;
    ctx.beginPath(); ctx.arc(node.x, node.y, CONFIG.NODE_RADIUS, 0, Math.PI*2);
    if(node === STATE.selectedNode) ctx.fillStyle = "#ffffff"; else ctx.fillStyle = "rgba(180,230,255,0.8)";
    ctx.shadowBlur = 15; ctx.shadowColor = '#00d0ff'; ctx.fill();
    if(node.pulse > 0){
      ctx.beginPath(); ctx.arc(node.x, node.y, CONFIG.NODE_RADIUS + node.pulse*20, 0, Math.PI*2);
      ctx.strokeStyle = "white"; ctx.stroke(); node.pulse -= 0.1;
    }
  }
  requestAnimationFrame(animate);
}

window.addEventListener('load', init);
