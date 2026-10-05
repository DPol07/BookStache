import React, { useState } from 'react';
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
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  // Loading State
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping" />
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Vyhledávám knihu...</h3>
            <p className="text-xs text-slate-400 mt-1">Kombinuji veřejné katalogy a knihovní databáze</p>
          </div>
        </div>
      </div>
    );
  }

  // Book Not Found State
  if (!book) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center">
          {/* Top-Right 'X' Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-4 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Kniha nebyla nalezena</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
            Podle naskenovaného kódu se v dostupných katalozích nepodařilo najít žádné informace o knize. Některé starší knihy nemají čárový kód nebo mají odlišný formát.
          </p>

          <div className="space-y-3">
            <button
              onClick={onRetryScan}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Zkusit skenovat znovu
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenManualInput();
              }}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl border border-slate-700 transition-colors text-sm"
            >
              Zadat ISBN ručně
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Book Found State
  const handleSave = () => {
    setIsSaved(true);
    onSaveBook(book);
  };

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
            {/* Book Cover */}
            <div className="relative w-28 h-40 shrink-0 bg-slate-800 rounded-xl overflow-hidden border border-slate-700/80 shadow-lg flex items-center justify-center">
              {book.cover && !imageError ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400 gap-1.5 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/20">
                  <Book className="w-8 h-8 text-amber-400 mb-1" />
                  <span className="text-[10px] font-bold text-amber-300 leading-tight line-clamp-3 px-1">{book.title}</span>
                  <span className="text-[9px] text-slate-400 truncate max-w-full px-1">{book.author}</span>
                </div>
              )}
            </div>

            {/* Title & Author Header */}
            <div className="space-y-1.5 flex-1">
              <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold rounded-full uppercase tracking-wider">
                Naskenovaná kniha
              </span>
              <h2 className="text-xl font-extrabold text-white leading-tight">
                {book.title}
              </h2>
              <p className="text-sm font-semibold text-amber-400/90">
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

            <div className="flex items-center justify-between py-1.5">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <Hash className="w-4 h-4 text-amber-400 shrink-0" />
                ISBN
              </span>
              <span className="font-mono font-bold text-amber-400">{book.isbn}</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800/80 flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl border border-slate-700 transition-colors text-center"
          >
            Zrušit
          </button>

          <button
            onClick={handleSave}
            disabled={isSaved}
            className="flex-1 py-3.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-emerald-600 text-slate-950 disabled:text-white font-bold text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
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
