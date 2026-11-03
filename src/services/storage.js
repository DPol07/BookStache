import { normalizeIsbn } from './bookApi.js';

const STORAGE_KEY = 'bookstache_library_v1';

/**
 * Convert 10-digit ISBN to 13-digit ISBN if possible.
 */
export function isbn10To13(isbn10) {
  const clean = normalizeIsbn(isbn10);
  if (clean.length !== 10) return null;
  const core = '978' + clean.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(core[i], 10);
    if (isNaN(digit)) return null;
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return core + check;
}

/**
 * Compare two ISBNs for equivalence after normalization and 10/13-digit conversion.
 */
export function isSameIsbn(isbnA, isbnB) {
  const cleanA = normalizeIsbn(isbnA);
  const cleanB = normalizeIsbn(isbnB);
  if (!cleanA || !cleanB) return false;
  if (cleanA === cleanB) return true;

  // Check 10-digit to 13-digit conversion
  if (cleanA.length === 10 && cleanB.length === 13) {
    return isbn10To13(cleanA) === cleanB;
  }
  if (cleanA.length === 13 && cleanB.length === 10) {
    return cleanA === isbn10To13(cleanB);
  }
  return false;
}

/**
 * Normalize text: remove accents/diacritics, lowercase, collapse spaces, trim.
 */
export function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Find if a duplicate of targetBook exists in the books collection.
 * Identifies duplicates by ISBN when available, with title-and-author fallback when ISBN is missing.
 * Returns the matching existing book, or null if none found.
 */
export function findDuplicateBook(targetBook, books = []) {
  if (!targetBook || !Array.isArray(books) || books.length === 0) return null;

  const targetIsbn = targetBook.rawIsbn || targetBook.isbn;
  const cleanTargetIsbn = normalizeIsbn(targetIsbn);

  const targetTitleNorm = normalizeText(targetBook.title);
  const targetAuthorNorm = normalizeText(targetBook.author);

  for (const candidate of books) {
    if (!candidate) continue;

    // Direct ID match
    if (targetBook.id && candidate.id && targetBook.id === candidate.id) {
      return candidate;
    }

    const candidateIsbn = candidate.rawIsbn || candidate.isbn;
    const cleanCandidateIsbn = normalizeIsbn(candidateIsbn);

    if (cleanTargetIsbn && cleanCandidateIsbn) {
      if (isSameIsbn(cleanTargetIsbn, cleanCandidateIsbn)) {
        return candidate;
      }
    } else {
      // ISBN is missing on either the target book or candidate book
      if (
        targetTitleNorm &&
        candidate.title &&
        targetTitleNorm === normalizeText(candidate.title) &&
        targetAuthorNorm &&
        candidate.author &&
        targetAuthorNorm === normalizeText(candidate.author)
      ) {
        return candidate;
      }
    }
  }

  return null;
}

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
 * Save a new book to local library. Prevent duplicate entries.
 * Returns { success: boolean, book: Object, isDuplicate: boolean }
 */
export function saveBook(book) {
  if (!book) return { success: false, book: null, isDuplicate: false };
  try {
    const books = getSavedBooks();
    const existing = findDuplicateBook(book, books);

    if (existing) {
      // Do not duplicate; update existing entry if needed or return existing
      const updatedBook = {
        ...existing,
        ...book,
        id: existing.id, // preserve existing id
        savedAt: existing.savedAt || new Date().toISOString(),
      };
      const existingIdx = books.findIndex(b => b.id === existing.id);
      if (existingIdx >= 0) {
        books[existingIdx] = updatedBook;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      return { success: true, book: updatedBook, isDuplicate: true };
    }

    const bookToSave = {
      ...book,
      id: book.id || `book-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      savedAt: new Date().toISOString(),
    };

    books.unshift(bookToSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    return { success: true, book: bookToSave, isDuplicate: false };
  } catch (e) {
    console.error('Failed to save book to localStorage:', e);
    return { success: false, book: null, isDuplicate: false };
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

  const q = normalizeText(query);
  return books.filter(b =>
    (b.title && normalizeText(b.title).includes(q)) ||
    (b.author && normalizeText(b.author).includes(q)) ||
    (b.isbn && normalizeIsbn(b.isbn).includes(q)) ||
    (b.genre && normalizeText(b.genre).includes(q))
  );
}
