import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidIsbn10, isValidIsbn13, isValidIsbn, extractIsbnCandidatesFromText } from '../src/services/isbnValidator.js';

test('isValidIsbn10 correctly validates valid and invalid ISBN-10', () => {
  // Valid ISBN-10
  assert.equal(isValidIsbn10('0471958697'), true);
  assert.equal(isValidIsbn10('0-471-95869-7'), true);
  assert.equal(isValidIsbn10('080442957X'), true); // Ends with X
  assert.equal(isValidIsbn10('0-8044-2957-X'), true);

  // Invalid ISBN-10
  assert.equal(isValidIsbn10('0471958698'), false);
  assert.equal(isValidIsbn10('0804429579'), false);
  assert.equal(isValidIsbn10('12345'), false);
  assert.equal(isValidIsbn10(''), false);
  assert.equal(isValidIsbn10(null), false);
});

test('isValidIsbn13 correctly validates valid and invalid ISBN-13', () => {
  // Valid ISBN-13
  assert.equal(isValidIsbn13('9788000058825'), true);
  assert.equal(isValidIsbn13('978-80-00058-82-5'), true);
  assert.equal(isValidIsbn13('9788073819316'), true);
  assert.equal(isValidIsbn13('978-80-73819-31-6'), true);
  assert.equal(isValidIsbn13('9780141439518'), true);

  // Invalid ISBN-13
  assert.equal(isValidIsbn13('9788000058824'), false);
  assert.equal(isValidIsbn13('1234567890123'), false); // Doesn't start with 978 or 979
  assert.equal(isValidIsbn13(''), false);
  assert.equal(isValidIsbn13(null), false);
});

test('isValidIsbn handles both 10 and 13 digit ISBNs', () => {
  assert.equal(isValidIsbn('978-80-00058-82-5'), true);
  assert.equal(isValidIsbn('0-8044-2957-X'), true);
  assert.equal(isValidIsbn('978-80-00058-82-0'), false);
  assert.equal(isValidIsbn('invalid'), false);
});

test('extractIsbnCandidatesFromText extracts valid ISBNs from sample OCR strings', () => {
  const ocrText1 = `
    Vydalo nakladatelství Albatros v roce 2020.
    ISBN 978-80-00-05882-5
    Vytištěno v České republice.
  `;
  const result1 = extractIsbnCandidatesFromText(ocrText1);
  assert.equal(result1.length >= 1, true);
  assert.equal(result1[0].isbn, '9788000058825');
  assert.equal(result1[0].valid, true);

  const ocrText2 = `
    First edition published in 1996.
    ISBN-10: 0-471-95869-7
    All rights reserved.
  `;
  const result2 = extractIsbnCandidatesFromText(ocrText2);
  assert.equal(result2.length >= 1, true);
  assert.equal(result2[0].isbn, '0471958697');
  assert.equal(result2[0].type, 'ISBN-10');

  // OCR with noise and slight letter substitution (O instead of 0)
  const ocrTextOcrNoise = `
    Katalogové číslo: 12345
    ISBN: 978-8O-73819-31-6
  `;
  const result3 = extractIsbnCandidatesFromText(ocrTextOcrNoise);
  assert.equal(result3.length >= 1, true);
  assert.equal(result3[0].isbn, '9788073819316');
});
