import React from 'react';
import { Library, BookMarked } from 'lucide-react';

export default function Header({ libraryCount, onOpenLibrary }) {
  return (
    <header className="w-full max-w-lg mx-auto px-4 py-4 flex items-center justify-between z-10">
      {/* Top Left Library Icon Button */}
      <button
        onClick={onOpenLibrary}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-2xl shadow-md transition-all active:scale-95"
        aria-label="Knihovna"
      >
        <Library className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-sm">Knihovna</span>
        {libraryCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-slate-950 bg-amber-400 rounded-full">
            {libraryCount}
          </span>
        )}
      </button>

      {/* App Branding Title */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-amber-500/20 rounded-xl border border-amber-500/30">
          <BookMarked className="w-5 h-5 text-amber-400" />
        </div>
        <span className="text-xl font-black tracking-tight text-white">
          Book<span className="text-amber-400">Stache</span>
        </span>
      </div>
    </header>
  );
}
