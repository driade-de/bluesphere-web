// game-core.js - Lógica principal del juego BlueSphere Kids (VERSIÓN CORREGIDA)

// ============================================
// DATOS DEL JUEGO
// ============================================

const GAME_DATA = {
    player: {
        score: 0,
        itemsCleaned: 0,
        realImpactKg: 0,
        treesEarned: 0,
        decayTimer: 450 // años iniciales
    },
    
    trashItems: [
        { type: 'plastic', emoji: '🥤', name: 'Botella', decayYears: 450, weightKg: 0.05 },
        { type: 'plastic', emoji: '🛍️', name: 'Bolsa', decayYears: 150, weightKg: 0.01 },
        { type: 'paper', emoji: '📄', name: 'Papel', decayYears: 2, weightKg: 0.001 },
        { type: 'paper', emoji: '📦', name: 'Caja', decayYears: 5, weightKg: 0.02 },
        { type: 'glass', emoji: '🥛', name: 'Vaso', decayYears: 4000, weightKg: 0.1 },
        { type: 'glass', emoji: '🍾', name: 'Botella', decayYears: 4000, weightKg: 0.3 },
        { type: 'organic', emoji: '🍎', name: 'Manzana', decayYears: 0.5, weightKg: 0.15 },
        { type: 'organic', emoji: '🥬', name: 'Lechuga', decayYears: 0.3, weightKg: 0.08 }
    ],
    
    educationalFacts: [
        "¡Cada año, 8 millones de toneladas de plástico terminan en el océano!",
        "Una botella de plástico puede tardar hasta 450 años en descomponerse.",
        "Las bolsas de plástico se usan en promedio 15 minutos, pero duran 150 años.",
        "El papel se recicla hasta 7 veces antes de perder calidad.",
        "Reciclar vidrio ahorra el 30% de energía comparado con producirlo nuevo.",
        "Los residuos orgánicos pueden convertirse en compost para fertilizar plantas.",
        "El 80% de la basura marina proviene de actividades terrestres.",
        "Las tortugas marinas confunden las bolsas plásticas con medusas y las comen."
    ],
    
    beachData: {
        name: "Playa del Carmen, México",
        realTrashKg: 2540.75,
        cleanupProjects: 3,
        lastCleanup: "2024-03-10"
    }
};

// ============================================
// VARIABLES GLOBALES
// ============================================

let currentFactIndex = 0;
let gameActive = true;
let itemsOnScreen = [];
let objectsGenerated = 0;
const VIRTUAL_TO_REAL_RATIO = 100;
const OBJECTS_PER_LEVEL = 20;
const MAX_OBJECTS_ON_SCREEN = 8;

// ============================================
// INICIALIZACIÓN DEL JUEGO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("BlueSphere Kids iniciado");
    initGame();
    setupEventListeners();
    generateTrashItems(8);
    updateEducationalFact();
    updateUI();
});

function initGame() {
    objectsGenerated = 0;
    document.getElementById('beach-name').textContent = GAME_DATA.beachData.name;
    document.getElementById('real-trash-count').textContent = 
        GAME_DATA.beachData.realTrashKg.toFixed(2) + ' kg';
    updateImpactDisplay();
}

// ============================================
// GENERACIÓN DE OBJETOS
// ============================================

function generateTrashItems(count) {
    const gameArea = document.getElementById('game-area');
    
    if (GAME_DATA.player.itemsCleaned >= OBJECTS_PER_LEVEL || objectsGenerated >= OBJECTS_PER_LEVEL) {
        return;
    }
    
    const canGenerate = Math.min(
        count,
        OBJECTS_PER_LEVEL - objectsGenerated,
        MAX_OBJECTS_ON_SCREEN - itemsOnScreen.length
    );
    
    if (canGenerate <= 0) return;
    
    for (let i = 0; i < canGenerate; i++) {
        if (objectsGenerated >= OBJECTS_PER_LEVEL) break;
        
        const item = GAME_DATA.trashItems[Math.floor(Math.random() * GAME_DATA.trashItems.length)];
        const trashElement = createTrashElement(item, objectsGenerated);
        gameArea.appendChild(trashElement);
        itemsOnScreen.push(trashElement);
        objectsGenerated++;
    }
}

