/**
 * ISBN Validation and OCR extraction utility
 */

/**
 * Validate ISBN-10 checksum
 * Formula: sum(digit[i] * (10 - i)) % 11 === 0 for i = 0..9 (where last digit can be 'X' = 10)
 */
export function isValidIsbn10(isbn10) {
  if (!isbn10) return false;
  const clean = String(isbn10).replace(/[^0-9X]/gi, '').toUpperCase();
  if (clean.length !== 10) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(clean[i], 10);
    if (isNaN(digit)) return false;
    sum += digit * (10 - i);
  }

  const lastChar = clean[9];
  const lastVal = lastChar === 'X' ? 10 : parseInt(lastChar, 10);
  if (isNaN(lastVal)) return false;
  sum += lastVal;

  return sum % 11 === 0;
}

/**
 * Validate ISBN-13 checksum
 * Formula: (10 - (sum(digit[i] * (1 or 3)) % 10)) % 10 === digit[12]
 */
export function isValidIsbn13(isbn13) {
  if (!isbn13) return false;
  const clean = String(isbn13).replace(/[^0-9]/g, '');
  if (clean.length !== 13) return false;
  if (!clean.startsWith('978') && !clean.startsWith('979')) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(clean[i], 10);
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(clean[12], 10);
}

/**
 * Validate any ISBN (10 or 13)
 */
export function isValidIsbn(isbn) {
  if (!isbn) return false;
  const clean = String(isbn).replace(/[^0-9X]/gi, '').toUpperCase();
  if (clean.length === 13) return isValidIsbn13(clean);
  if (clean.length === 10) return isValidIsbn10(clean);
  return false;
}

/**
 * Extract ISBN candidates from raw OCR text
 * Handles hyphens, spaces, "ISBN", "ISBN-13", "ISBN-10", common OCR digit confusions (O/0, l/1, etc.)
 */
export function extractIsbnCandidatesFromText(text) {
  if (!text || typeof text !== 'string') return [];

  const candidates = [];
  const seen = new Set();

  function addCandidate(rawCandidate, confidence = 'high') {
    const clean = rawCandidate.replace(/[^0-9X]/gi, '').toUpperCase();
    if (seen.has(clean)) return;

    if (clean.length === 13 && isValidIsbn13(clean)) {
      seen.add(clean);
      candidates.push({ isbn: clean, formatted: formatCandidate(clean), type: 'ISBN-13', valid: true, confidence });
    } else if (clean.length === 10 && isValidIsbn10(clean)) {
      seen.add(clean);
      candidates.push({ isbn: clean, formatted: formatCandidate(clean), type: 'ISBN-10', valid: true, confidence });
    }
  }

  function formatCandidate(clean) {
    if (clean.length === 13) {
      return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean.slice(12)}`;
    }
    return clean;
  }

  // 1. Direct regex for ISBN with prefix: ISBN[-:\s]*(?:13|10)?[-:\s]*([0-9Xx\s-]{10,20})
  const isbnPrefixRegex = /ISBN(?:[-:\s]*(?:13|10)?)?[-:\s]*([0-9Xx\s-]{10,22})/gi;
  let match;
  while ((match = isbnPrefixRegex.exec(text)) !== null) {
    const matchedSegment = match[1];
    addCandidate(matchedSegment, 'highest');
  }

  // 2. Direct search for 13-digit numbers starting with 978 or 979 (with possible hyphens)
  const isbn13Regex = /(?:978|979)[\s-]*(?:\d[\s-]*){10}/g;
  while ((match = isbn13Regex.exec(text)) !== null) {
    addCandidate(match[0], 'high');
  }

  // 3. Search for 10-digit patterns (numbers with hyphens or spaces)
  const isbn10Regex = /\b\d[\d\s-]{8,15}[\dX]\b/gi;
  while ((match = isbn10Regex.exec(text)) !== null) {
    addCandidate(match[0], 'medium');
  }

  // 4. OCR Fixup attempt: OCR sometimes mistakes 'O' or 'o' for '0', 'l'/'I' for '1', 'B' for '8'
  // If no candidates found yet, attempt text sanitization near "ISBN"
  if (candidates.length === 0) {
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (/ISBN/i.test(line)) {
        const sanitized = line
          .replace(/[oO]/g, '0')
          .replace(/[lI|]/g, '1')
          .replace(/[B]/g, '8')
          .replace(/[S]/g, '5');

        let subMatch;
        const subRegex13 = /(?:978|979)[\s-]*(?:\d[\s-]*){10}/g;
        while ((subMatch = subRegex13.exec(sanitized)) !== null) {
          addCandidate(subMatch[0], 'corrected');
        }
        const subRegex10 = /\b\d[\d\s-]{8,15}[\dX]\b/gi;
        while ((subMatch = subRegex10.exec(sanitized)) !== null) {
          addCandidate(subMatch[0], 'corrected');
        }
      }
    }
  }

  return candidates;
}
