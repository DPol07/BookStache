import React, { useState } from 'react';
import { X, Search, Library, Trash2, Book, ChevronRight, Plus } from 'lucide-react';

export default function LibraryModal({
  isOpen,
  books,
  onClose,
  onSelectBook,
  onDeleteBook,
  onStartScan,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredBooks = books.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q)) ||
      (b.genre && b.genre.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-slate-100 animate-fadeIn"
      style={{ backgroundColor: '#020617' }}
    >
      {/* Top Header */}
      <div
        className="p-4 border-b border-slate-800 flex items-center justify-between z-20 shrink-0"
        style={{ backgroundColor: '#0f172a' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Moje Knihovna</h2>
            <p className="text-xs text-slate-400">
              {books.length === 1 ? '1 uložená kniha' : `${books.length} uložených knih`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
          aria-label="Zavřít"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="p-4 border-b border-slate-800 shrink-0"
        style={{ backgroundColor: '#0f172a' }}
      >
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Vyhledat podle názvu nebo autora..."
            className="w-full px-4 py-3 pl-11 bg-slate-800 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-1 bg-slate-700/50 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Book List Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        {books.length === 0 ? (
          /* Empty Library State */
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-3xl border border-amber-500/20 flex items-center justify-center">
              <Book className="w-10 h-10 stroke-1" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Knihovna je zatím prázdná</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Naskenujte svou první knihu pomocí tlačítka "NASKENOVAT" na hlavní obrazovce.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onStartScan();
              }}
              className="py-3 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Naskenovat knihu
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          /* Search No Results State */
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-semibold text-slate-300">Žádná kniha neodpovídá vyhledávání</p>
            <p className="text-xs text-slate-500">Zkontrolujte překlepy nebo zkuste jiný výraz.</p>
          </div>
        ) : (
          /* List of Books */
          <div className="space-y-3 pb-8">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="group relative flex items-center gap-3.5 p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                {/* Book Cover */}
                <div className="relative w-14 h-20 shrink-0 bg-slate-800 rounded-xl overflow-hidden border border-slate-700/80 shadow flex items-center justify-center">
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="flex flex-col items-center justify-center p-1 text-slate-500 text-[9px] text-center w-full h-full bg-slate-800"
                    style={{ display: book.cover ? 'none' : 'flex' }}
                  >
                    <Book className="w-5 h-5 text-amber-500/60 mb-0.5" />
                    <span className="line-clamp-2 leading-tight text-[8px]">{book.title}</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                    {book.title}
                  </h4>
                  <p className="text-xs font-medium text-amber-400/90 truncate mt-0.5">
                    {book.author}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                    {book.year && book.year !== 'Neuvedeno' && (
                      <>
                        <span>{book.year}</span>
                        <span>•</span>
                      </>
                    )}
                    <span className="truncate">{book.isbn}</span>
                  </div>
                </div>

                {/* Delete & Detail Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBook(book.id);
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="Odstranit knihu"
                    aria-label="Odstranit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-1 text-slate-600 group-hover:text-amber-400 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
