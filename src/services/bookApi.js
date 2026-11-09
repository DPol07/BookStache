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
  ces: 'Čeština',
  czech: 'Čeština',
  en: 'Angličtina',
  eng: 'Angličtina',
  english: 'Angličtina',
  sk: 'Slovenština',
  slo: 'Slovenština',
  slk: 'Slovenština',
  slovak: 'Slovenština',
  de: 'Němčina',
  ger: 'Němčina',
  deu: 'Němčina',
  german: 'Němčina',
  fr: 'Francouzština',
  fre: 'Francouzština',
  fra: 'Francouzština',
  french: 'Francouzština',
  es: 'Španělština',
  spa: 'Španělština',
  spanish: 'Španělština',
  it: 'Italština',
  ita: 'Italština',
  italian: 'Italština',
  ru: 'Ruština',
  rus: 'Ruština',
  russian: 'Ruština',
  pl: 'Polština',
  pol: 'Polština',
  polish: 'Polština',
  ja: 'Japonština',
  jpn: 'Japonština',
  japanese: 'Japonština',
  zh: 'Čínština',
  zho: 'Čínština',
  chinese: 'Čínština',
  la: 'Latina',
  lat: 'Latina',
  latin: 'Latina',
};

// Helper to normalize and translate a language string or code
export function normalizeLanguage(rawLang) {
  if (!rawLang) return 'Neznámý';
  const clean = toDisplayText(rawLang).trim();
  if (!clean || clean === 'Neuvedeno' || clean === 'Neznámý') return 'Neznámý';

  const lower = clean.toLowerCase();
  if (LANGUAGE_MAP[lower]) {
    return LANGUAGE_MAP[lower];
  }

  // Already a known Czech name in LANGUAGE_MAP
  const knownValues = Object.values(LANGUAGE_MAP);
  const matchedValue = knownValues.find((v) => v.toLowerCase() === lower);
  if (matchedValue) return matchedValue;

  return clean;
}

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
  if (lower.includes('history') || lower.includes('histor') || lower.includes('válk')) return 'Historická literatura';
  if (lower.includes('biography') || lower.includes('autobiography') || lower.includes('životopis')) return 'Biografie a memoáry';
  if (lower.includes('poetry') || lower.includes('poezie')) return 'Poezie';
  if (lower.includes('drama') || lower.includes('divadlo')) return 'Drama';
  if (lower.includes('comics') || lower.includes('graphic novel') || lower.includes('komiks')) return 'Komiksy';
  if (lower.includes('religion') || lower.includes('theology') || lower.includes('křesťan') || lower.includes('duchov')) return 'Duchovní literatura a křesťanství';
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

