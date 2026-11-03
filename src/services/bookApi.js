// Book API service combining ObálkyKnih, Google Books, Open Library, Knihovny.cz, and offline fallback catalog

// Helper to normalize ISBN / EAN barcode
export function normalizeIsbn(isbn) {
  if (!isbn) return '';
  const clean = String(isbn).replace(/[^0-9X]/gi, '').toUpperCase();
  // Extract 13-digit EAN/ISBN starting with 978 or 979 if surrounded by noise
  const match13 = clean.match(/(978|979)\d{10}/);
  if (match13) return match13[0];
  const match10 = clean.match(/\d{9}[0-9X]/);
  if (match10) return match10[0];
  return clean;
}

// Convert third-party metadata to safe, readable React text.
export function toDisplayText(value, fallback = '') {
  if (value == null) return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
    const str = String(value).trim();
    return str || fallback;
  }
  if (Array.isArray(value)) {
    const joined = value.map((item) => toDisplayText(item)).filter(Boolean).join(', ');
    return joined || fallback;
  }
  if (typeof value === 'object') {
    for (const key of ['name', 'title', 'label', 'text', 'value', 'url', 'href']) {
      if (value[key] != null) {
        const text = toDisplayText(value[key], '');
        if (text) return text;
      }
    }
  }
  return fallback;
}

