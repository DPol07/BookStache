import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchBookByIsbn,
  toDisplayText,
  mergeBookMetadata,
  assembleCoverCandidates,
  findTitleInKnowledgeBase,
  normalizeTitleForMatch,
} from '../src/services/bookApi.js';

test('converts provider metadata objects into readable text', () => {
  assert.equal(toDisplayText({ title: 'Book title' }), 'Book title');
  assert.equal(toDisplayText([{ name: 'First' }, { name: 'Second' }]), 'First, Second');
  assert.equal(toDisplayText(null, 'fallback'), 'fallback');
});

test('normalizeTitleForMatch handles accents and punctuation correctly', () => {
  assert.equal(normalizeTitleForMatch('Rady zkušeného ďábla'), 'rady zkuseneho dabla');
  assert.equal(normalizeTitleForMatch('Zápisky o válce galské!'), 'zapisky o valce galske');
  assert.equal(normalizeTitleForMatch('Zraněné srdce'), 'zranene srdce');
});

test('findTitleInKnowledgeBase identifies requested test books', () => {
  const lewis = findTitleInKnowledgeBase('Rady zkušeného ďábla');
  assert.notEqual(lewis, null);
  assert.equal(lewis.author, 'C. S. Lewis');

  const caesar = findTitleInKnowledgeBase('Zápisky o válce galské');
  assert.notEqual(caesar, null);
  assert.equal(caesar.author, 'Gaius Iulius Caesar');

  const eldredge = findTitleInKnowledgeBase('Zraněné srdce');
  assert.notEqual(eldredge, null);
  assert.equal(eldredge.author, 'John Eldredge');
});

test('mergeBookMetadata preserves existing valid metadata and supplements missing fields', () => {
  const primary = {
    title: 'Duna',
    author: 'Frank Herbert',
    year: 'Neuvedeno',
    publisher: '',
    genre: 'Všeobecná literatura',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Čeština',
  };

  const supplement = {
    title: 'Dune (English Title)', // should NOT overwrite primary title
    author: 'F. Herbert', // should NOT overwrite primary author
    year: '1965',
    publisher: 'Chilton Books',
    genre: 'Sci-Fi',
    ageGroup: 'Mládež (12-18 let)',
    language: 'Angličtina',
  };

  const merged = mergeBookMetadata(primary, supplement);
  assert.equal(merged.title, 'Duna');
  assert.equal(merged.author, 'Frank Herbert');
  assert.equal(merged.year, '1965');
  assert.equal(merged.publisher, 'Chilton Books');
  assert.equal(merged.genre, 'Sci-Fi');
});

test('assembleCoverCandidates strictly respects the required 5-level priority chain', () => {
  const candidates = assembleCoverCandidates({
    cleanIsbn: '9788000058825',
    obalkyCover: 'https://www.obalkyknih.cz/api/cover?isbn=9788000058825',
    gbIsbnCover: 'https://books.google.com/cover-isbn.jpg',
    olIsbnCover: 'https://covers.openlibrary.org/b/id/10523420-L.jpg',
    gbQueryCover: 'https://books.google.com/cover-query.jpg',
    olQueryCover: 'https://covers.openlibrary.org/b/id/9999999-L.jpg',
  });

  assert.equal(candidates[0], 'https://www.obalkyknih.cz/api/cover?isbn=9788000058825');
  assert.equal(candidates[1], 'https://books.google.com/cover-isbn.jpg');
  assert.equal(candidates[2], 'https://covers.openlibrary.org/b/id/10523420-L.jpg');
  assert.ok(candidates.includes('https://books.google.com/cover-query.jpg'));
  assert.ok(candidates.includes('https://covers.openlibrary.org/b/id/9999999-L.jpg'));
});

test('returns render-safe fields for object-shaped Knihovny.cz metadata', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url) => {
    if (String(url).includes('www.knihovny.cz')) {
      return {
        ok: true,
        json: async () => ({ records: [{
          title: { title: 'Personal MBA' },
          authors: [{ name: 'Josh Kaufman' }],
          publishDate: 2020,
          publisher: [{ name: 'Portfolio' }],
          genres: [{ name: 'Business' }],
          cover: true,
        }] }),
      };
    }
    return { ok: false, json: async () => ({}) };
  };

  const book = await fetchBookByIsbn('9780525543022');
  assert.equal(book.title, 'Personal MBA');
  assert.equal(book.author, 'Josh Kaufman');
  assert.equal(book.year, '2020');
  assert.equal(book.publisher, 'Portfolio');
  assert.equal(book.genre, 'Business');
  assert.equal(typeof book.cover, 'string');
  assert.ok(Array.isArray(book.coverCandidates));
  assert.ok(book.coverCandidates.length > 0);
});

