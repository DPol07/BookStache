import React, { useState } from 'react';
import { X, Search, BookOpen, Sparkles } from 'lucide-react';
import { normalizeIsbn } from '../services/bookApi';

export default function ManualIsbnModal({ isOpen, onClose, onSubmitIsbn }) {
  const [isbnInput, setIsbnInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = normalizeIsbn(isbnInput);
    if (!clean || clean.length < 9) {
      setError('Zadejte platné 10 nebo 13-místné ISBN číslo (např. 9788000058825)');
      return;
    }
    setError('');
    onSubmitIsbn(clean);
  };

  const sampleIsbns = [
    { label: 'Harry Potter', isbn: '9788000058825' },
    { label: 'Malý princ', isbn: '9788000058832' },
    { label: '1984', isbn: '9788020455826' },
    { label: 'Alchymista', isbn: '9788073819316' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Zadat ISBN ručně</h2>
            <p className="text-xs text-slate-400">Napište 10 nebo 13-místný ISBN kód knihy</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              ISBN číslo
            </label>
            <div className="relative">
              <input
                type="text"
                value={isbnInput}
                onChange={(e) => {
                  setIsbnInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="např. 978-80-00-05882-5"
                className="w-full px-4 py-3.5 pl-11 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono text-sm"
                autoFocus
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {error && <p className="mt-2 text-xs font-medium text-rose-400">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Vyhledat knihu
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Rychlé vyzkoušení s příklady:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleIsbns.map((s) => (
              <button
                key={s.isbn}
                onClick={() => {
                  setIsbnInput(s.isbn);
                  setError('');
                }}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-amber-500/10 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 border border-slate-700/70 rounded-xl transition-colors font-medium"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
