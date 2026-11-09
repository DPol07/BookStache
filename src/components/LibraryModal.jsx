import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Library,
  Trash2,
  Book,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Filter
} from 'lucide-react';
import BookCoverImage from './BookCoverImage';
import { filterBooks, sortBooks, getUniqueFilterOptions } from '../services/filterService';

export default function LibraryModal({
  isOpen,
  books,
  onClose,
  onSelectBook,
  onDeleteBook,
  onStartScan,
  onOpenManualInput,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic filter options based on existing books
  const filterOptions = useMemo(() => getUniqueFilterOptions(books), [books]);

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedGenre !== 'all' ||
    selectedAuthor !== 'all' ||
    selectedLanguage !== 'all' ||
    sortBy !== 'date-desc';

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedAuthor('all');
    setSelectedLanguage('all');
    setSortBy('date-desc');
  };

  // Filtered and sorted books
  const processedBooks = useMemo(() => {
    const filtered = filterBooks(books, {
      searchQuery,
      genre: selectedGenre,
      author: selectedAuthor,
      language: selectedLanguage,
    });
    return sortBooks(filtered, sortBy);
  }, [books, searchQuery, selectedGenre, selectedAuthor, selectedLanguage, sortBy]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-fadeIn"
      style={{ backgroundColor: '#FAF6F0', color: '#3D2314' }}
    >
      {/* Top Header */}
      <div
        className="p-4 border-b flex items-center justify-between z-20 shrink-0"
        style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl border" style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0', borderColor: '#3D2314' }}>
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif" style={{ color: '#3D2314' }}>Moje Knihovna</h2>
            <p className="text-xs" style={{ color: '#5C3A24' }}>
              {books.length === 1 ? '1 uložená kniha' : `${books.length} uložených knih`}
              {books.length !== processedBooks.length && ` (zobrazeno ${processedBooks.length})`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
          className="p-2 rounded-full cursor-pointer hover:opacity-90"
          aria-label="Zavřít"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar & Filter Toggle */}
      <div
        className="p-4 border-b shrink-0 space-y-3"
        style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3' }}
      >
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vyhledat v knihovně..."
              style={{ backgroundColor: '#FFFDF9', borderColor: '#8C593B', color: '#3D2314' }}
              className="w-full px-4 py-2.5 pl-10 border rounded-2xl text-xs focus:outline-none"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8C593B' }} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs p-1 rounded-full cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: showFilters || hasActiveFilters ? '#4A2E1B' : '#F2E8D8',
              borderColor: '#8C593B',
              color: showFilters || hasActiveFilters ? '#FAF6F0' : '#3D2314',
            }}
            className="px-3 py-2.5 border rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            title="Filtry a řazení"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtry</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Reset Filters Quick Button if active */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#B91C1C' }}
              className="p-2.5 border rounded-2xl text-xs font-bold flex items-center justify-center cursor-pointer shrink-0 hover:bg-red-50"
              title="Resetovat filtry"
              aria-label="Resetovat filtry"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsible Filter & Sorting Drawer */}
        {showFilters && (
          <div
            style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }}
            className="p-4 rounded-2xl border max-w-lg mx-auto space-y-3 animate-fadeIn text-xs"
          >
            <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: '#E6D7C3' }}>
              <span className="font-bold font-serif flex items-center gap-1.5" style={{ color: '#3D2314' }}>
                <Filter className="w-3.5 h-3.5" style={{ color: '#8C593B' }} />
                Podrobné filtrování a řazení
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  style={{ color: '#B91C1C' }}
                  className="font-bold flex items-center gap-1 text-[11px] cursor-pointer hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resetovat filtry</span>
                </button>
              )}
            </div>

            {/* Sorting */}
            <div>
              <label className="block font-bold mb-1 flex items-center gap-1" style={{ color: '#3D2314' }}>
                <ArrowUpDown className="w-3.5 h-3.5" style={{ color: '#8C593B' }} />
                Řazení:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ backgroundColor: '#FFFDF9', borderColor: '#8C593B', color: '#3D2314' }}
                className="w-full p-2 border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="date-desc">Datum přidání (od nejnovějších)</option>
                <option value="date-asc">Datum přidání (od nejstarších)</option>
                <option value="title-asc">Název (A – Z)</option>
                <option value="title-desc">Název (Z – A)</option>
                <option value="year-desc">Rok vydání (od nejnovějších)</option>
                <option value="year-asc">Rok vydání (od nejstarších)</option>
              </select>
            </div>

            {/* Filter: Žánr, Autor, Jazyk Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Žánr */}
              <div>
                <label className="block font-bold mb-1 truncate" style={{ color: '#3D2314' }}>
                  Žánr:
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  style={{ backgroundColor: '#FFFDF9', borderColor: '#8C593B', color: '#3D2314' }}
                  className="w-full p-2 border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Všechny žánry</option>
                  {filterOptions.genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Autor */}
              <div>
                <label className="block font-bold mb-1 truncate" style={{ color: '#3D2314' }}>
                  Autor:
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  style={{ backgroundColor: '#FFFDF9', borderColor: '#8C593B', color: '#3D2314' }}
                  className="w-full p-2 border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Všichni autoři</option>
                  {filterOptions.authors.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Jazyk */}
              <div>
                <label className="block font-bold mb-1 truncate" style={{ color: '#3D2314' }}>
                  Jazyk:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={{ backgroundColor: '#FFFDF9', borderColor: '#8C593B', color: '#3D2314' }}
                  className="w-full p-2 border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Všechny jazyky</option>
                  {filterOptions.languages.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Book List Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        {books.length === 0 ? (
          /* Empty Library State */
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
            <div className="w-20 h-20 rounded-3xl border flex items-center justify-center" style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#5C3A24' }}>
              <Book className="w-10 h-10 stroke-1" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif mb-1" style={{ color: '#3D2314' }}>Knihovna je zatím prázdná</h3>
              <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: '#5C3A24' }}>
                Naskenujte svou první knihu pomocí tlačítka "NASKENOVAT" na hlavní obrazovce.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  onStartScan();
                }}
                style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
                className="py-3 px-5 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wider font-serif cursor-pointer hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Naskenovat knihu
              </button>
              {onOpenManualInput && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenManualInput();
                  }}
                  style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
                  className="py-3 px-5 font-bold text-xs rounded-2xl border flex items-center justify-center gap-2 font-serif cursor-pointer hover:opacity-90"
                >
                  Přidat ručně / Vyhledat
                </button>
              )}
            </div>
          </div>
        ) : processedBooks.length === 0 ? (
          /* Search / Filter No Results State */
          <div className="text-center py-12 space-y-3">
            <p className="text-sm font-bold" style={{ color: '#3D2314' }}>Žádná kniha neodpovídá zvoleným filtrům</p>
            <p className="text-xs" style={{ color: '#5C3A24' }}>Zkuste upravit vyhledávání nebo resetovat aktivní filtry.</p>
            <button
              onClick={handleResetFilters}
              style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
              className="py-2 px-4 rounded-xl text-xs font-bold font-serif uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 hover:opacity-90"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetovat filtry</span>
            </button>
          </div>
        ) : (
          /* List of Books */
          <div className="space-y-3 pb-8">
            {processedBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3' }}
                className="group relative flex items-center gap-3.5 p-3 border rounded-2xl transition-all active:scale-[0.99] cursor-pointer hover:border-[#8C593B]"
              >
                {/* Book Cover */}
                <div style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }} className="relative w-14 h-20 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center">
                  <BookCoverImage
                    book={book}
                    size="thumb"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-bold font-serif line-clamp-2 leading-snug" style={{ color: '#3D2314' }}>
                    {book.title}
                  </h4>
                  <p className="text-xs font-semibold truncate mt-0.5" style={{ color: '#5C3A24' }}>
                    {book.author}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono" style={{ color: '#8C593B' }}>
                    {book.year && book.year !== 'Neuvedeno' && (
                      <>
                        <span>{book.year}</span>
                        <span>•</span>
                      </>
                    )}
                    <span className="truncate">{book.genre || book.isbn}</span>
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
                    className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-red-50"
                    title="Odstranit knihu"
                    aria-label="Odstranit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-1" style={{ color: '#8C593B' }}>
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