// Fetch helper with timeout
export async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Format ISBN for display
export function formatIsbnDisplay(isbn) {
  const clean = normalizeIsbn(isbn);
  if (clean.length === 13 && (clean.startsWith('978') || clean.startsWith('979'))) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean.slice(12)}`;
  }
  return clean;
}

// Language code to Czech name mapping
export const LANGUAGE_MAP = {
  cs: 'Čeština',
  cze: 'Čeština',
  en: 'Angličtina',
  eng: 'Angličtina',
  sk: 'Slovenština',
  slo: 'Slovenština',
  slk: 'Slovenština',
  de: 'Němčina',
  ger: 'Němčina',
  deu: 'Němčina',
  fr: 'Francouzština',
  fre: 'Francouzština',
  fra: 'Francouzština',
  es: 'Španělština',
  spa: 'Španělština',
  it: 'Italština',
  ita: 'Italština',
  ru: 'Ruština',
  rus: 'Ruština',
  pl: 'Polština',
  pol: 'Polština',
  ja: 'Japonština',
  jpn: 'Japonština',
  zh: 'Čínština',
  zho: 'Čínština',
  la: 'Latina',
  lat: 'Latina',
};

// Genre category translation mapping
export function translateGenre(categories) {
  if (!categories || (Array.isArray(categories) && categories.length === 0)) return 'Beletrie';

  const raw = Array.isArray(categories)
    ? categories.map((category) => toDisplayText(category)).filter(Boolean).join(', ')
    : toDisplayText(categories);
  const lower = raw.toLowerCase();

  if (lower.includes('children') || lower.includes('juvenile') || lower.includes('děti') || lower.includes('mládež')) {
    return 'Literatura pro děti a mládež';
  }
  if (lower.includes('fantasy')) return 'Fantasy';
  if (lower.includes('science fiction') || lower.includes('sci-fi')) return 'Sci-Fi';
  if (lower.includes('detective') || lower.includes('mystery') || lower.includes('detektiv')) return 'Detektivky a krimi';
  if (lower.includes('thriller')) return 'Napínavé / Thriller';
  if (lower.includes('romance') || lower.includes('romant')) return 'Romantická literatura';
  if (lower.includes('history') || lower.includes('histor')) return 'Historická literatura';
  if (lower.includes('biography') || lower.includes('autobiography') || lower.includes('životopis')) return 'Biografie a memoáry';
  if (lower.includes('poetry') || lower.includes('poezie')) return 'Poezie';
  if (lower.includes('drama') || lower.includes('divadlo')) return 'Drama';
  if (lower.includes('comics') || lower.includes('graphic novel') || lower.includes('komiks')) return 'Komiksy';
  if (lower.includes('philosophy') || lower.includes('filozofie')) return 'Filozofie';
  if (lower.includes('psychology') || lower.includes('psychologie')) return 'Psychologie a rozvoj';
  if (lower.includes('science') || lower.includes('věda') || lower.includes('nature')) return 'Naukova a odborná literatura';
  if (lower.includes('fiction')) return 'Krásná literatura / Proza';

  return raw;
}

// Age group inference helper
export function inferAgeGroup(categories, title = '', description = '') {
  const combined = `${Array.isArray(categories) ? categories.join(' ') : categories || ''} ${title || ''} ${description || ''}`.toLowerCase();

  if (combined.includes('toddler') || combined.includes('preschool') || combined.includes('pro nejmenší') || combined.includes('batolata')) {
    return 'Děti (0-5 let)';
  }
  if (combined.includes('children') || combined.includes('juvenile') || combined.includes('pro děti') || combined.includes('pohádky')) {
    return 'Děti (6-12 let)';
  }
  if (combined.includes('young adult') || combined.includes('ya ') || combined.includes('mládež') || combined.includes('teen')) {
    return 'Mládež (12-18 let)';
  }
  if (combined.includes('not in juvenile') || combined.includes('mature') || combined.includes('dospělí')) {
    return 'Pro dospělé';
  }
  return 'Všeobecná veřejnost';
}

// Built-in offline backup catalog
export const OFFLINE_CATALOG = {
  '9788000058825': {
    title: 'Harry Potter a Kámen mudrců',
    author: 'J. K. Rowlingová',
    year: '2000',
    publisher: 'Albatros',
    genre: 'Fantasy / Pro děti a mládež',
    ageGroup: 'Mládež (9-15 let)',
    language: 'Čeština',
    isbn: '978-80-00058-82-5',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788000058825',
    fallbackCover: 'https://covers.openlibrary.org/b/id/10523420-L.jpg',
  },
  '9788073819316': {
    title: 'Alchymista',
    author: 'Paulo Coelho',
    year: '2011',
    publisher: 'Argo',
    genre: 'Filozofický román',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Čeština',
    isbn: '978-80-73819-31-6',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788073819316',
    fallbackCover: 'https://covers.openlibrary.org/b/id/12836269-L.jpg',
  },
  '9788000058832': {
    title: 'Malý princ',
    author: 'Antoine de Saint-Exupéry',
    year: '2021',
    publisher: 'Albatros',
    genre: 'Filozofická pohádka',
    ageGroup: 'Všechny věkové kategorie',
    language: 'Čeština',
    isbn: '978-80-00058-83-2',
    cover: 'https://covers.openlibrary.org/b/id/10523395-L.jpg',
    fallbackCover: 'https://covers.openlibrary.org/b/isbn/9788000058832-L.jpg',
  },
  '9788020455826': {
    title: '1984',
    author: 'George Orwell',
    year: '2020',
    publisher: 'Mladá fronta',
    genre: 'Dystopický román',
    ageGroup: 'Pro dospělé',
    language: 'Čeština',
    isbn: '978-80-20455-82-6',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788020455826',
    fallbackCover: 'https://covers.openlibrary.org/b/id/12645114-L.jpg',
  },
  '9780141439518': {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: '2003',
    publisher: 'Penguin Books',
    genre: 'Klasická literatura / Romantická',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Angličtina',
    isbn: '978-01-41439-51-8',
    cover: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    fallbackCover: 'https://covers.openlibrary.org/b/id/12645114-L.jpg',
  },
  '9780747532699': {
    title: "Harry Potter and the Philosopher's Stone",
    author: 'J. K. Rowling',
    year: '1997',
    publisher: 'Bloomsbury Publishing',
    genre: 'Fantasy',
    ageGroup: 'Mládež (9-15 let)',
    language: 'Angličtina',
    isbn: '978-07-47532-69-9',
    cover: 'https://covers.openlibrary.org/b/id/7355968-L.jpg',
    fallbackCover: 'https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg',
  }
};

// Fetch book details from Knihovny.cz API (Czech National Union Catalog API)
export async function fetchKnihovnyCz(cleanIsbn) {
  try {
    const url = `https://www.knihovny.cz/api/v1/search?lookfor=${cleanIsbn}&type=ISN`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.records || data.records.length === 0) return null;

    const record = data.records[0];
    const title = toDisplayText(record.title);
    const author = Array.isArray(record.authors)
      ? record.authors.map((item) => toDisplayText(item)).filter(Boolean).join(', ')
      : toDisplayText(record.authors);
    const year = toDisplayText(record.publishDate);
    const publisher = Array.isArray(record.publisher)
      ? toDisplayText(record.publisher[0])
      : toDisplayText(record.publisher);
    const genre = translateGenre(record.genres || record.topic);
    const cover = record.cover ? `https://www.obalkyknih.cz/api/cover?isbn=${cleanIsbn}` : null;

    return {
      title,
      author,
      year,
      publisher,
      genre,
      ageGroup: inferAgeGroup(genre, title),
      language: 'Čeština',
      cover,
    };
  } catch (e) {
    console.warn('Knihovny.cz fetch error:', e);
    return null;
  }
}

