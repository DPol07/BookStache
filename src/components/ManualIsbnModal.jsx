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
    <div style={{ backgroundColor: '#FAF6F0' }} className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3', color: '#3D2314' }} className="relative w-full max-w-md border rounded-3xl overflow-hidden p-6">
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          style={{ backgroundColor: '#D97706', color: '#FFFDF9' }}
          className="absolute top-4 right-4 p-2 rounded-full cursor-pointer"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div style={{ backgroundColor: '#EAE1D3', borderColor: '#D97706', color: '#D97706' }} className="p-3 rounded-2xl border">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold font-serif">Zadat ISBN ručně</h3>
            <p style={{ color: '#5C3A24' }} className="text-xs">Napište 10 nebo 13-místný ISBN kód knihy</p>
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
              style={{ backgroundColor: '#FAF6F0', borderColor: '#D97706', color: '#3D2314' }}
              className="w-full px-4 py-3.5 border rounded-2xl text-sm font-mono focus:outline-none"
            />
            <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#D97706' }} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#EAE1D3', borderColor: '#E6D7C3', color: '#3D2314' }}
              className="flex-1 py-3.5 font-semibold text-xs rounded-2xl border transition-colors cursor-pointer"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={!isbn.trim()}
              style={{ backgroundColor: '#D97706', color: '#FFFDF9' }}
              className="flex-1 py-3.5 font-bold text-xs rounded-2xl transition-all font-serif uppercase tracking-wider cursor-pointer"
            >
              Vyhledat knihu
            </button>
          </div>
        </form>

        {/* Quick Test Samples */}
        <div style={{ borderColor: '#E6D7C3' }} className="mt-6 pt-4 border-t space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#C26200' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rychlé vyzkoušení s příklady:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleSampleClick('9788000058825')}
              style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
              className="p-2.5 border rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <Book className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#D97706' }} />
              <div className="truncate">
                <span className="font-bold block truncate">Harry Potter</span>
                <span className="text-[10px] font-mono" style={{ color: '#8C593B' }}>9788000058825</span>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick('9788000058832')}
              style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
              className="p-2.5 border rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <Book className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#D97706' }} />
              <div className="truncate">
                <span className="font-bold block truncate">Malý princ</span>
                <span className="text-[10px] font-mono" style={{ color: '#8C593B' }}>9788000058832</span>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick('9788020455826')}
              style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
              className="p-2.5 border rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <Book className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#D97706' }} />
              <div className="truncate">
                <span className="font-bold block truncate">1984 (Orwell)</span>
                <span className="text-[10px] font-mono" style={{ color: '#8C593B' }}>9788020455826</span>
              </div>
            </button>

            <button
              onClick={() => handleSampleClick('9788073819316')}
              style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
              className="p-2.5 border rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <Book className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#D97706' }} />
              <div className="truncate">
                <span className="font-bold block truncate">Alchymista</span>
                <span className="text-[10px] font-mono" style={{ color: '#8C593B' }}>9788073819316</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
