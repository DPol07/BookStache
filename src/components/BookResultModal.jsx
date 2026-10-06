import React, { useState, useEffect } from 'react';
import { X, BookmarkPlus, RotateCcw, Book, Calendar, Building2, Tag, Users, Globe, Hash, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function BookResultModal({
  isOpen,
  isLoading,
  book,
  onClose,
  onSaveBook,
  onRetryScan,
  onOpenManualInput,
}) {
  const [imageError, setImageError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setImageError(false);
    setUseFallback(false);
    setIsSaved(false);
  }, [book]);

  if (!isOpen) return null;

  // Loading State
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950-85 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-sm p-8 bg-stone-900 border border-amber-800-60 rounded-3xl shadow-2xl text-center space-y-4 text-amber-100">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500-20 animate-ping" />
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-100 font-serif">Vyhledávám knihu...</h3>
            <p className="text-xs text-amber-300-70 mt-1">Kombinuji veřejné katalogy a knihovní databáze (Knihovny.cz)</p>
          </div>
        </div>
      </div>
    );
  }

  // Book Not Found State
  if (!book) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950-85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md p-6 bg-stone-900 border border-amber-800-60 rounded-3xl shadow-2xl text-center text-amber-100">
          {/* Top-Right 'X' Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-amber-300-70 hover:text-white bg-amber-950-60 hover:bg-amber-900 rounded-full transition-colors border border-amber-800-40"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-4 bg-amber-900-30 text-amber-400 rounded-2xl border border-amber-600-40 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-amber-100 font-serif mb-2">Kniha nebyla nalezena</h3>
          <p className="text-xs text-amber-200-70 max-w-xs mx-auto mb-6 leading-relaxed">
            Podle naskenovaného kódu se v dostupných katalozích nepodařilo najít žádné informace o knize. Některé starší knihy nemají čárový kód nebo mají odlišný formát.
          </p>

          <div className="space-y-3">
            <button
              onClick={onRetryScan}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-amber-950 font-extrabold rounded-2xl shadow-lg shadow-amber-950-40 transition-all flex items-center justify-center gap-2 text-xs font-serif uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              Zkusit skenovat znovu
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenManualInput();
              }}
              className="w-full py-3 px-4 bg-amber-950-60 hover:bg-amber-900-60 text-amber-200 font-semibold rounded-2xl border border-amber-800-50 transition-colors text-xs"
            >
              Zadat ISBN ručně
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Cover Image Error
  const handleImageError = () => {
    if (!useFallback && book.fallbackCover && book.cover !== book.fallbackCover) {
      setUseFallback(true);
    } else {
      setImageError(true);
    }
  };

  const currentCoverUrl = useFallback ? book.fallbackCover : book.cover;

  // Book Found State
  const handleSave = () => {
    setIsSaved(true);
    onSaveBook(book);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950-85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-stone-900 border border-amber-800-60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 text-amber-300-80 hover:text-white bg-stone-950-80 hover:bg-stone-950 rounded-full transition-colors border border-amber-800-50 backdrop-blur-md"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5 text-amber-100">
          {/* Cover & Hero Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left pt-2">
            {/* Book Cover / Placeholder */}
            <div className="relative w-28 h-40 shrink-0 bg-stone-950 rounded-xl overflow-hidden border border-amber-700-60 shadow-lg flex items-center justify-center">
              {currentCoverUrl && !imageError ? (
                <img
                  src={currentCoverUrl}
                  alt={book.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-between p-3 text-center text-amber-200 w-full h-full bg-stone-950 border border-amber-600-30">
                  <div className="p-1.5 bg-amber-600-20 rounded-full text-amber-400 mt-2">
                    <Book className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 my-auto">
                    <span className="text-[10px] font-bold text-amber-200 leading-snug line-clamp-3 block px-1 font-serif">{book.title}</span>
                    <span className="text-[9px] text-amber-400-80 truncate max-w-full block px-1">{book.author}</span>
                  </div>
                  <span className="text-[8px] font-mono text-amber-500-70 border-t border-amber-800-50 pt-1 w-full truncate">
                    {book.isbn}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Author Header */}
            <div className="space-y-1.5 flex-1">
              <span className="inline-block px-2.5 py-0.5 bg-amber-600-20 text-amber-300 border border-amber-600-30 text-[11px] font-extrabold rounded-full uppercase tracking-wider font-serif">
                Naskenovaná kniha
              </span>
              <h2 className="text-xl font-extrabold text-amber-100 font-serif leading-tight">
                {book.title}
              </h2>
              <p className="text-sm font-bold text-amber-400">
                {book.author}
              </p>
            </div>
          </div>

          {/* Detailed Metadata Grid */}
          <div className="bg-amber-950-30 rounded-2xl p-4 border border-amber-800-40 space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-amber-900-40">
              <span className="flex items-center gap-2 text-amber-300-80 font-medium">
                <Book className="w-4 h-4 text-amber-400 shrink-0" />
                Název
              </span>
              <span className="font-bold text-amber-100 text-right max-w-[200px] truncate font-serif">{book.title}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-amber-900-40">
              <span className="flex items-center gap-2 text-amber-300-80 font-medium">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                Autor
              </span>
              <span className="font-bold text-amber-100 text-right max-w-[200px] truncate">{book.author}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-amber-900-40">
              <span className="flex items-center gap-2 text-amber-300-80 font-medium">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                Rok vydání
              </span>
              <span className="font-bold text-amber-100">{book.year}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-amber-900-40">
              <span className="flex items-center gap-2 text-amber-300-80 font-medium">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                Nakladatelství
              </span>
              <span className="font-bold text-amber-100 text-right max-w-[200px] truncate">{book.publisher}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-amber-900-40">
              <span className="flex items-center gap-2 text-amber-300-80 font-medium">
                <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                Žánr
              </span>
              <span className="font-bold text-amber-100 text-right max-w-[200px] truncate">{book.genre}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-amber-900-40">
              <span className="flex items-center gap-2 text-amber-300-80 font-medium">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                Cílená věková skupina
              </span>
              <span className="font-extrabold text-amber-300">{book.ageGroup}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-amber-900-40">
              <span className="flex items-center gap-2 text-amber-300-80 font-medium">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                Jazyk
              </span>
              <span className="font-bold text-amber-100">{book.language}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="flex items-center gap-2 text-amber-300-80 font-medium">
                <Hash className="w-4 h-4 text-amber-400 shrink-0" />
                ISBN
              </span>
              <span className="font-mono font-bold text-amber-400">{book.isbn}</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 bg-stone-950 border-t border-amber-900-80 flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 bg-amber-950-60 hover:bg-amber-900-60 text-amber-200-80 hover:text-amber-100 font-bold text-xs rounded-2xl border border-amber-800-50 transition-colors text-center"
          >
            Zrušit
          </button>

          <button
            onClick={handleSave}
            disabled={isSaved}
            className="flex-1 py-3.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-emerald-700 text-amber-950 disabled:text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-950-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wider font-serif"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Uloženo!
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" />
                Uložit knihu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
