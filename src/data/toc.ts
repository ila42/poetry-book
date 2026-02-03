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
 * Строит список пунктов оглавления (только стихи) с индексами страниц.
 * Порядок и номера страниц совпадают с pageStructure в Book.
 */
export function getTocItems(bookInfo: BookInfo, poems: Poem[]): TocItem[] {
  let pageIndex = 0;
  pageIndex += 1; // title
  pageIndex += 1; // toc
  if (bookInfo.epigraph) pageIndex += 1;

  return poems.map((poem) => ({
    id: poem.id,
    title: poem.title,
    pageIndex: pageIndex++,
  }));
}