// Helper to extract Google Books volume data
function parseGoogleBooksItem(item) {
  if (!item || !item.volumeInfo) return null;
  const info = item.volumeInfo;
  const year = info.publishedDate ? info.publishedDate.slice(0, 4) : '';
  const coverUrl = info.imageLinks
    ? (info.imageLinks.extraLarge || info.imageLinks.large || info.imageLinks.medium || info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)
    : null;

  const safeCover = coverUrl
    ? coverUrl.replace(/^http:/, 'https:').replace('&edge=curl', '')
    : null;

  const lang = info.language ? (LANGUAGE_MAP[info.language.toLowerCase()] || info.language.toUpperCase()) : 'Čeština';

  return {
    title: toDisplayText(info.title),
    author: Array.isArray(info.authors) ? info.authors.map((item) => toDisplayText(item)).filter(Boolean).join(', ') : '',
    year: toDisplayText(year),
    publisher: toDisplayText(info.publisher),
    genre: translateGenre(info.categories),
    ageGroup: inferAgeGroup(info.categories, info.title, info.description),
    language: lang,
    cover: safeCover,
  };
}

// Fetch book details from Google Books by ISBN
export async function fetchGoogleBooks(cleanIsbn) {
  try {
    const response = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return parseGoogleBooksItem(data.items[0]);
      }
    }
    // Fallback search query by raw ISBN query
    const res2 = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${cleanIsbn}`);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.items && data2.items.length > 0) {
        return parseGoogleBooksItem(data2.items[0]);
      }
    }
    return null;
  } catch (e) {
    console.warn('Google Books fetch error:', e);
    return null;
  }
}

// Fetch book details from Google Books by Title and Author
export async function fetchGoogleBooksByQuery(title, author = '') {
  if (!title) return null;
  try {
    const cleanTitle = title.trim();
    const cleanAuthor = author && author !== 'Neznámý autor' ? author.trim() : '';
    let q = `intitle:${encodeURIComponent(cleanTitle)}`;
    if (cleanAuthor) {
      q += `+inauthor:${encodeURIComponent(cleanAuthor)}`;
    }
    const response = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3`);
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return parseGoogleBooksItem(data.items[0]);
      }
    }
    // Fallback to broader text query
    const fallbackQ = encodeURIComponent(`${cleanTitle} ${cleanAuthor}`.trim());
    const res2 = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${fallbackQ}&maxResults=3`);
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.items && data2.items.length > 0) {
        return parseGoogleBooksItem(data2.items[0]);
      }
    }
    return null;
  } catch (e) {
    console.warn('Google Books title/author fetch error:', e);
    return null;
  }
}

// Fetch book details from Open Library API by ISBN
export async function fetchOpenLibrary(cleanIsbn) {
  try {
    const bibUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
    const response = await fetchWithTimeout(bibUrl);
    if (response.ok) {
      const data = await response.json();
      const key = `ISBN:${cleanIsbn}`;
      const book = data[key];

      if (book) {
        const year = book.publish_date ? (book.publish_date.match(/\d{4}/)?.[0] || book.publish_date) : '';
        const authors = Array.isArray(book.authors) ? book.authors.map((item) => toDisplayText(item?.name ?? item)).filter(Boolean).join(', ') : '';
        const publishers = Array.isArray(book.publishers) ? book.publishers.map((item) => toDisplayText(item?.name ?? item)).filter(Boolean).join(', ') : '';
        const categories = Array.isArray(book.subjects) ? book.subjects.map((item) => toDisplayText(item?.name ?? item)).filter(Boolean) : [];

        let cover = null;
        if (book.cover) {
          cover = book.cover.large || book.cover.medium || book.cover.small;
        } else {
          cover = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
        }

        const lang = book.languages ? (LANGUAGE_MAP[book.languages[0]?.key?.replace('/languages/', '')] || 'Čeština') : 'Čeština';

        return {
          title: book.title || '',
          author: authors,
          year: year,
          publisher: publishers,
          genre: translateGenre(categories),
          ageGroup: inferAgeGroup(categories, book.title),
          language: lang,
          cover: cover,
        };
      }
    }

    // Fallback to search API by ISBN
    const searchUrl = `https://openlibrary.org/search.json?q=${cleanIsbn}`;
    const sRes = await fetchWithTimeout(searchUrl);
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    if (!sData.docs || sData.docs.length === 0) return null;
    const doc = sData.docs[0];
    return {
      title: toDisplayText(doc.title),
      author: Array.isArray(doc.author_name) ? doc.author_name.map((item) => toDisplayText(item)).filter(Boolean).join(', ') : '',
      year: toDisplayText(doc.first_publish_year),
      publisher: Array.isArray(doc.publisher) ? toDisplayText(doc.publisher[0]) : toDisplayText(doc.publisher),
      genre: translateGenre(doc.subject),
      ageGroup: inferAgeGroup(doc.subject, doc.title),
      language: doc.language ? (LANGUAGE_MAP[doc.language[0]] || doc.language[0]) : 'Čeština',
      cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
    };
  } catch (e) {
    console.warn('Open Library fetch error:', e);
    return null;
  }
}