test('supplements missing author and year for test book Rady zkuseneho dabla when ISBN query has missing author', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  // Simulate ISBN response that found only the title but no author or year
  globalThis.fetch = async (url) => {
    const sUrl = String(url);
    if (sUrl.includes('www.knihovny.cz')) {
      return {
        ok: true,
        json: async () => ({ records: [{
          title: 'Rady zkušeného ďábla',
          authors: [],
          publishDate: null,
          publisher: null,
        }] }),
      };
    }
    return { ok: false, json: async () => ({}) };
  };

  const book = await fetchBookByIsbn('9788071953258');
  assert.notEqual(book, null);
  assert.equal(book.title, 'Rady zkušeného ďábla');
  // Author and year should be successfully filled in without being overwritten
  assert.equal(book.author, 'C. S. Lewis');
  assert.notEqual(book.year, 'Neuvedeno');
  assert.ok(book.coverCandidates.length > 0);
});

test('supplements missing author and year for test book Zapisky o valce galske when ISBN query has missing author', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = async (url) => {
    const sUrl = String(url);
    if (sUrl.includes('www.knihovny.cz')) {
      return {
        ok: true,
        json: async () => ({ records: [{
          title: 'Zápisky o válce galské',
          authors: [],
          publishDate: null,
          publisher: null,
        }] }),
      };
    }
    return { ok: false, json: async () => ({}) };
  };

  const book = await fetchBookByIsbn('9788086410401');
  assert.notEqual(book, null);
  assert.equal(book.title, 'Zápisky o válce galské');
  assert.equal(book.author, 'Gaius Iulius Caesar');
  assert.notEqual(book.year, 'Neuvedeno');
});

test('supplements missing author and year for test book Zranene srdce when ISBN query has missing author', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = async (url) => {
    const sUrl = String(url);
    if (sUrl.includes('www.knihovny.cz')) {
      return {
        ok: true,
        json: async () => ({ records: [{
          title: 'Zraněné srdce',
          authors: [],
          publishDate: null,
          publisher: null,
        }] }),
      };
    }
    return { ok: false, json: async () => ({}) };
  };

  const book = await fetchBookByIsbn('9788072551521');
  assert.notEqual(book, null);
  assert.equal(book.title, 'Zraněné srdce');
  assert.equal(book.author, 'John Eldredge');
  assert.notEqual(book.year, 'Neuvedeno');
});

test('evaluates multiple items from Google Books query and selects the best matching candidate with cover', async () => {
  const { selectBestGoogleBooksCandidate } = await import('../src/services/bookApi.js');

  const items = [
    {
      volumeInfo: {
        title: 'Unrelated Title',
        authors: ['Other Author'],
        publishedDate: '1990',
      },
    },
    {
      volumeInfo: {
        title: 'Rady zkušeného ďábla',
        authors: ['C. S. Lewis'],
        publishedDate: '2008',
        publisher: 'Návrat domů',
        imageLinks: {
          thumbnail: 'http://books.google.com/rady-thumb.jpg',
        },
      },
    },
    {
      volumeInfo: {
        title: 'Rady zkuseneho dabla - pracovni sesit',
        authors: ['Někdo Jiný'],
      },
    },
  ];

  const best = selectBestGoogleBooksCandidate(items, 'Rady zkušeného ďábla', 'C. S. Lewis');
  assert.notEqual(best, null);
  assert.equal(best.title, 'Rady zkušeného ďábla');
  assert.equal(best.author, 'C. S. Lewis');
  assert.equal(best.year, '2008');
  assert.equal(best.cover, 'https://books.google.com/rady-thumb.jpg');
});

test('evaluates multiple items from Open Library docs and selects candidate with title match and cover', async () => {
  const { selectBestOpenLibraryCandidate } = await import('../src/services/bookApi.js');

  const docs = [
    {
      title: 'Random Book',
      author_name: ['Nobody'],
      first_publish_year: 1980,
    },
    {
      title: 'Zraněné srdce',
      author_name: ['John Eldredge'],
      first_publish_year: 2007,
      publisher: ['Návrat domů'],
      cover_i: 6808063,
    },
  ];

  const best = selectBestOpenLibraryCandidate(docs, 'Zraněné srdce', 'John Eldredge');
  assert.notEqual(best, null);
  assert.equal(best.title, 'Zraněné srdce');
  assert.equal(best.author, 'John Eldredge');
  assert.equal(best.year, '2007');
  assert.equal(best.cover, 'https://covers.openlibrary.org/b/id/6808063-L.jpg');
});
