const STORAGE_KEY = 'bookstache_library_v1';

/**
 * Retrieve all saved books from localStorage
 */
export function getSavedBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const books = JSON.parse(raw);
    return Array.isArray(books) ? books : [];
  } catch (e) {
    console.error('Failed to read books from localStorage:', e);
    return [];
  }
}

/**
 * Save a new book to local library. Avoid duplicates by rawIsbn or id.
 */
export function saveBook(book) {
  if (!book) return false;
  try {
    const books = getSavedBooks();
    // Check if already exists (by rawIsbn or title if rawIsbn missing)
    const existingIndex = books.findIndex(
      b => (b.rawIsbn && book.rawIsbn && b.rawIsbn === book.rawIsbn) || b.id === book.id
    );

    const bookToSave = {
      ...book,
      id: book.id || `book-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      savedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing book
      books[existingIndex] = { ...books[existingIndex], ...bookToSave };
    } else {
      // Add to beginning of array
      books.unshift(bookToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    return true;
  } catch (e) {
    console.error('Failed to save book to localStorage:', e);
    return false;
  }
}

/**
 * Remove a book by ID from localStorage
 */
export function deleteBook(id) {
  try {
    const books = getSavedBooks();
    const filtered = books.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to delete book from localStorage:', e);
    return false;
  }
}

/**
 * Search saved books by title or author
 */
export function searchBooks(query) {
  const books = getSavedBooks();
  if (!query || !query.trim()) return books;

  const q = query.toLowerCase().trim();
  return books.filter(b =>
    (b.title && b.title.toLowerCase().includes(q)) ||
    (b.author && b.author.toLowerCase().includes(q)) ||
    (b.isbn && b.isbn.toLowerCase().includes(q)) ||
    (b.genre && b.genre.toLowerCase().includes(q))
  );
}
