/**
 * Library filtering and sorting helpers
 */

/**
 * Filter books by query, genre, author, and language
 */
export function filterBooks(books, { searchQuery = '', genre = '', author = '', language = '' } = {}) {
  if (!Array.isArray(books)) return [];

  const q = searchQuery.toLowerCase().trim();

  return books.filter((book) => {
    // 1. Search Query filter (matches title, author, isbn, genre)
    if (q) {
      const matchTitle = book.title && book.title.toLowerCase().includes(q);
      const matchAuthor = book.author && book.author.toLowerCase().includes(q);
      const matchIsbn = (book.isbn && book.isbn.toLowerCase().includes(q)) || (book.rawIsbn && book.rawIsbn.toLowerCase().includes(q));
      const matchGenre = book.genre && book.genre.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchIsbn && !matchGenre) {
        return false;
      }
    }

    // 2. Genre filter
    if (genre && genre !== 'all') {
      if (book.genre !== genre) {
        return false;
      }
    }

    // 3. Author filter
    if (author && author !== 'all') {
      if (book.author !== author) {
        return false;
      }
    }

    // 4. Language filter
    if (language && language !== 'all') {
      const bookLang = book.language || 'Neznámý';
      if (bookLang !== language) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort books according to sortBy criterion
 * Options:
 * - 'title-asc': Název (A–Z)
 * - 'title-desc': Název (Z–A)
 * - 'year-desc': Rok vydání (nejnovější)
 * - 'year-asc': Rok vydání (nejstarší)
 * - 'date-desc': Datum přidání (nejnovější)
 * - 'date-asc': Datum přidání (nejstarší)
 */
export function sortBooks(books, sortBy = 'date-desc') {
  if (!Array.isArray(books)) return [];
  const list = [...books];

  return list.sort((a, b) => {
    switch (sortBy) {
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '', 'cs');
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '', 'cs');
      case 'year-desc': {
        const yA = parseInt(a.year, 10) || 0;
        const yB = parseInt(b.year, 10) || 0;
        return yB - yA;
      }
      case 'year-asc': {
        const yA = parseInt(a.year, 10) || 999999;
        const yB = parseInt(b.year, 10) || 999999;
        return yA - yB;
      }
      case 'date-asc': {
        const dA = new Date(a.savedAt || 0).getTime();
        const dB = new Date(b.savedAt || 0).getTime();
        return dA - dB;
      }
      case 'date-desc':
      default: {
        const dA = new Date(a.savedAt || 0).getTime();
        const dB = new Date(b.savedAt || 0).getTime();
        return dB - dA;
      }
    }
  });
}

/**
 * Extract unique options from saved books for dropdown filters
 */
export function getUniqueFilterOptions(books = []) {
  const genres = new Set();
  const authors = new Set();
  const languages = new Set();

  for (const b of books) {
    if (b.genre && b.genre !== 'Neuvedeno') genres.add(b.genre);
    if (b.author && b.author !== 'Neznámý autor' && b.author !== 'Neuvedeno') authors.add(b.author);
    const lang = b.language || 'Neznámý';
    if (lang && lang !== 'Neuvedeno') languages.add(lang);
  }

  return {
    genres: Array.from(genres).sort((a, b) => a.localeCompare(b, 'cs')),
    authors: Array.from(authors).sort((a, b) => a.localeCompare(b, 'cs')),
    languages: Array.from(languages).sort((a, b) => a.localeCompare(b, 'cs')),
  };
}
