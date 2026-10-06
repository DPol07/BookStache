import React from 'react';
import { Library } from 'lucide-react';

// Custom SVG Icon for Book + Moustache logo identity:
// Features a clear closed book (leather cover, spine, gold corners, page edges) with a prominent brown moustache that protrudes past BOTH sides of the book.
import logoGoldSymbol from '../assets/logo-symbol-gold.png';

export function BookStacheLogo({ className = "w-8 h-8" }) {
  return (
    <img
      src={logoGoldSymbol}
      alt="BookStache Logo"
      className={`${className} object-contain`}
    />
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

      {/* App Branding Title & Logo */}
      <div className="flex items-center gap-2.5">
        <div style={{ backgroundColor: '#2e180d', borderColor: '#b45309' }} className="p-1 rounded-2xl border shadow-inner flex items-center justify-center">
          <BookStacheLogo className="w-9 h-9" />
        </div>
        <span style={{ color: '#fef3c7' }} className="text-xl font-black tracking-tight font-serif">
          Book<span style={{ color: '#d97706' }}>Stache</span>
        </span>
      </div>
    </header>
  );
}
