import React from 'react';
import { Library } from 'lucide-react';

// Clean vector logo mark for BookStache (Book + Moustache motif)
export function BookStacheLogo({ className = "w-8 h-8", color = "#3D2314" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Book base */}
      <path
        d="M20 28C20 28 35 22 50 28C65 22 80 28 80 28V72C80 72 65 66 50 72C35 66 20 72 20 72V28Z"
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center spine */}
      <path d="M50 28V72" stroke={color} strokeWidth="5" strokeLinecap="round" />
      {/* Book pages accent lines */}
      <path d="M28 38C35 34 43 36 43 36" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <path d="M72 38C65 34 57 36 57 36" stroke={color} strokeWidth="4" strokeLinecap="round" />
      {/* Moustache emblem below book spine */}
      <path
        d="M50 77C44 72 34 72 28 78C26 80 28 83 31 82C37 80 43 82 48 85C49 85.5 51 85.5 52 85C57 82 63 80 69 82C72 83 74 80 72 78C66 72 56 72 50 77Z"
        fill={color}
      />
    </svg>
  );
}

export default function Header({ libraryCount, onOpenLibrary }) {
  return (
    <header className="w-full max-w-lg mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 z-10">
      {/* Top Left Library Icon Button */}
      <button
        onClick={onOpenLibrary}
        style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
        className="group relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 border rounded-2xl transition-transform active:scale-95 cursor-pointer shadow-2xs shrink-0"
        aria-label="Knihovna"
      >
        <Library className="w-4 h-4 shrink-0" style={{ color: '#5C3A24' }} />
        <span className="font-bold text-xs sm:text-sm tracking-wide">Knihovna</span>
        {libraryCount > 0 && (
          <span style={{ backgroundColor: '#5C3A24', color: '#FFFDF9' }} className="flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-black rounded-full shrink-0">
            {libraryCount}
          </span>
        )}
      </button>

      {/* Clean Vector Header Branding */}
      <div
        style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border rounded-2xl shadow-2xs shrink-0"
      >
        <BookStacheLogo className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" color="#3D2314" />
        <span style={{ color: '#3D2314' }} className="text-sm sm:text-base font-black tracking-tight font-serif whitespace-nowrap">
          Book<span style={{ color: '#5C3A24' }}>Stache</span>
        </span>
      </div>
    </header>
  );
}
