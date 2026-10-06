import React, { useState } from 'react';
import { X, Search, Keyboard, Book, Sparkles } from 'lucide-react';

export default function ManualIsbnModal({ isOpen, onClose, onSubmitIsbn }) {
  const [isbn, setIsbn] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isbn.trim()) return;
    onSubmitIsbn(isbn);
    setIsbn('');
  };

  const handleSampleClick = (sampleIsbn) => {
    onSubmitIsbn(sampleIsbn);
    setIsbn('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950-85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-800-60 rounded-3xl shadow-2xl overflow-hidden p-6 text-amber-100">
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-amber-300-70 hover:text-white bg-amber-950-60 hover:bg-amber-900 rounded-full transition-colors border border-amber-800-40"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-600-20 text-amber-400 rounded-2xl border border-amber-600-30">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-amber-100 font-serif">Zadat ISBN ručně</h3>
            <p className="text-xs text-amber-200-70">Napište 10 nebo 13-místný ISBN kód knihy</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="Např. 9788000058825 nebo 978-80-00058-82-5"
              autoFocus
              className="w-full px-4 py-3.5 bg-stone-950 border border-amber-800-60 rounded-2xl text-sm font-mono text-amber-100 placeholder-amber-900-60 focus:outline-none focus:ring-2 focus:ring-amber-500-50 focus:border-amber-500"
            />
            <Search className="w-5 h-5 text-amber-500-60 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-amber-950-60 hover:bg-amber-900-60 text-amber-200-80 hover:text-amber-100 font-semibold text-xs rounded-2xl border border-amber-800-50 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!isbn.trim()}
              className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-2xl shadow-lg shadow-amber-950-40 transition-all font-serif uppercase tracking-wider"
            >
              Vyhledat knihu
            </button>
          </div>
        </form>

        {/* Quick Test Samples */}
        <div className="mt-6 pt-4 border-t border-amber-900-50 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rychlé vyzkoušení s příklady:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleSampleClick('9788000058825')}
              className="p-2.5 bg-stone-950-80 hover:bg-amber-900-40 border border-amber-800-40 rounded-xl text-left transition-colors flex items-center gap-2 group"
            >
              <Book className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="truncate">
                <span className="font-bold block text-amber-100 truncate">Harry Potter</span>
                <span className="text-[10px] text-amber-300-70 font-mono">9788000058825</span>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick('9788000058832')}
              className="p-2.5 bg-stone-950-80 hover:bg-amber-900-40 border border-amber-800-40 rounded-xl text-left transition-colors flex items-center gap-2 group"
            >
              <Book className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="truncate">
                <span className="font-bold block text-amber-100 truncate">Malý princ</span>
                <span className="text-[10px] text-amber-300-70 font-mono">9788000058832</span>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick('9788020455826')}
              className="p-2.5 bg-stone-950-80 hover:bg-amber-900-40 border border-amber-800-40 rounded-xl text-left transition-colors flex items-center gap-2 group"
            >
              <Book className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="truncate">
                <span className="font-bold block text-amber-100 truncate">1984 (Orwell)</span>
                <span className="text-[10px] text-amber-300-70 font-mono">9788020455826</span>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick('9788073819316')}
              className="p-2.5 bg-stone-950-80 hover:bg-amber-900-40 border border-amber-800-40 rounded-xl text-left transition-colors flex items-center gap-2 group"
            >
              <Book className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="truncate">
                <span className="font-bold block text-amber-100 truncate">Alchymista</span>
                <span className="text-[10px] text-amber-300-70 font-mono">9788073819316</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
