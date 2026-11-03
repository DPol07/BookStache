import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchBookByIsbn,
  toDisplayText,
  mergeBookMetadata,
  assembleCoverCandidates,
} from '../src/services/bookApi.js';

test('converts provider metadata objects into readable text', () => {
  assert.equal(toDisplayText({ title: 'Book title' }), 'Book title');
  assert.equal(toDisplayText([{ name: 'First' }, { name: 'Second' }]), 'First, Second');
  assert.equal(toDisplayText(null, 'fallback'), 'fallback');
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
  // candidates[3] is openlibrary direct isbn fallback if present or query cover
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

test('two-phase search supplements missing author and publisher via title/author query', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = async (url) => {
    const sUrl = String(url);
    // Knihovny.cz returns only title for this ISBN
    if (sUrl.includes('www.knihovny.cz')) {
      return {
        ok: true,
        json: async () => ({ records: [{
          title: 'R.U.R.',
          authors: [],
          publishDate: null,
          publisher: null,
          genres: [],
        }] }),
      };
    }
    // Google Books by ISBN fails
    if (sUrl.includes('volumes?q=isbn:') || sUrl.includes('volumes?q=9788072030000')) {
      return { ok: false, json: async () => ({}) };
    }
    // Open Library by ISBN fails
    if (sUrl.includes('openlibrary.org/api/books') || sUrl.includes('openlibrary.org/search.json?q=')) {
      return { ok: false, json: async () => ({}) };
    }
    // Google Books by query fills in author & publisher!
    if (sUrl.includes('volumes?q=intitle:R.U.R.')) {
      return {
        ok: true,
        json: async () => ({
          items: [{
            volumeInfo: {
              title: 'R.U.R.',
              authors: ['Karel Čapek'],
              publishedDate: '1920',
              publisher: 'Aventinum',
              imageLinks: { thumbnail: 'http://books.google.com/rur.jpg' },
            }
          }]
        }),
      };
    }

    return { ok: false, json: async () => ({}) };
  };

  const book = await fetchBookByIsbn('9788072030000');
  assert.notEqual(book, null);
  assert.equal(book.title, 'R.U.R.');
  assert.equal(book.author, 'Karel Čapek');
  assert.equal(book.year, '1920');
  assert.equal(book.publisher, 'Aventinum');
  assert.ok(book.coverCandidates.some((c) => c.includes('rur.jpg')));
});
