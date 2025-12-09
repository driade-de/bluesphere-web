// game-core.js - Lógica principal del juego BlueSphere Kids

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
const VIRTUAL_TO_REAL_RATIO = 100; // 100 objetos virtuales = 1 kg real

// ============================================
// INICIALIZACIÓN DEL JUEGO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initGame();
    setupEventListeners();
    generateTrashItems(8); // Generar 8 objetos iniciales
    updateEducationalFact();
    updateUI();
});

function initGame() {
    // Actualizar datos de playa real
    document.getElementById('beach-name').textContent = GAME_DATA.beachData.name;
    document.getElementById('real-trash-count').textContent = 
        GAME_DATA.beachData.realTrashKg.toFixed(2) + ' kg';
    
    // Mostrar impacto inicial
    updateImpactDisplay();
}

// ============================================
// GENERACIÓN DE OBJETOS
// ============================================

function generateTrashItems(count) {
    const gameArea = document.getElementById('game-area');
    
    for (let i = 0; i < count; i++) {
        const item = GAME_DATA.trashItems[Math.floor(Math.random() * GAME_DATA.trashItems.length)];
        const trashElement = createTrashElement(item, i);
        gameArea.appendChild(trashElement);
        itemsOnScreen.push(trashElement);
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
    
    // Posición aleatoria
    const x = 100 + Math.random() * 600;
    const y = 150 + Math.random() * 300;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    
    div.innerHTML = `
        <div class="trash-emoji">${item.emoji}</div>
        <div class="trash-name">${item.name}</div>
        <div class="trash-decay">${item.decayYears}a</div>
    `;
    
    // Eventos drag and drop
    div.addEventListener('dragstart', dragStart);
    
    return div;
}

// ============================================
// DRAG AND DROP
// ============================================

function dragStart(e) {
    if (!gameActive) return false;
    
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Efecto visual
    e.target.style.opacity = '0.7';
}

// Configurar contenedores
function setupEventListeners() {
    const bins = document.querySelectorAll('.bin');
    
    bins.forEach(bin => {
        bin.addEventListener('dragover', dragOver);
        bin.addEventListener('dragenter', dragEnter);
        bin.addEventListener('dragleave', dragLeave);
        bin.addEventListener('drop', drop);
    });
    
    // Botones de control
    document.getElementById('btn-new-game').addEventListener('click', resetGame);
    document.getElementById('btn-back').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    document.getElementById('btn-help').addEventListener('click', showHelp);
    document.getElementById('next-fact').addEventListener('click', updateEducationalFact);
    document.getElementById('btn-continue').addEventListener('click', continueGame);
    document.getElementById('btn-certificate').addEventListener('click', showCertificate);
}

function dragOver(e) {
    if (!gameActive) return false;
    e.preventDefault();
}

function dragEnter(e) {
    if (!gameActive) return;
    e.target.classList.add('drag-over');
}

function dragLeave(e) {
    e.target.classList.remove('drag-over');
}

function drop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    
    if (!gameActive) return;
    
    const trashId = e.dataTransfer.getData('text/plain');
    const trashElement = document.getElementById(trashId);
    const trashType = trashElement.dataset.type;
    const binType = e.target.dataset.accepts;
    
    // Verificar si es correcto
    if (trashType === binType) {
        handleCorrectDrop(trashElement, e.target);
    } else {
        handleIncorrectDrop(trashElement, e.target);
    }
}

// ============================================
// LÓGICA DE ACIERTOS Y ERRORES
// ============================================

function handleCorrectDrop(trashElement, bin) {
    // Efecto visual
    bin.classList.add('correct');
    trashElement.style.opacity = '0';
    
    // Actualizar puntuación
    GAME_DATA.player.score += 10;
    GAME_DATA.player.itemsCleaned++;
    GAME_DATA.player.realImpactKg += parseFloat(trashElement.dataset.weight);
    
    // Reducir timer de descomposición
    GAME_DATA.player.decayTimer -= parseInt(trashElement.dataset.decay) / 10;
    if (GAME_DATA.player.decayTimer < 0) GAME_DATA.player.decayTimer = 0;
    
    // Actualizar UI
    updateUI();
    
    // Remover objeto después de animación
    setTimeout(() => {
        trashElement.remove();
        
        // Eliminar de array
        const index = itemsOnScreen.indexOf(trashElement);
        if (index > -1) itemsOnScreen.splice(index, 1);
        
        // Remover efecto del contenedor
        setTimeout(() => bin.classList.remove('correct'), 500);
        
        // Verificar si ganó
        checkWinCondition();
        
        // Generar nuevo objeto si hay menos de 8
        if (itemsOnScreen.length < 8) {
            generateTrashItems(1);
        }
    }, 300);
}

