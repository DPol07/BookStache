import React from 'react';
import { Library } from 'lucide-react';

// Custom SVG Icon for Book + Moustache logo identity:
// Features a closed book with a prominent brown moustache that extends past the book on both sides.
export function BookStacheLogo({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 120 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Closed Book Body (Vintage Leather Cover) */}
      <rect x="25" y="20" width="70" height="60" rx="6" fill="#3a2312" stroke="#d97706" strokeWidth="3" />
      {/* Book Spine Accent Line */}
      <rect x="25" y="20" width="10" height="60" rx="3" fill="#24150a" stroke="#b45309" strokeWidth="2" />
      {/* Page Edge Lines on Right Side */}
      <line x1="90" y1="26" x2="90" y2="74" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" />
      <line x1="93" y1="28" x2="93" y2="72" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      {/* Book Cover Decorative Gold Corner Lines */}
      <path d="M40 28 L48 28 M40 28 L40 36" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 72 L48 72 M40 72 L40 64" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />

      {/* Prominent Brown Moustache sticking out on both left & right sides past the book edges */}
      <path
        d="M60 48 C48 32 10 35 2 52 C12 66 38 66 58 54 C78 66 108 66 118 52 C110 35 72 32 60 48 Z"
        fill="#522a0a"
        stroke="#d97706"
        strokeWidth="2.5"
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
        style={{ backgroundColor: 'rgba(69, 26, 3, 0.6)', borderColor: 'rgba(180, 83, 9, 0.6)', color: '#fef3c7' }}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 border rounded-2xl shadow-md transition-all active:scale-95 backdrop-blur-sm"
        aria-label="Knihovna"
      >
        <Library className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-sm tracking-wide">Knihovna</span>
        {libraryCount > 0 && (
          <span style={{ backgroundColor: '#d97706', color: '#1c1917' }} className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black rounded-full shadow">
            {libraryCount}
          </span>
        )}
      </button>

      {/* App Branding Title & Closed Book + Moustache Logo */}
      <div className="flex items-center gap-2.5">
        <div style={{ backgroundColor: 'rgba(69, 26, 3, 0.7)', borderColor: 'rgba(180, 83, 9, 0.5)' }} className="p-1.5 rounded-2xl border shadow-inner flex items-center justify-center">
          <BookStacheLogo className="w-8 h-8" />
        </div>
        <span style={{ color: '#fef3c7' }} className="text-xl font-black tracking-tight font-serif">
          Book<span style={{ color: '#d97706' }}>Stache</span>
        </span>
      </div>
    </header>
  );
}
