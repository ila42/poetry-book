import type { Poem } from '@/types';
import type { BookInfo } from '@/types';
import tocBookData from './toc-book.json';

export type TocItemType = 'part' | 'chapter' | 'poem' | 'poem-of-day' | 'interlude';

export interface TocItem {
  id: string;
  title: string;
  pageIndex: number;
  type: TocItemType;
  poemNumber?: number;
  pageNumber?: number;
  subtitle?: string; // для частей и глав
}

interface TocBookSection {
  type: string;
  id: string;
  label: string;
  title: string;
  items: any[];
}

interface TocBookData {
  meta: { bookTitle: string };
  frontMatter: any[];
  sections: TocBookSection[];
}

export function getTocItems(bookInfo: BookInfo, poems: Poem[]): TocItem[] {
  const poemOfDayPageIndex = getPoemOfTheDayPageIndex(bookInfo);
  let currentPageIndex = poemOfDayPageIndex + 1;

  // Создаём мапу poem.id -> poem для быстрого доступа
  const poemMap = new Map<string, Poem>();
  poems.forEach((poem) => {
    poemMap.set(poem.id, poem);
  });

  const items: TocItem[] = [];

  items.push({
    id: 'poem-of-the-day',
    title: '\u0421\u0442\u0438\u0445\u043e\u0442\u0432\u043e\u0440\u0435\u043d\u0438\u0435 \u0434\u043d\u044f',
    pageIndex: poemOfDayPageIndex,
    type: 'poem-of-day',
    pageNumber: poemOfDayPageIndex + 1,
  });

  const tocBook = tocBookData as TocBookData;

  // Проходим по структуре и присваиваем pageIndex последовательно
  for (const section of tocBook.sections) {
    if (section.type === 'part') {
      // Добавляем страницу части
      items.push({
        id: section.id,
        title: section.label,
        subtitle: section.title,
        pageIndex: currentPageIndex,
        type: 'part',
        pageNumber: currentPageIndex + 1,
      });
      currentPageIndex++;

      // Обрабатываем содержимое части
      for (const item of section.items) {
        if (item.type === 'chapter') {
          // Добавляем страницу главы
          items.push({
            id: item.id,
            title: item.label,
            subtitle: item.title,
            pageIndex: currentPageIndex,
            type: 'chapter',
            pageNumber: currentPageIndex + 1,
          });
          currentPageIndex++;

          // Добавляем содержимое главы
          for (const chapterItem of item.items) {
            if (chapterItem.type === 'poem') {
              items.push({
                id: chapterItem.id,
                title: chapterItem.title,
                pageIndex: currentPageIndex,
                type: 'poem',
                pageNumber: currentPageIndex + 1,
              });
              currentPageIndex++;
            } else if (chapterItem.type === 'interlude') {
              items.push({
                id: chapterItem.id,
                title: chapterItem.title,
                pageIndex: currentPageIndex,
                type: 'interlude',
                pageNumber: currentPageIndex + 1,
              });
              currentPageIndex++;
            }
          }
        } else if (item.type === 'poem') {
          // Стихи напрямую в части (без главы)
          items.push({
            id: item.id,
            title: item.title,
            pageIndex: currentPageIndex,
            type: 'poem',
            pageNumber: currentPageIndex + 1,
          });
          currentPageIndex++;
        } else if (item.type === 'interlude') {
          // Интерлюдия в части
          items.push({
            id: item.id,
            title: item.title,
            pageIndex: currentPageIndex,
            type: 'interlude',
            pageNumber: currentPageIndex + 1,
          });
          currentPageIndex++;
        }
      }
    }
  }

  return items;
}

export function getPoemOfTheDayPageIndex(bookInfo: BookInfo): number {
  let pageIndex = 0;
  pageIndex += 1; // title
  if (bookInfo.epigraph) pageIndex += 1;
  return pageIndex;
}
