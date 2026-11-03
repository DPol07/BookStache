import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchBookByIsbn, toDisplayText } from '../src/services/bookApi.js';

test('converts provider metadata objects into readable text', () => {
  assert.equal(toDisplayText({ title: 'Book title' }), 'Book title');
  assert.equal(toDisplayText([{ name: 'First' }, { name: 'Second' }]), 'First, Second');
  assert.equal(toDisplayText(null, 'fallback'), 'fallback');
});

test('returns render-safe fields for object-shaped Knihovny.cz metadata', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url) => {
    const urlStr = String(url);
    if (urlStr.includes('www.knihovny.cz')) {
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
    if (urlStr.includes('obalkyknih.cz/view')) {
      return {
        ok: true,
        text: async () => '<img src="https://www.obalkyknih.cz/file/cover/12345/medium" />',
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
  assert.equal(book.cover, 'https://www.obalkyknih.cz/file/cover/12345/medium');
  assert.ok(Array.isArray(book.coverCandidates));
  assert.ok(book.coverCandidates.includes('https://www.obalkyknih.cz/file/cover/12345/medium'));
});
