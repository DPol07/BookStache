import React from 'react';
import { Library } from 'lucide-react';

export function BookStacheLogo({ className = "h-8 w-8", ink = '#6B5849', accent = '#9A846F' }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 11.5c6.6-1.4 12.3-.1 17 3.9 4.7-4 10.4-5.3 17-3.9v23c-6.6-1.3-12.3 0-17 3.8-4.7-3.8-10.4-5.1-17-3.8v-23Z"
        stroke={ink}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M24 15.5v22" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M12.2 25.2c-2.5-2.6-5.4-.8-4.5 2 1.2 3.9 5.1 4.8 9 2l7.3-5.1 7.3 5.1c3.9 2.8 7.8 1.9 9-2 .9-2.8-2-4.6-4.5-2l-4.3 2.2-7.5-4.3-7.5 4.3-4.3-2.2Z"
        fill={accent}
      />
    </svg>
  );
}

export default function Header({ libraryCount, onOpenLibrary }) {
  return (
    <header className="w-full max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between z-10">
      <button
        onClick={onOpenLibrary}
        style={{ backgroundColor: '#F3ECE3', borderColor: '#E1D6C8', color: '#514337' }}
        className="group relative flex items-center gap-2.5 px-4 py-2.5 border rounded-2xl transition-transform active:scale-95 cursor-pointer"
        aria-label="Knihovna"
      >
        <Library className="w-5 h-5" style={{ color: '#806858' }} />
        <span className="font-semibold text-sm tracking-wide">Knihovna</span>
        {libraryCount > 0 && (
          <span style={{ backgroundColor: '#806858', color: '#FFF9F1' }} className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full">
            {libraryCount}
          </span>
        )}
      </button>

      <div className="flex items-center gap-2.5">
        <span className="grid h-11 w-11 place-items-center rounded-2xl border" style={{ backgroundColor: '#F3ECE3', borderColor: '#E1D6C8' }}>
          <BookStacheLogo className="h-8 w-8" ink="#695647" accent="#9A846F" />
        </span>
        <span className="font-serif text-[17px] font-bold tracking-tight" style={{ color: '#514337' }}>
          BookStache
        </span>
      </div>
    </header>
  );
}
