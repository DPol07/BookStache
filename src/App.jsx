import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MainScreen from './components/MainScreen';
import ScannerModal from './components/ScannerModal';
import ManualBookModal from './components/ManualBookModal';
import BookResultModal from './components/BookResultModal';
import LibraryModal from './components/LibraryModal';
import BookDetailModal from './components/BookDetailModal';

import { fetchBookByIsbn } from './services/bookApi';
import { getSavedBooks, saveBook, deleteBook, findDuplicateBook } from './services/storage';

export default function App() {
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [scannedBookResult, setScannedBookResult] = useState(null); // { book, searched: bool }
  const [selectedBookForDetail, setSelectedBookForDetail] = useState(null);

  // Load saved books from localStorage on mount
  useEffect(() => {
    const saved = getSavedBooks();
    setLibraryBooks(saved);
  }, []);

  // Handle ISBN search (from scanner or manual entry)
  const handleLookupIsbn = async (rawInput) => {
    setIsScannerOpen(false);
    setIsManualInputOpen(false);
    setIsLoadingBook(true);

    try {
      const bookData = await fetchBookByIsbn(rawInput);
      setScannedBookResult({ book: bookData, searched: true });
    } catch (e) {
      console.error('Error fetching book:', e);
      setScannedBookResult({ book: null, searched: true });
    } finally {
      setIsLoadingBook(false);
    }
  };

  // Check if current scanned book is already in the library
  const duplicateExistingBook = scannedBookResult?.book
    ? findDuplicateBook(scannedBookResult.book, libraryBooks)
    : null;

  // Save book and return to main screen
  const handleSaveBook = (bookToSave) => {
    if (!bookToSave) return;
    const result = saveBook(bookToSave);
    const updated = getSavedBooks();
    setLibraryBooks(updated);

    setTimeout(() => {
      setScannedBookResult(null);
    }, 300);
    return result;
  };

  // Direct save for manual books without ISBN or online search selections
  const handleSaveDirectBook = (bookToSave) => {
    if (!bookToSave) return;
    saveBook(bookToSave);
    const updated = getSavedBooks();
    setLibraryBooks(updated);
    setIsManualInputOpen(false);
  };

  // Open existing book detail from duplicate detection notice
  const handleOpenExistingBook = (existingBook) => {
    setScannedBookResult(null);
    setSelectedBookForDetail(existingBook);
  };

  // Delete book from library
  const handleDeleteBook = (id) => {
    deleteBook(id);
    const updated = getSavedBooks();
    setLibraryBooks(updated);

    if (selectedBookForDetail && selectedBookForDetail.id === id) {
      setSelectedBookForDetail(null);
    }
  };

  return (
    <div
      style={{ backgroundColor: '#FAF6F0', color: '#3D2314' }}
      className="min-h-screen flex flex-col font-sans"
    >
      {/* Header with Top Left "Knihovna" button */}
      <Header
        libraryCount={libraryBooks.length}
        onOpenLibrary={() => setIsLibraryOpen(true)}
      />

      {/* Main Home Screen */}
      <MainScreen
        onStartScan={() => setIsScannerOpen(true)}
        onOpenManualInput={() => setIsManualInputOpen(true)}
        libraryCount={libraryBooks.length}
      />

      {/* Barcode Scanner Viewfinder Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleLookupIsbn}
        onOpenManualInput={() => {
          setIsScannerOpen(false);
          setIsManualInputOpen(true);
        }}
      />

      {/* Unified Manual Book & Search Entry Modal */}
      <ManualBookModal
        isOpen={isManualInputOpen}
        onClose={() => setIsManualInputOpen(false)}
        onSubmitIsbn={handleLookupIsbn}
        onSaveDirectBook={handleSaveDirectBook}
      />

      {/* Book Result Modal (Scanned / Searched) */}
      <BookResultModal
        isOpen={isLoadingBook || (scannedBookResult && scannedBookResult.searched)}
        isLoading={isLoadingBook}
        book={scannedBookResult?.book || null}
        existingDuplicate={duplicateExistingBook}
        onOpenExistingBook={handleOpenExistingBook}
        onClose={() => setScannedBookResult(null)}
        onSaveBook={handleSaveBook}
        onRetryScan={() => {
          setScannedBookResult(null);
          setIsScannerOpen(true);
        }}
        onOpenManualInput={() => {
          setScannedBookResult(null);
          setIsManualInputOpen(true);
        }}
      />

      {/* "Knihovna" Library View Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        books={libraryBooks}
        onClose={() => setIsLibraryOpen(false)}
        onSelectBook={(book) => setSelectedBookForDetail(book)}
        onDeleteBook={handleDeleteBook}
        onStartScan={() => setIsScannerOpen(true)}
        onOpenManualInput={() => setIsManualInputOpen(true)}
      />

      {/* Book Detail Modal (from Library) */}
      <BookDetailModal
        isOpen={!!selectedBookForDetail}
        book={selectedBookForDetail}
        onClose={() => setSelectedBookForDetail(null)}
        onDeleteBook={handleDeleteBook}
      />
    </div>
  );
}
