import React from 'react';
import { Scan, Keyboard, Sparkles } from 'lucide-react';

export default function MainScreen({ onStartScan, onOpenManualInput, libraryCount }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 max-w-lg mx-auto w-full">
      {/* Top Greeting / Info */}
      <div className="text-center mt-2 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-semibold text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skenování čárových kódů & ISBN</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white pt-2">
          Přidejte knihy do své sbírky
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Zamiřte fotoaparát na čárový kód knihy a okamžitě získejte všechny informace.
        </p>
      </div>

      {/* Central Big Scan Button */}
      <div className="my-auto py-8 flex flex-col items-center justify-center relative">
        {/* Animated Glow Rings */}
        <div className="absolute w-64 h-64 bg-amber-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />
        <div className="absolute w-48 h-48 bg-amber-500/20 rounded-full blur-xl pointer-events-none" />

        <button
          onClick={onStartScan}
          className="relative group w-52 h-52 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-3 border-4 border-amber-300/40"
        >
          <div className="p-4 bg-slate-950/10 rounded-full group-hover:scale-110 transition-transform">
            <Scan className="w-12 h-12 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-2xl tracking-wider font-extrabold uppercase">
            NASKENOVAT
          </span>
        </button>
      </div>

      {/* Secondary Actions & Info */}
      <div className="w-full space-y-3 mb-2">
        <button
          onClick={onOpenManualInput}
          className="w-full py-4 px-5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-2xl shadow-lg font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
        >
          <Keyboard className="w-5 h-5 text-amber-400" />
          <span>Zadat ISBN ručně</span>
        </button>

        {/* Footer Hint */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Všechna data jsou bezpečně uložena lokálně ve vašem zařízení.
          </p>
        </div>
      </div>
    </div>
  );
}
