import React from 'react';
import { Library } from 'lucide-react';

// Clean vector logo mark for BookStache (Closed Book viewed from side + Moustache motif)
export function BookStacheLogo({ className = "w-8 h-8", color = "#3D2314" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Closed Book - Top Page Block Edge (Cream / Highlighted top of closed pages) */}
      <path
        d="M 37.5 21 C 45 18, 55 18, 57.5 21 L 57.5 25.5 C 55 22.5, 45 22.5, 37.5 25.5 Z"
        fill="#FAF6F0"
        opacity="0.9"
      />

      {/* Closed Book - Top spine arc cap */}
      <path
        d="M 37.5 21 C 36 21.5, 34.5 23, 34.5 25.5 C 34.5 28, 36 29.5, 37.5 30 L 57.5 25.5 L 57.5 21 Z"
        fill={color}
      />

      {/* Spine / Spine Curve (Left side) */}
      <path
        d="M 34.5 25.5 L 34.5 68.5 C 34.5 71, 36 72.5, 37.5 73 L 37.5 30 C 36 29.5, 34.5 28, 34.5 25.5 Z"
        fill={color}
        opacity="0.85"
      />

      {/* Main Front Cover (Perspective Closed Book) */}
      <path
        d="M 37.5 30 L 61.5 24.5 C 62.8 24.2, 64 25.2, 64 26.5 L 64 69.5 C 64 70.8, 62.8 71.8, 61.5 72.1 L 37.5 77.5 Z"
        fill={color}
      />

      {/* Inner Page Edges (Side view block of closed pages behind front cover) */}
      <path
        d="M 37.5 25.5 L 57.5 21 C 58.8 20.7, 60 21.7, 60 23 L 60 66 C 60 67.3, 58.8 68.3, 57.5 68.6 L 37.5 73 Z"
        fill="#FAF6F0"
        opacity="0.95"
      />

      {/* Front Cover Plate (Re-rendered over page block) */}
      <path
        d="M 37.5 30 L 61.5 24.5 C 62.8 24.2, 64 25.2, 64 26.5 L 64 69.5 C 64 70.8, 62.8 71.8, 61.5 72.1 L 37.5 77.5 Z"
        fill={color}
      />

      {/* Mustachioed Emblem Extending Past Both Edges at Bottom */}
      <path
        d="M 50 63
           C 46 58, 38 56, 28 62
           C 20 67, 18 73, 21 76
           C 23.5 78.5, 27 77, 29 74.5
           C 33 69.5, 41 68.5, 48 74
           C 49.2 75, 50.8 75, 52 74
           C 59 68.5, 67 69.5, 71 74.5
           C 73 77, 76.5 78.5, 79 76
           C 82 73, 80 67, 72 62
           C 62 56, 54 58, 50 63 Z"
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
