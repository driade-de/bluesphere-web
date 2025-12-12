// game.js — MODO CLIC (Fácil de usar)
const CONFIG = {
  NODE_COUNT: 12,
  NODE_RADIUS: 25,       // Puntos grandes fáciles de cliquear
  ORBIT_SPEED: 0.001,    // Velocidad suave
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
  selectedNode: null, // Guardamos cuál fue el primer clic
  activeMenu: false, audioCtx: null, masterGain: null
};

// Elementos
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha:true });
const habitMenu = document.getElementById('habitMenu');
const countDisplay = document.getElementById('count');
const hint = document.getElementById('hint');

// Iniciar
function init(){
  resizeCanvas(); createNodes(); setupAudio(); setupListeners(); animate();
  // Cambiar el texto de ayuda para que sepa que es con clic
  if(hint) hint.textContent = "Haz CLIC en un punto y luego CLIC en otro para conectar";
}

function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }

function createNodes(){
  STATE.nodes = [];
  const cx = canvas.width/2, cy = canvas.height/2;
  const radius = Math.min(cx,cy) * 0.65;
  for(let i=0;i<CONFIG.NODE_COUNT;i++){
    const angle = (i/CONFIG.NODE_COUNT)*Math.PI*2;
    STATE.nodes.push({
      id:i, baseAngle: angle, orbitRadius: radius,
      x: cx + Math.cos(angle)*radius, y: cy + Math.sin(angle)*radius,
      pulse:0, glow: Math.random()*0.25+0.75
    });
  }
}

// Sonido
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

// Eventos (Solo usamos CLIC ahora)
function setupListeners(){
  window.addEventListener('resize', ()=>{ resizeCanvas(); createNodes(); });
  
  // Usamos 'click' para todo (funciona en PC y Celular)
  canvas.addEventListener('click', onCanvasClick);
  
  // Cerrar menú si clic fuera
  document.addEventListener('click', (e)=>{ 
    if(STATE.activeMenu && !habitMenu.contains(e.target) && e.target !== canvas) closeMenu(); 
  });
  
  // Activar audio al primer toque
  window.addEventListener('click', ()=>{ if(STATE.audioCtx?.state === 'suspended') STATE.audioCtx.resume(); }, {once:true});
}

function onCanvasClick(e){
  if(STATE.activeMenu) return; // Si el menú está abierto, no hacer nada en el canvas
  
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Buscar si se hizo clic en un nodo
  let clickedNode = null;
  for(const node of STATE.nodes){
    const dist = Math.hypot(mouseX - node.x, mouseY - node.y);
    if(dist < CONFIG.NODE_RADIUS * 1.5){ // Área de clic generosa
      clickedNode = node;
      break;
    }
  }

  if(clickedNode){
    handleNodeClick(clickedNode);
  } else {
    // Si clic en el vacío, deseleccionar
    STATE.selectedNode = null;
  }
}

function handleNodeClick(node){
  // Caso 1: No hay nada seleccionado -> Seleccionar este
  if(!STATE.selectedNode){
    STATE.selectedNode = node;
    node.pulse = 1.5; // Efecto visual
    playTone(300);    // Sonido suave
    return;
  }

  // Caso 2: Clic en el MISMO nodo -> Deseleccionar
  if(STATE.selectedNode === node){
    STATE.selectedNode = null;
    return;
  }

  // Caso 3: Clic en OTRO nodo -> ¡CONECTAR!
  // Verificar si ya existe conexión
  const exists = STATE.connections.some(c => 
    (c.from === STATE.selectedNode && c.to === node) || 
    (c.from === node && c.to === STATE.selectedNode)
  );

  if(!exists){
    showHabitMenu(STATE.selectedNode, node);
  }
  
  STATE.selectedNode = null; // Resetear selección
}

