import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Book,
  Calendar,
  Building2,
  Tag,
  Users,
  Globe,
  Hash,
  Clock,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Palette
} from 'lucide-react';
import BookCoverImage from './BookCoverImage';
import { normalizeIsbn, formatIsbnDisplay } from '../services/bookApi';

const COVER_COLORS = [
  { name: 'Kávová', bg: '#4A2E1B' },
  { name: 'Karamelová', bg: '#8C593B' },
  { name: 'Vínová', bg: '#7F1D1D' },
  { name: 'Tmavě modrá', bg: '#1E3A5F' },
  { name: 'Lesní zelená', bg: '#1B4332' },
  { name: 'Břidlicová', bg: '#334155' },
];

export default function BookDetailModal({ isOpen, book, onClose, onDeleteBook, onUpdateBook }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    year: '',
    publisher: '',
    genre: '',
    language: '',
    isbn: '',
    editionNote: '',
    customCoverColor: '#4A2E1B',
  });
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    if (book) {
      setEditForm({
        title: book.title || '',
        author: book.author || '',
        year: book.year === 'Neuvedeno' ? '' : (book.year || ''),
        publisher: book.publisher === 'Neuvedeno' ? '' : (book.publisher || ''),
        genre: book.genre || 'Beletrie',
        language: book.language || '',
        isbn: book.rawIsbn || book.isbn || '',
        editionNote: book.editionNote || '',
        customCoverColor: book.customCoverColor || '#4A2E1B',
      });
      setIsEditing(false);
      setEditError(null);
      setEditSuccess(false);
    }
  }, [book, isOpen]);

  if (!isOpen || !book) return null;

  const formattedDate = book.savedAt
    ? new Date(book.savedAt).toLocaleDateString('cs-CZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditError(null);
    setEditSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
    setEditSuccess(false);
    // Reset form to current book state
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      year: book.year === 'Neuvedeno' ? '' : (book.year || ''),
      publisher: book.publisher === 'Neuvedeno' ? '' : (book.publisher || ''),
      genre: book.genre || 'Beletrie',
      language: book.language || '',
      isbn: book.rawIsbn || book.isbn || '',
      editionNote: book.editionNote || '',
      customCoverColor: book.customCoverColor || '#4A2E1B',
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      setEditError('Název knihy je povinný.');
      return;
    }

    const cleanIsbn = normalizeIsbn(editForm.isbn);
    const updatedBookData = {
      ...book,
      title: editForm.title.trim(),
      author: editForm.author.trim() || 'Neznámý autor',
      year: editForm.year.trim() || 'Neuvedeno',
      publisher: editForm.publisher.trim() || 'Neuvedeno',
      genre: editForm.genre.trim() || 'Všeobecná literatura',
      language: editForm.language.trim() || 'Neznámý',
      isbn: cleanIsbn ? formatIsbnDisplay(cleanIsbn) : (editForm.isbn.trim() || 'Bez ISBN'),
      rawIsbn: cleanIsbn,
      editionNote: editForm.editionNote.trim(),
      customCoverColor: editForm.customCoverColor,
    };

    if (onUpdateBook) {
      const res = onUpdateBook(updatedBookData);
      if (res && !res.success) {
        setEditError(res.error || 'Uložení se nezdařilo.');
        return;
      }
    }

    setEditSuccess(true);
    setTimeout(() => {
      setIsEditing(false);
      setEditSuccess(false);
      setEditError(null);
    }, 400);
  };

  return (
    <div style={{ backgroundColor: '#FAF6F0' }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
      <div style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3' }} className="relative w-full max-w-md my-auto border rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full cursor-pointer hover:opacity-90"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Content */}
        <div style={{ color: '#3D2314' }} className="overflow-y-auto p-5 space-y-5">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left pt-2">
            {/* Book Cover / Placeholder */}
            <div style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }} className="relative w-28 h-40 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center">
              <BookCoverImage
                book={isEditing ? { ...book, customCoverColor: editForm.customCoverColor } : book}
                size="normal"
              />
            </div>

            {/* Title & Author Header */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span style={{ backgroundColor: '#F2E8D8', color: '#3D2314', borderColor: '#8C593B' }} className="inline-block px-2.5 py-0.5 border text-[11px] font-bold rounded-full uppercase tracking-wider font-serif">
                  {isEditing ? 'Úprava knihy' : 'Detail knihy'}
                </span>
                {!isEditing && (
                  <button
                    onClick={handleStartEdit}
                    style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Upravit</span>
                  </button>
                )}
              </div>
              <h2 style={{ color: '#3D2314' }} className="text-xl font-extrabold font-serif leading-tight break-words">
                {isEditing ? (editForm.title || 'Název knihy') : book.title}
              </h2>
              <p style={{ color: '#5C3A24' }} className="text-sm font-bold truncate">
                {isEditing ? (editForm.author || 'Autor') : book.author}
              </p>
            </div>
          </div>

          {/* EDIT MODE */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editError && (
                <div className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                  Název knihy <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                  Autor
                </label>
                <input
                  type="text"
                  value={editForm.author}
                  onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Year & Publisher */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Rok vydání
                  </label>
                  <input
                    type="text"
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                    placeholder="Např. 2021"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Nakladatelství
                  </label>
                  <input
                    type="text"
                    value={editForm.publisher}
                    onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                    placeholder="Např. Albatros"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Genre & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Žánr
                  </label>
                  <input
                    type="text"
                    value={editForm.genre}
                    onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                    placeholder="Např. Fantasy"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Jazyk
                  </label>
                  <input
                    type="text"
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    placeholder="Např. Čeština"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                  ISBN
                </label>
                <input
                  type="text"
                  value={editForm.isbn}
                  onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
                  placeholder="Např. 9788000058825"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono focus:outline-none"
                />
              </div>

              {/* Edition Note / Poznámky */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                  Poznámky / Vydání
                </label>
                <input
                  type="text"
                  value={editForm.editionNote}
                  onChange={(e) => setEditForm({ ...editForm, editionNote: e.target.value })}
                  placeholder="Např. 2. vydání, ilustrované"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Color picker for books without image cover or custom cover */}
              {(!book.cover || book.customCoverColor) && (
                <div>
                  <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: '#3D2314' }}>
                    <Palette className="w-3.5 h-3.5" style={{ color: '#8C593B' }} />
                    <span>Barva obálky (u knih bez obrázku)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {COVER_COLORS.map((c) => (
                      <button
                        key={c.bg}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, customCoverColor: c.bg })}
                        style={{
                          backgroundColor: c.bg,
                          borderColor: editForm.customCoverColor === c.bg ? '#FAF6F0' : 'transparent',
                          outline: editForm.customCoverColor === c.bg ? '2px solid #4A2E1B' : 'none',
                        }}
                        className="w-7 h-7 rounded-full border-2 transition-transform cursor-pointer"
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Save & Cancel Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
                  className="flex-1 py-3 font-semibold text-xs rounded-2xl border transition-colors cursor-pointer"
                >
                  Zrušit úpravy
                </button>
                <button
                  type="submit"
                  disabled={!editForm.title.trim()}
                  style={{
                    backgroundColor: editSuccess ? '#15803D' : '#4A2E1B',
                    color: '#FAF6F0',
                  }}
                  className="flex-1 py-3 font-bold text-xs rounded-2xl transition-all font-serif uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  {editSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Uloženo!
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Uložit změny
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE: Detailed Metadata Grid */
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
                <span style={{ color: '#5C3A24' }} className="font-mono font-bold">{book.isbn || 'Bez ISBN'}</span>
              </div>

              {book.editionNote && (
                <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: '#E6D7C3' }}>
                  <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                    <Tag className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                    Poznámky / Vydání
                  </span>
                  <span style={{ color: '#3D2314' }} className="font-medium text-right max-w-[200px] truncate">{book.editionNote}</span>
                </div>
              )}

              {formattedDate && (
                <div className="flex items-center justify-between py-1.5 border-t" style={{ borderColor: '#E6D7C3' }}>
                  <span style={{ color: '#5C3A24' }} className="flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 shrink-0" style={{ color: '#8C593B' }} />
                    Uloženo dne
                  </span>
                  <span style={{ color: '#8C593B' }} className="font-medium">{formattedDate}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {!isEditing && (
          <div style={{ backgroundColor: '#F2E8D8', borderColor: '#E6D7C3' }} className="p-4 border-t flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => onDeleteBook(book.id)}
              style={{ backgroundColor: '#B91C1C', color: '#FAF6F0' }}
              className="py-3 px-4 font-bold text-xs rounded-2xl transition-colors flex items-center gap-2 font-serif cursor-pointer hover:opacity-90"
            >
              <Trash2 className="w-4 h-4" />
              <span>Odstranit</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartEdit}
                style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
                className="py-3 px-4 font-bold text-xs rounded-2xl transition-colors font-serif uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hover:opacity-90"
              >
                <Edit3 className="w-4 h-4" />
                <span>Upravit</span>
              </button>

              <button
                onClick={onClose}
                style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                className="py-3 px-4 border font-bold text-xs rounded-2xl transition-colors font-serif uppercase tracking-wider cursor-pointer hover:opacity-90"
              >
                Zavřít
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
