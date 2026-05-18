import React from 'react';

const METRICS = [
  { label: 'CO2 EN AIRE', value: '429 ppm', status: 'Advertencia', color: 'text-amber-500', glow: 'shadow-amber-500/20' },
  { label: 'TEMPERATURA', value: '+1.1 °C', status: 'Advertencia', color: 'text-amber-500', glow: 'shadow-amber-500/20' },
  { label: 'HIELO', value: '4.3 M km²', status: 'Estable', color: 'text-emerald-500', glow: 'shadow-emerald-500/20' },
  { label: 'NIVEL DEL MAR', value: '104.5 mm', status: 'Advertencia', color: 'text-amber-500', glow: 'shadow-amber-500/20' },
  { label: 'OCÉANO (pH)', value: '2.1 pH', status: 'Crítico', color: 'text-red-500', glow: 'shadow-red-500/20' },
  { label: 'BIODIVERSIDAD', value: '-73 %', status: 'Crítico', color: 'text-red-500', glow: 'shadow-red-500/20' },
  { label: 'AGUA DULCE', value: 'Descenso', status: 'Advertencia', color: 'text-amber-500', glow: 'shadow-amber-500/20' },
];

export const LiveMetrics = () => {
  return (
    <div className="w-full bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-white text-[10px] font-black tracking-[0.3em] uppercase">Indicadores Planetarios Clave</h3>
        <span className="text-blue-400 text-[9px] font-bold tracking-widest cursor-pointer hover:text-blue-300 transition-colors uppercase">Ver Todos →</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {METRICS.map((m, i) => (
          <div key={i} className={`flex flex-col items-center p-4 rounded-xl border border-white/5 bg-slate-900/20 transition-all hover:bg-slate-900/40 ${m.glow}`}>
            <span className="text-slate-400 text-[8px] font-bold tracking-tighter mb-3 uppercase text-center h-4">{m.label}</span>
            <span className="text-white text-lg font-mono mb-2">{m.value}</span>
            <span className={`text-[8px] font-black uppercase tracking-widest ${m.color}`}>{m.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex justify-center italic text-slate-500">
        <p className="text-[10px] tracking-widest text-center">
          <span className="text-blue-500/60 font-serif text-lg mr-2">“</span>
          La conciencia es la nueva civilización.
          <span className="ml-2 text-slate-600 font-bold">— BlueSphere Consciousness</span>
        </p>
      </div>
    </div>
  );
};
