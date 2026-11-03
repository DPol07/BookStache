import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findDuplicateBook,
  isSameIsbn,
  isbn10To13,
  normalizeText,
  saveBook,
  getSavedBooks,
} from '../src/services/storage.js';

test('normalizeText handles accents, lowercase, extra spaces', () => {
  assert.equal(
    normalizeText('  Kámen   mudrců  '),
    'kamen mudrcu'
  );
  assert.equal(
    normalizeText('J. K. Rowlingová'),
    'j. k. rowlingova'
  );
  assert.equal(
    normalizeText('Antoine de Saint-Exupéry'),
    'antoine de saint-exupery'
  );
});

test('isSameIsbn matches identical, hyphenated, and 10 vs 13 digit ISBNs', () => {
  // Same 13 digit
  assert.equal(isSameIsbn('978-80-00-05882-5', '9788000058825'), true);
  // ISBN-10 to ISBN-13 conversion: 8000058825 -> 9788000058825
  assert.equal(isbn10To13('8000058825'), '9788000058825');
  assert.equal(isSameIsbn('80-00-05882-5', '978-80-00-05882-5'), true);
  assert.equal(isSameIsbn('978-80-00-05882-5', '8000058825'), true);

  // Different ISBN
  assert.equal(isSameIsbn('9788000058825', '9788000058832'), false);
});

test('findDuplicateBook finds duplicate by ISBN', () => {
  const library = [
    {
      id: 'book-1',
      title: 'Harry Potter a Kámen mudrců',
      author: 'J. K. Rowlingová',
      isbn: '978-80-00058-82-5',
      rawIsbn: '9788000058825',
    },
    {
      id: 'book-2',
      title: 'Malý princ',
      author: 'Antoine de Saint-Exupéry',
      isbn: '978-80-00058-83-2',
      rawIsbn: '9788000058832',
    },
  ];

  const candidate = {
    title: 'Different Title Text',
    author: 'Someone Else',
    isbn: '978-80-00-05882-5',
  };

  const dup = findDuplicateBook(candidate, library);
  assert.ok(dup);
  assert.equal(dup.id, 'book-1');
});

test('findDuplicateBook falls back to title and author when ISBN is missing', () => {
  const library = [
    {
      id: 'book-1',
      title: 'Babička',
      author: 'Božena Němcová',
      isbn: '',
    },
  ];

  // Missing ISBN, accents/casing differences
  const candidate = {
    title: '  babička  ',
    author: 'BOŽENA NĚMCOVÁ ',
    isbn: '',
  };

  const dup = findDuplicateBook(candidate, library);
  assert.ok(dup);
  assert.equal(dup.id, 'book-1');

  // Different author
  const notDup = findDuplicateBook({ title: 'Babička', author: 'Karel Čapek' }, library);
  assert.equal(notDup, null);
});

test('saveBook prevents duplicates in localStorage', () => {
  // Mock localStorage
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = val; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };

  const book1 = {
    id: 'hp-1',
    title: 'Harry Potter',
    author: 'Rowling',
    isbn: '9788000058825',
    rawIsbn: '9788000058825',
  };

  const res1 = saveBook(book1);
  assert.equal(res1.success, true);
  assert.equal(res1.isDuplicate, false);
  assert.equal(getSavedBooks().length, 1);

  // Attempt duplicate save with 10-digit ISBN or formatted ISBN
  const res2 = saveBook({
    title: 'Harry Potter (Kámen mudrců)',
    author: 'J.K. Rowling',
    isbn: '978-80-00058-82-5',
    rawIsbn: '9788000058825',
  });

  assert.equal(res2.success, true);
  assert.equal(res2.isDuplicate, true);
  assert.equal(getSavedBooks().length, 1);
});

test('doesBookNeedEnrichment flags incomplete stored books', async () => {
  const { doesBookNeedEnrichment } = await import('../src/services/storage.js');

  assert.equal(doesBookNeedEnrichment({
    title: 'Rady zkušeného ďábla',
    author: 'Neznámý autor',
    year: '2008',
    cover: 'https://example.com/cover.jpg',
    coverCandidates: ['https://example.com/cover.jpg'],
  }), true);

  assert.equal(doesBookNeedEnrichment({
    title: 'Harry Potter',
    author: 'J. K. Rowlingová',
    year: '2000',
    publisher: 'Albatros',
    genre: 'Fantasy',
    cover: 'https://example.com/cover.jpg',
    coverCandidates: ['https://example.com/cover.jpg'],
  }), false);
});

test('enrichBookRecord supplements missing metadata without overwriting existing valid values', async () => {
  const { enrichBookRecord } = await import('../src/services/storage.js');

  const oldBook = {
    id: 'old-1',
    title: 'Rady zkušeného ďábla',
    author: 'Neznámý autor',
    year: 'Neuvedeno',
    publisher: 'Neuvedeno',
    genre: 'Všeobecná literatura',
    cover: null,
    coverCandidates: [],
    savedAt: '2023-01-01T00:00:00.000Z',
  };

  const freshData = {
    title: 'Rady zkušeného ďábla (vydání 2008)',
    author: 'C. S. Lewis',
    year: '2008',
    publisher: 'Návrat domů',
    genre: 'Křesťanská literatura / Alegorie',
    cover: 'https://covers.openlibrary.org/b/id/9779-L.jpg',
    coverCandidates: ['https://covers.openlibrary.org/b/id/9779-L.jpg'],
  };

  const enriched = enrichBookRecord(oldBook, freshData);
  assert.equal(enriched.id, 'old-1');
  assert.equal(enriched.title, 'Rady zkušeného ďábla'); // Existing title is kept
  assert.equal(enriched.author, 'C. S. Lewis'); // Missing author filled
  assert.equal(enriched.year, '2008'); // Missing year filled
  assert.equal(enriched.publisher, 'Návrat domů');
  assert.equal(enriched.cover, 'https://covers.openlibrary.org/b/id/9779-L.jpg');
  assert.equal(enriched.savedAt, '2023-01-01T00:00:00.000Z');
  assert.ok(enriched.enrichedAt);
});

test('refreshSavedBooks updates old incomplete books in localStorage asynchronously', async () => {
  const { refreshSavedBooks } = await import('../src/services/storage.js');

  // Setup localStorage with an old incomplete book
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = val; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };

  const oldSavedBooks = [
    {
      id: 'old-book-1',
      title: 'Rady zkušeného ďábla',
      author: 'Neznámý autor',
      year: 'Neuvedeno',
      isbn: '978-80-7195-325-8',
      rawIsbn: '9788071953258',
      cover: null,
      coverCandidates: [],
    },
  ];

  store['bookstache_library_v1'] = JSON.stringify(oldSavedBooks);

  let callbackCalledWith = null;
  const refreshed = await refreshSavedBooks((updated) => {
    callbackCalledWith = updated;
  });

  assert.equal(refreshed.length, 1);
  assert.equal(refreshed[0].author, 'C. S. Lewis');
  assert.equal(refreshed[0].year, '2008');
  assert.ok(refreshed[0].cover);
  assert.notEqual(callbackCalledWith, null);
  assert.equal(callbackCalledWith[0].author, 'C. S. Lewis');

  // Verify updated in localStorage
  const inStore = JSON.parse(store['bookstache_library_v1']);
  assert.equal(inStore[0].author, 'C. S. Lewis');
  assert.equal(inStore[0].year, '2008');
});
