import React from 'react';
import { Library } from 'lucide-react';

import logoOriginal from '../assets/logo-original.png';

export function BookStacheLogo({ className = "w-8 h-8" }) {
  return (
    <img
      src={logoOriginal}
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
        style={{ backgroundColor: '#F2E8D8', borderColor: '#D97706', color: '#3D2314' }}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 border rounded-2xl transition-transform active:scale-95 cursor-pointer"
        aria-label="Knihovna"
      >
        <Library className="w-5 h-5" style={{ color: '#D97706' }} />
        <span className="font-bold text-sm tracking-wide">Knihovna</span>
        {libraryCount > 0 && (
          <span style={{ backgroundColor: '#D97706', color: '#FFFDF9' }} className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black rounded-full">
            {libraryCount}
          </span>
        )}
      </button>

      {/* App Branding Title & Logo */}
      <div className="flex items-center gap-2">
        <img src={logoOriginal} alt="BookStache Logo" className="h-10 w-auto object-contain" />
      </div>
    </header>
  );
}
