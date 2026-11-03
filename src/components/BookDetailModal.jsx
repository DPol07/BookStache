import React from 'react';
import { X, Trash2, Book, Calendar, Building2, Tag, Users, Globe, Hash, Clock } from 'lucide-react';
import BookCoverImage from './BookCoverImage';

export default function BookDetailModal({ isOpen, book, onClose, onDeleteBook }) {
  if (!isOpen || !book) return null;

  const formattedDate = book.savedAt
    ? new Date(book.savedAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

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
        <div style={{ color: '#3D2314' }} className="overflow-y-auto p-5 space-y-5">
          {/* Cover & Hero Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left pt-2">
            {/* Book Cover / Placeholder */}
            <div style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }} className="relative w-28 h-40 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center">
              <BookCoverImage book={book} size="normal" />
            </div>

            {/* Title & Author Header */}
            <div className="space-y-1.5 flex-1">
              <span style={{ backgroundColor: '#F2E8D8', color: '#3D2314', borderColor: '#8C593B' }} className="inline-block px-2.5 py-0.5 border text-[11px] font-bold rounded-full uppercase tracking-wider font-serif">
                Detail knihy
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
              <span style={{ color: '#3D2314' }} className="font-bold">{book.language}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                <Hash className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                ISBN
              </span>
              <span style={{ color: '#5C3A24' }} className="font-mono font-bold">{book.isbn}</span>
            </div>

            {formattedDate && (
              <div className="flex items-center justify-between py-1.5">
                <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                  Uloženo dne
                </span>
                <span style={{ color: '#8C593B' }} className="font-medium">{formattedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ backgroundColor: '#F2E8D8', borderColor: '#E6D7C3' }} className="p-4 border-t flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onDeleteBook(book.id)}
            style={{ backgroundColor: '#B91C1C', color: '#FAF6F0' }}
            className="py-3 px-4 font-bold text-xs rounded-2xl transition-colors flex items-center gap-2 font-serif cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Odstranit z knihovny</span>
          </button>

          <button
            onClick={onClose}
            style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
            className="py-3 px-5 border font-bold text-xs rounded-2xl transition-colors font-serif uppercase tracking-wider cursor-pointer"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