function handleIncorrectDrop(trashElement, bin) {
    // Efecto visual
    bin.classList.add('incorrect');
    
    // Aumentar timer de descomposición (penalización)
    GAME_DATA.player.decayTimer += 5;
    
    // Actualizar UI
    updateUI();
    
    // Regresar objeto a posición aleatoria
    setTimeout(() => {
        trashElement.style.left = `${100 + Math.random() * 600}px`;
        trashElement.style.top = `${150 + Math.random() * 300}px`;
        trashElement.style.opacity = '1';
        bin.classList.remove('incorrect');
    }, 500);
}

// ============================================
// ACTUALIZACIÓN DE UI
// ============================================

function updateUI() {
    // Actualizar puntuaciones
    document.getElementById('score-count').textContent = GAME_DATA.player.score;
    document.getElementById('player-impact').textContent = 
        `${GAME_DATA.player.itemsCleaned} objetos limpiados`;
    
    // Actualizar impacto real
    updateImpactDisplay();
    
    // Actualizar árboles
    const trees = Math.floor(GAME_DATA.player.itemsCleaned / 20);
    if (trees > GAME_DATA.player.treesEarned) {
        GAME_DATA.player.treesEarned = trees;
        document.getElementById('trees-earned').textContent = trees;
    }
    
    // Actualizar timer
    document.getElementById('decay-clock').textContent = 
        Math.max(0, Math.floor(GAME_DATA.player.decayTimer));
}

function updateImpactDisplay() {
    const realImpact = GAME_DATA.player.realImpactKg;
    document.getElementById('real-impact').textContent = 
        realImpact.toFixed(2) + ' kg';
    
    // Actualizar también el contador de playa real (simulado)
    const beachImpact = GAME_DATA.beachData.realTrashKg - (GAME_DATA.player.itemsCleaned / VIRTUAL_TO_REAL_RATIO);
    document.getElementById('real-trash-count').textContent = 
        Math.max(0, beachImpact).toFixed(2) + ' kg';
}

function updateEducationalFact() {
    const factElement = document.getElementById('fact-text');
    factElement.textContent = GAME_DATA.educationalFacts[currentFactIndex];
    
    // Rotar al siguiente hecho
    currentFactIndex = (currentFactIndex + 1) % GAME_DATA.educationalFacts.length;
}

// ============================================
// CONDICIONES DE VICTORIA
// ============================================

function checkWinCondition() {
    // Ganar al limpiar 20 objetos
    if (GAME_DATA.player.itemsCleaned >= 20) {
        gameActive = false;
        showVictoryModal();
    }
}

function showVictoryModal() {
    const modal = document.getElementById('victory-modal');
    document.getElementById('final-score').textContent = GAME_DATA.player.score;
    document.getElementById('final-impact').textContent = 
        GAME_DATA.player.realImpactKg.toFixed(2);
    
    modal.style.display = 'flex';
}

// ============================================
// FUNCIONES DE CONTROL
// ============================================

function resetGame() {
    // Resetear datos del jugador
    GAME_DATA.player = {
        score: 0,
        itemsCleaned: 0,
        realImpactKg: 0,
        treesEarned: 0,
        decayTimer: 450
    };
    
    // Remover objetos existentes
    itemsOnScreen.forEach(item => item.remove());
    itemsOnScreen = [];
    
    // Ocultar modal si está visible
    document.getElementById('victory-modal').style.display = 'none';
    
    // Reactivar juego
    gameActive = true;
    
    // Generar nuevos objetos
    generateTrashItems(8);
    
    // Actualizar UI
    updateUI();
    updateEducationalFact();
}

function continueGame() {
    // Para el prototipo, simplemente reinicia
    resetGame();
}

function showHelp() {
    alert("🎮 CÓMO JUGAR:\n\n" +
          "1. Arrastra los objetos de basura a los contenedores correctos.\n" +
          "2. Plástico → ♻️ | Papel → 📄 | Vidrio → 🥛 | Orgánico → 🍎\n" +
          "3. Cada acierto suma puntos y reduce la basura real.\n" +
          "4. Cada error aumenta el tiempo de descomposición.\n" +
          "5. ¡Limpia 20 objetos para ganar un árbol virtual!");
}

function showCertificate() {
    const certificate = `
        🏆 CERTIFICADO BLUESPHERE KIDS 🏆
        
        ¡Felicidades Guardián!
        
        Has limpiado: ${GAME_DATA.player.itemsCleaned} objetos
        Impacto real: ${GAME_DATA.player.realImpactKg.toFixed(2)} kg menos en océano
        Árboles ganados: ${GAME_DATA.player.treesEarned}
        
        Gracias por ayudar a salvar nuestro planeta.
        
        🌍 BlueSphere Kids - ${new Date().toLocaleDateString()}
    `;
    
    alert(certificate);
}
