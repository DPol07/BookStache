import { normalizeIsbn, fetchBookByIsbn, mergeBookMetadata, isFieldMissing } from './bookApi.js';

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

/**
 * Check whether a stored book has any missing metadata or missing cover candidates
 */
export function doesBookNeedEnrichment(book) {
  if (!book) return false;
  const hasMissingAuthor = isFieldMissing(book.author, ['Neznámý autor', '']);
  const hasMissingYear = isFieldMissing(book.year, ['Neuvedeno', 'Rok vydání neuveden', '']);
  const hasMissingPublisher = isFieldMissing(book.publisher, ['Neuvedeno', 'Nakladatelství neuvedeno', '']);
  const hasMissingGenre = isFieldMissing(book.genre, ['Všeobecná literatura', 'Beletrie', '']);
  const hasMissingCover = !book.cover;
  const hasMissingCoverCandidates = !Array.isArray(book.coverCandidates) || book.coverCandidates.length === 0;

  return hasMissingAuthor || hasMissingYear || hasMissingPublisher || hasMissingGenre || hasMissingCover || hasMissingCoverCandidates;
}

/**
 * Enrich a single saved book using newly fetched data while preserving valid existing data
 */
export function enrichBookRecord(existingBook, freshData) {
  if (!existingBook) return null;
  if (!freshData) return existingBook;

  const mergedMeta = mergeBookMetadata(existingBook, freshData);

  // Preserve existing cover candidates, append fresh candidates without duplicates
  const existingCandidates = Array.isArray(existingBook.coverCandidates) ? existingBook.coverCandidates : (existingBook.cover ? [existingBook.cover] : []);
  const freshCandidates = Array.isArray(freshData.coverCandidates) ? freshData.coverCandidates : (freshData.cover ? [freshData.cover] : []);

  const combinedCandidates = [...existingCandidates];
  for (const c of freshCandidates) {
    if (c && !combinedCandidates.includes(c)) {
      combinedCandidates.push(c);
    }
  }

  const resolvedCover = existingBook.cover || freshData.cover || combinedCandidates[0] || null;

  return {
    ...existingBook,
    title: mergedMeta.title || existingBook.title,
    author: mergedMeta.author || existingBook.author,
    year: mergedMeta.year || existingBook.year,
    publisher: mergedMeta.publisher || existingBook.publisher,
    genre: mergedMeta.genre || existingBook.genre,
    ageGroup: mergedMeta.ageGroup || existingBook.ageGroup,
    language: mergedMeta.language || existingBook.language,
    cover: resolvedCover,
    coverCandidates: combinedCandidates,
    fallbackCover: existingBook.fallbackCover || freshData.fallbackCover || combinedCandidates[1] || null,
    enrichedAt: new Date().toISOString(),
  };
}

/**
 * Refresh and enrich missing data in all saved library books asynchronously.
 * Skips already complete records. Updates localStorage and calls onUpdated callback if any changes occur.
 */
export async function refreshSavedBooks(onUpdated) {
  const books = getSavedBooks();
  if (!books || books.length === 0) return books;

  let anyUpdated = false;
  const updatedBooks = [...books];

  for (let i = 0; i < updatedBooks.length; i++) {
    const book = updatedBooks[i];
    if (!doesBookNeedEnrichment(book)) {
      continue;
    }

    const rawIsbn = book.rawIsbn || normalizeIsbn(book.isbn);
    if (!rawIsbn) continue;

    try {
      const freshData = await fetchBookByIsbn(rawIsbn);
      if (freshData) {
        const enriched = enrichBookRecord(book, freshData);
        // Only mark updated if metadata or cover candidates actually changed
        if (
          enriched.author !== book.author ||
          enriched.year !== book.year ||
          enriched.publisher !== book.publisher ||
          enriched.genre !== book.genre ||
          enriched.cover !== book.cover ||
          (enriched.coverCandidates?.length || 0) > (book.coverCandidates?.length || 0)
        ) {
          updatedBooks[i] = enriched;
          anyUpdated = true;
        }
      }
    } catch (err) {
      console.warn(`Failed to refresh book ${book.title || rawIsbn}:`, err);
    }
  }

  if (anyUpdated) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBooks));
      if (typeof onUpdated === 'function') {
        onUpdated(updatedBooks);
      }
    } catch (e) {
      console.error('Failed to save refreshed books to localStorage:', e);
    }
  }

  return updatedBooks;
}
