import React from 'react';
import { Scan, Keyboard, Sparkles } from 'lucide-react';

export default function MainScreen({ onStartScan, onOpenManualInput, libraryCount }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 max-w-lg mx-auto w-full">
      {/* Top Greeting / Info */}
      <div className="text-center mt-2 space-y-1.5 w-full">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-900/40 border border-amber-600/40 rounded-full text-xs font-bold text-amber-300 shadow-sm backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Skenování čárových kódů & ISBN</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-amber-100 font-serif pt-2 tracking-tight">
          Přidejte knihy do své sbírky
        </h1>
        <p className="text-xs text-amber-200/70 max-w-xs mx-auto font-medium">
          Zamiřte fotoaparát na čárový kód knihy a okamžitě získejte všechny informace.
        </p>
      </div>

      {/* Central Big Scan Button in Warm Caramel */}
      <div className="my-auto py-8 flex flex-col items-center justify-center relative">
        {/* Warm Caramel Glow Background */}
        <div className="absolute w-64 h-64 bg-amber-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute w-48 h-48 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onStartScan}
          className="relative group w-52 h-52 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-amber-950 font-black shadow-2xl shadow-amber-950/60 hover:shadow-amber-600/50 transition-all duration-300 active:scale-95 flex flex-col items-center justify-center gap-2.5 border-4 border-amber-300/50"
        >
          {/* Moustache Icon Accent on Scan Button */}
          <svg viewBox="0 0 100 100" className="w-12 h-12 fill-amber-950 stroke-amber-950 group-hover:scale-110 transition-transform" strokeWidth="2">
            <path d="M50 50C42 42 24 42 18 50C24 58 38 58 50 52C62 58 76 58 82 50C76 42 58 42 50 50Z" />
          </svg>

          <span className="text-2xl tracking-wider font-black uppercase text-amber-950 font-serif">
            NASKENOVAT
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900/90 -mt-1">
            Fotoaparát
          </span>
        </button>
      </div>

      {/* Secondary Actions & Info */}
      <div className="w-full space-y-3 mb-2">
        <button
          onClick={onOpenManualInput}
          className="w-full py-4 px-5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-100 border border-amber-700/50 rounded-2xl shadow-lg font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 backdrop-blur-sm"
        >
          <Keyboard className="w-5 h-5 text-amber-400" />
          <span>Zadat ISBN ručně</span>
        </button>

        {/* Footer Hint */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-amber-200/50 font-medium">
            Všechna data jsou bezpečně uložena lokálně ve vašem zařízení.
          </p>
        </div>
      </div>
    </div>
  );
}
