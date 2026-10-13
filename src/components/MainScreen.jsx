import React from 'react';
import { Keyboard, Sparkles } from 'lucide-react';
import { BookStacheLogo } from './Header';

export default function MainScreen({ onStartScan, onOpenManualInput, libraryCount }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 py-4 max-w-lg mx-auto w-full relative overflow-hidden">
      {/* Subtle Book-Spine Graphic Background Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center -z-0">
        <svg width="340" height="340" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 40H85C95 40 100 45 100 55V170C100 160 92 155 82 155H30V40Z" stroke="#3D2314" strokeWidth="3" />
          <path d="M170 40H115C105 40 100 45 100 55V170C100 160 108 155 118 155H170V40Z" stroke="#3D2314" strokeWidth="3" />
          <line x1="45" y1="65" x2="75" y2="65" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" />
          <line x1="45" y1="85" x2="75" y2="85" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" />
          <line x1="125" y1="65" x2="155" y2="65" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" />
          <line x1="125" y1="85" x2="155" y2="85" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Top Greeting / Info */}
      <div className="text-center mt-1 space-y-1 w-full z-10">
        <div
          style={{ backgroundColor: '#F2E8D8', borderColor: '#D97706', color: '#5C3A24' }}
          className="inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-bold"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#D97706' }} />
          <span>Skenování čárových kódů & ISBN</span>
        </div>
        <h1 style={{ color: '#3D2314' }} className="text-2xl sm:text-3xl font-black font-serif pt-1.5 tracking-tight">
          Přidejte knihy do své sbírky
        </h1>
        <p style={{ color: '#5C3A24' }} className="text-xs max-w-xs mx-auto font-medium">
          Zamiřte fotoaparát na čárový kód knihy a okamžitě získejte všechny informace.
        </p>
      </div>

      {/* Central Big Scan Button - Balanced Proportions */}
      <div className="my-auto py-4 flex flex-col items-center justify-center relative z-10">
        <button
          onClick={onStartScan}
          style={{
            backgroundColor: '#A35212',
            borderColor: '#3D2314',
            color: '#FFFDF9'
          }}
          className="relative group w-52 h-52 sm:w-56 sm:h-56 rounded-full font-black transition-transform active:scale-95 flex flex-col items-center justify-center gap-2 border-4 shadow-md cursor-pointer"
        >
          {/* Logo symbol on central button */}
          <BookStacheLogo className="w-16 h-16 group-hover:scale-105 transition-transform" />

          <span style={{ color: '#FFFDF9' }} className="text-2xl sm:text-2xl tracking-wider font-black uppercase font-serif">
            NASKENOVAT
          </span>
          <span style={{ color: '#F2E8D8' }} className="text-[10px] font-extrabold uppercase tracking-widest -mt-0.5">
            Fotoaparát
          </span>
        </button>
      </div>

      {/* Secondary Actions & Info */}
      <div className="w-full space-y-3 mb-2">
        <button
          onClick={onOpenManualInput}
          style={{ backgroundColor: '#F2E8D8', borderColor: '#D97706', color: '#3D2314' }}
          className="w-full py-4 px-5 border rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Keyboard className="w-5 h-5" style={{ color: '#D97706' }} />
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