// Fetch book details from Open Library by Title and Author
export async function fetchOpenLibraryByQuery(title, author = '') {
  if (!title) return null;
  try {
    const cleanTitle = title.trim();
    const cleanAuthor = author && author !== 'Neznámý autor' ? author.trim() : '';
    let url = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}`;
    if (cleanAuthor) {
      url += `&author=${encodeURIComponent(cleanAuthor)}`;
    }
    url += '&limit=3';

    const response = await fetchWithTimeout(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.docs || data.docs.length === 0) return null;
    const doc = data.docs[0];

    return {
      title: toDisplayText(doc.title),
      author: Array.isArray(doc.author_name) ? doc.author_name.map((item) => toDisplayText(item)).filter(Boolean).join(', ') : '',
      year: toDisplayText(doc.first_publish_year),
      publisher: Array.isArray(doc.publisher) ? toDisplayText(doc.publisher[0]) : toDisplayText(doc.publisher),
      genre: translateGenre(doc.subject),
      ageGroup: inferAgeGroup(doc.subject, doc.title),
      language: doc.language ? (LANGUAGE_MAP[doc.language[0]] || doc.language[0]) : 'Čeština',
      cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
    };
  } catch (e) {
    console.warn('Open Library title/author fetch error:', e);
    return null;
  }
}

// Helper to check if a metadata field is missing or generic default
function isFieldMissing(val, defaults = []) {
  if (val == null) return true;
  const str = String(val).trim();
  if (!str) return true;
  return defaults.includes(str);
}

// Merge book metadata carefully: keeps existing valid fields, only fills missing ones
export function mergeBookMetadata(primary, supplement) {
  if (!supplement) return primary;
  if (!primary) return supplement;

  return {
    title: isFieldMissing(primary.title) ? (supplement.title || '') : primary.title,
    author: isFieldMissing(primary.author, ['Neznámý autor', '']) ? (supplement.author || primary.author) : primary.author,
    year: isFieldMissing(primary.year, ['Neuvedeno', '']) ? (supplement.year || primary.year) : primary.year,
    publisher: isFieldMissing(primary.publisher, ['Neuvedeno', '']) ? (supplement.publisher || primary.publisher) : primary.publisher,
    genre: isFieldMissing(primary.genre, ['Všeobecná literatura', 'Beletrie', '']) ? (supplement.genre || primary.genre) : primary.genre,
    ageGroup: isFieldMissing(primary.ageGroup, ['Všeobecná veřejnost', '']) ? (supplement.ageGroup || primary.ageGroup) : primary.ageGroup,
    language: isFieldMissing(primary.language, ['Čeština', '']) ? (supplement.language || primary.language) : primary.language,
  };
}

// Assemble and prioritize cover candidates according to the required priority order:
// 1) ObálkyKnih by ISBN
// 2) Google Books by ISBN
// 3) Open Library by ISBN
// 4) Google Books by title & author
// 5) Open Library by title & author
export function assembleCoverCandidates({
  cleanIsbn,
  obalkyCover,
  gbIsbnCover,
  olIsbnCover,
  gbQueryCover,
  olQueryCover,
  extraFallbacks = [],
}) {
  const candidates = [];

  function addCandidate(url) {
    if (!url || typeof url !== 'string') return;
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (!candidates.includes(cleanUrl)) {
      candidates.push(cleanUrl);
    }
  }

  // 1. ObálkyKnih by ISBN
  if (obalkyCover) {
    addCandidate(obalkyCover);
  } else if (cleanIsbn) {
    addCandidate(`https://www.obalkyknih.cz/api/cover?isbn=${cleanIsbn}`);
  }

  // 2. Google Books by ISBN
  addCandidate(gbIsbnCover);

  // 3. Open Library by ISBN
  addCandidate(olIsbnCover);
  if (cleanIsbn) {
    addCandidate(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`);
  }

  // 4. Google Books by Title and Author
  addCandidate(gbQueryCover);

  // 5. Open Library by Title and Author
  addCandidate(olQueryCover);

  // Extras / custom fallbacks
  for (const extra of extraFallbacks) {
    addCandidate(extra);
  }

  return candidates;
}

// Primary Aggregator Function
export async function fetchBookByIsbn(rawIsbn) {
  const cleanIsbn = normalizeIsbn(rawIsbn);
  if (!cleanIsbn || cleanIsbn.length < 7) {
    return null;
  }

  // 1. Immediate offline catalog check
  const offlineMatch = OFFLINE_CATALOG[cleanIsbn];
  if (offlineMatch) {
    const obalkyCover = `https://www.obalkyknih.cz/api/cover?isbn=${cleanIsbn}`;
    const coverCandidates = assembleCoverCandidates({
      cleanIsbn,
      obalkyCover,
      olIsbnCover: offlineMatch.cover,
      extraFallbacks: [offlineMatch.fallbackCover, `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`],
    });

    return {
      id: `${cleanIsbn}-${Date.now()}`,
      isbn: formatIsbnDisplay(cleanIsbn),
      rawIsbn: cleanIsbn,
      ...offlineMatch,
      cover: coverCandidates[0] || offlineMatch.cover,
      coverCandidates,
      fallbackCover: coverCandidates[1] || offlineMatch.fallbackCover || `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
      scannedAt: new Date().toISOString(),
    };
  }

  // 2. Query ISBN-based external APIs in parallel:
  // Knihovny.cz (Czech National Union Catalog API)
  // Google Books by ISBN
  // Open Library by ISBN
  const [knihovnyResult, gbResult, olResult] = await Promise.allSettled([
    fetchKnihovnyCz(cleanIsbn),
    fetchGoogleBooks(cleanIsbn),
    fetchOpenLibrary(cleanIsbn),
  ]);

  const knihovnyData = knihovnyResult.status === 'fulfilled' ? knihovnyResult.value : null;
  const gbData = gbResult.status === 'fulfilled' ? gbResult.value : null;
  const olData = olResult.status === 'fulfilled' ? olResult.value : null;

  // Check if at least one ISBN source returned any book information
  const hasIsbnData = !!(knihovnyData || gbData || olData);

  // Initialize aggregated metadata with Czech priority, then Google Books, then Open Library
  let mergedMeta = {
    title: toDisplayText(knihovnyData?.title || gbData?.title || olData?.title),
    author: toDisplayText(knihovnyData?.author || gbData?.author || olData?.author, 'Neznámý autor'),
    year: toDisplayText(knihovnyData?.year || gbData?.year || olData?.year, 'Neuvedeno'),
    publisher: toDisplayText(knihovnyData?.publisher || gbData?.publisher || olData?.publisher, 'Neuvedeno'),
    genre: toDisplayText(knihovnyData?.genre || gbData?.genre || olData?.genre, 'Všeobecná literatura'),
    ageGroup: toDisplayText(knihovnyData?.ageGroup || gbData?.ageGroup || olData?.ageGroup, 'Všeobecná veřejnost'),
    language: toDisplayText(knihovnyData?.language || gbData?.language || olData?.language, 'Čeština'),
  };

  // Check if important details or covers are missing
  const needsMoreData = !mergedMeta.title ||
    mergedMeta.author === 'Neznámý autor' ||
    mergedMeta.year === 'Neuvedeno' ||
    mergedMeta.publisher === 'Neuvedeno';

  let gbQueryData = null;
  let olQueryData = null;

  // Phase 2: If we have a title (either found now or missing data), query by title & author
  if (mergedMeta.title && (needsMoreData || (!gbData?.cover && !olData?.cover))) {
    const [gbQResult, olQResult] = await Promise.allSettled([
      fetchGoogleBooksByQuery(mergedMeta.title, mergedMeta.author),
      fetchOpenLibraryByQuery(mergedMeta.title, mergedMeta.author),
    ]);
    gbQueryData = gbQResult.status === 'fulfilled' ? gbQResult.value : null;
    olQueryData = olQResult.status === 'fulfilled' ? olQResult.value : null;

    if (gbQueryData) {
      mergedMeta = mergeBookMetadata(mergedMeta, gbQueryData);
    }
    if (olQueryData) {
      mergedMeta = mergeBookMetadata(mergedMeta, olQueryData);
    }
  }

  // If still no title and no data found from any source, return null
  if (!hasIsbnData && !gbQueryData && !olQueryData) {
    return null;
  }

  // ObálkyKnih direct endpoint by clean ISBN
  const obalkyCover = `https://www.obalkyknih.cz/api/cover?isbn=${cleanIsbn}`;

  // Priority chain for covers:
  // 1) ObálkyKnih by ISBN
  // 2) Google Books by ISBN
  // 3) Open Library by ISBN
  // 4) Google Books by title & author
  // 5) Open Library by title & author
  const coverCandidates = assembleCoverCandidates({
    cleanIsbn,
    obalkyCover,
    gbIsbnCover: gbData?.cover,
    olIsbnCover: olData?.cover,
    gbQueryCover: gbQueryData?.cover,
    olQueryCover: olQueryData?.cover,
  });

  return {
    id: `${cleanIsbn}-${Date.now()}`,
    isbn: formatIsbnDisplay(cleanIsbn),
    rawIsbn: cleanIsbn,
    title: mergedMeta.title || 'Neznámý název',
    author: mergedMeta.author || 'Neznámý autor',
    year: mergedMeta.year || 'Neuvedeno',
    publisher: mergedMeta.publisher || 'Neuvedeno',
    genre: mergedMeta.genre || 'Všeobecná literatura',
    ageGroup: mergedMeta.ageGroup || 'Všeobecná veřejnost',
    language: mergedMeta.language || 'Čeština',
    cover: coverCandidates[0] || null,
    coverCandidates,
    fallbackCover: coverCandidates[1] || coverCandidates[0] || `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
    scannedAt: new Date().toISOString(),
  };
}
