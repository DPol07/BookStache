import React, { useState, useEffect } from 'react';
import { X, BookmarkPlus, RotateCcw, Book, Calendar, Building2, Tag, Users, Globe, Hash, AlertTriangle, RefreshCw, CheckCircle2, BookmarkCheck, ExternalLink } from 'lucide-react';
import BookCoverImage from './BookCoverImage';

export default function BookResultModal({
  isOpen,
  isLoading,
  book,
  existingDuplicate = null,
  onOpenExistingBook,
  onClose,
  onSaveBook,
  onRetryScan,
  onOpenManualInput,
}) {
  const [resolvedCover, setResolvedCover] = useState(book?.cover || null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setResolvedCover(book?.cover || null);
    setIsSaved(false);
  }, [book]);

  if (!isOpen) return null;

  // Loading State
  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#FAF6F0' }} className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3', color: '#3D2314' }} className="w-full max-w-sm p-8 border rounded-3xl text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#5C3A24' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif">Vyhledávám knihu...</h3>
            <p style={{ color: '#5C3A24' }} className="text-xs mt-1">Kombinuji veřejné katalogy a knihovní databáze (Knihovny.cz)</p>
          </div>
        </div>
      </div>
    );
  }

  // Book Not Found State
  if (!book) {
    return (
      <div style={{ backgroundColor: '#FAF6F0' }} className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3', color: '#3D2314' }} className="relative w-full max-w-md p-6 border rounded-3xl text-center">
          {/* Top-Right 'X' Close Button */}
          <button
            onClick={onClose}
            style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
            className="absolute top-4 right-4 p-2 rounded-full cursor-pointer"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>

          <div style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#5C3A24' }} className="w-14 h-14 mx-auto mb-4 rounded-2xl border flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold font-serif mb-2">Kniha nebyla nalezena</h3>
          <p style={{ color: '#5C3A24' }} className="text-xs max-w-xs mx-auto mb-6 leading-relaxed">
            Podle naskenovaného kódu se v dostupných katalozích nepodařilo najít žádné informace o knize. Některé starší knihy nemají čárový kód nebo mají odlišný formát.
          </p>

          <div className="space-y-3">
            <button
              onClick={onRetryScan}
              style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
              className="w-full py-3.5 px-4 font-extrabold rounded-2xl flex items-center justify-center gap-2 text-xs font-serif uppercase tracking-wider cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Zkusit skenovat znovu
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenManualInput();
              }}
              style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
              className="w-full py-3 px-4 font-semibold rounded-2xl border text-xs cursor-pointer"
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
    // Persist verified cover as book.cover
    const bookToSave = {
      ...book,
      cover: resolvedCover || book.cover,
    };
    onSaveBook(bookToSave);
  };

  const isDuplicate = !!existingDuplicate;

  return (
    <div style={{ backgroundColor: '#FAF6F0' }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3' }} className="relative w-full max-w-md my-auto border rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full cursor-pointer"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Content */}
        <div style={{ color: '#3D2314' }} className="overflow-y-auto p-5 space-y-4">
          {/* Duplicate Notice Banner */}
          {isDuplicate && (
            <div
              style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
              className="p-3.5 rounded-2xl border flex items-center gap-3 text-left"
            >
              <div
                style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              >
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold font-serif leading-snug">
                  Tato kniha již je ve vaší knihovně
                </p>
                <p style={{ color: '#5C3A24' }} className="text-[11px] leading-tight mt-0.5">
                  Knihu nelze přidat vícekrát. Můžete si otevřít existující záznam.
                </p>
              </div>
            </div>
          )}

          {/* Cover & Hero Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left pt-1">
            {/* Book Cover / Placeholder */}
            <div style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }} className="relative w-28 h-40 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center">
              <BookCoverImage
                book={book}
                size="normal"
                onResolvedCover={(url) => setResolvedCover(url)}
              />
            </div>

            {/* Title & Author Header */}
            <div className="space-y-1.5 flex-1">
              <span style={{ backgroundColor: '#F2E8D8', color: '#3D2314', borderColor: '#8C593B' }} className="inline-block px-2.5 py-0.5 border text-[11px] font-bold rounded-full uppercase tracking-wider font-serif">
                {isDuplicate ? 'Kniha v knihovně' : 'Naskenovaná kniha'}
              </span>
              <h2 style={{ color: '#3D2314' }} className="text-xl font-extrabold font-serif leading-tight">
                {book.title}
              </h2>
              <p style={{ color: '#5C3A24' }} className="text-sm font-bold">
                {book.author}
              </p>
            </div>
          </div>

          {/* Detailed Metadata Grid */}
          <div style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3' }} className="rounded-2xl p-4 border space-y-3 text-xs">
            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Book className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                Název
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold text-right max-w-[200px] truncate font-serif">{book.title}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                Autor
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold text-right max-w-[200px] truncate">{book.author}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                Rok vydání
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold">{book.year}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Building2 className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                Nakladatelství
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold text-right max-w-[200px] truncate">{book.publisher}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Tag className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                Žánr
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold text-right max-w-[200px] truncate">{book.genre}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                Cílená věková skupina
              </span>
              <span style={{ color: '#5C3A24' }} className="font-extrabold">{book.ageGroup}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Globe className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                Jazyk
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold">{book.language || 'Neznámý'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Hash className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                ISBN
              </span>
              <span style={{ color: '#5C3A24' }} className="font-mono font-bold">{book.isbn}</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div style={{ backgroundColor: '#F2E8D8', borderColor: '#E6D7C3' }} className="p-4 border-t flex items-center gap-3 shrink-0">
          <button
            onClick={onClose}
            style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
            className="flex-1 py-3.5 px-4 font-bold text-xs rounded-2xl border text-center cursor-pointer"
          >
            Zavřít
          </button>

          {isDuplicate ? (
            <button
              onClick={() => onOpenExistingBook(existingDuplicate)}
              style={{
                backgroundColor: '#4A2E1B',
                color: '#FAF6F0',
              }}
              className="flex-1 py-3.5 px-4 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wider font-serif cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Otevřít v knihovně
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaved}
              style={{
                backgroundColor: isSaved ? '#15803D' : '#4A2E1B',
                color: '#FAF6F0'
              }}
              className="flex-1 py-3.5 px-4 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wider font-serif cursor-pointer"
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
          )}
        </div>
      </div>
    </div>
  );
}
