import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MainScreen from './components/MainScreen';
import ScannerModal from './components/ScannerModal';
import ManualIsbnModal from './components/ManualIsbnModal';
import BookResultModal from './components/BookResultModal';
import LibraryModal from './components/LibraryModal';
import BookDetailModal from './components/BookDetailModal';

import { fetchBookByIsbn } from './services/bookApi';
import { getSavedBooks, saveBook, deleteBook } from './services/storage';

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
  const handleLookupIsbn = async (isbn) => {
    setIsScannerOpen(false);
    setIsManualInputOpen(false);
    setIsLoadingBook(true);
    setScannedBookResult({ book: null, searched: true });

    try {
      const bookData = await fetchBookByIsbn(isbn);
      setScannedBookResult({ book: bookData, searched: true });
    } catch (e) {
      console.error('Error fetching book:', e);
      setScannedBookResult({ book: null, searched: true });
    } finally {
      setIsLoadingBook(false);
    }
  };

  // Save book and return to main screen
  const handleSaveBook = (bookToSave) => {
    if (!bookToSave) return;
    saveBook(bookToSave);
    const updated = getSavedBooks();
    setLibraryBooks(updated);

    // Smooth transition back to main screen
    setTimeout(() => {
      setScannedBookResult(null);
    }, 400);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
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

      {/* Manual ISBN Entry Modal */}
      <ManualIsbnModal
        isOpen={isManualInputOpen}
        onClose={() => setIsManualInputOpen(false)}
        onSubmitIsbn={handleLookupIsbn}
      />

      {/* Book Result Modal (Scanned / Searched) */}
      <BookResultModal
        isOpen={isLoadingBook || (scannedBookResult && scannedBookResult.searched)}
        isLoading={isLoadingBook}
        book={scannedBookResult?.book || null}
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
