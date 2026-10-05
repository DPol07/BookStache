import React, { useState, useEffect } from 'react';
import { X, Trash2, Book, Calendar, Building2, Tag, Users, Globe, Hash, Clock } from 'lucide-react';

export default function BookDetailModal({ isOpen, book, onClose, onDeleteBook }) {
  const [imageError, setImageError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setImageError(false);
    setUseFallback(false);
  }, [book]);

  if (!isOpen || !book) return null;

  const formattedDate = book.savedAt
    ? new Date(book.savedAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleImageError = () => {
    if (!useFallback && book.fallbackCover && book.cover !== book.fallbackCover) {
      setUseFallback(true);
    } else {
      setImageError(true);
    }
  };

  const currentCoverUrl = useFallback ? book.fallbackCover : book.cover;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 text-slate-400 hover:text-white bg-slate-950/70 hover:bg-slate-950 rounded-full transition-colors border border-slate-800/80 backdrop-blur-md"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Cover & Hero Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left pt-2">
            {/* Book Cover / Placeholder */}
            <div className="relative w-28 h-40 shrink-0 bg-slate-800 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg flex items-center justify-center">
              {currentCoverUrl && !imageError ? (
                <img
                  src={currentCoverUrl}
                  alt={book.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-between p-3 text-center text-slate-300 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 border border-amber-500/30">
                  <div className="p-1.5 bg-amber-500/20 rounded-full text-amber-400 mt-2">
                    <Book className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 my-auto">
                    <span className="text-[10px] font-bold text-amber-300 leading-snug line-clamp-3 block px-1">{book.title}</span>
                    <span className="text-[9px] text-slate-400 truncate max-w-full block px-1">{book.author}</span>
                  </div>
                  <span className="text-[8px] font-mono text-amber-500/70 border-t border-slate-700/60 pt-1 w-full truncate">
                    {book.isbn}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Author Header */}
            <div className="space-y-1.5 flex-1">
              <span className="inline-block px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold rounded-full uppercase tracking-wider">
                Detail knihy
              </span>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                {book.title}
              </h2>
              <p className="text-sm font-semibold text-amber-400">
                {book.author}
              </p>
            </div>
          </div>

          {/* Detailed Metadata Grid */}
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Book className="w-4 h-4 text-amber-400 shrink-0" />
                Název
              </span>
              <span className="font-semibold text-white text-right max-w-[200px] truncate">{book.title}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                Autor
              </span>
              <span className="font-semibold text-white text-right max-w-[200px] truncate">{book.author}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                Rok vydání
              </span>
              <span className="font-semibold text-white">{book.year}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                Nakladatelství
              </span>
              <span className="font-semibold text-white text-right max-w-[200px] truncate">{book.publisher}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                Žánr
              </span>
              <span className="font-semibold text-white text-right max-w-[200px] truncate">{book.genre}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                Cílená věková skupina
              </span>
              <span className="font-semibold text-amber-300">{book.ageGroup}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                Jazyk
              </span>
              <span className="font-semibold text-white">{book.language}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-700/40">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Hash className="w-4 h-4 text-amber-400 shrink-0" />
                ISBN
              </span>
              <span className="font-mono font-bold text-amber-400">{book.isbn}</span>
            </div>

            {formattedDate && (
              <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-slate-400 font-medium">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  Uloženo dne
                </span>
                <span className="font-medium text-slate-300">{formattedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onDeleteBook(book.id)}
            className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-2xl border border-rose-500/30 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Odstranit z knihovny</span>
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-2xl border border-slate-700 transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
