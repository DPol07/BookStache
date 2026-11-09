import React, { useState } from 'react';
import {
  X,
  Search,
  Keyboard,
  Book,
  Sparkles,
  BookPlus,
  Compass,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Tag,
  Users,
  Globe,
  Hash,
  Loader2,
  Palette
} from 'lucide-react';
import { searchBooksOnline, formatIsbnDisplay, normalizeIsbn } from '../services/bookApi';
import BookCoverImage from './BookCoverImage';

const COVER_COLORS = [
  { name: 'Kávová', bg: '#4A2E1B', text: '#FAF6F0' },
  { name: 'Karamelová', bg: '#8C593B', text: '#FAF6F0' },
  { name: 'Vínová', bg: '#7F1D1D', text: '#FAF6F0' },
  { name: 'Tmavě modrá', bg: '#1E3A5F', text: '#FAF6F0' },
  { name: 'Lesní zelená', bg: '#1B4332', text: '#FAF6F0' },
  { name: 'Břidlicová', bg: '#334155', text: '#FAF6F0' },
];

export default function ManualBookModal({
  isOpen,
  onClose,
  onSubmitIsbn,
  onSaveDirectBook,
}) {
  const [activeTab, setActiveTab] = useState('isbn'); // 'isbn' | 'search' | 'manual'

  // Tab 1: ISBN
  const [isbn, setIsbn] = useState('');

  // Tab 2: Online Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedOnlineBook, setSelectedOnlineBook] = useState(null);

  // Tab 3: Manual Direct Entry (Without ISBN)
  const [manualForm, setManualForm] = useState({
    title: '',
    author: '',
    year: '',
    publisher: '',
    genre: 'Krásná literatura / Próza',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Čeština',
    editionNote: '',
    coverColor: COVER_COLORS[0].bg,
  });
  const [manualSaved, setManualSaved] = useState(false);

  if (!isOpen) return null;

  // Handlers for Tab 1 (ISBN)
  const handleIsbnSubmit = (e) => {
    e.preventDefault();
    if (!isbn.trim()) return;
    onSubmitIsbn(isbn.trim());
    setIsbn('');
  };

  const handleSampleClick = (sampleIsbn) => {
    onSubmitIsbn(sampleIsbn);
    setIsbn('');
  };

  // Handlers for Tab 2 (Online Search by Title / Author)
  const handleOnlineSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSelectedOnlineBook(null);

    try {
      const results = await searchBooksOnline(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectOnlineResult = (book) => {
    // If book has valid ISBN, query it through standard flow for maximum cover resolution,
    // otherwise save direct book metadata.
    if (book.rawIsbn) {
      onSubmitIsbn(book.rawIsbn);
    } else {
      onSaveDirectBook(book);
    }
  };

  // Handlers for Tab 3 (Manual book entry without ISBN)
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualForm.title.trim()) return;

    const newBook = {
      id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: manualForm.title.trim(),
      author: manualForm.author.trim() || 'Neznámý autor',
      year: manualForm.year.trim() || 'Neuvedeno',
      publisher: manualForm.publisher.trim() || 'Neuvedeno',
      genre: manualForm.genre.trim() || 'Krásná literatura / Próza',
      ageGroup: manualForm.ageGroup.trim() || 'Všeobecná veřejnost',
      language: manualForm.language.trim() || 'Čeština',
      editionNote: manualForm.editionNote.trim() || '',
      isbn: 'Bez ISBN',
      rawIsbn: '',
      cover: null,
      customCoverColor: manualForm.coverColor,
      scannedAt: new Date().toISOString(),
    };

    setManualSaved(true);
    setTimeout(() => {
      onSaveDirectBook(newBook);
      setManualSaved(false);
      setManualForm({
        title: '',
        author: '',
        year: '',
        publisher: '',
        genre: 'Krásná literatura / Próza',
        ageGroup: 'Všeobecná veřejnost',
        language: 'Čeština',
        editionNote: '',
        coverColor: COVER_COLORS[0].bg,
      });
    }, 350);
  };

  return (
    <div
      style={{ backgroundColor: 'rgba(61, 35, 20, 0.65)', backdropFilter: 'blur(3px)' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto"
    >
      <div
        style={{ backgroundColor: '#FFFDF9', borderColor: '#E6D7C3', color: '#3D2314' }}
        className="relative w-full max-w-lg my-auto border rounded-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl"
      >
        {/* Top-Right 'X' Close Button */}
        <button
          onClick={onClose}
          style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full cursor-pointer hover:opacity-90"
          aria-label="Zavřít"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div
          style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }}
          className="p-4 pt-5 border-b shrink-0"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
              className="p-2.5 rounded-2xl"
            >
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold font-serif" style={{ color: '#3D2314' }}>
                Přidat knihu
              </h3>
              <p style={{ color: '#5C3A24' }} className="text-xs">
                Vyberte způsob přidání knihy do vaší knihovny
              </p>
            </div>
          </div>

          {/* Navigation Segments */}
          <div
            style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B' }}
            className="grid grid-cols-3 p-1 rounded-2xl border text-xs font-bold"
          >
            <button
              onClick={() => setActiveTab('isbn')}
              style={{
                backgroundColor: activeTab === 'isbn' ? '#4A2E1B' : 'transparent',
                color: activeTab === 'isbn' ? '#FAF6F0' : '#5C3A24',
              }}
              className="py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Keyboard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Zadat ISBN</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              style={{
                backgroundColor: activeTab === 'search' ? '#4A2E1B' : 'transparent',
                color: activeTab === 'search' ? '#FAF6F0' : '#5C3A24',
              }}
              className="py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Online hledání</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              style={{
                backgroundColor: activeTab === 'manual' ? '#4A2E1B' : 'transparent',
                color: activeTab === 'manual' ? '#FAF6F0' : '#5C3A24',
              }}
              className="py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Palette className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Bez ISBN</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto p-5 flex-1">
          {/* TAB 1: Ruční zadání ISBN */}
          {activeTab === 'isbn' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h4 className="text-sm font-bold font-serif" style={{ color: '#3D2314' }}>
                  Zadání podle kódu ISBN
                </h4>
                <p className="text-xs" style={{ color: '#5C3A24' }}>
                  Vhodné, pokud je čárový kód poškozený, ale číslo ISBN je čitelné.
                </p>
              </div>

              <form onSubmit={handleIsbnSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="Např. 9788000058825 nebo 978-80-00058-82-5"
                    autoFocus
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-4 py-3.5 border rounded-2xl text-sm font-mono focus:outline-none"
                  />
                  <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#8C593B' }} />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
                    className="flex-1 py-3.5 font-semibold text-xs rounded-2xl border transition-colors cursor-pointer"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    disabled={!isbn.trim()}
                    style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0', opacity: isbn.trim() ? 1 : 0.6 }}
                    className="flex-1 py-3.5 font-bold text-xs rounded-2xl transition-all font-serif uppercase tracking-wider cursor-pointer"
                  >
                    Vyhledat knihu
                  </button>
                </div>
              </form>

              {/* Quick Samples */}
              <div style={{ borderColor: '#E6D7C3' }} className="pt-4 border-t space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#5C3A24' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Rychlé vyzkoušení s příklady:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleSampleClick('9788000058825')}
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
                    className="p-2.5 border rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
                  >
                    <Book className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#5C3A24' }} />
                    <div className="truncate">
                      <span className="font-bold block truncate">Harry Potter</span>
                      <span className="text-[10px] font-mono" style={{ color: '#8C593B' }}>9788000058825</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSampleClick('9788000058832')}
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
                    className="p-2.5 border rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
                  >
                    <Book className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#5C3A24' }} />
                    <div className="truncate">
                      <span className="font-bold block truncate">Malý princ</span>
                      <span className="text-[10px] font-mono" style={{ color: '#8C593B' }}>9788000058832</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSampleClick('9788020455826')}
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
                    className="p-2.5 border rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
                  >
                    <Book className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#5C3A24' }} />
                    <div className="truncate">
                      <span className="font-bold block truncate">1984 (Orwell)</span>
                      <span className="text-[10px] font-mono" style={{ color: '#8C593B' }}>9788020455826</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSampleClick('9788073819316')}
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3', color: '#3D2314' }}
                    className="p-2.5 border rounded-xl text-left transition-colors flex items-center gap-2 group cursor-pointer"
                  >
                    <Book className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" style={{ color: '#5C3A24' }} />
                    <div className="truncate">
                      <span className="font-bold block truncate">Alchymista</span>
                      <span className="text-[10px] font-mono" style={{ color: '#8C593B' }}>9788073819316</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BONUS – Vyhledávání online podle názvu a autora */}
          {activeTab === 'search' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-sm font-bold font-serif" style={{ color: '#3D2314' }}>
                  Vyhledávání podle názvu nebo autora
                </h4>
                <p className="text-xs" style={{ color: '#5C3A24' }}>
                  Vyhledejte knihu v databázích Google Books a Open Library a automaticky doplňte informace.
                </p>
              </div>

              <form onSubmit={handleOnlineSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Zadejte název knihy nebo autora..."
                    autoFocus
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-4 py-3 border rounded-2xl text-sm focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-xs"
                      style={{ color: '#8C593B' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0', opacity: searchQuery.trim() ? 1 : 0.6 }}
                  className="px-5 py-3 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 font-serif uppercase tracking-wider cursor-pointer"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Hledat</span>
                </button>
              </form>

              {/* Search Results Display */}
              {isSearching && (
                <div className="py-8 text-center space-y-2">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto" style={{ color: '#5C3A24' }} />
                  <p className="text-xs font-semibold" style={{ color: '#5C3A24' }}>
                    Prohledávám Google Books a Open Library...
                  </p>
                </div>
              )}

              {!isSearching && hasSearched && searchResults.length === 0 && (
                <div
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3' }}
                  className="p-6 border rounded-2xl text-center space-y-2"
                >
                  <AlertCircle className="w-8 h-8 mx-auto" style={{ color: '#8C593B' }} />
                  <p className="text-sm font-bold font-serif" style={{ color: '#3D2314' }}>
                    Žádné výsledky nenalezeny
                  </p>
                  <p className="text-xs" style={{ color: '#5C3A24' }}>
                    Zkuste upravit klíčová slova nebo zadejte knihu přímo v záložce "Bez ISBN".
                  </p>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#8C593B' }}>
                    Nalezené knihy ({searchResults.length}):
                  </p>
                  {searchResults.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectOnlineResult(b)}
                      style={{ backgroundColor: '#FAF6F0', borderColor: '#E6D7C3' }}
                      className="p-3 border rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#8C593B] transition-all group"
                    >
                      <div
                        style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B' }}
                        className="w-12 h-16 shrink-0 rounded-lg overflow-hidden border flex items-center justify-center relative"
                      >
                        <BookCoverImage book={b} size="thumb" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold font-serif truncate" style={{ color: '#3D2314' }}>
                          {b.title}
                        </h5>
                        <p className="text-[11px] truncate font-medium" style={{ color: '#5C3A24' }}>
                          {b.author}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px]" style={{ color: '#8C593B' }}>
                          {b.year && b.year !== 'Neuvedeno' && <span>{b.year}</span>}
                          {b.year && b.year !== 'Neuvedeno' && <span>•</span>}
                          <span>{b.source || (b.isbn ? `ISBN: ${b.isbn}` : 'Online databáze')}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold font-serif uppercase tracking-wider shrink-0"
                      >
                        Vybrat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Bod 3 – Ruční zápis knih bez ISBN */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 animate-fadeIn">
              <div>
                <h4 className="text-sm font-bold font-serif" style={{ color: '#3D2314' }}>
                  Ruční zápis knihy bez ISBN
                </h4>
                <p className="text-xs" style={{ color: '#5C3A24' }}>
                  Pro starší tisky, samizdaty nebo knihy bez přiděleného kódu ISBN.
                </p>
              </div>

              {/* Title & Author */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Název knihy <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.title}
                    onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                    placeholder="Např. Babička nebo Staré pověsti české"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Autor
                  </label>
                  <input
                    type="text"
                    value={manualForm.author}
                    onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
                    placeholder="Např. Božena Němcová"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Year & Publisher */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Rok vydání
                  </label>
                  <input
                    type="text"
                    value={manualForm.year}
                    onChange={(e) => setManualForm({ ...manualForm, year: e.target.value })}
                    placeholder="Např. 1925"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Nakladatelství
                  </label>
                  <input
                    type="text"
                    value={manualForm.publisher}
                    onChange={(e) => setManualForm({ ...manualForm, publisher: e.target.value })}
                    placeholder="Např. J. Otto"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none"
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
                    value={manualForm.genre}
                    onChange={(e) => setManualForm({ ...manualForm, genre: e.target.value })}
                    placeholder="Např. Historický román"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                    Jazyk
                  </label>
                  <input
                    type="text"
                    value={manualForm.language}
                    onChange={(e) => setManualForm({ ...manualForm, language: e.target.value })}
                    placeholder="Čeština"
                    style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Edition Note / Rozlišení vydání */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#3D2314' }}>
                  Poznámka o vydání (např. 2. vydání, vázaná, ilustrovaná)
                </label>
                <input
                  type="text"
                  value={manualForm.editionNote}
                  onChange={(e) => setManualForm({ ...manualForm, editionNote: e.target.value })}
                  placeholder="Např. 3. přepracované vydání, ilustrace Adolf Kašpar"
                  style={{ backgroundColor: '#FAF6F0', borderColor: '#8C593B', color: '#3D2314' }}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none"
                />
              </div>

              {/* Custom Cover Color / Styling */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#3D2314' }}>
                  Barva obálky knihy
                </label>
                <div className="flex items-center gap-2">
                  {COVER_COLORS.map((c) => (
                    <button
                      key={c.bg}
                      type="button"
                      onClick={() => setManualForm({ ...manualForm, coverColor: c.bg })}
                      style={{
                        backgroundColor: c.bg,
                        borderColor: manualForm.coverColor === c.bg ? '#FAF6F0' : 'transparent',
                        outline: manualForm.coverColor === c.bg ? '2px solid #4A2E1B' : 'none',
                      }}
                      className="w-8 h-8 rounded-full border-2 transition-transform cursor-pointer"
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  style={{ backgroundColor: '#F2E8D8', borderColor: '#8C593B', color: '#3D2314' }}
                  className="flex-1 py-3.5 font-semibold text-xs rounded-2xl border transition-colors cursor-pointer"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={!manualForm.title.trim() || manualSaved}
                  style={{
                    backgroundColor: manualSaved ? '#15803D' : '#4A2E1B',
                    color: '#FAF6F0',
                    opacity: manualForm.title.trim() ? 1 : 0.6,
                  }}
                  className="flex-1 py-3.5 font-bold text-xs rounded-2xl transition-all font-serif uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  {manualSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Uloženo!
                    </>
                  ) : (
                    <>
                      <BookPlus className="w-4 h-4" />
                      Uložit do knihovny
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