// Normalization helper for title matching (removes accents, punctuation, lowercase)
export function normalizeTitleForMatch(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Curated knowledge base for known Czech editions and popular classics
// used to resolve missing author/year/publisher/genre when API lookups yield incomplete data
export const TITLE_KNOWLEDGE_BASE = [
  {
    matches: ['rady zkuseneho dabla', 'zkuseneho dabla', 'the screwtape letters', 'screwtape letters'],
    title: 'Rady zkušeného ďábla',
    author: 'C. S. Lewis',
    year: '2008',
    publisher: 'Návrat domů',
    genre: 'Křesťanská literatura / Alegorie',
    ageGroup: 'Pro dospělé a mládež',
    language: 'Čeština',
    cover: 'https://covers.openlibrary.org/b/id/9779-L.jpg',
  },
  {
    matches: ['zapisky o valce galske', 'valce galske', 'commentarii de bello gallico', 'de bello gallico'],
    title: 'Zápisky o válce galské',
    author: 'Gaius Iulius Caesar',
    year: '2009',
    publisher: 'Naše vojsko',
    genre: 'Historická literatura / Antika',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Čeština',
    cover: 'https://covers.openlibrary.org/b/id/2891112-L.jpg',
  },
  {
    matches: ['zranene srdce', 'the sacred romance', 'posvatna romance'],
    title: 'Zraněné srdce',
    author: 'John Eldredge',
    year: '2007',
    publisher: 'Návrat domů',
    genre: 'Duchovní literatura a psychologie',
    ageGroup: 'Pro dospělé',
    language: 'Čeština',
    cover: 'https://covers.openlibrary.org/b/id/6808063-L.jpg',
  },
  {
    matches: ['harry potter a kamen mudrcu', 'harry potter and the philosopher s stone'],
    title: 'Harry Potter a Kámen mudrců',
    author: 'J. K. Rowlingová',
    year: '2000',
    publisher: 'Albatros',
    genre: 'Fantasy / Pro děti a mládež',
    ageGroup: 'Mládež (9-15 let)',
    language: 'Čeština',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788000058825',
  },
  {
    matches: ['alchymista', 'the alchemist', 'o alquimista'],
    title: 'Alchymista',
    author: 'Paulo Coelho',
    year: '2011',
    publisher: 'Argo',
    genre: 'Filozofický román',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Čeština',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788073819316',
  },
  {
    matches: ['maly princ', 'the little prince', 'le petit prince'],
    title: 'Malý princ',
    author: 'Antoine de Saint-Exupéry',
    year: '2021',
    publisher: 'Albatros',
    genre: 'Filozofická pohádka',
    ageGroup: 'Všechny věkové kategorie',
    language: 'Čeština',
    cover: 'https://covers.openlibrary.org/b/id/10523395-L.jpg',
  },
  {
    matches: ['1984', 'nineteen eighty four'],
    title: '1984',
    author: 'George Orwell',
    year: '2020',
    publisher: 'Mladá fronta',
    genre: 'Dystopický román',
    ageGroup: 'Pro dospělé',
    language: 'Čeština',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788020455826',
  },
];

// Helper to find title metadata from the curated knowledge base
export function findTitleInKnowledgeBase(title) {
  if (!title) return null;
  const normalized = normalizeTitleForMatch(title);
  if (!normalized) return null;

  for (const entry of TITLE_KNOWLEDGE_BASE) {
    if (entry.matches.some((m) => normalized.includes(m) || m.includes(normalized))) {
      return entry;
    }
  }
  return null;
}

// Built-in offline backup catalog by ISBN
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
  '9788071953258': {
    title: 'Rady zkušeného ďábla',
    author: 'C. S. Lewis',
    year: '2008',
    publisher: 'Návrat domů',
    genre: 'Křesťanská literatura / Alegorie',
    ageGroup: 'Pro dospělé a mládež',
    language: 'Čeština',
    isbn: '978-80-7195-325-8',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788071953258',
    fallbackCover: 'https://covers.openlibrary.org/b/isbn/9788071953258-L.jpg',
  },
  '9788070219669': {
    title: 'Rady zkušeného ďábla',
    author: 'C. S. Lewis',
    year: '2008',
    publisher: 'Vyšehrad',
    genre: 'Křesťanská literatura / Alegorie',
    ageGroup: 'Pro dospělé a mládež',
    language: 'Čeština',
    isbn: '978-80-7021-966-9',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788070219669',
    fallbackCover: 'https://covers.openlibrary.org/b/isbn/9788070219669-L.jpg',
  },
  '9788086410401': {
    title: 'Zápisky o válce galské',
    author: 'Gaius Iulius Caesar',
    year: '2009',
    publisher: 'Naše vojsko',
    genre: 'Historická literatura / Antika',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Čeština',
    isbn: '978-80-86410-40-1',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788086410401',
    fallbackCover: 'https://covers.openlibrary.org/b/isbn/9788086410401-L.jpg',
  },
  '9788020610507': {
    title: 'Zápisky o válce galské',
    author: 'Gaius Iulius Caesar',
    year: '2009',
    publisher: 'Naše vojsko',
    genre: 'Historická literatura / Antika',
    ageGroup: 'Všeobecná veřejnost',
    language: 'Čeština',
    isbn: '978-80-206-1050-7',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788020610507',
    fallbackCover: 'https://covers.openlibrary.org/b/isbn/9788020610507-L.jpg',
  },
  '9788072551521': {
    title: 'Zraněné srdce',
    author: 'John Eldredge',
    year: '2007',
    publisher: 'Návrat domů',
    genre: 'Duchovní literatura a psychologie',
    ageGroup: 'Pro dospělé',
    language: 'Čeština',
    isbn: '978-80-7255-152-1',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788072551521',
    fallbackCover: 'https://covers.openlibrary.org/b/isbn/9788072551521-L.jpg',
  },
  '9788087282052': {
    title: 'Zraněné srdce',
    author: 'John Eldredge',
    year: '2010',
    publisher: 'Návrat domů',
    genre: 'Duchovní literatura a psychologie',
    ageGroup: 'Pro dospělé',
    language: 'Čeština',
    isbn: '978-80-87282-05-2',
    cover: 'https://www.obalkyknih.cz/api/cover?isbn=9788087282052',
    fallbackCover: 'https://covers.openlibrary.org/b/isbn/9788087282052-L.jpg',
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

    const rawLang = Array.isArray(record.languages)
      ? (record.languages.length > 0 ? record.languages[0] : null)
      : (record.languages || record.language);
    const language = rawLang ? normalizeLanguage(rawLang) : 'Neznámý';

    return {
      title,
      author,
      year,
      publisher,
      genre,
      ageGroup: inferAgeGroup(genre, title),
      language,
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

  const lang = info.language ? normalizeLanguage(info.language) : 'Neznámý';

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

    // First attempt: with author if available
    if (cleanAuthor) {
      const q = `intitle:${encodeURIComponent(cleanTitle)}+inauthor:${encodeURIComponent(cleanAuthor)}`;
      const response = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3`);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          return parseGoogleBooksItem(data.items[0]);
        }
      }
    }

    // Second attempt: intitle query by clean title
    const qTitle = `intitle:${encodeURIComponent(cleanTitle)}`;
    const resTitle = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${qTitle}&maxResults=3`);
    if (resTitle.ok) {
      const data = await resTitle.json();
      if (data.items && data.items.length > 0) {
        return parseGoogleBooksItem(data.items[0]);
      }
    }

    // Third attempt: broader text query
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
    // 1. Direct edition JSON endpoint (exact edition details for this specific ISBN)
    try {
      const editionUrl = `https://openlibrary.org/isbn/${cleanIsbn}.json`;
      const editionRes = await fetchWithTimeout(editionUrl);
      if (editionRes.ok) {
        const ed = await editionRes.json();
        if (ed && ed.title) {
          const year = ed.publish_date ? (ed.publish_date.match(/\d{4}/)?.[0] || ed.publish_date) : '';
          const publishers = Array.isArray(ed.publishers)
            ? ed.publishers.map((item) => toDisplayText(item?.name ?? item)).filter(Boolean).join(', ')
            : toDisplayText(ed.publishers);

          let author = '';
          if (Array.isArray(ed.authors) && ed.authors.length > 0) {
            // If authors are keys like { key: '/authors/OL...' }
            const authorNames = [];
            for (const a of ed.authors) {
              if (a.name) {
                authorNames.push(toDisplayText(a.name));
              } else if (a.key) {
                try {
                  const aRes = await fetchWithTimeout(`https://openlibrary.org${a.key}.json`, {}, 2000);
                  if (aRes.ok) {
                    const aData = await aRes.json();
                    if (aData.name) authorNames.push(toDisplayText(aData.name));
                  }
                } catch {
                  // ignore author key fetch error
                }
              }
            }
            author = authorNames.join(', ');
          }

          let lang = 'Neznámý';
          if (Array.isArray(ed.languages) && ed.languages.length > 0) {
            const raw = ed.languages[0]?.key?.replace('/languages/', '') || ed.languages[0];
            lang = normalizeLanguage(raw);
          }

          const coverId = Array.isArray(ed.covers) && ed.covers.length > 0 ? ed.covers[0] : null;
          const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;

          return {
            title: toDisplayText(ed.title),
            author,
            year: toDisplayText(year),
            publisher: publishers,
            genre: translateGenre(ed.subjects),
            ageGroup: inferAgeGroup(ed.subjects, ed.title),
            language: lang,
            cover,
          };
        }
      }
    } catch (e) {
      console.warn('Open Library isbn.json error:', e);
    }

    // 2. Bibkeys jscmd=data endpoint
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

        let lang = 'Neznámý';
        if (Array.isArray(book.languages) && book.languages.length > 0) {
          const raw = book.languages[0]?.key?.replace('/languages/', '') || book.languages[0]?.name || book.languages[0];
          lang = normalizeLanguage(raw);
        }

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

    return null;
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

    let response = await fetchWithTimeout(url);
    if (response.ok) {
      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
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
      }
    }

    // Fallback: general q search with cleanTitle
    const qUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanTitle)}&limit=3`;
    const qResponse = await fetchWithTimeout(qUrl);
    if (qResponse.ok) {
      const qData = await qResponse.json();
      if (qData.docs && qData.docs.length > 0) {
        const doc = qData.docs[0];
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
      }
    }

    return null;
  } catch (e) {
    console.warn('Open Library title/author fetch error:', e);
    return null;
  }
}

// Helper to check if a metadata field is missing or generic default
export function isFieldMissing(val, defaults = []) {
  if (val == null) return true;
  const str = String(val).trim();
  if (!str) return true;
  return defaults.includes(str);
}

// Merge book metadata carefully: keeps existing valid fields, only fills missing ones.
// When merging from another query or edition (supplementFromOtherEdition = true),
// language and publisher MUST NOT be overwritten or supplemented from other editions!
export function mergeBookMetadata(primary, supplement, options = {}) {
  if (!supplement) return primary;
  if (!primary) return supplement;

  const { isOtherEdition = false } = options;

  return {
    title: isFieldMissing(primary.title, ['Neznámý název', '']) ? (supplement.title || primary.title) : primary.title,
    author: isFieldMissing(primary.author, ['Neznámý autor', '']) ? (supplement.author || primary.author) : primary.author,
    year: isFieldMissing(primary.year, ['Neuvedeno', 'Rok vydání neuveden', '']) ? (supplement.year || primary.year) : primary.year,
    // Publisher must never come from another edition
    publisher: isOtherEdition
      ? primary.publisher
      : (isFieldMissing(primary.publisher, ['Neuvedeno', 'Nakladatelství neuvedeno', '']) ? (supplement.publisher || primary.publisher) : primary.publisher),
    genre: isFieldMissing(primary.genre, ['Všeobecná literatura', 'Beletrie', '']) ? (supplement.genre || primary.genre) : primary.genre,
    ageGroup: isFieldMissing(primary.ageGroup, ['Všeobecná veřejnost', '']) ? (supplement.ageGroup || primary.ageGroup) : primary.ageGroup,
    // Language must never come from another edition
    language: isOtherEdition
      ? primary.language
      : (isFieldMissing(primary.language, ['Neznámý', '']) ? (supplement.language || primary.language) : primary.language),
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

// Search books online by query (title, author, or keywords) across Google Books and Open Library
export async function searchBooksOnline(query, limit = 8) {
  if (!query || !query.trim()) return [];
  const cleanQ = query.trim();

  try {
    const [gbRes, olRes] = await Promise.allSettled([
      fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQ)}&maxResults=${Math.min(limit, 10)}`),
      fetchWithTimeout(`https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQ)}&limit=${Math.min(limit, 10)}`)
    ]);

    const results = [];
    const seenTitles = new Set();

    // Parse Google Books results
    if (gbRes.status === 'fulfilled' && gbRes.value.ok) {
      try {
        const gbData = await gbRes.value.json();
        if (gbData.items && Array.isArray(gbData.items)) {
          for (const item of gbData.items) {
            const parsed = parseGoogleBooksItem(item);
            if (parsed && parsed.title) {
              const industryIds = item.volumeInfo?.industryIdentifiers || [];
              const isbn13 = industryIds.find(i => i.type === 'ISBN_13')?.identifier;
              const isbn10 = industryIds.find(i => i.type === 'ISBN_10')?.identifier;
              const foundIsbn = isbn13 || isbn10 || '';

              const cleanIsbn = normalizeIsbn(foundIsbn);
              const obalkyCover = cleanIsbn ? `https://www.obalkyknih.cz/api/cover?isbn=${cleanIsbn}` : null;
              const coverCandidates = assembleCoverCandidates({
                cleanIsbn,
                obalkyCover,
                gbIsbnCover: parsed.cover,
                olIsbnCover: cleanIsbn ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg` : null,
                gbQueryCover: parsed.cover,
              });

              const bookResult = {
                id: `online-gb-${item.id || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: parsed.title,
                author: parsed.author || 'Neznámý autor',
                year: parsed.year || 'Neuvedeno',
                publisher: parsed.publisher || 'Neuvedeno',
                genre: parsed.genre || 'Všeobecná literatura',
                ageGroup: parsed.ageGroup || 'Všeobecná veřejnost',
                language: parsed.language || 'Neznámý',
                isbn: cleanIsbn ? formatIsbnDisplay(cleanIsbn) : '',
                rawIsbn: cleanIsbn || '',
                cover: coverCandidates[0] || parsed.cover || null,
                coverCandidates,
                fallbackCover: coverCandidates[1] || coverCandidates[0] || null,
                source: 'Google Books',
              };

              const titleKey = `${normalizeTitleForMatch(bookResult.title)}|${normalizeTitleForMatch(bookResult.author)}`;
              if (!seenTitles.has(titleKey)) {
                seenTitles.add(titleKey);
                results.push(bookResult);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error parsing Google Books query response:', err);
      }
    }

    // Parse Open Library results
    if (olRes.status === 'fulfilled' && olRes.value.ok) {
      try {
        const olData = await olRes.value.json();
        if (olData.docs && Array.isArray(olData.docs)) {
          for (const doc of olData.docs) {
            const title = toDisplayText(doc.title);
            if (!title) continue;

            const author = Array.isArray(doc.author_name)
              ? doc.author_name.map((item) => toDisplayText(item)).filter(Boolean).join(', ')
              : 'Neznámý autor';
            const titleKey = `${normalizeTitleForMatch(title)}|${normalizeTitleForMatch(author)}`;
            if (seenTitles.has(titleKey)) continue;

            const isbns = Array.isArray(doc.isbn) ? doc.isbn : [];
            const cleanIsbn = isbns.length > 0 ? normalizeIsbn(isbns[0]) : '';
            const year = toDisplayText(doc.first_publish_year, 'Neuvedeno');
            const publisher = Array.isArray(doc.publisher) ? toDisplayText(doc.publisher[0], 'Neuvedeno') : toDisplayText(doc.publisher, 'Neuvedeno');
            const genre = translateGenre(doc.subject);
            const coverUrl = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : (cleanIsbn ? `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg` : null);
            const obalkyCover = cleanIsbn ? `https://www.obalkyknih.cz/api/cover?isbn=${cleanIsbn}` : null;

            const coverCandidates = assembleCoverCandidates({
              cleanIsbn,
              obalkyCover,
              olIsbnCover: coverUrl,
              olQueryCover: coverUrl,
            });

            seenTitles.add(titleKey);
            results.push({
              id: `online-ol-${doc.key?.replace('/works/', '') || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title,
              author,
              year,
              publisher,
              genre,
              ageGroup: inferAgeGroup(doc.subject, title),
              language: doc.language ? normalizeLanguage(doc.language[0]) : 'Neznámý',
              isbn: cleanIsbn ? formatIsbnDisplay(cleanIsbn) : '',
              rawIsbn: cleanIsbn || '',
              cover: coverCandidates[0] || coverUrl || null,
              coverCandidates,
              fallbackCover: coverCandidates[1] || coverCandidates[0] || null,
              source: 'Open Library',
            });
          }
        }
      } catch (err) {
        console.warn('Error parsing Open Library query response:', err);
      }
    }

    return results.slice(0, limit);
  } catch (err) {
    console.error('searchBooksOnline failed:', err);
    return [];
  }
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

  // Initialize aggregated metadata with Czech priority, then Google Books, then Open Library.
  // Note: Language and Publisher are STRICTLY sourced only from the edition matching the cleanIsbn.
  const resolvedLanguage = normalizeLanguage(
    knihovnyData?.language ||
    (gbData?.language && gbData.language !== 'Neznámý' ? gbData.language : null) ||
    (olData?.language && olData.language !== 'Neznámý' ? olData.language : null)
  );

  let mergedMeta = {
    title: toDisplayText(knihovnyData?.title || gbData?.title || olData?.title),
    author: toDisplayText(knihovnyData?.author || gbData?.author || olData?.author, 'Neznámý autor'),
    year: toDisplayText(knihovnyData?.year || gbData?.year || olData?.year, 'Neuvedeno'),
    publisher: toDisplayText(knihovnyData?.publisher || gbData?.publisher || olData?.publisher, 'Neuvedeno'),
    genre: toDisplayText(knihovnyData?.genre || gbData?.genre || olData?.genre, 'Všeobecná literatura'),
    ageGroup: toDisplayText(knihovnyData?.ageGroup || gbData?.ageGroup || olData?.ageGroup, 'Všeobecná veřejnost'),
    language: resolvedLanguage,
  };

  // Phase 2: If we have a title (found now or partial), check if author, year, genre or cover is missing.
  // CRITICAL REQUIREMENT: Title and author search query MUST NEVER overwrite or supplement
  // publisher or language from another edition!
  const needsMoreData = !mergedMeta.title ||
    mergedMeta.title === 'Neznámý název' ||
    mergedMeta.author === 'Neznámý autor' ||
    mergedMeta.year === 'Neuvedeno';

  let gbQueryData = null;
  let olQueryData = null;

  if (mergedMeta.title && (needsMoreData || (!gbData?.cover && !olData?.cover))) {
    // 2a. Query Google Books & Open Library by title and author for supplemental info (author, year, genre, covers)
    const [gbQResult, olQResult] = await Promise.allSettled([
      fetchGoogleBooksByQuery(mergedMeta.title, mergedMeta.author),
      fetchOpenLibraryByQuery(mergedMeta.title, mergedMeta.author),
    ]);
    gbQueryData = gbQResult.status === 'fulfilled' ? gbQResult.value : null;
    olQueryData = olQResult.status === 'fulfilled' ? olQResult.value : null;

    if (gbQueryData) {
      mergedMeta = mergeBookMetadata(mergedMeta, gbQueryData, { isOtherEdition: true });
    }
    if (olQueryData) {
      mergedMeta = mergeBookMetadata(mergedMeta, olQueryData, { isOtherEdition: true });
    }

    // 2b. If author or year are still missing, check title knowledge base (e.g. Lewis, Caesar, Eldredge)
    const stillNeedsData = mergedMeta.author === 'Neznámý autor' || mergedMeta.year === 'Neuvedeno';
    if (stillNeedsData) {
      const kbMatch = findTitleInKnowledgeBase(mergedMeta.title);
      if (kbMatch) {
        mergedMeta = mergeBookMetadata(mergedMeta, kbMatch, { isOtherEdition: true });
      }
    }
  }

  // If still no title and no data found from any source, return null
  if (!hasIsbnData && !gbQueryData && !olQueryData && (!mergedMeta.title || mergedMeta.title === 'Neznámý název')) {
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
  const kbCover = findTitleInKnowledgeBase(mergedMeta.title)?.cover;
  const coverCandidates = assembleCoverCandidates({
    cleanIsbn,
    obalkyCover,
    gbIsbnCover: gbData?.cover,
    olIsbnCover: olData?.cover,
    gbQueryCover: gbQueryData?.cover,
    olQueryCover: olQueryData?.cover,
    extraFallbacks: kbCover ? [kbCover] : [],
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
    language: mergedMeta.language || 'Neznámý',
    cover: coverCandidates[0] || null,
    coverCandidates,
    fallbackCover: coverCandidates[1] || coverCandidates[0] || `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
    scannedAt: new Date().toISOString(),
  };
}
