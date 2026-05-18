import React from 'react';

export const PlanetHealth = () => {
  return (
    <div className="flex flex-col p-6 bg-slate-900/20 backdrop-blur-md rounded-2xl border border-white/5 h-full justify-center">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase">En Vivo</span>
      </div>

      <div className="mb-8">
        <h3 className="text-slate-400 text-[10px] font-bold tracking-[0.2em] mb-2 uppercase">Salud Planetaria</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black text-blue-500 tracking-tighter">62%</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-amber-500 text-[11px] font-black tracking-widest uppercase mb-1">Estado: Inestable</h4>
          <p className="text-slate-400 text-[10px] leading-relaxed">
            Sistema Tierra: fiebre metabólica aprox. de +1.1°C respecto al periodo preindustrial.
          </p>
        </div>

        <button className="w-full py-3 px-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-lg transition-all group">
          <span className="text-[9px] font-black text-blue-400 group-hover:text-blue-300 tracking-[0.2em] uppercase">
            Ver Análisis Completo →
          </span>
        </button>
      </div>
    </div>
  );
};