function createTrashElement(item, id) {
    const div = document.createElement('div');
    div.className = `trash-item ${item.type}`;
    div.id = `trash-${id}`;
    div.draggable = true;
    div.dataset.type = item.type;
    div.dataset.decay = item.decayYears;
    div.dataset.weight = item.weightKg;
    
    const x = 100 + Math.random() * 600;
    const y = 150 + Math.random() * 300;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    
    div.innerHTML = `
        <div class="trash-emoji">${item.emoji}</div>
        <div class="trash-name">${item.name}</div>
        <div class="trash-decay">${item.decayYears}a</div>
    `;
    
    div.addEventListener('dragstart', dragStart);
    return div;
}

// ============================================
// DRAG AND DROP (CORREGIDO)
// ============================================

function dragStart(e) {
    if (!gameActive) return false;
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.7';
}

function setupEventListeners() {
    const bins = document.querySelectorAll('.bin');
    
    bins.forEach(bin => {
        bin.addEventListener('dragover', dragOver);
        bin.addEventListener('dragenter', dragEnter);
        bin.addEventListener('dragleave', dragLeave);
        bin.addEventListener('drop', drop);
    });
    
    document.getElementById('btn-new-game').addEventListener('click', resetGame);
    document.getElementById('btn-back').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    document.getElementById('btn-help').addEventListener('click', showHelp);
    document.getElementById('next-fact').addEventListener('click', updateEducationalFact);
    document.getElementById('btn-continue').addEventListener('click', continueGame);
    document.getElementById('btn-certificate').addEventListener('click', showCertificate);
    
    // Botón para Memorias del Océano
    const memoryBtn = document.createElement('button');
    memoryBtn.id = 'btn-memories';
    memoryBtn.className = 'control-btn';
    memoryBtn.innerHTML = '📖 Diario Oceánico';
    memoryBtn.addEventListener('click', () => {
        if (typeof showMemoryJournal === 'function') {
            showMemoryJournal();
        } else {
            alert('¡Limpia objetos para desbloquear memorias!');
        }
    });
    
    // Añadir al final de los controles
    document.querySelector('.controls').appendChild(memoryBtn);
}

function dragOver(e) {
    if (!gameActive) return false;
    e.preventDefault();
}

function dragEnter(e) {
    if (!gameActive) return;
    
    let binElement = e.target;
    while (binElement && !binElement.classList.contains('bin')) {
        binElement = binElement.parentElement;
    }
    
    if (binElement) {
        binElement.classList.add('drag-over');
    }
}

function dragLeave(e) {
    let binElement = e.target;
    while (binElement && !binElement.classList.contains('bin')) {
        binElement = binElement.parentElement;
    }
    
    if (binElement) {
        if (!binElement.contains(e.relatedTarget)) {
            binElement.classList.remove('drag-over');
        }
    }
}

function drop(e) {
    e.preventDefault();
    
    // Limpiar todos los drag-over
    document.querySelectorAll('.bin.drag-over').forEach(bin => {
        bin.classList.remove('drag-over');
    });
    
    if (!gameActive) return;
    
    const trashId = e.dataTransfer.getData('text/plain');
    const trashElement = document.getElementById(trashId);
    
    if (!trashElement) {
        console.log("Elemento no encontrado:", trashId);
        return;
    }
    
    const trashType = trashElement.dataset.type;
    
    // ENCONTRAR CONTENEDOR REAL
    let binElement = e.target;
    while (binElement && !binElement.classList.contains('bin')) {
        binElement = binElement.parentElement;
    }
    
    if (!binElement) {
        console.log("Contenedor no encontrado");
        return;
    }
    
    const binType = binElement.dataset.accepts;
    
    console.log(`[DEBUG] ${trashType} → ${binType}`);
    
    if (trashType === binType) {
        handleCorrectDrop(trashElement, binElement, trashType);
    } else {
        handleIncorrectDrop(trashElement, binElement, trashType);
    }
}

// ============================================
// LÓGICA DE ACIERTOS Y ERRORES
// ============================================

function handleCorrectDrop(trashElement, bin, trashType) {
    bin.classList.add('correct');
    trashElement.style.opacity = '0';
    
    // MEMORIAS DEL OCÉANO
    if (typeof registerOceanMemory === 'function') {
        registerOceanMemory(trashType);
    }
    
    // PUNTUACIÓN
    GAME_DATA.player.score += 10;
    GAME_DATA.player.itemsCleaned++;
    GAME_DATA.player.realImpactKg += parseFloat(trashElement.dataset.weight);
    GAME_DATA.player.decayTimer -= parseInt(trashElement.dataset.decay) / 10;
    if (GAME_DATA.player.decayTimer < 0) GAME_DATA.player.decayTimer = 0;
    
    updateUI();
    
    setTimeout(() => {
        trashElement.remove();
        
        const index = itemsOnScreen.indexOf(trashElement);
        if (index > -1) itemsOnScreen.splice(index, 1);
        
        setTimeout(() => bin.classList.remove('correct'), 500);
        
        checkWinCondition();
        
        if (itemsOnScreen.length < MAX_OBJECTS_ON_SCREEN && 
            objectsGenerated < OBJECTS_PER_LEVEL &&
            GAME_DATA.player.itemsCleaned < OBJECTS_PER_LEVEL) {
            generateTrashItems(1);
        }
    }, 300);
}

