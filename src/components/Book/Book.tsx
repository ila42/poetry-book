import { useState, useCallback, useMemo, useRef, forwardRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import { BookInfo, Chapter, Poem } from '@/types';
import { BookCover } from './BookCover';
import { BookPage, TitlePage, DedicationPage, EpigraphPage, AfterwordPage, ChapterPage } from './BookPage';
import { PoemPage } from './PoemPage';
import { TableOfContents } from './TableOfContents';
import { SidebarNav } from './SidebarNav';
import { EdgeNavigationHints } from './EdgeNavigationHints';

// Хук для определения мобильного устройства и ориентации экрана
function useDeviceInfo() {
  // Инициализируем с реальными значениями если window доступен
  const getInitialState = () => {
    if (typeof window === 'undefined') {
      return {
        isMobile: true, // По умолчанию считаем мобильным для SSR
        isPortrait: true,
        isLandscape: false,
        screenWidth: 375,
        screenHeight: 667,
      };
    }
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      isMobile: width < 768,
      isPortrait: height > width,
      isLandscape: width >= height,
      screenWidth: width,
      screenHeight: height,
    };
  };
  
  const [deviceInfo, setDeviceInfo] = useState(getInitialState);
  
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isPortrait = height > width;
      
      setDeviceInfo({
        isMobile,
        isPortrait,
        isLandscape: !isPortrait,
        screenWidth: width,
        screenHeight: height,
      });
    };
    
    // Обновляем сразу при монтировании
    updateDeviceInfo();
    
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);
  
  return deviceInfo;
}

