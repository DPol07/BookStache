// Book API service combining Google Books, Open Library, ObálkyKnih, and fallback catalog

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

// Format ISBN for display
export function formatIsbnDisplay(isbn) {
  const clean = normalizeIsbn(isbn);
  if (clean.length === 13 && (clean.startsWith('978') || clean.startsWith('979'))) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean.slice(12)}`;
  }
  return clean;
}

// Language code to Czech name mapping
const LANGUAGE_MAP = {
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
function translateGenre(categories) {
  if (!categories || categories.length === 0) return 'Beletrie';

  const raw = Array.isArray(categories) ? categories.join(', ') : String(categories);
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
function inferAgeGroup(categories, title = '', description = '') {
  const combined = `${Array.isArray(categories) ? categories.join(' ') : categories} ${title} ${description}`.toLowerCase();

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
const OFFLINE_CATALOG = {
  '9788000058825': {
    title: 'Harry Potter a Kámen mudrců',
    author: 'J. K. Rowlingová',
    year: '2000',
    publisher: 'Albatros',
    genre: 'Fantasy / Pro děti a mládež',
    ageGroup: 'Mládež (9-15 let)',
    language: 'Čeština',
    isbn: '978-80-00058-82-5',
    cover: 'https://covers.openlibrary.org/b/id/10523420-L.jpg',
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
    cover: 'https://covers.openlibrary.org/b/id/12836269-L.jpg',
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
    cover: 'https://covers.openlibrary.org/b/id/12645114-L.jpg',
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
    cover: 'https://covers.openlibrary.org/b/id/12645114-L.jpg',
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
  }
};

// Fetch book details from Google Books
async function fetchGoogleBooks(cleanIsbn) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      // Try search query by raw string
      const res2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${cleanIsbn}`);
      if (!res2.ok) return null;
      const data2 = await res2.json();
      if (!data2.items || data2.items.length === 0) return null;
      data.items = data2.items;
    }

    const info = data.items[0].volumeInfo;
    const year = info.publishedDate ? info.publishedDate.slice(0, 4) : '';
    const coverUrl = info.imageLinks
      ? (info.imageLinks.extraLarge || info.imageLinks.large || info.imageLinks.medium || info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)
      : null;

    const safeCover = coverUrl
      ? coverUrl.replace(/^http:/, 'https:').replace('&edge=curl', '')
      : null;

    const lang = info.language ? (LANGUAGE_MAP[info.language.toLowerCase()] || info.language.toUpperCase()) : 'Čeština';

    return {
      title: info.title || '',
      author: info.authors ? info.authors.join(', ') : '',
      year: year,
      publisher: info.publisher || '',
      genre: translateGenre(info.categories),
      ageGroup: inferAgeGroup(info.categories, info.title, info.description),
      language: lang,
      cover: safeCover,
    };
  } catch (e) {
    console.warn('Google Books fetch error:', e);
    return null;
  }
}

// Fetch book details from Open Library API
async function fetchOpenLibrary(cleanIsbn) {
  try {
    const bibUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
    const response = await fetch(bibUrl);
    if (!response.ok) return null;
    const data = await response.json();
    const key = `ISBN:${cleanIsbn}`;
    const book = data[key];

    if (!book) {
      // Fallback to search API
      const searchUrl = `https://openlibrary.org/search.json?q=${cleanIsbn}`;
      const sRes = await fetch(searchUrl);
      if (!sRes.ok) return null;
      const sData = await sRes.json();
      if (!sData.docs || sData.docs.length === 0) return null;
      const doc = sData.docs[0];
      return {
        title: doc.title || '',
        author: doc.author_name ? doc.author_name.join(', ') : '',
        year: doc.first_publish_year ? String(doc.first_publish_year) : '',
        publisher: doc.publisher ? doc.publisher[0] : '',
        genre: translateGenre(doc.subject),
        ageGroup: inferAgeGroup(doc.subject, doc.title),
        language: doc.language ? (LANGUAGE_MAP[doc.language[0]] || doc.language[0]) : 'Čeština',
        cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`,
      };
    }

    const year = book.publish_date ? (book.publish_date.match(/\d{4}/)?.[0] || book.publish_date) : '';
    const authors = book.authors ? book.authors.map(a => a.name).join(', ') : '';
    const publishers = book.publishers ? book.publishers.map(p => p.name).join(', ') : '';
    const categories = book.subjects ? book.subjects.map(s => s.name) : [];

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
  } catch (e) {
    console.warn('Open Library fetch error:', e);
    return null;
  }
}

// Primary Aggregator Function
export async function fetchBookByIsbn(rawIsbn) {
  const cleanIsbn = normalizeIsbn(rawIsbn);
  if (!cleanIsbn || cleanIsbn.length < 7) {
    return null;
  }

  // 1. Query external APIs in parallel
  const [gbResult, olResult] = await Promise.allSettled([
    fetchGoogleBooks(cleanIsbn),
    fetchOpenLibrary(cleanIsbn),
  ]);

  const gbData = gbResult.status === 'fulfilled' ? gbResult.value : null;
  const olData = olResult.status === 'fulfilled' ? olResult.value : null;

  // 2. Check offline catalog
  const offlineData = OFFLINE_CATALOG[cleanIsbn];

  // Merge data prioritizing accuracy
  const title = gbData?.title || olData?.title || offlineData?.title || `Naskenovaná kniha (${formatIsbnDisplay(cleanIsbn)})`;
  const author = gbData?.author || olData?.author || offlineData?.author || 'Neznámý autor';
  const year = gbData?.year || olData?.year || offlineData?.year || 'Neuvedeno';
  const publisher = gbData?.publisher || olData?.publisher || offlineData?.publisher || 'Neuvedeno';
  const genre = gbData?.genre || olData?.genre || offlineData?.genre || 'Všeobecná literatura';
  const ageGroup = gbData?.ageGroup || olData?.ageGroup || offlineData?.ageGroup || 'Všeobecná veřejnost';
  const language = gbData?.language || olData?.language || offlineData?.language || 'Čeština';

  // Cover fallback order
  let cover = gbData?.cover || olData?.cover || offlineData?.cover || `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;

  return {
    id: `${cleanIsbn}-${Date.now()}`,
    isbn: formatIsbnDisplay(cleanIsbn),
    rawIsbn: cleanIsbn,
    title: title,
    author: author,
    year: year,
    publisher: publisher,
    genre: genre,
    ageGroup: ageGroup,
    language: language,
    cover: cover,
    scannedAt: new Date().toISOString(),
  };
}
