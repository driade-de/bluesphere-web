// game.js - VERSIÓN REVELACIÓN DE IMAGEN
const CONFIG = {
  NODE_COUNT: 12, // 12 nodos = 12 piezas de imagen
  NODE_RADIUS: 25,
  ORBIT_SPEED: 0.001,
  PATTERNS: {
    flora:    { color:'#FF6BCB', sound:392 },
    agua:     { color:'#2F9BFF', sound:523 },
    tierra:   { color:'#8AFF80', sound:659 },
    transporte:{ color:'#FFAA33', sound:440 },
    reciclar: { color:'#9D6BFF', sound:587 },
    energia:  { color:'#FFFF80', sound:349 }
  },
  CENTER_AWAKEN_THRESHOLD: 12
};

const STATE = {
  nodes: [], connections: [], totalConnections:0,
  selectedNode: null, activeMenu: false, audioCtx: null, masterGain: null
};

// DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha:true });
const habitMenu = document.getElementById('habitMenu');
const countDisplay = document.getElementById('count');
const maskGrid = document.getElementById('mask-grid');
const oracleCard = document.getElementById('oracle-card');

function init(){
  createMaskTiles(); // Crear los cuadros negros
  resizeCanvas(); createNodes(); setupAudio(); setupListeners(); animate();
}

// 1. CREAR REJILLA NEGRA
function createMaskTiles(){
  maskGrid.innerHTML = '';
  // Creamos 12 cuadros (para tapar la imagen)
  for(let i=0; i<12; i++){
    const tile = document.createElement('div');
    tile.className = 'mask-tile';
    tile.id = 'tile-' + i;
    maskGrid.appendChild(tile);
  }
}

// 2. REVELAR UN CUADRO
function revealNextTile(){
  // El número de conexiones actual nos dice qué cuadro quitar (del 0 al 11)
  const tileIndex = STATE.totalConnections - 1;
  const tile = document.getElementById('tile-' + tileIndex);
  
  if(tile) {
    tile.classList.add('revealed'); // CSS hace que desaparezca suavemente
  }
  
  // Si llegamos a 12, ganamos
  if(STATE.totalConnections >= CONFIG.CENTER_AWAKEN_THRESHOLD){
    setTimeout(showOracle, 1500); // Esperar un poco y mostrar mensaje final
  }
}

function showOracle(){
  oracleCard.classList.add('visible');
  playTone(880); // Sonido de victoria
}

// ... EL RESTO DEL JUEGO (Igual que antes) ...

function resizeCanvas(){ 
  // Ajustamos el canvas al tamaño del contenedor padre, no de toda la ventana
  const parent = canvas.parentElement;
  canvas.width = parent.clientWidth; 
  canvas.height = parent.clientHeight; 
}

function createNodes(){
  STATE.nodes = [];
  const cx = canvas.width/2, cy = canvas.height/2;
  const radius = Math.min(cx,cy) * 0.65;
  for(let i=0;i<CONFIG.NODE_COUNT;i++){
    const angle = (i/CONFIG.NODE_COUNT)*Math.PI*2;
    STATE.nodes.push({
      id:i, baseAngle: angle, orbitRadius: radius,
      x: cx + Math.cos(angle)*radius, y: cy + Math.sin(angle)*radius,
      pulse:0
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
function playTone(freq){
  if(!STATE.audioCtx) return;
  const o = STATE.audioCtx.createOscillator();
  const g = STATE.audioCtx.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.1, STATE.audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, STATE.audioCtx.currentTime + 0.5);
  o.connect(g); g.connect(STATE.masterGain);
  o.start(); o.stop(STATE.audioCtx.currentTime + 0.6);
}

function setupListeners(){
  window.addEventListener('resize', ()=>{ resizeCanvas(); createNodes(); });
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
    if(dist < CONFIG.NODE_RADIUS * 1.5){ clickedNode = node; break; }
  }

  if(clickedNode) handleNodeClick(clickedNode);
  else STATE.selectedNode = null;
}

function handleNodeClick(node){
  if(!STATE.selectedNode){
    STATE.selectedNode = node;
    node.pulse = 1.5; playTone(300); return;
  }
  if(STATE.selectedNode === node){ STATE.selectedNode = null; return; }

  const exists = STATE.connections.some(c => (c.from === STATE.selectedNode && c.to === node) || (c.from === node && c.to === STATE.selectedNode));
  if(!exists) showHabitMenu(STATE.selectedNode, node);
  STATE.selectedNode = null; 
}

function showHabitMenu(nodeA, nodeB){
  STATE.activeMenu = true;
  // Ajuste para que el menú salga cerca del click dentro del canvas
  const rect = canvas.getBoundingClientRect();
  const midX = (nodeA.x + nodeB.x)/2 + rect.left; // Sumamos offset
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
    btn.onclick = (e)=>{ e.stopPropagation(); createConnection(nodeA, nodeB, h.p); closeMenu(); };
    habitMenu.appendChild(btn);
  });
}

function closeMenu(){ habitMenu.classList.remove('show'); STATE.activeMenu = false; }

function createConnection(nodeA, nodeB, pattern){
  STATE.connections.push({ from: nodeA, to: nodeB, pattern, age:0 });
  STATE.totalConnections++;
  countDisplay.textContent = STATE.totalConnections;
  playTone(CONFIG.PATTERNS[pattern].sound);
  
  // ¡¡AQUÍ ESTÁ LA MAGIA!!
  revealNextTile(); 
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const c of STATE.connections){
    ctx.beginPath(); ctx.moveTo(c.from.x, c.from.y); ctx.lineTo(c.to.x, c.to.y);
    ctx.strokeStyle = CONFIG.PATTERNS[c.pattern].color; ctx.lineWidth = 3; ctx.stroke();
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
