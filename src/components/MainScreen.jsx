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

      {/* Top Greeting / Header Section */}
      <div className="text-center mt-2 space-y-2 w-full z-10">
        <div
          style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#5C3A24' }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 border rounded-full text-xs font-bold shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#5C3A24' }} />
          <span>Skenování čárových kódů & ISBN</span>
        </div>
        <h1 style={{ color: '#3D2314' }} className="text-2xl sm:text-3xl font-black font-serif pt-1 tracking-tight">
          Přidejte knihy do své sbírky
        </h1>
        <p style={{ color: '#5C3A24' }} className="text-xs max-w-xs mx-auto font-medium leading-relaxed">
          Zamiřte fotoaparát na čárový kód knihy a okamžitě získejte všechny informace.
        </p>
      </div>

      {/* Redesigned Scan Button: Muted Cocoa Brown Squircle Card */}
      <div className="my-auto py-6 flex flex-col items-center justify-center w-full z-10">
        <button
          onClick={onStartScan}
          style={{
            backgroundColor: '#4A2E1B',
            borderColor: '#3D2314',
            color: '#FAF6F0'
          }}
          className="relative group w-full max-w-[280px] h-48 sm:h-52 rounded-3xl font-black transition-transform active:scale-[0.97] flex flex-col items-center justify-center gap-3 border-2 shadow-xl cursor-pointer overflow-hidden p-6"
        >
          {/* Decorative Corner Accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#8C593B]/40 rounded-tl-md" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#8C593B]/40 rounded-tr-md" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#8C593B]/40 rounded-bl-md" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#8C593B]/40 rounded-br-md" />

          {/* Clean Vector Emblem */}
          <BookStacheLogo className="w-20 h-20 sm:w-24 sm:h-24 group-hover:scale-105 transition-transform" color="#FAF6F0" />

          <div className="text-center space-y-0.5">
            <span style={{ color: '#FAF6F0' }} className="text-2xl tracking-wider font-black uppercase font-serif block">
              NASKENOVAT
            </span>
            <span style={{ color: '#F2E8D8' }} className="text-[11px] font-bold uppercase tracking-widest block opacity-90">
              Fotoaparát
            </span>
          </div>
        </button>
      </div>

      {/* Secondary Actions & Info */}
      <div className="w-full space-y-3 mb-2 z-10">
        <button
          onClick={onOpenManualInput}
          style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
          className="w-full py-3.5 px-5 border rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
        >
          <Keyboard className="w-4 h-4" style={{ color: '#5C3A24' }} />
          <span>Zadat ISBN ručně</span>
        </button>

        {/* Footer Hint */}
        <div className="text-center pt-1">
          <p style={{ color: '#8C593B' }} className="text-[11px] font-medium">
            Všechna data jsou bezpečně uložena lokálně ve vašem zařízení.
          </p>
        </div>
      </div>
    </div>
  );
}
