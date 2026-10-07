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
    <div style={{ backgroundColor: '#FAF6F0' }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3' }} className="relative w-full max-w-md my-auto border rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          style={{ backgroundColor: '#D97706', color: '#FFFDF9' }}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full cursor-pointer"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Content */}
        <div style={{ color: '#3D2314' }} className="overflow-y-auto p-5 space-y-5">
          {/* Cover & Hero Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left pt-2">
            {/* Book Cover / Placeholder */}
            <div style={{ backgroundColor: '#EAE1D3', borderColor: '#D97706' }} className="relative w-28 h-40 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center">
              {currentCoverUrl && !imageError ? (
                <img
                  src={currentCoverUrl}
                  alt={book.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div style={{ backgroundColor: '#EAE1D3', color: '#3D2314' }} className="flex flex-col items-center justify-between p-3 text-center w-full h-full">
                  <div style={{ backgroundColor: '#D97706', color: '#FFFDF9' }} className="p-1.5 rounded-full mt-2">
                    <Book className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 my-auto">
                    <span className="text-[10px] font-bold leading-snug line-clamp-3 block px-1 font-serif">{book.title}</span>
                    <span style={{ color: '#5C3A24' }} className="text-[9px] truncate max-w-full block px-1">{book.author}</span>
                  </div>
                  <span style={{ color: '#8C593B', borderColor: '#E6D7C3' }} className="text-[8px] font-mono border-t pt-1 w-full truncate">
                    {book.isbn}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Author Header */}
            <div className="space-y-1.5 flex-1">
              <span style={{ backgroundColor: '#EAE1D3', color: '#3D2314', borderColor: '#D97706' }} className="inline-block px-2.5 py-0.5 border text-[11px] font-bold rounded-full uppercase tracking-wider font-serif">
                Detail knihy
              </span>
              <h2 style={{ color: '#3D2314' }} className="text-xl font-extrabold font-serif leading-tight">
                {book.title}
              </h2>
              <p style={{ color: '#C26200' }} className="text-sm font-bold">
                {book.author}
              </p>
            </div>
          </div>

          {/* Detailed Metadata Grid */}
          <div style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3' }} className="rounded-2xl p-4 border space-y-3 text-xs">
            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Book className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                Název
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold text-right max-w-[200px] truncate font-serif">{book.title}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                Autor
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold text-right max-w-[200px] truncate">{book.author}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                Rok vydání
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold">{book.year}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Building2 className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                Nakladatelství
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold text-right max-w-[200px] truncate">{book.publisher}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Tag className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                Žánr
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold text-right max-w-[200px] truncate">{book.genre}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                Cílená věková skupina
              </span>
              <span style={{ color: '#D97706' }} className="font-extrabold">{book.ageGroup}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Globe className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                Jazyk
              </span>
              <span style={{ color: '#3D2314' }} className="font-bold">{book.language}</span>
            </div>

            <div style={{ borderColor: '#E6D7C3' }} className="flex items-center justify-between py-1.5 border-b">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Hash className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                ISBN
              </span>
              <span style={{ color: '#D97706' }} className="font-mono font-bold">{book.isbn}</span>
            </div>

            {formattedDate && (
              <div className="flex items-center justify-between py-1.5">
                <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 shrink-0" style={{ color: '#D97706' }} />
                  Uloženo dne
                </span>
                <span style={{ color: '#8C593B' }} className="font-medium">{formattedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ backgroundColor: '#EAE1D3', borderColor: '#E6D7C3' }} className="p-4 border-t flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onDeleteBook(book.id)}
            style={{ backgroundColor: '#B91C1C', color: '#FFFDF9' }}
            className="py-3 px-4 font-bold text-xs rounded-2xl transition-colors flex items-center gap-2 font-serif cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Odstranit z knihovny</span>
          </button>

          <button
            onClick={onClose}
            style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
            className="py-3 px-5 border font-bold text-xs rounded-2xl transition-colors font-serif uppercase tracking-wider cursor-pointer"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
