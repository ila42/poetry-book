import { BookInfo, Poem, Chapter } from '@/types';
import { extractPoemsFromData, extractChaptersFromData, getPoemOfTheDay, type ContentDataShape } from './contentHelpers';
import { getTocItems, type TocItem, type TocBookData } from './toc';
import { author, bookInfo as book1Info } from './author';

import contentBook1 from './content.json';
import contentBook2 from './content-book-2.json';
import contentBook3 from './content-book-3.json';
import contentBook4 from './content-book-4.json';
import tocBook1 from './toc-book.json';
import tocBook2 from './toc-book-2.json';
import tocBook3 from './toc-book-3.json';
import tocBook4 from './toc-book-4.json';

export interface BookConfig {
  slug: string;
  bookInfo: BookInfo;
  contentData: ContentDataShape;
  tocData: TocBookData;
  coverGradient: string;
}

const booksConfig: BookConfig[] = [
  {
    slug: 'book-1',
    bookInfo: book1Info,
    contentData: contentBook1 as ContentDataShape,
    tocData: tocBook1 as TocBookData,
    coverGradient: 'from-[#7A3545] via-[#5E2838] to-[#42192A]',
  },
  {
    slug: 'book-2',
    bookInfo: {
      title: '6 тетрадей сборник',
      titlePageTitle: '6 тетрадей сборник',
      subtitle: '',
      author: 'Андрей Балашов',
      year: '2026',
      epigraph: '',
    },
    contentData: contentBook2 as ContentDataShape,
    tocData: tocBook2 as TocBookData,
    coverGradient: 'from-[#6A3B5E] via-[#523048] to-[#3A2034]',
  },
  {
    slug: 'book-3',
    bookInfo: {
      title: 'Вне времени',
      titlePageTitle: 'Вне времени',
      subtitle: 'книга стихов',
      author: 'Андрей Балашов',
      year: '2026',
      epigraph: '',
    },
    contentData: contentBook3 as ContentDataShape,
    tocData: tocBook3 as TocBookData,
    coverGradient: 'from-[#6B4A3A] via-[#52382C] to-[#3A271E]',
  },
  {
    slug: 'book-4',
    bookInfo: {
      title: 'Восточные тетради',
      titlePageTitle: 'Восточные тетради',
      subtitle: 'как будто восточный цикл',
      author: 'Андрей Балашов',
      year: '2026',
      epigraph: '',
    },
    contentData: contentBook4 as ContentDataShape,
    tocData: tocBook4 as TocBookData,
    coverGradient: 'from-[#8B1A1A] via-[#6B1212] to-[#4A0D0D]',
  },
];

export interface ResolvedBookData {
  slug: string;
  bookInfo: BookInfo;
  poems: Poem[];
  chapters: Chapter[];
  tocData: TocBookData;
  coverGradient: string;
}

const resolvedCache = new Map<string, ResolvedBookData>();

export function getBookBySlug(slug: string): ResolvedBookData | undefined {
  if (resolvedCache.has(slug)) return resolvedCache.get(slug)!;

  const cfg = booksConfig.find((b) => b.slug === slug);
  if (!cfg) return undefined;

  const poems = extractPoemsFromData(cfg.contentData);
  const chapters = extractChaptersFromData(cfg.contentData);

  const resolved: ResolvedBookData = {
    slug: cfg.slug,
    bookInfo: cfg.bookInfo,
    poems,
    chapters,
    tocData: cfg.tocData,
    coverGradient: cfg.coverGradient,
  };

  resolvedCache.set(slug, resolved);
  return resolved;
}

export function getTocItemsForBook(book: ResolvedBookData): TocItem[] {
  return getTocItems(book.bookInfo, book.poems, book.tocData);
}

export function getAllBooks(): BookConfig[] {
  return booksConfig;
}

let globalPoemPool: Poem[] | null = null;

function getGlobalPoemPool(): Poem[] {
  if (globalPoemPool) return globalPoemPool;

  globalPoemPool = booksConfig.flatMap((book, index) => {
    const match = book.slug.match(/book-(\d+)/);
    const bookNumber = match ? Number(match[1]) : index + 1;
    return extractPoemsFromData(book.contentData).map((poem) => ({
      ...poem,
      bookSlug: book.slug,
      bookNumber,
    }));
  });

  return globalPoemPool;
}

export function getGlobalPoemOfTheDay(): Poem {
  return getPoemOfTheDay('global', getGlobalPoemPool());
}

export { author };
