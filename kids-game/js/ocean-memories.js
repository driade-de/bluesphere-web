// OCEAN MEMORIES SYSTEM - Bluesphere Consciousness
// Sistema de historias ancestrales y bio-recuerdos

const OCEAN_MEMORIES = {
    plastic_bottle: {
        id: "plastic_dinosaur",
        type: "plastic",
        title: "Memoria Ancestral",
        memory: "Hace 65 millones de años, fui parte de un bosque prehistórico. Dinosaurios caminaban sobre mí. Luego, bajo presión y tiempo, me transformé en petróleo. Ahora soy esta botella... pero recuerdo mi origen vegetal.",
        voice: "Voz de la Tierra Profunda",
        vibration: 174,
        unlockCondition: { type: "plastic", count: 3 }
    },
    
    plastic_bag: {
        id: "plastic_journey",
        type: "plastic", 
        title: "Viaje sin Fin",
        memory: "Nací en una fábrica en China. Viajé en barco a México. Estuve 15 minutos en manos humanas. Llevo 150 años flotando en el océano. He visto tortugas confundirme con medusas.",
        voice: "Voz del Viento Marino",
        vibration: 285,
        unlockCondition: { type: "plastic", count: 5 }
    },
    
    glass_bottle: {
        id: "glass_volcano",
        type: "glass",
        title: "Origen Volcánico",
        memory: "Soy lava solidificada. Arena de erupciones antiguas. En hornos humanos, recupero mi fluidez primigenia. Podría durar 4,000 años más, contemplando las estrellas desde el fondo marino.",
        voice: "Voz del Fuego Subterráneo",
        vibration: 396,
        unlockCondition: { type: "glass", count: 2 }
    },
    
    paper_sheet: {
        id: "paper_tree",
        type: "paper",
        title: "Árbol Transformado",
        memory: "Fui un roble en Canadá. Mis hojas bailaban con el viento. Ahora soy papel, pero aún recuerdo la lluvia en mis hojas. En 2 años, volveré a la tierra.",
        voice: "Voz del Bosque",
        vibration: 528,
        unlockCondition: { type: "paper", count: 2 }
    },
    
    apple_core: {
        id: "apple_cycle",
        type: "organic",
        title: "Ciclo de Vida",
        memory: "De semilla a flor, de flor a fruto, de fruto a semilla otra vez. En 6 meses completo el círculo. No soy basura, soy el próximo manzano.",
        voice: "Voz del Huerto",
        vibration: 741,
        unlockCondition: { type: "organic", count: 1 }
    }
};

// Sistema simple de desbloqueo
let unlockedMemories = [];
let typeCounters = { plastic: 0, paper: 0, glass: 0, organic: 0 };

function registerOceanMemory(itemType) {
    typeCounters[itemType]++;
    
    // Buscar memorias para desbloquear
    for (const [key, memory] of Object.entries(OCEAN_MEMORIES)) {
        if (memory.type === itemType && 
            !unlockedMemories.includes(key) &&
            typeCounters[itemType] >= memory.unlockCondition.count) {
            
            unlockedMemories.push(key);
            showOceanMemory(memory);
            break; // Solo una memoria por vez
        }
    }
}

function showOceanMemory(memory) {
    // Crear modal simple
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a237e, #4fc3f7);
        color: white;
        padding: 20px;
        border-radius: 15px;
        z-index: 9999;
        width: 80%;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 150, 255, 0.5);
        border: 2px solid #bbdefb;
    `;
    
    modal.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 2em; margin-bottom: 10px;">🌀</div>
            <h3 style="margin: 0 0 10px 0; color: #bbdefb;">${memory.title}</h3>
            <p style="font-style: italic; margin-bottom: 15px;">"${memory.memory}"</p>
            <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <div>🗣️ ${memory.voice}</div>
                <div>🎵 ${memory.vibration} Hz</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #00e676; color: white; border: none; padding: 8px 15px; border-radius: 20px; cursor: pointer;">
                Continuar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remover después de 8 segundos
    setTimeout(() => {
        if (document.body.contains(modal)) {
            modal.remove();
        }
    }, 8000);
}

// Función para ver memorias desbloqueadas
function showMemoryJournal() {
    if (unlockedMemories.length === 0) {
        alert("Aún no has desbloqueado memorias. ¡Limpia más objetos!");
        return;
    }
    
    let journalText = "📖 MI DIARIO OCEÁNICO\n\n";
    unlockedMemories.forEach(key => {
        const memory = OCEAN_MEMORIES[key];
        journalText += `🌀 ${memory.title}\n`;
        journalText += `   "${memory.memory.substring(0, 60)}..."\n`;
        journalText += `   Frecuencia: ${memory.vibration} Hz\n\n`;
    });
    
    journalText += `\nMemorias desbloqueadas: ${unlockedMemories.length}/5`;
    alert(journalText);
}
