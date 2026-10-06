import React from 'react';
import { Library } from 'lucide-react';

// Custom SVG Icon for Book + Moustache logo identity:
// Features a clear closed book (leather cover, spine, gold corners, page edges) with a prominent brown moustache that protrudes past BOTH sides of the book.
export function BookStacheLogo({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 140 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* CLOSED BOOK SVG REPRESENTATION */}
      {/* Book Cover (Warm Rich Leather Brown) */}
      <rect x="35" y="15" width="70" height="70" rx="6" fill="#3a2312" stroke="#d97706" strokeWidth="3" />
      {/* Book Spine (Left Side) */}
      <rect x="35" y="15" width="12" height="70" rx="3" fill="#24150a" stroke="#b45309" strokeWidth="2" />
      {/* Spine Gold Ribs */}
      <line x1="36" y1="30" x2="46" y2="30" stroke="#fbbf24" strokeWidth="1.5" />
      <line x1="36" y1="50" x2="46" y2="50" stroke="#fbbf24" strokeWidth="1.5" />
      <line x1="36" y1="70" x2="46" y2="70" stroke="#fbbf24" strokeWidth="1.5" />

      {/* Book Pages Edge (Right Side) */}
      <path d="M99 22 L101 22 L101 78 L99 78 Z" fill="#fef3c7" />
      <line x1="98" y1="20" x2="98" y2="80" stroke="#d97706" strokeWidth="1.5" />

      {/* Book Decorative Gold Corners */}
      <path d="M52 24 L60 24 M52 24 L52 32" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 76 L60 76 M52 76 L52 68" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 24 L84 24 M92 24 L92 32" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 76 L84 76 M92 76 L92 68" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />

      {/* PROMINENT BROWN MOUSTACHE EXTENDING PAST BOTH SIDES OF THE BOOK */}
      {/* Left wing goes to x=5 (far left past book edge at x=35) */}
      {/* Right wing goes to x=135 (far right past book edge at x=105) */}
      <path
        d="M70 42
           C55 24, 15 26, 2 48
           C18 68, 48 68, 68 54
           C88 68, 122 68, 138 48
           C125 26, 85 24, 70 42 Z"
        fill="#522a0a"
        stroke="#fcd34d"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Internal Moustache Detail Curves */}
      <path
        d="M70 45 C58 35 25 35 12 48"
        stroke="#3a1c06"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M70 45 C82 35 115 35 128 48"
        stroke="#3a1c06"
        strokeWidth="2"
        strokeLinecap="round"
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
        style={{ backgroundColor: '#2e180d', borderColor: '#b45309', color: '#fef3c7' }}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 border rounded-2xl shadow-md transition-transform active:scale-95 cursor-pointer"
        aria-label="Knihovna"
      >
        <Library className="w-5 h-5" style={{ color: '#fbbf24' }} />
        <span className="font-bold text-sm tracking-wide">Knihovna</span>
        {libraryCount > 0 && (
          <span style={{ backgroundColor: '#d97706', color: '#1c1917' }} className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black rounded-full shadow">
            {libraryCount}
          </span>
        )}
      </button>

      {/* App Branding Title & Closed Book + Moustache Logo */}
      <div className="flex items-center gap-2.5">
        <div style={{ backgroundColor: '#2e180d', borderColor: '#b45309' }} className="p-1.5 rounded-2xl border shadow-inner flex items-center justify-center">
          <BookStacheLogo className="w-10 h-8" />
        </div>
        <span style={{ color: '#fef3c7' }} className="text-xl font-black tracking-tight font-serif">
          Book<span style={{ color: '#d97706' }}>Stache</span>
        </span>
      </div>
    </header>
  );
}
