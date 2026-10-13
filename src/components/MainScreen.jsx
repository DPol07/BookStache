import React from 'react';
import { ArrowRight, Keyboard, Sparkles } from 'lucide-react';
import { BookStacheLogo } from './Header';

export default function MainScreen({ onStartScan, onOpenManualInput }) {
  return (
    <main className="flex-1 flex flex-col items-center px-5 pt-5 pb-6 max-w-lg mx-auto w-full">
      <div className="text-center space-y-4 pt-2">
        <div
          style={{ backgroundColor: '#F3ECE3', borderColor: '#E1D6C8', color: '#665445' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 border rounded-full text-xs font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#806858' }} />
          <span>Skenování čárových kódů & ISBN</span>
        </div>
        <h1 style={{ color: '#40352D' }} className="text-[2rem] leading-tight sm:text-4xl font-bold font-serif tracking-tight">
          Přidejte knihy do své sbírky
        </h1>
        <p style={{ color: '#75685D' }} className="text-sm leading-relaxed max-w-xs mx-auto">
          Zamiřte fotoaparát na čárový kód knihy a okamžitě získejte všechny informace.
        </p>
      </div>

      <div className="flex-1 flex w-full items-center justify-center py-8">
        <button
          onClick={onStartScan}
          style={{
            backgroundColor: '#806858',
            borderColor: '#735C4B',
            color: '#FFF9F1',
            boxShadow: '0 12px 28px rgba(76, 56, 42, 0.16), inset 0 1px 0 rgba(255, 249, 241, 0.18)'
          }}
          className="group w-full max-w-[320px] min-h-[112px] rounded-[28px] border px-5 py-4 flex items-center gap-4 text-left transition-all active:scale-[0.98] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D8C9B8] cursor-pointer"
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px]" style={{ backgroundColor: '#F3ECE3' }}>
            <BookStacheLogo className="h-11 w-11" ink="#695647" accent="#9A846F" />
          </span>
          <span className="flex-1 flex flex-col gap-1">
            <span className="font-serif text-xl font-bold tracking-wide">Naskenovat</span>
            <span className="text-xs font-medium tracking-wide" style={{ color: '#F0E7DD' }}>Čárový kód knihy</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 opacity-80 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onOpenManualInput}
          style={{ backgroundColor: '#F3ECE3', borderColor: '#E1D6C8', color: '#514337' }}
          className="w-full py-4 px-5 border rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Keyboard className="w-5 h-5" style={{ color: '#806858' }} />
          <span>Zadat ISBN ručně</span>
        </button>

        <p className="text-center pt-1 text-[11px] font-medium" style={{ color: '#88796C' }}>
          Všechna data jsou bezpečně uložena lokálně ve vašem zařízení.
        </p>
      </div>
    </main>
  );
}
