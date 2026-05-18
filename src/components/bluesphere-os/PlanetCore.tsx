import React from 'react';

export const PlanetCore = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[400px]">
      {/* Resplandor Atmosférico de Fondo */}
      <div className="absolute w-[80%] h-[80%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      
      {/* Contenedor del Globo 3D */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] flex items-center justify-center overflow-hidden bg-slate-950">
        
        {/* Placeholder del Planeta (Aquí irá Three.js) */}
        <div className="text-center p-8">
          <div className="text-blue-400 text-[10px] tracking-[0.3em] font-black uppercase mb-4">Motor Neural Gaia</div>
          <div className="w-16 h-16 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-[9px] uppercase tracking-widest">Renderizando Biósfera en Tiempo Real...</p>
        </div>

        {/* Capas de Interfaz Orbital */}
        <div className="absolute inset-0 border-[0.5px] border-blue-400/10 rounded-full scale-90" />
        <div className="absolute inset-0 border-[0.5px] border-blue-400/5 rounded-full scale-75 rotate-45" />
      </div>

      {/* Etiquetas Flotantes (UI Decorativa) */}
      <div className="absolute top-10 right-10 border-l border-blue-500 pl-3">
        <span className="block text-[8px] text-blue-400 font-bold uppercase tracking-tighter">Latitud: 0.000</span>
        <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Longitud: 0.000</span>
      </div>
    </div>
  );
};
