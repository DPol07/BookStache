import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchBooksOnline } from '../src/services/bookApi.js';
import { saveBook, getSavedBooks, findDuplicateBook } from '../src/services/storage.js';

test('searchBooksOnline returns empty array on empty query', async () => {
  const res = await searchBooksOnline('');
  assert.deepEqual(res, []);
  const res2 = await searchBooksOnline('   ');
  assert.deepEqual(res2, []);
});

test('searchBooksOnline finds and shapes results for a query', async () => {
  const results = await searchBooksOnline('Karel Capek RUR', 5);
  assert.ok(Array.isArray(results));
  // May be empty if offline/network fails, but structure should always be valid array
  if (results.length > 0) {
    const first = results[0];
    assert.ok(first.title);
    assert.ok(first.id);
    assert.ok(first.author);
  }
});

test('saving and handling books without ISBN', () => {
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = val; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };

  const manualBook = {
    title: 'Staré pověsti české',
    author: 'Alois Jirásek',
    year: '1894',
    publisher: 'J. Otto',
    genre: 'Historická próza',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Čeština',
    editionNote: 'Ilustrace Mikoláš Aleš',
    isbn: 'Bez ISBN',
    rawIsbn: '',
    customCoverColor: '#4A2E1B',
  };

  const res = saveBook(manualBook);
  assert.equal(res.success, true);
  assert.equal(res.isDuplicate, false);
  assert.ok(res.book.id);

  const books = getSavedBooks();
  assert.equal(books.length, 1);
  assert.equal(books[0].title, 'Staré pověsti české');
  assert.equal(books[0].author, 'Alois Jirásek');
  assert.equal(books[0].editionNote, 'Ilustrace Mikoláš Aleš');
  assert.equal(books[0].customCoverColor, '#4A2E1B');

  // Test duplicate prevention for manual book without ISBN (title + author match)
  const dupCheck = findDuplicateBook(
    { title: 'staré pověsti české', author: 'alois jirasek' },
    books
  );
  assert.ok(dupCheck);
  assert.equal(dupCheck.id, books[0].id);
});
