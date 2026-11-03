import React, { useState, useEffect } from 'react';
import { Book } from 'lucide-react';

/**
 * Robust Book Cover Image Component:
 * - Tries cover candidates in order of priority.
 * - Detects broken image loads (onError).
 * - Detects 1x1 pixel empty images (e.g. Open Library transparent GIF or ObalkyKnih 1x1 placeholder).
 * - When a valid image loads, informs the caller via onResolvedCover(validUrl).
 * - Falls back to a clean styled book placeholder if all candidates fail.
 */
export default function BookCoverImage({
  book,
  className = 'w-full h-full object-cover',
  placeholderClassName = '',
  size = 'normal', // 'normal' | 'thumb'
  onResolvedCover,
}) {
  // Build unique list of candidates from book object
  const candidates = React.useMemo(() => {
    if (!book) return [];
    const list = [];
    if (Array.isArray(book.coverCandidates)) {
      list.push(...book.coverCandidates);
    }
    if (book.cover && !list.includes(book.cover)) {
      list.unshift(book.cover);
    }
    if (book.fallbackCover && !list.includes(book.fallbackCover)) {
      list.push(book.fallbackCover);
    }
    if (book.rawIsbn) {
      const olIsbn = `https://covers.openlibrary.org/b/isbn/${book.rawIsbn}-L.jpg`;
      if (!list.includes(olIsbn)) list.push(olIsbn);
      const obalky = `https://www.obalkyknih.cz/api/cover?isbn=${book.rawIsbn}`;
      if (!list.includes(obalky)) list.push(obalky);
    }
    return list.filter(Boolean);
  }, [book?.cover, book?.fallbackCover, book?.coverCandidates, book?.rawIsbn]);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Reset when book changes
  useEffect(() => {
    setCandidateIndex(0);
    setHasFailedAll(false);
  }, [book?.id, book?.rawIsbn, book?.cover]);

  const currentUrl = candidates[candidateIndex];

  const tryNextCandidate = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    // Check if image is a 1x1 transparent/empty placeholder
    if (img.naturalWidth <= 1 && img.naturalHeight <= 1) {
      tryNextCandidate();
      return;
    }
    // Valid cover loaded!
    if (onResolvedCover && currentUrl) {
      onResolvedCover(currentUrl);
    }
  };

  const handleImageError = () => {
    tryNextCandidate();
  };

  if (!currentUrl || hasFailedAll) {
    if (size === 'thumb') {
      return (
        <div
          className={`flex flex-col items-center justify-center p-1 text-[9px] text-center w-full h-full ${placeholderClassName}`}
          style={{ backgroundColor: '#F2E8D8', color: '#3D2314' }}
        >
          <Book className="w-5 h-5 mb-0.5" style={{ color: '#5C3A24' }} />
          <span className="line-clamp-2 leading-tight text-[8px] font-serif">{book?.title}</span>
        </div>
      );
    }

    return (
      <div
        style={{ backgroundColor: '#F2E8D8', color: '#3D2314' }}
        className={`flex flex-col items-center justify-between p-3 text-center w-full h-full ${placeholderClassName}`}
      >
        <div style={{ backgroundColor: '#4A2E1B', color: '#FAF6F0' }} className="p-1.5 rounded-full mt-2">
          <Book className="w-6 h-6" />
        </div>
        <div className="space-y-1 my-auto">
          <span className="text-[10px] font-bold leading-snug line-clamp-3 block px-1 font-serif">
            {book?.title}
          </span>
          <span style={{ color: '#5C3A24' }} className="text-[9px] truncate max-w-full block px-1">
            {book?.author}
          </span>
        </div>
        <span
          style={{ color: '#8C593B', borderColor: '#E6D7C3' }}
          className="text-[8px] font-mono border-t pt-1 w-full truncate"
        >
          {book?.isbn}
        </span>
      </div>
    );
  }

  return (
    <img
      key={currentUrl}
      src={currentUrl}
      alt={book?.title || 'Obálka knihy'}
      onLoad={handleImageLoad}
      onError={handleImageError}
      className={className}
    />
  );
}
