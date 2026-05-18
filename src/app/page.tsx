import React from 'react';
import { OrbitalNavbar } from '../components/bluesphere-os/OrbitalNavbar';
import { GuardianJourney } from '../components/bluesphere-os/GuardianJourney';
import { PlanetCore } from '../components/bluesphere-os/PlanetCore';
import { PlanetHealth } from '../components/bluesphere-os/PlanetHealth';
import { LiveMetrics } from '../components/bluesphere-os/LiveMetrics';

export default function BlueSphereOSV2() {
  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <OrbitalNavbar />

      <div className="pt-28 pb-12 px-6 max-w-[1600px] mx-auto space-y-12">
        <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
          <GuardianJourney />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-3 h-full">
            <PlanetHealth />
          </div>

          <div className="lg:col-span-6 flex justify-center items-center">
            <PlanetCore />
          </div>

          <div className="lg:col-span-3 space-y-6 text-right hidden lg:block">
            <div className="border-r-2 border-blue-500 pr-4">
              <h2 className="text-2xl font-black tracking-tighter text-blue-400 uppercase leading-none">
                Protocolo de<br/>Homeostasis
              </h2>
              <p className="text-[10px] text-slate-500 tracking-[0.3em] font-bold mt-2 uppercase">
                Ziriux Inc. System
              </p>
            </div>
            <p className="text-[9px] text-slate-400 leading-relaxed tracking-widest uppercase pl-10">
              Monitoreo biophysical de la Tierra en tiempo real para la regeneración planetaria.
            </p>
          </div>
        </div>

        <section className="pt-8">
          <LiveMetrics />
        </section>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-red-600 opacity-30" />
    </main>
  );
}