interface BookProps {
  bookInfo: BookInfo;
  chapters?: Chapter[]; // Необязательный для обратной совместимости
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

export function Book({ bookInfo, chapters = [], poems }: BookProps) {
  const [isBookOpen, setIsBookOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const { isMobile, screenWidth, screenHeight } = useDeviceInfo();
  
  // Вычисляем оптимальные размеры книги в зависимости от устройства
  const bookDimensions = useMemo(() => {
    if (isMobile) {
      // Мобильные устройства - ОДНА страница на весь экран (портретный режим)
      const width = screenWidth - 16; // 16px отступы по бокам
      const height = Math.round(screenHeight * 0.75); // 75% высоты экрана
      
      return {
        width,
        height,
        minWidth: 300,
        maxWidth: screenWidth,
        minHeight: 400,
        maxHeight: screenHeight,
      };
    }
    
    // Десктоп - разворот (две страницы)
    return {
      width: 550,
      height: 733,
      minWidth: 320,
      maxWidth: 700,
      minHeight: 450,
      maxHeight: 950,
    };
  }, [isMobile, screenWidth, screenHeight]);
  
  // Вычисляем структуру страниц
  // Структура: 1-титульная, 2-оглавление, 3-эпиграф (если есть), 4+-стихи
  const pageStructure = useMemo(() => {
    const pages: Array<{ type: string; content?: unknown; id?: string; poemIndex?: number }> = [];
    
    // Страница 1: Титульная
    pages.push({ type: 'title' });
    
    // Страница 2: Содержание
    pages.push({ type: 'toc' });
    
    // Страница 3: Эпиграф (если есть)
    if (bookInfo.epigraph) {
      pages.push({ type: 'epigraph', content: bookInfo.epigraph });
    }
    
    // Страницы 4+: Стихи (по одному на страницу)
    poems.forEach((poem, index) => {
      pages.push({ type: 'poem', content: poem, id: poem.id, poemIndex: index });
    });
    
    // Финальная проверка на четность
    if (pages.length % 2 !== 0) {
      pages.push({ type: 'empty' });
    }
    
    return pages;
  }, [bookInfo, poems]);
  
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
  
  // handleCloseBook не используется, но оставлен для возможного будущего использования
  // const handleCloseBook = () => {
  //   setIsBookOpen(false);
  //   setCurrentPage(0);
  // };
  
  const handleFlip = (e: { data: number }) => {
    setCurrentPage(e.data);
  };
  
  const handlePrevPage = useCallback(() => {
    if (bookRef.current?.pageFlip()) {
      bookRef.current.pageFlip().flipPrev();
    }
  }, []);
  
  const handleNextPage = useCallback(() => {
    if (bookRef.current?.pageFlip()) {
      bookRef.current.pageFlip().flipNext();
    }
  }, []);

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
    <div className={`book-container w-full flex flex-col items-center justify-center
                     ${isMobile ? 'min-h-[100dvh] p-1 pt-10' : 'min-h-screen p-2 md:p-4 pt-16 md:pt-4'}`}>
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
            className={`relative w-full flex flex-col items-center justify-center
                       ${isMobile 
                         ? 'max-w-[100vw] mt-1' 
                         : 'max-w-[98vw] sm:max-w-[95vw] lg:max-w-[85vw] xl:max-w-[1400px] mt-8 sm:mt-4'
                       }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Стрелки навигации - только на десктопе */}
            {!isMobile && (
              <EdgeNavigationHints
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                visible={isBookOpen}
              />
            )}
            
            {/* Книга с зонами навигации */}
            <div 
              className={`book-interactive-container ${isMobile ? 'mb-2' : 'mb-6'}`}
              style={{ position: 'relative' }}
            >
              {/* HTMLFlipBook */}
              <div className={`rounded-lg overflow-hidden book-container-inner
                              ${isMobile ? 'shadow-md' : 'shadow-book'}`}>
                <HTMLFlipBook
                  ref={bookRef}
                  width={bookDimensions.width}
                  height={bookDimensions.height}
                  size="stretch"
                  minWidth={bookDimensions.minWidth}
                  maxWidth={bookDimensions.maxWidth}
                  minHeight={bookDimensions.minHeight}
                  maxHeight={bookDimensions.maxHeight}
                  maxShadowOpacity={0.5}
                  showCover={false}
                  mobileScrollSupport={false}
                  onFlip={handleFlip}
                  className="book-flip"
                  style={{}}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={500}
                  usePortrait={isMobile}
                  startZIndex={0}
                  autoSize={true}
                  clickEventForward={false}
                  useMouseEvents={false}
                  swipeDistance={30}
                  showPageCorners={false}
                  disableFlipByClick={true}
                >
                  {pageStructure.map((page, index) => renderPage(page, index))}
                </HTMLFlipBook>
              </div>
              
              {/* Левая зона - предыдущая страница */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Предыдущая страница"
                className="absolute top-0 left-0 h-full cursor-pointer select-none hover:bg-black/5 active:bg-black/10 transition-colors"
                style={{ 
                  width: isMobile ? '20%' : '15%',
                  zIndex: 200,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  pointerEvents: 'auto',
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePrevPage();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePrevPage();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePrevPage();
                  }
                }}
              />
              {/* Правая зона - следующая страница */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Следующая страница"
                className="absolute top-0 right-0 h-full cursor-pointer select-none hover:bg-black/5 active:bg-black/10 transition-colors"
                style={{ 
                  width: isMobile ? '20%' : '15%',
                  zIndex: 200,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  pointerEvents: 'auto',
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNextPage();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNextPage();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNextPage();
                  }
                }}
              />
            </div>
            
            {/* Скраббер страниц - компактный на мобильных */}
            <motion.div
              className={`px-2 sm:px-4 max-w-2xl mx-auto w-full ${isMobile ? 'mt-1' : 'mt-6'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`bg-gradient-to-br from-[#3d2817]/95 to-[#2a1a0f]/95 
                              backdrop-blur-sm rounded-lg shadow-xl border border-[#d4af37]/20
                              ${isMobile ? 'p-2' : 'p-3 sm:p-4'}`}>
                {/* Информация о странице */}
                <div className={`flex justify-between items-center font-serif
                                ${isMobile ? 'mb-1 text-[10px]' : 'mb-2 sm:mb-3 text-xs sm:text-sm'}`}>
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
                
                {/* Быстрые переходы - скрыты на мобильных для экономии места */}
                <div className={`flex justify-between font-serif text-[#d4af37]/50
                                ${isMobile ? 'hidden' : 'mt-2 sm:mt-3 text-[10px] sm:text-xs'}`}>
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
