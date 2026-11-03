import React, { useState, useEffect, useRef } from 'react';
import { Book } from 'lucide-react';
import { getInitialCoverCandidates, getOrderedCoverCandidates } from '../services/bookApi.js';

/**
 * Robust BookCover component that:
 * 1. Collects candidate covers according to priority:
 *    - ObálkyKnih by ISBN
 *    - Google Books by ISBN
 *    - Open Library by ISBN
 *    - Google Books by title & author
 *    - Open Library by title & author
 * 2. Tries candidate URLs in order.
 * 3. Handles both network errors (onError) and transparent/empty 1x1 image placeholders (onLoad).
 * 4. Displays a styled fallback placeholder if all candidates are exhausted.
 */
export default function BookCover({
  book,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-28 h-40 shrink-0 rounded-xl overflow-hidden border flex items-center justify-center',
  containerStyle = {},
  placeholderStyle = {},
  showIsbn = true,
  size = 'normal', // 'normal' | 'thumb'
}) {
  const [candidates, setCandidates] = useState(() => getInitialCoverCandidates(book));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasAllFailed, setHasAllFailed] = useState(false);
  const attemptedUrlsRef = useRef(new Set());

  useEffect(() => {
    attemptedUrlsRef.current.clear();
    const initial = getInitialCoverCandidates(book);
    setCandidates(initial);
    setCurrentIndex(0);
    setHasAllFailed(initial.length === 0);

    // If the book does not have full cover candidates pre-computed (e.g. from existing library),
    // fetch background candidates asynchronously using ISBN, Title, and Author
    let isCancelled = false;
    if (book && (!book.coverCandidates || book.coverCandidates.length <= 1)) {
      getOrderedCoverCandidates({
        isbn: book.rawIsbn || book.isbn,
        title: book.title,
        author: book.author,
        existingCover: book.cover,
        obalkyCover: book.obalkyCover,
        gbCover: book.gbCover,
        olCover: book.fallbackCover,
      }).then((newCandidates) => {
        if (!isCancelled && Array.isArray(newCandidates) && newCandidates.length > 0) {
          setCandidates((prev) => {
            const merged = [...prev];
            const seen = new Set(merged);
            for (const c of newCandidates) {
              if (c && !seen.has(c)) {
                seen.add(c);
                merged.push(c);
              }
            }
            return merged;
          });
          setHasAllFailed(false);
        }
      }).catch((e) => {
        console.warn('Async cover candidate lookup failed:', e);
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [book?.id, book?.isbn, book?.rawIsbn, book?.title, book?.author, book?.cover]);

  const tryNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= candidates.length) {
        setHasAllFailed(true);
        return prev;
      }
      return next;
    });
  };

  const handleImageError = () => {
    tryNext();
  };

  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    // Reject 1x1 or empty placeholder images (common in Open Library or broken CDNs)
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      tryNext();
    }
  };

  const currentUrl = !hasAllFailed && currentIndex < candidates.length ? candidates[currentIndex] : null;

  return (
    <div style={containerStyle} className={containerClassName}>
      {currentUrl ? (
        <img
          key={currentUrl}
          src={currentUrl}
          alt={book?.title || 'Obálka knihy'}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={className}
        />
      ) : size === 'thumb' ? (
        <div
          className="flex flex-col items-center justify-center p-1 text-[9px] text-center w-full h-full"
          style={placeholderStyle}
        >
          <Book className="w-5 h-5 mb-0.5" style={{ color: '#5C3A24' }} />
          <span className="line-clamp-2 leading-tight text-[8px] font-serif">{book?.title}</span>
        </div>
      ) : (
        <div
          style={placeholderStyle}
          className="flex flex-col items-center justify-between p-3 text-center w-full h-full"
        >
          <div style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }} className="p-1.5 rounded-full mt-2">
            <Book className="w-6 h-6" />
          </div>
          <div className="space-y-1 my-auto">
            <span className="text-[10px] font-bold leading-snug line-clamp-3 block px-1 font-serif">{book?.title}</span>
            <span style={{ color: '#5C3A24' }} className="text-[9px] truncate max-w-full block px-1">{book?.author}</span>
          </div>
          {showIsbn && book?.isbn && (
            <span style={{ color: '#8C593B', borderColor: '#E6D7C3' }} className="text-[8px] font-mono border-t pt-1 w-full truncate">
              {book.isbn}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
