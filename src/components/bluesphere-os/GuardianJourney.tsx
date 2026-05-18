import React from 'react';

const STEPS = [
  { id: 1, title: 'ACTIVACIÓN', desc: 'Realizas tu aporte y recibes tu Código de Guardián.', color: 'border-blue-500', glow: 'shadow-blue-500/40' },
  { id: 2, title: 'PACTO AZUL', desc: 'Valida tu código, agrega tu nombre y deja tu mensaje.', color: 'border-emerald-500', glow: 'shadow-emerald-500/40' },
  { id: 3, title: 'CERTIFICADO', desc: 'Descarga tu Certificado con tu nombre y fecha.', color: 'border-purple-500', glow: 'shadow-purple-500/40' },
  { id: 4, title: 'BIBLIOTECA', desc: 'Explora y descarga las sinopsis de los libros.', color: 'border-amber-500', glow: 'shadow-amber-500/40' },
  { id: 5, title: 'CÁPSULA DEL TIEMPO', desc: 'Deja tu reflexión para el futuro. Se abrirá en 2035.', color: 'border-cyan-500', glow: 'shadow-cyan-500/40' },
  { id: 6, title: 'HÁBITOS & SER', desc: 'Registra tus 18 hábitos y activa el ser.', color: 'border-green-500', glow: 'shadow-green-500/40' },
  { id: 7, title: 'GUARDIÁN GAIA', desc: 'Accede a tu Dashboard de impacto y métricas.', color: 'border-red-500', glow: 'shadow-red-500/40' },
];

export const GuardianJourney = () => {
  return (
    <div className="w-full max-w-[1400px] mx-auto py-20 px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[0.1em] uppercase mb-4">Tu Viaje como Guardián Gaia</h2>
        <p className="text-blue-400 text-sm tracking-widest uppercase opacity-80">Un camino de conciencia, compromiso y acción</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-8">
        {STEPS.map((step) => (
          <div key={step.id} className="flex flex-col items-center group">
            {/* Círculo Pro con Glow */}
            <div className={`
              w-20 h-20 rounded-full border-2 flex items-center justify-center mb-6
              text-2xl font-bold text-white transition-all duration-700
              ${step.color} ${step.glow} bg-slate-900/40 backdrop-blur-md
              group-hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.5)]
            `}>
              {step.id}
            </div>
            
            {/* Títulos y Descripción del Modelo PRO */}
            <h3 className="text-[11px] font-black tracking-[0.2em] text-white mb-3 uppercase text-center">
              {step.title}
            </h3>
            <p className="text-[9px] text-slate-400 leading-relaxed text-center mb-4 px-2 h-12">
              {step.desc}
            </p>

            {/* Botón de Estado */}
            <button className="px-4 py-1.5 rounded-full border border-slate-800 bg-slate-950/80 group-hover:border-slate-600 transition-colors">
              <span className="text-[8px] font-bold text-slate-500 tracking-[0.2em] uppercase">
                ○ Pendiente ○
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