function showHabitMenu(nodeA, nodeB){
  STATE.activeMenu = true;
  // Posicionar menú entre los dos nodos
  const midX = (nodeA.x + nodeB.x)/2;
  const midY = (nodeA.y + nodeB.y)/2;
  
  habitMenu.style.left = (midX - 110) + 'px';
  habitMenu.style.top  = (midY - 110) + 'px';
  habitMenu.classList.add('show');
  habitMenu.innerHTML = ''; // Limpiar

  const habits = [
    {emoji:'🍃', p:'flora'}, {emoji:'💧', p:'agua'}, {emoji:'🌱', p:'tierra'},
    {emoji:'🚲', p:'transporte'}, {emoji:'♻️', p:'reciclar'}, {emoji:'💡', p:'energia'}
  ];

  habits.forEach((h, i)=>{
    const angle = (i/6) * Math.PI * 2;
    const btn = document.createElement('div');
    btn.className = 'habit-btn';
    btn.textContent = h.emoji;
    // Posición circular botones
    btn.style.left = (110 + Math.cos(angle)*75 - 28) + 'px';
    btn.style.top  = (110 + Math.sin(angle)*75 - 28) + 'px';
    btn.style.borderColor = CONFIG.PATTERNS[h.p].color;
    btn.style.color = CONFIG.PATTERNS[h.p].color;
    
    btn.onclick = (e)=>{ 
      e.stopPropagation(); // Evitar que el clic pase al canvas
      createConnection(nodeA, nodeB, h.p); 
      closeMenu(); 
    };
    habitMenu.appendChild(btn);
  });
}

function closeMenu(){
  habitMenu.classList.remove('show');
  STATE.activeMenu = false;
}

function createConnection(nodeA, nodeB, pattern){
  STATE.connections.push({ from: nodeA, to: nodeB, pattern, age:0 });
  STATE.totalConnections++;
  countDisplay.textContent = STATE.totalConnections;
  playTone(CONFIG.PATTERNS[pattern].sound);
  
  if(STATE.totalConnections >= CONFIG.CENTER_AWAKEN_THRESHOLD){
    // Efecto final simple
    document.body.style.transition = "background 2s";
    document.body.style.background = "#0b1a30"; 
  }
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  // Dibujar conexiones
  for(const c of STATE.connections){
    ctx.beginPath();
    ctx.moveTo(c.from.x, c.from.y);
    ctx.lineTo(c.to.x, c.to.y);
    ctx.strokeStyle = CONFIG.PATTERNS[c.pattern].color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Dibujar línea temporal si hay uno seleccionado
  if(STATE.selectedNode){
    // Como no trackeamos el mouse constantemente para ahorrar recursos,
    // solo dibujamos un anillo alrededor del seleccionado
    ctx.beginPath();
    ctx.arc(STATE.selectedNode.x, STATE.selectedNode.y, CONFIG.NODE_RADIUS + 10, 0, Math.PI*2);
    ctx.strokeStyle = "white";
    ctx.setLineDash([5,5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Dibujar nodos
  const now = Date.now();
  for(const node of STATE.nodes){
    // Movimiento orbital suave
    node.baseAngle += CONFIG.ORBIT_SPEED;
    const cx = canvas.width/2, cy = canvas.height/2;
    node.x = cx + Math.cos(node.baseAngle)*node.orbitRadius;
    node.y = cy + Math.sin(node.baseAngle)*node.orbitRadius;

    ctx.beginPath();
    ctx.arc(node.x, node.y, CONFIG.NODE_RADIUS, 0, Math.PI*2);
    
    // Color: Si está seleccionado, brilla más
    if(node === STATE.selectedNode) ctx.fillStyle = "#ffffff";
    else ctx.fillStyle = "rgba(180,230,255,0.8)";
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d0ff';
    ctx.fill();

    // Pulso al hacer clic
    if(node.pulse > 0){
      ctx.beginPath();
      ctx.arc(node.x, node.y, CONFIG.NODE_RADIUS + node.pulse*20, 0, Math.PI*2);
      ctx.strokeStyle = "white";
      ctx.stroke();
      node.pulse -= 0.1;
    }
  }

  requestAnimationFrame(animate);
}

window.addEventListener('load', init);
