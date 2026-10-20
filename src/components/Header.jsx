import React from 'react';
import { Library } from 'lucide-react';

// Clean vector logo mark for BookStache (Book + Moustache motif)
export function BookStacheLogo({ className = "w-10 h-10", color = "#3D2314" }) {
  const maskId = React.useId();
  return (
    <svg className={className} viewBox="-50 -45 160 145" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-70" y="-60" width="180" height="150">
          <image
            href="./mustacheforbookstache.png"
            x="-50"
            y="-45"
            width="140"
            height="100"
            preserveAspectRatio="xMidYMid meet"
            transform="rotate(-28 20 5)"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </mask>
      </defs>

      {/* Dramatically larger moustache emblem angled diagonally in book's upper-left corner */}
      <rect
        x="-70"
        y="-60"
        width="180"
        height="150"
        fill={color}
        mask={`url(#${maskId})`}
      />

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
        <BookStacheLogo className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" color="#3D2314" />
        <span style={{ color: '#3D2314' }} className="text-sm sm:text-base font-black tracking-tight font-serif whitespace-nowrap">
          Book<span style={{ color: '#5C3A24' }}>Stache</span>
        </span>
      </div>
    </header>
  );
}
