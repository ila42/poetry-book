import type { Poem } from '@/types';
import type { BookInfo } from '@/types';

export interface TocItem {
  /** Уникальный id (slug) стиха */
  id: string;
  /** Название стиха */
  title: string;
  /** Индекс страницы в книге (для навигации setCurrentPage(pageIndex)) */
  pageIndex: number;
}

/**
 * Строит список пунктов оглавления (стих дня + стихи) с индексами страниц.
 * Порядок и номера страниц совпадают с pageStructure в Book.
 */
export function getTocItems(bookInfo: BookInfo, poems: Poem[]): TocItem[] {
  const poemOfDayPageIndex = getPoemOfTheDayPageIndex(bookInfo);
  let pageIndex = poemOfDayPageIndex + 1;

  return [
    { id: 'poem-of-the-day', title: 'Стихотворение дня', pageIndex: poemOfDayPageIndex },
    ...poems.map((poem) => ({
      id: poem.id,
      title: poem.title,
      pageIndex: pageIndex++,
    })),
  ];
}

export function getPoemOfTheDayPageIndex(bookInfo: BookInfo): number {
  let pageIndex = 0;
  pageIndex += 1; // title
  if (bookInfo.epigraph) pageIndex += 1;
  return pageIndex;
}
