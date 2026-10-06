import React from 'react';
import { Scan, Keyboard, Sparkles } from 'lucide-react';
import { BookStacheLogo } from './Header';

export default function MainScreen({ onStartScan, onOpenManualInput, libraryCount }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 max-w-lg mx-auto w-full">
      {/* Top Greeting / Info */}
      <div className="text-center mt-2 space-y-1.5 w-full">
        <div
          style={{ backgroundColor: '#2e180d', borderColor: '#78350f', color: '#fcd34d' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-xs font-bold shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
          <span>Skenování čárových kódů & ISBN</span>
        </div>
        <h1 style={{ color: '#fef3c7' }} className="text-2xl sm:text-3xl font-black font-serif pt-2 tracking-tight">
          Přidejte knihy do své sbírky
        </h1>
        <p style={{ color: '#fde68a' }} className="text-xs max-w-xs mx-auto font-medium opacity-90">
          Zamiřte fotoaparát na čárový kód knihy a okamžitě získejte všechny informace.
        </p>
      </div>

      {/* Central Big Scan Button in Warm Caramel */}
      <div className="my-auto py-8 flex flex-col items-center justify-center relative">
        {/* Soft Warm Glow Background */}
        <div style={{ backgroundColor: '#d97706', opacity: 0.15 }} className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onStartScan}
          style={{
            backgroundColor: '#d97706',
            borderColor: '#fcd34d',
            color: '#1c1917',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          }}
          className="relative group w-56 h-56 rounded-full font-black transition-transform active:scale-95 flex flex-col items-center justify-center gap-2 border-4 cursor-pointer"
        >
          {/* Logo with Closed Book + Protruding Brown Moustache on the central button */}
          <BookStacheLogo className="w-20 h-16 group-hover:scale-105 transition-transform" />

          <span style={{ color: '#1c1917' }} className="text-2xl tracking-wider font-black uppercase font-serif">
            NASKENOVAT
          </span>
          <span style={{ color: '#451a03' }} className="text-[10px] font-extrabold uppercase tracking-widest -mt-1">
            Fotoaparát
          </span>
        </button>
      </div>

      {/* Secondary Actions & Info */}
      <div className="w-full space-y-3 mb-2">
        <button
          onClick={onOpenManualInput}
          style={{ backgroundColor: '#2e180d', borderColor: '#b45309', color: '#fef3c7' }}
          className="w-full py-4 px-5 border rounded-2xl shadow-lg font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Keyboard className="w-5 h-5" style={{ color: '#fbbf24' }} />
          <span>Zadat ISBN ručně</span>
        </button>

        {/* Footer Hint */}
        <div className="text-center pt-2">
          <p style={{ color: '#fde68a' }} className="text-[11px] font-medium opacity-75">
            Všechna data jsou bezpečně uložena lokálně ve vašem zařízení.
          </p>
        </div>
      </div>
    </div>
  );
}
