// CONFIGURACIÓN DEL JUEGO
const trashTypes = [
    { name: 'Botella', type: 'plastic', icon: '🧴', decay: 450 },
    { name: 'Bolsa', type: 'plastic', icon: '🛍️', decay: 150 },
    { name: 'Periódico', type: 'paper', icon: '📰', decay: 0.1 }, // 6 semanas
    { name: 'Caja', type: 'paper', icon: '📦', decay: 0.2 },
    { name: 'Botella Vidrio', type: 'glass', icon: '🍾', decay: 4000 },
    { name: 'Manzana', type: 'organic', icon: '🍎', decay: 0.1 }, // 2 meses
    { name: 'Plátano', type: 'organic', icon: '🍌', decay: 0.1 }
];

const facts = [
    "¡Una botella de plástico tarda 450 años en desaparecer!",
    "El vidrio es 100% reciclable y se puede usar infinitas veces.",
    "Si reciclas una tonelada de papel, salvas 17 árboles.",
    "El 80% de la contaminación del océano viene de la tierra."
];

let score = 0;
let realImpactKg = 0;
let levelItems = 0;
const MAX_ITEMS_LEVEL = 10;
let activeTrash = null;

// ELEMENTOS DOM
const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score-count');
const impactEl = document.getElementById('real-impact');
const progressEl = document.getElementById('level-progress');
const decayClock = document.getElementById('decay-clock');
const factPanel = document.querySelector('.education-panel');
const factText = document.getElementById('fact-text');
const victoryModal = document.getElementById('victory-modal');

// SONIDOS (Sintetizados para no depender de archivos externos por ahora)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'good') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    }
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// INICIAR JUEGO
function initGame() {
    score = 0;
    realImpactKg = 0;
    levelItems = 0;
    updateUI();
    spawnTrash();
}

// GENERAR BASURA
function spawnTrash() {
    if (levelItems >= MAX_ITEMS_LEVEL) {
        endLevel();
        return;
    }

    // Limpiar basura anterior si existe
    const existing = document.querySelector('.trash-item');
    if (existing) existing.remove();

    const itemData = trashTypes[Math.floor(Math.random() * trashTypes.length)];
    const trash = document.createElement('div');
    trash.classList.add('trash-item');
    trash.textContent = itemData.icon;
    trash.dataset.type = itemData.type;
    trash.dataset.decay = itemData.decay;
    
    // Posición aleatoria en el "cielo/mar"
    trash.style.left = Math.random() * (gameArea.offsetWidth - 50) + 'px';
    trash.style.top = '50px';
    
    // DRAG AND DROP LÓGICA
    trash.draggable = true;
    trash.addEventListener('dragstart', (e) => {
        activeTrash = trash;
        decayClock.textContent = itemData.decay; // Mostrar tiempo de vida
        e.dataTransfer.setData('text/plain', itemData.type);
        setTimeout(() => trash.style.display = 'none', 0); // Ocultar visualmente al arrastrar
    });
    
    trash.addEventListener('dragend', () => {
        trash.style.display = 'block'; // Volver a mostrar si se suelta mal
        activeTrash = null;
    });

    gameArea.appendChild(trash);
}

// CONFIGURAR BOTES (DROP ZONES)
document.querySelectorAll('.bin').forEach(bin => {
    bin.addEventListener('dragover', e => e.preventDefault());
    
    bin.addEventListener('drop', e => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        const binType = bin.dataset.accepts;

        if (type === binType) {
            handleSuccess();
        } else {
            handleMistake();
        }
    });
});

function handleSuccess() {
    playSound('good');
    score++;
    realImpactKg += 0.5; // Simulación: 0.5kg por objeto
    levelItems++;
    
    // Animación visual de éxito
    const trash = document.querySelector('.trash-item');
    if(trash) trash.remove();

    showFact(); // Mostrar dato curioso ocasionalmente
    updateUI();
    setTimeout(spawnTrash, 1500); // Siguiente objeto
}

function handleMistake() {
    playSound('bad');
    alert("¡Ups! Ese no es el contenedor correcto. Intenta de nuevo.");
    const trash = document.querySelector('.trash-item');
    if(trash) trash.style.display = 'block'; // Regresar objeto
}

function showFact() {
    if (Math.random() > 0.7) { // 30% de probabilidad
        factPanel.style.display = 'block';
        factText.textContent = facts[Math.floor(Math.random() * facts.length)];
        setTimeout(() => factPanel.style.display = 'none', 3000);
    }
}

function updateUI() {
    scoreEl.textContent = score;
    impactEl.textContent = realImpactKg.toFixed(2) + ' kg';
    progressEl.textContent = `${levelItems}/${MAX_ITEMS_LEVEL}`;
}

function endLevel() {
    victoryModal.style.display = 'flex';
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-impact').textContent = realImpactKg.toFixed(2);
}

// BOTONES DE CONTROL
document.getElementById('btn-new-game').addEventListener('click', () => {
    victoryModal.style.display = 'none';
    initGame();
});

document.getElementById('btn-continue').addEventListener('click', () => {
    victoryModal.style.display = 'none';
    initGame(); // Por ahora reinicia, luego podríamos subir dificultad
});

// Inicializar al cargar
initGame();
