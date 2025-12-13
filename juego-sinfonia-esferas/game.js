// game.js - VERSIÓN FINAL CORREGIDA
const CONFIG = {
  NODE_COUNT: 12,
  NODE_RADIUS: 25,
  ORBIT_SPEED: 0.001,
  PATTERNS: {
    flora: { color: '#FF6BCB', sound: 392, name: 'FLORA' },
    agua: { color: '#2F9BFF', sound: 523, name: 'AGUA' },
    tierra: { color: '#8AFF80', sound: 659, name: 'TIERRA' },
    transporte: { color: '#FFAA33', sound: 440, name: 'MOVILIDAD' },
    reciclar: { color: '#9D6BFF', sound: 587, name: 'RECICLAJE' },
    energia: { color: '#FFFF80', sound: 349, name: 'ENERGÍA' }
  },
  SEQUENCE: [
    'agua', 'agua',
    'tierra', 'tierra',
    'flora', 'flora',
    'energia', 'energia',
    'transporte', 'transporte',
    'reciclar', 'reciclar'
  ],
  CENTER_AWAKEN_THRESHOLD: 12
};

// ========== SISTEMA DE REVELACIÓN DE IMÁGENES DOBLES ==========
const IMAGE_SYSTEM = {
  isActive: false,
  baseImage: null,
  revealImage: null,
  currentRevealPercent: 0,

  reflectionTexts: [
    "Cada conexión revela la vida que persiste bajo nuestra huella...",
    "Observa cómo el color regresa. Así actúa la conciencia regenerativa.",
    "No estás limpiando basura, estás pintando el mundo vivo con tu atención.",
    "Este es el acto más radical: imaginar lo que puede renacer.",
    "La tierra no necesita que la salves. Necesita que la veas de nuevo.",
    "¿Qué mundo eliges ver cuando miras?",
    "Tu voluntad es el pincel. La conexión, la pintura.",
    "Cada línea que trazas es un hábito nuevo en tu mente.",
    "La red que ves crecer es la misma que teje el cambio real.",
    "De la fragmentación a la totalidad: así se sana un sistema.",
    "Lo que unes en el juego, lo unes en tu conciencia.",
    "✨ La transformación está completa. Este es el mundo que imaginas y que puedes crear. ✨"
  ],

  init: function () {
    console.log("Iniciando sistema de imágenes...");
    this.loadImage('base.jpg', 'baseImage');
    this.loadImage('reveal.jpg', 'revealImage');
},

  loadImage: function (src, target) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      this[target] = img;
      console.log(`Imagen cargada: ${target}`);
      if (this.baseImage && this.revealImage) {
        this.setupCanvases();
      }
    };
    img.onerror = () => {
      console.error(`Error cargando imagen: ${src}`);
      this.createFallbackImage(target);
    };
    if (src && src.startsWith('http')) {
      img.src = src;
    } else {
      this.createFallbackImage(target);
    }
  },

  createFallbackImage: function (target) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;

    if (target === 'baseImage') {
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#4a5568';
      for (let i = 0; i < 25; i++) {
        ctx.fillRect(Math.random() * 400, Math.random() * 300, 25, 25);
      }
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 400, 300);
      gradient.addColorStop(0, '#1e3a8a');
      gradient.addColorStop(0.5, '#065f46');
      gradient.addColorStop(1, '#047857');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#10b981';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 400, Math.random() * 300, 8 + Math.random() * 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      this[target] = img;
      if (this.baseImage && this.revealImage) {
        this.setupCanvases();
      }
    };
  },

  setupCanvases: function () {
    const baseCanvas = document.getElementById('baseLayerCanvas');
    const revealCanvas = document.getElementById('revealLayerCanvas');
    const effectCanvas = document.getElementById('effectCanvas');

    const container = document.querySelector('.canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    [baseCanvas, revealCanvas, effectCanvas].forEach(canvas => {
      canvas.width = width;
      canvas.height = height;
    });

    this.drawBaseLayer();
    this.isActive = true;
    this.updateReflectionText(0);
  },

  drawBaseLayer: function () {
    const canvas = document.getElementById('baseLayerCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.baseImage) {
      ctx.filter = 'grayscale(100%) contrast(1.08) brightness(0.9)';
      ctx.drawImage(this.baseImage, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
    }
  },

  revealNextSection: function (connections) {
    if (!this.isActive) return;

    const newPercent = Math.min(100, (connections / 12) * 100);
    const oldPercent = this.currentRevealPercent;
    this.currentRevealPercent = newPercent;

    this.animateReveal(oldPercent, newPercent);
    this.updateReflectionText(connections);
    this.updateProgressBar(newPercent);

    if (connections === 12) {
      setTimeout(() => this.triggerCompletionEffect(), 500);
    }
  },

  animateReveal: function (fromPercent, toPercent) {
    const canvas = document.getElementById('revealLayerCanvas');
    const ctx = canvas.getContext('2d');
    const effectCtx = document.getElementById('effectCanvas').getContext('2d');

    if (!this.revealImage) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width * (toPercent / 100), canvas.height);
    ctx.clip();
    ctx.drawImage(this.revealImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    this.drawRevealBorder(effectCtx, toPercent);

    if (toPercent > fromPercent) {
      this.createRevealParticles(toPercent);
    }
  },

  drawRevealBorder: function (ctx, percent) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const x = ctx.canvas.width * (percent / 100);
    if (x <= 0 || x >= ctx.canvas.width) return;

    const gradient = ctx.createLinearGradient(x - 15, 0, x + 15, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, 'rgba(100, 255, 218, 0.7)');
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.lineWidth = 4;
    ctx.strokeStyle = gradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#64ffda';
    ctx.stroke();
    ctx.shadowBlur = 0;
  },

  createRevealParticles: function (percent) {
    const canvas = document.getElementById('effectCanvas');
    const ctx = canvas.getContext('2d');
    const x = canvas.width * (percent / 100);

    const particleCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < particleCount; i++) {
      const size = 1.5 + Math.random() * 3;
      const y = Math.random() * canvas.height;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 255, 218, ${0.4 + Math.random() * 0.4})`;
      ctx.fill();
    }
  },

  updateReflectionText: function (connections) {
    const textIndex = Math.min(connections, this.reflectionTexts.length - 1);
    const textElement = document.getElementById('imageReflectionText');
    if (textElement) {
      textElement.textContent = this.reflectionTexts[textIndex];
      textElement.style.opacity = '0';
      setTimeout(() => {
        textElement.style.transition = 'opacity 0.5s ease';
        textElement.style.opacity = '1';
      }, 50);
    }
  },

  updateProgressBar: function (percent) {
    const fillBar = document.getElementById('imageProgressFill');
    const percentText = document.getElementById('progressPercent');

    if (fillBar) fillBar.style.width = percent + '%';
    if (percentText) percentText.textContent = Math.round(percent) + '%';

    if (percent > 0 && Math.round(percent) % 25 === 0) {
      if (fillBar) {
        fillBar.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.8)';
        setTimeout(() => {
          fillBar.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.5)';
        }, 600);
      }
    }
  },

  triggerCompletionEffect: function () {
    const effectCtx = document.getElementById('effectCanvas').getContext('2d');
    const canvas = effectCtx.canvas;

    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 2 + Math.random() * 5;

        effectCtx.beginPath();
        effectCtx.arc(x, y, size, 0, Math.PI * 2);
        effectCtx.fillStyle = i % 3 === 0 ? '#64ffda' : (i % 3 === 1 ? '#3b82f6' : '#10b981');
        effectCtx.fill();
      }, i * 30);
    }

    setTimeout(() => {
      const mainMessage = document.getElementById('dynamicMessage');
      if (mainMessage) {
        mainMessage.textContent = '"Has tejido la red completa. Cada conexión es un hábito consciente, cada hábito un acto de regeneración. Este es el mundo que imaginas y que ahora puedes crear."';
        mainMessage.style.color = '#64ffda';
        mainMessage.style.fontWeight = '500';
      }
    }, 800);
  }
};

// ========== ESTADO PRINCIPAL ==========
const STATE = {
  nodes: [],
  connections: [],
  totalConnections: 0,
  selectedNode: null,
  activeMenu: false,
  audioCtx: null,
  masterGain: null,
  errorLines: []
};

// ========== ELEMENTOS DOM ==========
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const habitMenu = document.getElementById('habitMenu');
const countDisplay = document.getElementById('count');
const maskGrid = document.getElementById('mask-grid');
const oracleCard = document.getElementById('oracle-card');
const hint = document.getElementById('hint');

// ========== FUNCIONES PRINCIPALES ==========
function init() {
  createMaskTiles();
  resizeCanvas();
  setTimeout(resizeCanvas, 100);
  createNodes();
  setupAudio();
  setupListeners();
  updateMissionHint();
  animate();
}

function updateMissionHint() {
  if (STATE.totalConnections >= CONFIG.SEQUENCE.length) return;

  const currentKey = CONFIG.SEQUENCE[STATE.totalConnections];
  const target = CONFIG.PATTERNS[currentKey];

  const habits = [
    { e: '🍃', p: 'flora' }, { e: '💧', p: 'agua' }, { e: '🌱', p: 'tierra' },
    { e: '🚲', p: 'transporte' }, { e: '♻️', p: 'reciclar' }, { e: '💡', p: 'energia' }
  ];
  const icon = habits.find(h => h.p === currentKey).e;

  if (hint) {
    hint.innerHTML = `Misión ${STATE.totalConnections + 1}/12: <br> Conecta la energía de <strong style="color:${target.color}">${target.name} ${icon}</strong>`;
  }
}

function createMaskTiles() {
  if (!maskGrid) return;
  maskGrid.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const tile = document.createElement('div');
    tile.className = 'mask-tile';
    tile.id = 'tile-' + i;
    maskGrid.appendChild(tile);
  }
}

function revealNextTile() {
  const tileIndex = STATE.totalConnections - 1;
  const tile = document.getElementById('tile-' + tileIndex);
  if (tile) tile.classList.add('revealed');
}

function resizeCanvas() {
  const parent = canvas.parentElement;
  if (parent) {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    createNodes();
  }
}

function createNodes() {
  STATE.nodes = [];
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) * 0.65;
  for (let i = 0; i < CONFIG.NODE_COUNT; i++) {
    const angle = (i / CONFIG.NODE_COUNT) * Math.PI * 2;
    STATE.nodes.push({
      id: i,
      baseAngle: angle,
      orbitRadius: radius,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      pulse: 0
    });
  }
}

function setupAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    STATE.audioCtx = new AudioContext();
    STATE.masterGain = STATE.audioCtx.createGain();
    STATE.masterGain.gain.value = 0.5;
    STATE.masterGain.connect(STATE.audioCtx.destination);
  } catch (e) { }
}

function playTone(freq, type = 'sine') {
  if (!STATE.audioCtx) return;
  const o = STATE.audioCtx.createOscillator();
  const g = STATE.audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.1, STATE.audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, STATE.audioCtx.currentTime + 0.5);
  o.connect(g);
  g.connect(STATE.masterGain);
  o.start();
  o.stop(STATE.audioCtx.currentTime + 0.6);
}

function playErrorSound() {
  if (!STATE.audioCtx) return;
  const o = STATE.audioCtx.createOscillator();
  const g = STATE.audioCtx.createGain();
  o.type = 'sawtooth';
  o.frequency.value = 100;
  g.gain.setValueAtTime(0.2, STATE.audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, STATE.audioCtx.currentTime + 0.4);
  o.connect(g);
  g.connect(STATE.masterGain);
  o.start();
  o.stop(STATE.audioCtx.currentTime + 0.5);
}

function setupListeners() {
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('click', onCanvasClick);
  document.addEventListener('click', (e) => {
    if (STATE.activeMenu && !habitMenu.contains(e.target) && e.target !== canvas) closeMenu();
  });
  window.addEventListener('click', () => { if (STATE.audioCtx?.state === 'suspended') STATE.audioCtx.resume(); }, { once: true });
}

function onCanvasClick(e) {
  if (STATE.activeMenu) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let clickedNode = null;
  for (const node of STATE.nodes) {
    const dist = Math.hypot(mouseX - node.x, mouseY - node.y);
    if (dist < CONFIG.NODE_RADIUS * 1.8) {
      clickedNode = node;
      break;
    }
  }
  if (clickedNode) handleNodeClick(clickedNode);
  else STATE.selectedNode = null;
}

function handleNodeClick(node) {
  if (!STATE.selectedNode) {
    STATE.selectedNode = node;
    node.pulse = 1.5;
    playTone(300);
    return;
  }
  if (STATE.selectedNode === node) {
    STATE.selectedNode = null;
    return;
  }

  const diff = Math.abs(STATE.selectedNode.id - node.id);
  const isNeighbor = (diff === 1) || (diff === (CONFIG.NODE_COUNT - 1));
  if (isNeighbor) {
    triggerError(STATE.selectedNode, node);
    STATE.selectedNode = null;
    return;
  }

  const exists = STATE.connections.some(c => (c.from === STATE.selectedNode && c.to === node) || (c.from === node && c.to === STATE.selectedNode));
  if (!exists) showHabitMenu(STATE.selectedNode, node);
  STATE.selectedNode = null;
}

function triggerError(nodeA, nodeB) {
  playErrorSound();
  STATE.errorLines.push({ from: nodeA, to: nodeB, life: 1.0 });
}

function showHabitMenu(nodeA, nodeB) {
  STATE.activeMenu = true;
  const rect = canvas.getBoundingClientRect();
  const midX = (nodeA.x + nodeB.x) / 2 + rect.left;
  const midY = (nodeA.y + nodeB.y) / 2 + rect.top;

  habitMenu.style.left = (midX - 110) + 'px';
  habitMenu.style.top = (midY - 110) + 'px';
  habitMenu.classList.add('show');
  habitMenu.innerHTML = '';

  const habits = [
    { emoji: '🍃', p: 'flora' }, { emoji: '💧', p: 'agua' }, { emoji: '🌱', p: 'tierra' },
    { emoji: '🚲', p: 'transporte' }, { emoji: '♻️', p: 'reciclar' }, { emoji: '💡', p: 'energia' }
  ];
  habits.forEach((h, i) => {
    const angle = (i / 6) * Math.PI * 2;
    const btn = document.createElement('div');
    btn.className = 'habit-btn';
    btn.textContent = h.emoji;
    btn.style.left = (110 + Math.cos(angle) * 75 - 25) + 'px';
    btn.style.top = (110 + Math.sin(angle) * 75 - 25) + 'px';
    btn.style.borderColor = CONFIG.PATTERNS[h.p].color;
    btn.style.color = CONFIG.PATTERNS[h.p].color;

    btn.onclick = (e) => {
      e.stopPropagation();
      checkSelection(nodeA, nodeB, h.p);
    };
    habitMenu.appendChild(btn);
  });
}

function checkSelection(nodeA, nodeB, pattern) {
  const required = CONFIG.SEQUENCE[STATE.totalConnections];

  if (pattern === required) {
    createConnection(nodeA, nodeB, pattern);
    closeMenu();
  } else {
    playErrorSound();
    if (hint) {
      hint.style.color = 'red';
      setTimeout(() => hint.style.color = '', 400);
    }
  }
}

function closeMenu() {
  habitMenu.classList.remove('show');
  STATE.activeMenu = false;
}

function createConnection(nodeA, nodeB, pattern) {
  STATE.connections.push({ from: nodeA, to: nodeB, pattern, age: 0 });
  STATE.totalConnections++;
  if (countDisplay) countDisplay.textContent = STATE.totalConnections;

  playTone(CONFIG.PATTERNS[pattern].sound);

  // ========== ACTUALIZAR SISTEMA DE IMÁGENES ==========
  if (STATE.totalConnections === 1) {
    IMAGE_SYSTEM.init();
  }
  if (IMAGE_SYSTEM.isActive) {
    IMAGE_SYSTEM.revealNextSection(STATE.totalConnections);
  }

  const imageContainer = document.querySelector('.image-container');
  if (imageContainer) {
    if (STATE.totalConnections === 4) {
      imageContainer.classList.add('stage-recovery');
      playTone(440, 'triangle');
    }
    if (STATE.totalConnections === 8) {
      imageContainer.classList.remove('stage-recovery');
      imageContainer.classList.add('stage-final');
      playTone(523, 'triangle');
    }
  }

  revealNextTile();
  updateMissionHint();

  if (STATE.totalConnections >= CONFIG.CENTER_AWAKEN_THRESHOLD) {
    setTimeout(() => {
      if (oracleCard) oracleCard.classList.add('visible');
      playTone(880, 'sine');
    }, 1500);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const c of STATE.connections) {
    ctx.beginPath();
    ctx.moveTo(c.from.x, c.from.y);
    ctx.lineTo(c.to.x, c.to.y);
    ctx.strokeStyle = CONFIG.PATTERNS[c.pattern].color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  for (let i = STATE.errorLines.length - 1; i >= 0; i--) {
    const err = STATE.errorLines[i];
    ctx.beginPath();
    ctx.moveTo(err.from.x, err.from.y);
    ctx.lineTo(err.to.x, err.to.y);
    ctx.strokeStyle = `rgba(255, 50, 50, ${err.life})`;
    ctx.lineWidth = 4;
    ctx.stroke();
    err.life -= 0.05;
    if (err.life <= 0) STATE.errorLines.splice(i, 1);
  }
  if (STATE.selectedNode) {
    ctx.beginPath();
    ctx.arc(STATE.selectedNode.x, STATE.selectedNode.y, CONFIG.NODE_RADIUS + 10, 0, Math.PI * 2);
    ctx.strokeStyle = "white";
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  for (const node of STATE.nodes) {
    node.baseAngle += CONFIG.ORBIT_SPEED;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    node.x = cx + Math.cos(node.baseAngle) * node.orbitRadius;
    node.y = cy + Math.sin(node.baseAngle) * node.orbitRadius;
    ctx.beginPath();
    ctx.arc(node.x, node.y, CONFIG.NODE_RADIUS, 0, Math.PI * 2);
    if (node === STATE.selectedNode) ctx.fillStyle = "#ffffff";
    else ctx.fillStyle = "rgba(180,230,255,0.8)";
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00d0ff';
    ctx.fill();
    if (node.pulse > 0) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, CONFIG.NODE_RADIUS + node.pulse * 20, 0, Math.PI * 2);
      ctx.strokeStyle = "white";
      ctx.stroke();
      node.pulse -= 0.1;
    }
  }
  requestAnimationFrame(animate);
}

function resetGame() {
  if (STATE.totalConnections < 12 && !confirm("¿Seguro que quieres empezar una nueva sinfonía? Perderás el progreso actual.")) {
    return;
  }

  STATE.connections = [];
  STATE.totalConnections = 0;
  if (countDisplay) countDisplay.textContent = '0';

  if (IMAGE_SYSTEM.isActive) {
    IMAGE_SYSTEM.currentRevealPercent = 0;
    IMAGE_SYSTEM.revealNextSection(0);
    IMAGE_SYSTEM.updateReflectionText(0);
    IMAGE_SYSTEM.updateProgressBar(0);

    const mainMessage = document.getElementById('dynamicMessage');
    if (mainMessage) {
      mainMessage.textContent = '"Al igual que uniste estos puntos, hoy tu conciencia une tu voluntad con la salud del planeta."';
      mainMessage.style.color = '#cbd5e1';
      mainMessage.style.fontWeight = 'normal';
    }

    const effectCtx = document.getElementById('effectCanvas')?.getContext('2d');
    if (effectCtx) effectCtx.clearRect(0, 0, effectCtx.canvas.width, effectCtx.canvas.height);
  }

  createMaskTiles();
  updateMissionHint();
  if (oracleCard) oracleCard.classList.remove('visible');

  console.log("Juego reiniciado");
}

window.addEventListener('load', init);
