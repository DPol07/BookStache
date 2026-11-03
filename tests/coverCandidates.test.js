import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getOrderedCoverCandidates,
  getInitialCoverCandidates,
  fetchObalkyKnihCover,
  fetchGoogleBooksCoverByTitleAuthor,
  fetchOpenLibraryCoverByTitleAuthor
} from '../src/services/bookApi.js';

test('getInitialCoverCandidates generates synchronous fallback list for existing library books', () => {
  const existingBook = {
    id: '123',
    title: 'Test Book',
    author: 'Test Author',
    isbn: '978-80-00-05882-5',
    cover: 'https://example.com/cover1.jpg',
    fallbackCover: 'https://example.com/fallback.jpg',
  };

  const candidates = getInitialCoverCandidates(existingBook);
  assert.ok(candidates.length >= 3);
  assert.equal(candidates[0], 'https://www.obalkyknih.cz/file/cover/9788000058825/medium');
  assert.equal(candidates[1], 'https://example.com/cover1.jpg');
  assert.equal(candidates[2], 'https://example.com/fallback.jpg');
});

test('getOrderedCoverCandidates respects user priority strictly: 1. Obalky, 2. GB ISBN, 3. OL ISBN, 4. GB Title, 5. OL Title', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = async (url) => {
    const urlStr = String(url);
    if (urlStr.includes('obalkyknih.cz/view')) {
      return {
        ok: true,
        text: async () => '<html><body><img src="https://www.obalkyknih.cz/file/cover/9999/medium" /></body></html>',
      };
    }
    if (urlStr.includes('googleapis.com/books/v1/volumes')) {
      return {
        ok: true,
        json: async () => ({
          items: [{
            volumeInfo: {
              imageLinks: {
                thumbnail: 'https://books.google.com/thumb_title.jpg',
              },
            },
          }],
        }),
      };
    }
    if (urlStr.includes('openlibrary.org/search.json')) {
      return {
        ok: true,
        json: async () => ({
          docs: [{
            cover_i: 123456,
          }],
        }),
      };
    }
    return { ok: false, text: async () => '', json: async () => ({}) };
  };

  const candidates = await getOrderedCoverCandidates({
    isbn: '9788073819316',
    title: 'Alchymista',
    author: 'Paulo Coelho',
    gbCover: 'https://books.google.com/thumb_isbn.jpg',
    olCover: 'https://covers.openlibrary.org/b/isbn/9788073819316-L.jpg?default=false',
  });

  assert.equal(candidates[0], 'https://www.obalkyknih.cz/file/cover/9999/medium'); // 1. ObálkyKnih
  assert.equal(candidates[1], 'https://books.google.com/thumb_isbn.jpg'); // 2. GB by ISBN
  assert.equal(candidates[2], 'https://covers.openlibrary.org/b/isbn/9788073819316-L.jpg?default=false'); // 3. OL by ISBN
  assert.equal(candidates[3], 'https://books.google.com/thumb_title.jpg'); // 4. GB by Title/Author
  assert.equal(candidates[4], 'https://covers.openlibrary.org/b/id/123456-L.jpg?default=false'); // 5. OL by Title/Author
});

test('getOrderedCoverCandidates skips failed sources and continues down priority chain', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  globalThis.fetch = async (url) => {
    const urlStr = String(url);
    if (urlStr.includes('obalkyknih.cz/view')) {
      return {
        ok: true,
        text: async () => '<html><body>No cover found</body></html>',
      };
    }
    if (urlStr.includes('googleapis.com/books/v1/volumes')) {
      // simulate GB failure / 429
      return { ok: false, status: 429, json: async () => ({}) };
    }
    if (urlStr.includes('openlibrary.org/search.json')) {
      return {
        ok: true,
        json: async () => ({
          docs: [{
            cover_i: 888999,
          }],
        }),
      };
    }
    return { ok: false, text: async () => '', json: async () => ({}) };
  };

  const candidates = await getOrderedCoverCandidates({
    isbn: '9788020455826',
    title: '1984',
    author: 'George Orwell',
    // No ISBN covers available
  });

  // Should have Obálky fallback URL, Open Library by ISBN url, and OL search by Title
  assert.ok(candidates.includes('https://www.obalkyknih.cz/file/cover/9788020455826/medium'));
  assert.ok(candidates.includes('https://covers.openlibrary.org/b/isbn/9788020455826-L.jpg?default=false'));
  assert.ok(candidates.includes('https://covers.openlibrary.org/b/id/888999-L.jpg?default=false'));
});
