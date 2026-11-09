import test from 'node:test';
import assert from 'node:assert/strict';
import { filterBooks, sortBooks, getUniqueFilterOptions } from '../src/services/filterService.js';

const mockBooks = [
  {
    id: '1',
    title: 'Babička',
    author: 'Božena Němcová',
    genre: 'Klasická literatura',
    language: 'Čeština',
    year: '1855',
    savedAt: '2023-01-01T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Alchymista',
    author: 'Paulo Coelho',
    genre: 'Filozofický román',
    language: 'Čeština',
    year: '2011',
    savedAt: '2023-03-01T10:00:00.000Z',
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopický román',
    language: 'Angličtina',
    year: '1949',
    savedAt: '2023-02-01T10:00:00.000Z',
  },
  {
    id: '4',
    title: 'Harry Potter a Kámen mudrců',
    author: 'J. K. Rowlingová',
    genre: 'Fantasy',
    language: 'Čeština',
    year: '2000',
    savedAt: '2023-04-01T10:00:00.000Z',
  },
];

test('getUniqueFilterOptions extracts unique sorted genres, authors, and languages', () => {
  const options = getUniqueFilterOptions(mockBooks);
  assert.deepEqual(options.languages, ['Angličtina', 'Čeština']);
  assert.equal(options.genres.includes('Fantasy'), true);
  assert.equal(options.authors.includes('George Orwell'), true);
  assert.equal(options.authors.length, 4);
});

test('filterBooks filters by search query and multiple dimensions simultaneously', () => {
  // Filter by genre
  const genreRes = filterBooks(mockBooks, { genre: 'Fantasy' });
  assert.equal(genreRes.length, 1);
  assert.equal(genreRes[0].title, 'Harry Potter a Kámen mudrců');

  // Filter by language
  const langRes = filterBooks(mockBooks, { language: 'Angličtina' });
  assert.equal(langRes.length, 1);
  assert.equal(langRes[0].title, '1984');

  // Combined search and filters
  const combinedRes = filterBooks(mockBooks, {
    searchQuery: 'a',
    genre: 'Klasická literatura',
    language: 'Čeština',
  });
  assert.equal(combinedRes.length, 1);
  assert.equal(combinedRes[0].title, 'Babička');

  // Non-matching combo
  const emptyRes = filterBooks(mockBooks, {
    genre: 'Klasická literatura',
    language: 'Angličtina',
  });
  assert.equal(emptyRes.length, 0);
});

test('sortBooks sorts by title A-Z, Z-A, year, and date correctly', () => {
  // Title A-Z
  const titleAsc = sortBooks(mockBooks, 'title-asc');
  assert.equal(titleAsc[0].title, '1984');
  assert.equal(titleAsc[1].title, 'Alchymista');

  // Title Z-A
  const titleDesc = sortBooks(mockBooks, 'title-desc');
  assert.equal(titleDesc[0].title, 'Harry Potter a Kámen mudrců');

  // Year descending (newest first)
  const yearDesc = sortBooks(mockBooks, 'year-desc');
  assert.equal(yearDesc[0].title, 'Alchymista'); // 2011
  assert.equal(yearDesc[yearDesc.length - 1].title, 'Babička'); // 1855

  // Date descending (newest saved first)
  const dateDesc = sortBooks(mockBooks, 'date-desc');
  assert.equal(dateDesc[0].title, 'Harry Potter a Kámen mudrců'); // 2023-04-01
  assert.equal(dateDesc[dateDesc.length - 1].title, 'Babička'); // 2023-01-01
});
