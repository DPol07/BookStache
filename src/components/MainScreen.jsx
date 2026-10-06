import React from 'react';
import { Keyboard, Sparkles } from 'lucide-react';
import { BookStacheLogo } from './Header';

export default function MainScreen({ onStartScan, onOpenManualInput, libraryCount }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 py-6 max-w-lg mx-auto w-full">
      {/* Top Greeting / Info */}
      <div className="text-center mt-2 space-y-1.5 w-full">
        <div
          style={{ backgroundColor: '#EAE1D3', borderColor: '#D97706', color: '#5C3A24' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-xs font-bold"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#C26200' }} />
          <span>Skenování čárových kódů & ISBN</span>
        </div>
        <h1 style={{ color: '#3D2314' }} className="text-2xl sm:text-3xl font-black font-serif pt-2 tracking-tight">
          Přidejte knihy do své sbírky
        </h1>
        <p style={{ color: '#5C3A24' }} className="text-xs max-w-xs mx-auto font-medium">
          Zamiřte fotoaparát na čárový kód knihy a okamžitě získejte všechny informace.
        </p>
      </div>

      {/* Central Big Scan Button in Warm Caramel */}
      <div className="my-auto py-8 flex flex-col items-center justify-center relative">
        <button
          onClick={onStartScan}
          style={{
            backgroundColor: '#D97706',
            borderColor: '#3D2314',
            color: '#FFFDF9'
          }}
          className="relative group w-56 h-56 rounded-full font-black transition-transform active:scale-95 flex flex-col items-center justify-center gap-2 border-4 cursor-pointer"
        >
          {/* Logo symbol on central button */}
          <BookStacheLogo className="w-16 h-16 group-hover:scale-105 transition-transform" />

          <span style={{ color: '#FFFDF9' }} className="text-2xl tracking-wider font-black uppercase font-serif">
            NASKENOVAT
          </span>
          <span style={{ color: '#3D2314' }} className="text-[10px] font-extrabold uppercase tracking-widest -mt-1">
            Fotoaparát
          </span>
        </button>
      </div>

      {/* Secondary Actions & Info */}
      <div className="w-full space-y-3 mb-2">
        <button
          onClick={onOpenManualInput}
          style={{ backgroundColor: '#EAE1D3', borderColor: '#D97706', color: '#3D2314' }}
          className="w-full py-4 px-5 border rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Keyboard className="w-5 h-5" style={{ color: '#C26200' }} />
          <span>Zadat ISBN ručně</span>
        </button>

        {/* Footer Hint */}
        <div className="text-center pt-2">
          <p style={{ color: '#8C593B' }} className="text-[11px] font-medium">
            Všechna data jsou bezpečně uložena lokálně ve vašem zařízení.
          </p>
        </div>
      </div>
    </div>
  );
}
