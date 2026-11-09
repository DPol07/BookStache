import test from 'node:test';
import assert from 'node:assert/strict';
import { updateBook, saveBook, getSavedBooks, deleteBook } from '../src/services/storage.js';

// Setup mock localStorage in Node.js
if (typeof globalThis.localStorage === 'undefined') {
  let store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
}

test('updateBook correctly modifies existing book fields', () => {
  globalThis.localStorage.clear();

  const book1 = {
    id: 'b1',
    title: 'Původní název',
    author: 'Původní autor',
    year: '2020',
    publisher: 'Test Press',
    genre: 'Drama',
    language: 'Čeština',
    isbn: '978-80-00058-82-5',
    rawIsbn: '9788000058825',
  };
  saveBook(book1);

  const res = updateBook({
    id: 'b1',
    title: 'Nový upravený název',
    author: 'Upravený autor',
    year: '2022',
    publisher: 'Nový Press',
    genre: 'Krimi',
    language: 'Slovenština',
    isbn: '978-80-00058-82-5',
    rawIsbn: '9788000058825',
    editionNote: 'Speciální edice',
    customCoverColor: '#7F1D1D',
  });

  assert.equal(res.success, true);
  assert.equal(res.book.title, 'Nový upravený název');
  assert.equal(res.book.author, 'Upravený autor');
  assert.equal(res.book.year, '2022');
  assert.equal(res.book.publisher, 'Nový Press');
  assert.equal(res.book.genre, 'Krimi');
  assert.equal(res.book.language, 'Slovenština');
  assert.equal(res.book.editionNote, 'Speciální edice');
  assert.equal(res.book.customCoverColor, '#7F1D1D');

  const books = getSavedBooks();
  assert.equal(books.length, 1);
  assert.equal(books[0].title, 'Nový upravený název');
});

test('updateBook prevents duplicate ISBN or duplicate title+author with other books', () => {
  globalThis.localStorage.clear();

  const book1 = {
    id: 'book-1',
    title: 'Kniha 1',
    author: 'Autor 1',
    isbn: '978-80-00058-82-5',
    rawIsbn: '9788000058825',
  };
  const book2 = {
    id: 'book-2',
    title: 'Kniha 2',
    author: 'Autor 2',
    isbn: '978-80-73819-31-6',
    rawIsbn: '9788073819316',
  };
  saveBook(book1);
  saveBook(book2);

  // Try updating book2 with book1's ISBN
  const dupRes = updateBook({
    id: 'book-2',
    title: 'Kniha 2 Jiný název',
    author: 'Autor 2',
    isbn: '978-80-00058-82-5',
    rawIsbn: '9788000058825',
  });

  assert.equal(dupRes.success, false);
  assert.match(dupRes.error, /již v knihovně existuje/);

  // Updating book2 without colliding with book1 should succeed
  const okRes = updateBook({
    id: 'book-2',
    title: 'Kniha 2 Super vydání',
    author: 'Autor 2',
    isbn: '978-80-73819-31-6',
    rawIsbn: '9788073819316',
  });
  assert.equal(okRes.success, true);
});
