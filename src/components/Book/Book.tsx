import React, { useState, useCallback, useMemo } from 'react';
import { BookInfo, Chapter, Poem } from '@/types';
import { BookPage, TitlePage, DedicationPage, EpigraphPage, AfterwordPage, ChapterPage, PartPage, ChapterInPartPage, InterludePage } from './BookPage';
import { PoemPage } from './PoemPage';
import { getPoemOfTheDay } from '@/data/contentHelpers';
import { getTocItems } from '@/data/toc';

interface BookProps {
  bookInfo: BookInfo;
  chapters?: Chapter[];
  poems: Poem[];
  /** Управляемый режим: текущая страница */
  currentPage?: number;
  /** Управляемый режим: переход на страницу */
  onNavigate?: (pageIndex: number) => void;
  /** Размер шрифта в зоне чтения (px), задаёт CSS-переменную --reader-font-size */
  readerFontSize?: number;
}

export function Book({ bookInfo, poems, currentPage: controlledPage, onNavigate, readerFontSize = 16 }: BookProps) {
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = controlledPage !== undefined && onNavigate !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;
  const setCurrentPage = isControlled ? onNavigate : setInternalPage;
  const poemOfTheDay = useMemo(() => getPoemOfTheDay(), []);

  const pageStructure = useMemo(() => {
    const pages: Array<{ type: string; content?: unknown; id?: string; poemIndex?: number }> = [];

    pages.push({ type: 'title' });

    if (bookInfo.epigraph) {
      pages.push({ type: 'epigraph', content: bookInfo.epigraph });
    }

    pages.push({ type: 'poem-of-day', content: poemOfTheDay, id: 'poem-of-the-day' });

    // Получаем информацию о структуре из toc
    const tocItems = getTocItems(bookInfo, poems);
    const poemMap = new Map(poems.map((p, i) => [p.id, { poem: p, index: i }]));

    // Добавляем страницы согласно tocItems
    for (const item of tocItems) {
      if (item.type === 'part') {
        pages.push({ 
          type: 'part', 
          content: { label: item.title, title: item.subtitle },
          id: item.id 
        });
      } else if (item.type === 'chapter') {
        pages.push({ 
          type: 'chapter-in-part', 
          content: { label: item.title, title: item.subtitle },
          id: item.id 
        });
      } else if (item.type === 'interlude') {
        pages.push({ 
          type: 'interlude', 
          content: item.title,
          id: item.id 
        });
      } else if (item.type === 'epigraph' && item.subtitle) {
        pages.push({ 
          type: 'epigraph', 
          content: item.subtitle,
          id: item.id 
        });
      } else if (item.type === 'poem' && item.id !== 'poem-of-the-day') {
        const poemData = poemMap.get(item.id);
        if (poemData) {
          pages.push({ 
            type: 'poem', 
            content: poemData.poem, 
            id: item.id, 
            poemIndex: poemData.index 
          });
        }
      }
    }

    return pages;
  }, [bookInfo, poems, poemOfTheDay]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(Math.max(0, currentPage - 1));
  }, [currentPage, setCurrentPage]);

  const handleNextPage = useCallback(() => {
    setCurrentPage(Math.min(pageStructure.length - 1, currentPage + 1));
  }, [pageStructure.length, currentPage, setCurrentPage]);

  const page = pageStructure[currentPage];
  if (!page) return null;
  const isInterlude = page.type === 'interlude';

  const renderCurrentPage = () => {
    switch (page.type) {
      case 'title':
        return (
          <TitlePage
            title={bookInfo.titlePageTitle ?? bookInfo.title}
            subtitle={bookInfo.subtitle}
            author={bookInfo.author}
          />
        );
      case 'dedication':
        return <DedicationPage dedication={page.content as string} />;
      case 'epigraph':
        return (
          <EpigraphPage
            content={page.content as string}
            pageNumber={currentPage + 1}
            isLeft={currentPage % 2 === 0}
          />
        );
      case 'afterword':
        return (
          <AfterwordPage
            content={page.content as string}
            pageNumber={currentPage + 1}
            isLeft={currentPage % 2 === 0}
          />
        );
      case 'part':
        return (
          <PartPage
            label={(page.content as any).label}
            title={(page.content as any).title}
          />
        );
      case 'chapter-in-part':
        return (
          <ChapterInPartPage
            label={(page.content as any).label}
            title={(page.content as any).title}
          />
        );
      case 'interlude':
        return (
          <InterludePage
            title={page.content as string}
          />
        );
      case 'chapter':
        const chapter = page.content as Chapter;
        return (
          <ChapterPage
            title={chapter.title}
            subtitle={chapter.subtitle}
            chapterNumber={chapter.order}
          />
        );
      case 'poem': {
        const poem = page.content as Poem;
        const isPoemOfTheDay = poem.id === poemOfTheDay.id;
        const poemNumber = typeof page.poemIndex === 'number'
          ? poems[page.poemIndex]?.number
          : poem.number;
        return (
          <div id={page.id} className="reader-poem-anchor">
            <PoemPage
              poem={poem}
              pageNumber={currentPage + 1}
              isLeft={currentPage % 2 === 0}
              variant="reader"
              showPoemOfTheDayLabel={isPoemOfTheDay}
              poemNumber={poemNumber}
            />
          </div>
        );
      }
      case 'poem-of-day':
        return (
          <div id={page.id} className="reader-poem-anchor w-full">
            <div className="mb-3 text-center font-serif text-sm text-burgundy-600">
              Стихотворение дня
            </div>
            <PoemPage
              poem={page.content as Poem}
              pageNumber={currentPage + 1}
              isLeft={currentPage % 2 === 0}
              variant="reader"
              poemNumber={(page.content as Poem).number}
            />
          </div>
        );
      case 'empty':
        return (
          <BookPage pageNumber={currentPage + 1} isLeft={currentPage % 2 === 0}>
            <div className="h-full" />
          </BookPage>
        );
      default:
        return null;
    }
  };

  const readerFontSizeStyle: React.CSSProperties | undefined =
    typeof readerFontSize === 'number'
      ? { ['--reader-font-size' as string]: `${readerFontSize}px` }
      : undefined;

  return (
    <div
      className={`reader-page-wrap w-full min-h-screen flex flex-col pt-14 pb-24 transition-colors duration-300 ${isInterlude ? 'bg-black' : ''}`}
      style={readerFontSizeStyle}
    >
      {/* Одна страница на весь экран: белый фон, контент по центру */}
      <div className={`flex-1 flex flex-col min-h-0 relative transition-colors duration-300 ${isInterlude ? 'bg-black' : 'bg-white'}`}>
        {/* Зоны клика влево/вправо для перелистывания */}
        <button
          type="button"
          aria-label="Предыдущая страница"
          className={`absolute left-0 top-0 bottom-0 w-1/4 min-w-[60px] z-10 cursor-pointer transition-colors ${isInterlude ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
          onClick={handlePrevPage}
        />
        <button
          type="button"
          aria-label="Следующая страница"
          className={`absolute right-0 top-0 bottom-0 w-1/4 min-w-[60px] z-10 cursor-pointer transition-colors ${isInterlude ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
          onClick={handleNextPage}
        />

        <div className={`readerContent flex-1 flex flex-col items-center justify-center mx-auto w-full ${isInterlude ? '' : 'max-w-3xl px-6 py-8'} overflow-y-auto`}>
          {renderCurrentPage()}
        </div>
      </div>

      {/* Нижняя навигация: только стрелки и номер страницы */}
      <div className={`fixed bottom-0 left-0 right-0 py-3 px-4 flex items-center justify-center gap-6 z-40 transition-colors duration-300 ${isInterlude ? 'bg-black/95 border-t border-gray-800' : 'bg-white/95 border-t border-gray-100'}`}>
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          aria-label="Предыдущая страница"
          className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${isInterlude ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={`font-serif text-sm min-w-[4rem] text-center ${isInterlude ? 'text-gray-500' : 'text-gray-500'}`}>
          {currentPage + 1} / {pageStructure.length}
        </span>
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage === pageStructure.length - 1}
          aria-label="Следующая страница"
          className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${isInterlude ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
