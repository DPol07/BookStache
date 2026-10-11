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
      className="fixed inset-0 z-50 flex flex-col animate-fadeIn"
      style={{ backgroundColor: '#FAF6F0', color: '#3D2314' }}
    >
      {/* Top Header */}
      <div
        className="p-4 border-b flex items-center justify-between z-20 shrink-0"
        style={{ backgroundColor: '#EAE1D3', borderColor: '#E6D7C3' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: '#D97706', color: '#FFFDF9', borderColor: '#C26200' }}>
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif" style={{ color: '#3D2314' }}>Moje Knihovna</h2>
            <p className="text-xs" style={{ color: '#5C3A24' }}>
              {books.length === 1 ? '1 uložená kniha' : `${books.length} uložených knih`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ backgroundColor: '#D97706', color: '#FFFDF9' }}
          className="p-2 rounded-full cursor-pointer"
          aria-label="Zavřít"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="p-4 border-b shrink-0"
        style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3' }}
      >
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Vyhledat podle názvu nebo autora..."
            style={{ backgroundColor: '#FFFDF9', borderColor: '#D97706', color: '#3D2314' }}
            className="w-full px-4 py-3 pl-11 border rounded-2xl text-sm focus:outline-none"
          />
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#D97706' }} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ backgroundColor: '#D97706', color: '#FFFDF9' }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs p-1 rounded-full cursor-pointer"
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
            <div className="w-20 h-20 rounded-3xl border flex items-center justify-center" style={{ backgroundColor: '#EAE1D3', borderColor: '#D97706', color: '#D97706' }}>
              <Book className="w-10 h-10 stroke-1" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif mb-1" style={{ color: '#3D2314' }}>Knihovna je zatím prázdná</h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: '#5C3A24' }}>
                Naskenujte svou první knihu pomocí tlačítka "NASKENOVAT" na hlavní obrazovce.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onStartScan();
              }}
              style={{ backgroundColor: '#D97706', color: '#FFFDF9' }}
              className="py-3 px-5 font-bold text-xs rounded-2xl flex items-center gap-2 uppercase tracking-wider font-serif cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Naskenovat knihu
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          /* Search No Results State */
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-bold" style={{ color: '#3D2314' }}>Žádná kniha neodpovídá vyhledávání</p>
            <p className="text-xs" style={{ color: '#5C3A24' }}>Zkontrolujte překlepy nebo zkuste jiný výraz.</p>
          </div>
        ) : (
          /* List of Books */
          <div className="space-y-3 pb-8">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3' }}
                className="group relative flex items-center gap-3.5 p-3 border rounded-2xl transition-all active:scale-[0.99] cursor-pointer"
              >
                {/* Book Cover */}
                <div style={{ backgroundColor: '#EAE1D3', borderColor: '#D97706' }} className="relative w-14 h-20 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center">
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
                    className="flex flex-col items-center justify-center p-1 text-[9px] text-center w-full h-full"
                    style={{ display: book.cover ? 'none' : 'flex', backgroundColor: '#EAE1D3', color: '#3D2314' }}
                  >
                    <Book className="w-5 h-5 mb-0.5" style={{ color: '#D97706' }} />
                    <span className="line-clamp-2 leading-tight text-[8px] font-serif">{book.title}</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-bold font-serif line-clamp-2 leading-snug" style={{ color: '#3D2314' }}>
                    {book.title}
                  </h4>
                  <p className="text-xs font-semibold truncate mt-0.5" style={{ color: '#C26200' }}>
                    {book.author}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono" style={{ color: '#8C593B' }}>
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
                    style={{ color: '#B91C1C' }}
                    className="p-2 rounded-xl transition-colors cursor-pointer"
                    title="Odstranit knihu"
                    aria-label="Odstranit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-1" style={{ color: '#D97706' }}>
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
