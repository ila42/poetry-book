import { useState, useCallback, useMemo } from 'react';
import { BookInfo, Chapter, Poem } from '@/types';
import { BookPage, TitlePage, DedicationPage, EpigraphPage, AfterwordPage, ChapterPage } from './BookPage';
import { PoemPage } from './PoemPage';
import { TableOfContents } from './TableOfContents';

interface BookProps {
  bookInfo: BookInfo;
  chapters?: Chapter[];
  poems: Poem[];
  /** Управляемый режим: текущая страница */
  currentPage?: number;
  /** Управляемый режим: переход на страницу */
  onNavigate?: (pageIndex: number) => void;
}

export function Book({ bookInfo, chapters = [], poems, currentPage: controlledPage, onNavigate }: BookProps) {
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = controlledPage !== undefined && onNavigate !== undefined;
  const currentPage = isControlled ? controlledPage : internalPage;
  const setCurrentPage = isControlled ? onNavigate : setInternalPage;

  const pageStructure = useMemo(() => {
    const pages: Array<{ type: string; content?: unknown; id?: string; poemIndex?: number }> = [];

    pages.push({ type: 'title' });
    pages.push({ type: 'toc' });

    if (bookInfo.epigraph) {
      pages.push({ type: 'epigraph', content: bookInfo.epigraph });
    }

    poems.forEach((poem, index) => {
      pages.push({ type: 'poem', content: poem, id: poem.id, poemIndex: index });
    });

    if (pages.length % 2 !== 0) {
      pages.push({ type: 'empty' });
    }

    return pages;
  }, [bookInfo, poems]);

  const getPageForChapter = useCallback((chapterId: string) => {
    return pageStructure.findIndex(p => p.type === 'chapter' && p.id === chapterId) + 1;
  }, [pageStructure]);

  const getPageForPoem = useCallback((poemId: string) => {
    return pageStructure.findIndex(p => p.type === 'poem' && p.id === poemId) + 1;
  }, [pageStructure]);

  const handleNavigate = useCallback((pageIndex: number) => {
    setCurrentPage(Math.max(0, Math.min(pageIndex, pageStructure.length - 1)));
  }, [pageStructure.length]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(Math.max(0, currentPage - 1));
  }, [currentPage, setCurrentPage]);

  const handleNextPage = useCallback(() => {
    setCurrentPage(Math.min(pageStructure.length - 1, currentPage + 1));
  }, [pageStructure.length, currentPage, setCurrentPage]);

  const page = pageStructure[currentPage];
  if (!page) return null;

  const renderCurrentPage = () => {
    switch (page.type) {
      case 'title':
        return (
          <TitlePage
            title={bookInfo.title}
            subtitle={bookInfo.subtitle}
            author={bookInfo.author}
          />
        );
      case 'dedication':
        return <DedicationPage dedication={page.content as string} />;
      case 'toc':
        return (
          <TableOfContents
            chapters={chapters}
            poems={poems}
            onNavigate={handleNavigate}
            getPageForChapter={getPageForChapter}
            getPageForPoem={getPageForPoem}
            pageNumber={currentPage + 1}
            isLeft={currentPage % 2 === 0}
            hasEpigraph={!!bookInfo.epigraph}
            hasAftervord={!!bookInfo.afterword}
            epigraphPageNumber={bookInfo.epigraph ? pageStructure.findIndex(p => p.type === 'epigraph') + 1 : undefined}
            afterwordPageNumber={bookInfo.afterword ? pageStructure.findIndex(p => p.type === 'afterword') + 1 : undefined}
            currentPage={currentPage}
            pageStructure={pageStructure}
          />
        );
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
      case 'chapter':
        const chapter = page.content as Chapter;
        return (
          <ChapterPage
            title={chapter.title}
            subtitle={chapter.subtitle}
            chapterNumber={chapter.order}
          />
        );
      case 'poem':
        return (
          <div id={page.id} className="reader-poem-anchor">
            <PoemPage
              poem={page.content as Poem}
              pageNumber={currentPage + 1}
              isLeft={currentPage % 2 === 0}
              variant="reader"
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

  return (
    <div className="reader-page-wrap w-full min-h-screen flex flex-col pt-14 pb-24">
      {/* Одна страница на весь экран: белый фон, контент по центру */}
      <div className="flex-1 flex flex-col min-h-0 relative bg-white">
        {/* Зоны клика влево/вправо для перелистывания */}
        <button
          type="button"
          aria-label="Предыдущая страница"
          className="absolute left-0 top-0 bottom-0 w-1/4 min-w-[60px] z-10 cursor-pointer hover:bg-black/5 transition-colors"
          onClick={handlePrevPage}
        />
        <button
          type="button"
          aria-label="Следующая страница"
          className="absolute right-0 top-0 bottom-0 w-1/4 min-w-[60px] z-10 cursor-pointer hover:bg-black/5 transition-colors"
          onClick={handleNextPage}
        />

        <div className="flex-1 flex flex-col items-center justify-center mx-auto w-full max-w-3xl px-6 py-8 overflow-y-auto">
          {renderCurrentPage()}
        </div>
      </div>

      {/* Нижняя навигация: только стрелки и номер страницы */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-gray-100 py-3 px-4 flex items-center justify-center gap-6 z-40">
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          aria-label="Предыдущая страница"
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-serif text-sm text-gray-500 min-w-[4rem] text-center">
          {currentPage + 1} / {pageStructure.length}
        </span>
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage === pageStructure.length - 1}
          aria-label="Следующая страница"
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
