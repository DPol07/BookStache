import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIsbn, formatIsbnDisplay, fetchBookByIsbn } from '../src/services/bookApi.js';

test('normalizeIsbn correctly extracts 13-digit and 10-digit ISBNs', () => {
  assert.equal(normalizeIsbn('978-80-00058-82-5'), '9788000058825');
  assert.equal(normalizeIsbn(' 9788000058825 '), '9788000058825');
  assert.equal(normalizeIsbn('ISBN 978-80-73819-31-6'), '9788073819316');
  assert.equal(normalizeIsbn('8020455826'), '8020455826');
  assert.equal(normalizeIsbn(''), '');
});

test('formatIsbnDisplay formats 13-digit ISBN correctly', () => {
  assert.equal(formatIsbnDisplay('9788000058825'), '978-80-00058-82-5');
});

test('fetchBookByIsbn returns built-in sample Harry Potter offline immediately', async () => {
  const result = await fetchBookByIsbn('9788000058825');
  assert.notEqual(result, null);
  assert.equal(result.title, 'Harry Potter a Kámen mudrců');
  assert.equal(result.author, 'J. K. Rowlingová');
  assert.equal(result.publisher, 'Albatros');
});

test('fetchBookByIsbn returns null for empty string or invalid ISBN length', async () => {
  const result = await fetchBookByIsbn('123');
  assert.equal(result, null);
});