function handleIncorrectDrop(trashElement, bin, trashType) {
    bin.classList.add('incorrect');
    GAME_DATA.player.decayTimer += 5;
    updateUI();
    
    setTimeout(() => {
        trashElement.style.left = `${100 + Math.random() * 600}px`;
        trashElement.style.top = `${150 + Math.random() * 300}px`;
        trashElement.style.opacity = '1';
        bin.classList.remove('incorrect');
    }, 500);
}

// ============================================
// INTERFAZ DE USUARIO
// ============================================

function updateUI() {
    document.getElementById('score-count').textContent = GAME_DATA.player.score;
    document.getElementById('player-impact').textContent = 
        `${GAME_DATA.player.itemsCleaned} objetos limpiados`;
    
    updateImpactDisplay();
    
    const trees = Math.floor(GAME_DATA.player.itemsCleaned / 20);
    if (trees > GAME_DATA.player.treesEarned) {
        GAME_DATA.player.treesEarned = trees;
        document.getElementById('trees-earned').textContent = trees;
    }
    
    document.getElementById('decay-clock').textContent = 
        Math.max(0, Math.floor(GAME_DATA.player.decayTimer));
    
    // Progreso del nivel
    const progressElement = document.getElementById('level-progress');
    if (progressElement) {
        progressElement.textContent = `${GAME_DATA.player.itemsCleaned}/${OBJECTS_PER_LEVEL}`;
    }
}

function updateImpactDisplay() {
    const realImpact = GAME_DATA.player.realImpactKg;
    document.getElementById('real-impact').textContent = 
        realImpact.toFixed(2) + ' kg';
    
    const beachImpact = GAME_DATA.beachData.realTrashKg - (GAME_DATA.player.itemsCleaned / VIRTUAL_TO_REAL_RATIO);
    document.getElementById('real-trash-count').textContent = 
        Math.max(0, beachImpact).toFixed(2) + ' kg';
}

function updateEducationalFact() {
    const factElement = document.getElementById('fact-text');
    factElement.textContent = GAME_DATA.educationalFacts[currentFactIndex];
    currentFactIndex = (currentFactIndex + 1) % GAME_DATA.educationalFacts.length;
}

// ============================================
// VICTORIA Y CONTROLES
// ============================================

function checkWinCondition() {
    if (GAME_DATA.player.itemsCleaned >= OBJECTS_PER_LEVEL) {
        gameActive = false;
        setTimeout(() => {
            showVictoryModal();
        }, 500);
    }
}

function showVictoryModal() {
    const modal = document.getElementById('victory-modal');
    document.getElementById('final-score').textContent = GAME_DATA.player.score;
    document.getElementById('final-impact').textContent = 
        GAME_DATA.player.realImpactKg.toFixed(2);
    modal.style.display = 'flex';
}

function resetGame() {
    GAME_DATA.player = {
        score: 0,
        itemsCleaned: 0,
        realImpactKg: 0,
        treesEarned: 0,
        decayTimer: 450
    };
    
    objectsGenerated = 0;
    itemsOnScreen.forEach(item => item.remove());
    itemsOnScreen = [];
    document.getElementById('victory-modal').style.display = 'none';
    gameActive = true;
    generateTrashItems(8);
    updateUI();
    updateEducationalFact();
}

function continueGame() {
    resetGame();
}

function showHelp() {
    alert("🎮 CÓMO JUGAR:\n\n1. Arrastra objetos a contenedores correctos\n2. Plástico→♻️ Papel→📄 Vidrio→🥛 Orgánico→🍎\n3. Limpia 20 objetos para ganar\n4. ¡Cada objeto tiene una historia!");
}

function showCertificate() {
    const cert = `🏆 CERTIFICADO BLUESPHERE 🏆\n\nHas limpiado: ${GAME_DATA.player.itemsCleaned} objetos\nImpacto: ${GAME_DATA.player.realImpactKg.toFixed(2)} kg\nÁrboles: ${GAME_DATA.player.treesEarned}\n\n🌍 ${new Date().toLocaleDateString()}`;
    alert(cert);
}
