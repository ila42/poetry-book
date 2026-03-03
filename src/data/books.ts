import { BookInfo, Poem, Chapter } from '@/types';
import { extractPoemsFromData, extractChaptersFromData, getPoemOfTheDay, type ContentDataShape } from './contentHelpers';
import { getTocItems, type TocItem, type TocBookData } from './toc';
import { author, bookInfo as book1Info } from './author';

import contentBook1 from './content.json';
import contentBook2 from './content-book-2.json';
import contentBook3 from './content-book-3.json';
import tocBook1 from './toc-book.json';
import tocBook2 from './toc-book-2.json';
import tocBook3 from './toc-book-3.json';

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
    coverGradient: 'from-[#8B4557] via-[#6B3344] to-[#4A2332]',
  },
  {
    slug: 'book-2',
    bookInfo: {
      title: '6 тетрадей сборник',
      titlePageTitle: '6 тетрадей сборник',
      subtitle: '',
      author: 'Андрей Балашов',
      year: '2026',
    },
    contentData: contentBook2 as ContentDataShape,
    tocData: tocBook2 as TocBookData,
    coverGradient: 'from-[#2C5F7C] via-[#1E4A5F] to-[#0F3042]',
  },
  {
    slug: 'book-3',
    bookInfo: {
      title: 'Вне времени',
      titlePageTitle: 'Вне времени',
      subtitle: '',
      author: 'Андрей Балашов',
      year: '2026',
    },
    contentData: contentBook3 as ContentDataShape,
    tocData: tocBook3 as TocBookData,
    coverGradient: 'from-[#5C6B3C] via-[#465429] to-[#2F3A1A]',
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
