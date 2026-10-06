import React from 'react';
import { Library } from 'lucide-react';

// Custom SVG Icon for Book + Moustache logo identity
export function BookStacheLogo({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Open Book Pages Background */}
      <path
        d="M15 28C15 28 32 20 50 28C68 20 85 28 85 28V72C85 72 68 64 50 72C32 64 15 72 15 72V28Z"
        className="fill-amber-900/30 stroke-amber-500"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M50 28V72"
        className="stroke-amber-500"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Classic Moustache Overlay */}
      <path
        d="M50 56C42 48 24 48 18 56C24 64 38 64 50 58C62 64 76 64 82 56C76 48 58 48 50 56Z"
        className="fill-amber-500 stroke-amber-300"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function Header({ libraryCount, onOpenLibrary }) {
  return (
    <header className="w-full max-w-lg mx-auto px-4 py-4 flex items-center justify-between z-10">
      {/* Top Left Library Icon Button */}
      <button
        onClick={onOpenLibrary}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-100 border border-amber-700/50 rounded-2xl shadow-md transition-all active:scale-95 backdrop-blur-sm"
        aria-label="Knihovna"
      >
        <Library className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-sm tracking-wide">Knihovna</span>
        {libraryCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black text-amber-950 bg-amber-400 rounded-full shadow">
            {libraryCount}
          </span>
        )}
      </button>

      {/* App Branding Title & Moustache Logo */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-amber-900/40 rounded-2xl border border-amber-600/40 shadow-inner flex items-center justify-center">
          <BookStacheLogo className="w-6 h-6" />
        </div>
        <span className="text-xl font-black tracking-tight text-amber-100 font-serif">
          Book<span className="text-amber-400">Stache</span>
        </span>
      </div>
    </header>
  );
}
