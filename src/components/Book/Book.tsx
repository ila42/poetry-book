import { useState, useCallback, useMemo, useRef, forwardRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import { BookInfo, Chapter, Poem } from '@/types';
import { useEdgeClickNavigation } from '@/hooks';
import { BookCover } from './BookCover';
import { BookPage, TitlePage, DedicationPage, EpigraphPage, AfterwordPage, ChapterPage } from './BookPage';
import { PoemPage } from './PoemPage';
import { TableOfContents } from './TableOfContents';
import { SidebarNav } from './SidebarNav';
import { EdgeNavigationHints } from './EdgeNavigationHints';

// Хук для определения мобильного устройства
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

interface BookProps {
  bookInfo: BookInfo;
  chapters: Chapter[];
  poems: Poem[];
}

// Wrapper component for page flip
const PageWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  ({ children }, ref) => (
    <div ref={ref} className="page-wrapper">
      {children}
    </div>
  )
);
PageWrapper.displayName = 'PageWrapper';

export function Book({ bookInfo, chapters, poems }: BookProps) {
  const [isBookOpen, setIsBookOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void; turnToPage: (page: number) => void; } }>(null);
  const isMobile = useIsMobile();
  
  // Сортируем главы
  const sortedChapters = useMemo(() => 
    [...chapters].sort((a, b) => a.order - b.order), 
    [chapters]
  );
  
  // Вычисляем структуру страниц
  const pageStructure = useMemo(() => {
    const pages: Array<{ type: string; content?: unknown; id?: string }> = [];
    
    // Титульная страница
    pages.push({ type: 'title' });
    
    // Посвящение (если есть)
    if (bookInfo.dedication) {
      pages.push({ type: 'dedication', content: bookInfo.dedication });
    }
    
    // Содержание
    pages.push({ type: 'toc' });
    
    // Эпиграф (вместо предисловия)
    if (bookInfo.epigraph) {
      pages.push({ type: 'epigraph', content: bookInfo.epigraph });
    }
    
    // Главы и стихи
    sortedChapters.forEach(chapter => {
      // Страница главы
      pages.push({ type: 'chapter', content: chapter, id: chapter.id });
      
      // Стихи главы
      const chapterPoems = poems.filter(p => p.chapterId === chapter.id);
      chapterPoems.forEach(poem => {
        pages.push({ type: 'poem', content: poem, id: poem.id });
      });
    });
    
    // Послесловие на странице 310
    if (bookInfo.afterword) {
      const targetPageIndex = 309; // Страница 310 (индекс 309, т.к. нумерация с 1)
      
      // Если текущее количество страниц меньше целевого, добавляем пустые страницы
      while (pages.length < targetPageIndex) {
        pages.push({ type: 'empty' });
      }
      
      // Вставляем послесловие на страницу 310
      pages.push({ type: 'afterword', content: bookInfo.afterword });
    }
    
    // Финальная проверка на четность всего каталога
    if (pages.length % 2 !== 0) {
      pages.push({ type: 'empty' });
    }
    
    return pages;
  }, [bookInfo, sortedChapters, poems]);
  
  // Функции для получения номера страницы
  const getPageForChapter = useCallback((chapterId: string) => {
    return pageStructure.findIndex(p => p.type === 'chapter' && p.id === chapterId) + 1;
  }, [pageStructure]);
  
  const getPageForPoem = useCallback((poemId: string) => {
    return pageStructure.findIndex(p => p.type === 'poem' && p.id === poemId) + 1;
  }, [pageStructure]);
  
  // Навигация
  const handleNavigate = useCallback((pageIndex: number) => {
    if (bookRef.current?.pageFlip()) {
      bookRef.current.pageFlip().turnToPage(pageIndex);
    }
  }, []);
  
  const handleOpenBook = () => {
    setIsBookOpen(true);
  };
  
  const handleCloseBook = () => {
    setIsBookOpen(false);
    setCurrentPage(0);
  };
  
  const handleFlip = (e: { data: number }) => {
    setCurrentPage(e.data);
  };
  
  const handlePrevPage = () => {
    if (bookRef.current?.pageFlip()) {
      bookRef.current.pageFlip().flipPrev();
    }
  };
  
  const handleNextPage = () => {
    if (bookRef.current?.pageFlip()) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  // Используем хук для навигации по краям экрана
  useEdgeClickNavigation({
    onNextPage: handleNextPage,
    onPrevPage: handlePrevPage,
    edgePercentage: 15, // 15% от края экрана
    enabled: isBookOpen, // Только когда книга открыта
  });

  // Обработчик клика по странице для перелистывания
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // ===== Исключения: НЕ срабатываем на интерактивных элементах =====
    
    // 1. Стандартные интерактивные элементы
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return;
    }
    
    // 2. Элементы с специальными классами
    if (
      target.closest('[data-no-flip]') ||
      target.closest('nav') ||
      target.closest('.toc') ||
      target.closest('.epigraph') ||
      target.closest('.table-of-contents') ||
      target.closest('.menu') ||
      target.closest('[contenteditable]')
    ) {
      return;
    }
    
    // 3. Если пользователь выделяет текст - не срабатываем
    if (window.getSelection()?.toString()) {
      return;
    }

    // ===== Определяем зону клика =====
    const container = e.currentTarget;
    const clickX = e.clientX - container.getBoundingClientRect().left;
    const containerWidth = container.getBoundingClientRect().width;
    
    // Клик в правой половине - следующая страница
    if (clickX > containerWidth * 0.5) {
      e.preventDefault?.();
      handleNextPage();
    } 
    // Клик в левой половине - предыдущая страница
    else {
      e.preventDefault?.();
      handlePrevPage();
    }
  };
  
  // Рендер страницы по типу
  const renderPage = (page: { type: string; content?: unknown; id?: string }, index: number) => {
    const pageNumber = index + 1;
    const isLeft = index % 2 === 0;
    
    switch (page.type) {
      case 'title':
        return (
          <PageWrapper key={`page-${index}`}>
            <TitlePage 
              title={bookInfo.title} 
              subtitle={bookInfo.subtitle}
              author={bookInfo.author}
            />
          </PageWrapper>
        );
        
      case 'dedication':
        return (
          <PageWrapper key={`page-${index}`}>
            <DedicationPage dedication={page.content as string} />
          </PageWrapper>
        );
        
      case 'toc':
        return (
          <PageWrapper key={`page-${index}`}>
            <TableOfContents
              chapters={chapters}
              poems={poems}
              onNavigate={handleNavigate}
              getPageForChapter={getPageForChapter}
              getPageForPoem={getPageForPoem}
              pageNumber={pageNumber}
              isLeft={isLeft}
              hasEpigraph={!!bookInfo.epigraph}
              hasAftervord={!!bookInfo.afterword}
              epigraphPageNumber={bookInfo.epigraph ? pageStructure.findIndex(p => p.type === 'epigraph') + 1 : undefined}
              afterwordPageNumber={bookInfo.afterword ? pageStructure.findIndex(p => p.type === 'afterword') + 1 : undefined}
              currentPage={currentPage}
              pageStructure={pageStructure}
            />
          </PageWrapper>
        );
        
      case 'epigraph':
        return (
          <PageWrapper key={`page-${index}`}>
            <EpigraphPage 
              content={page.content as string}
              pageNumber={pageNumber}
              isLeft={isLeft}
            />
          </PageWrapper>
        );

      case 'afterword':
        return (
          <PageWrapper key={`page-${index}`}>
            <AfterwordPage 
              content={page.content as string}
              pageNumber={pageNumber}
              isLeft={isLeft}
            />
          </PageWrapper>
        );
        
      case 'chapter':
        const chapter = page.content as Chapter;
        return (
          <PageWrapper key={`page-${index}`}>
            <ChapterPage
              title={chapter.title}
              subtitle={chapter.subtitle}
              chapterNumber={chapter.order}
            />
          </PageWrapper>
        );
        
      case 'poem':
        const poem = page.content as Poem;
        return (
          <PageWrapper key={`page-${index}`}>
            <PoemPage
              poem={poem}
              pageNumber={pageNumber}
              isLeft={isLeft}
            />
          </PageWrapper>
        );
        
      case 'empty':
        return (
          <PageWrapper key={`page-${index}`}>
            <BookPage pageNumber={pageNumber} isLeft={isLeft}>
              <div className="h-full" />
            </BookPage>
          </PageWrapper>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="book-container w-full min-h-screen flex flex-col items-center justify-start md:justify-center p-2 md:p-4 pt-4">
      {/* Подсказки для навигации по краям экрана */}
      {isBookOpen && (
        <EdgeNavigationHints
          edgePercentage={15}
          visible={isBookOpen}
          hideDelay={3000}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
        />
      )}
      
      {/* Боковая навигация - ФИКСИРОВАНА в правом верхнем углу */}
      <SidebarNav
        isBookOpen={isBookOpen}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        pageStructure={pageStructure}
        totalPages={pageStructure.length}
      />
      
      <AnimatePresence mode="wait">
        {!isBookOpen ? (
          <motion.div
            key="cover"
            className="w-full max-w-[85vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl aspect-[3/4] shadow-cover rounded-r-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.5 }}
          >
            <BookCover bookInfo={bookInfo} onOpen={handleOpenBook} />
          </motion.div>
        ) : (
          <motion.div
            key="book"
            className="relative w-full max-w-[98vw] sm:max-w-[95vw] lg:max-w-[85vw] xl:max-w-[1400px] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Кнопка закрытия - адаптивная */}
            <motion.button
              onClick={handleCloseBook}
              className="absolute -top-10 sm:-top-12 right-1 sm:right-0 text-parchment-200 hover:text-parchment-100 
                         transition-colors z-10 flex items-center gap-1 sm:gap-2 font-serif text-xs sm:text-sm
                         bg-burgundy-900/50 sm:bg-transparent rounded px-2 py-1 sm:p-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="hidden sm:inline">Закрыть книгу</span>
              <span className="sm:hidden">Закрыть</span>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            
            {/* Книга */}
            <div 
              className="flex items-center justify-center relative cursor-pointer group mb-6 book-interactive-container"
              onClick={handlePageClick}
            >
              {/* HTMLFlipBook - режим одной страницы на мобильных */}
              <div className="shadow-book rounded-lg overflow-hidden book-container-inner">
                <HTMLFlipBook
                  ref={bookRef}
                  width={isMobile ? 320 : 550}
                  height={isMobile ? 480 : 750}
                  size="stretch"
                  minWidth={isMobile ? 280 : 320}
                  maxWidth={isMobile ? 400 : 700}
                  minHeight={isMobile ? 400 : 450}
                  maxHeight={isMobile ? 600 : 950}
                  maxShadowOpacity={isMobile ? 0.3 : 0.5}
                  showCover={false}
                  mobileScrollSupport={false}
                  onFlip={handleFlip}
                  className="book-flip"
                  style={{}}
                  startPage={0}
                  drawShadow={!isMobile}
                  flippingTime={isMobile ? 400 : 600}
                  usePortrait={true}
                  startZIndex={0}
                  autoSize={true}
                  clickEventForward={false}
                  useMouseEvents={false}
                  swipeDistance={isMobile ? 30 : 0}
                  showPageCorners={!isMobile}
                  disableFlipByClick={isMobile}
                >
                  {pageStructure.map((page, index) => renderPage(page, index))}
                </HTMLFlipBook>
              </div>
            </div>
            
            {/* Скраббер страниц - тёмная тема с золотыми акцентами */}
            <motion.div
              className="mt-6 px-2 sm:px-4 max-w-2xl mx-auto w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-[#3d2817]/95 to-[#2a1a0f]/95 
                              backdrop-blur-sm rounded-lg p-3 sm:p-4 
                              shadow-xl border border-[#d4af37]/20">
                {/* Информация о странице */}
                <div className="flex justify-between items-center mb-2 sm:mb-3 text-xs sm:text-sm font-serif">
                  <span className="text-[#d4af37]">
                    <span className="hidden sm:inline">Страница </span>
                    <span className="sm:hidden">Стр. </span>
                    {currentPage + 1} из {pageStructure.length}
                  </span>
                  <span className="text-[#d4af37]/60">
                    {Math.round(((currentPage + 1) / pageStructure.length) * 100)}%
                  </span>
                </div>
                
                {/* Ползунок */}
                <input
                  type="range"
                  min={0}
                  max={pageStructure.length - 1}
                  value={currentPage}
                  onChange={(e) => handleNavigate(parseInt(e.target.value))}
                  className="page-scrubber w-full"
                />
                
                {/* Быстрые переходы */}
                <div className="flex justify-between mt-2 sm:mt-3 text-[10px] sm:text-xs font-serif text-[#d4af37]/50">
                  <button 
                    onClick={() => handleNavigate(0)}
                    className="hover:text-[#d4af37] active:text-[#f4d03f] transition-colors py-1 px-2"
                  >
                    В начало
                  </button>
                  <button 
                    onClick={() => handleNavigate(Math.floor(pageStructure.length / 2))}
                    className="hover:text-[#d4af37] active:text-[#f4d03f] transition-colors py-1 px-2"
                  >
                    Середина
                  </button>
                  <button 
                    onClick={() => handleNavigate(pageStructure.length - 1)}
                    className="hover:text-[#d4af37] active:text-[#f4d03f] transition-colors py-1 px-2"
                  >
                    В конец
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
