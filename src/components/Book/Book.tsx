import { useState, useCallback, useMemo, useRef, forwardRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import { BookInfo, Author, Chapter, Poem } from '@/types';
import { BookCover } from './BookCover';
import { BookPage, TitlePage, DedicationPage, IntroductionPage, ChapterPage } from './BookPage';
import { PoemPage } from './PoemPage';
import { TableOfContents } from './TableOfContents';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';
import { SidebarNav } from './SidebarNav';

// Хук для управления состоянием перетаскивания
// isDragging = true ТОЛЬКО когда ЛКМ зажата НА странице книги (не на интерактивных элементах)
function useDragProtection() {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Список селекторов элементов, которые НЕ должны запускать перетаскивание
    const interactiveSelectors = [
      'button',
      'a',
      'input',
      'textarea',
      'select',
      '[role="button"]',
      '[data-no-drag]',
      '.inline-audio-player',
      '.global-audio-player', 
      '.sidebar-nav-container',
      '.sidebar-nav-toggle',
      '.sidebar-nav-menu',
      '.nav-arrow',
      '.contact-form',
    ].join(', ');

    // Сброс всех состояний перетаскивания
    const resetDragState = () => {
      isMouseDownRef.current = false;
      setIsDragging(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Если клик на интерактивном элементе - НЕ начинаем перетаскивание
      if (target.closest(interactiveSelectors)) {
        resetDragState();
        return;
      }
      
      // Проверяем, что клик был ЛКМ (button === 0)
      if (e.button !== 0) {
        return;
      }
      
      isMouseDownRef.current = true;
      setIsDragging(true);
    };

    // ВАЖНО: mousemove проверяет, действительно ли кнопка зажата
    const handleMouseMove = (e: MouseEvent) => {
      // e.buttons === 1 означает, что ЛКМ зажата
      // Если ЛКМ НЕ зажата, но isMouseDownRef.current === true - сбрасываем
      if (e.buttons !== 1 && isMouseDownRef.current) {
        resetDragState();
        return;
      }
      
      // Если мышь не зажата - выходим
      if (!isMouseDownRef.current) {
        return;
      }
    };

    const handleMouseUp = () => {
      resetDragState();
    };

    // Глобальный обработчик - ГАРАНТИРОВАННО сбрасывает состояние
    const handleGlobalMouseUp = () => {
      resetDragState();
    };

    // Обработчик потери фокуса окна
    const handleWindowBlur = () => {
      resetDragState();
    };

    // Добавляем слушатели
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    // НЕ сбрасываем на mouseleave - это мешает перетаскиванию
    // container.addEventListener('mouseleave', handleMouseLeave);
    
    // Глобальные слушатели
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleMouseMove); // Проверяем и глобально
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      // container.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return { isDragging, containerRef };
}

interface BookProps {
  bookInfo: BookInfo;
  author: Author;
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

export function Book({ bookInfo, author, chapters, poems }: BookProps) {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void; turnToPage: (page: number) => void; } }>(null);
  
  // Защита от перелистывания при hover (только drag)
  const { isDragging, containerRef } = useDragProtection();
  
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
    
    // Об авторе
    pages.push({ type: 'about' });
    
    // Предисловие
    pages.push({ type: 'introduction', content: bookInfo.introduction });
    
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
    
    // Контакты
    pages.push({ type: 'contact' });
    
    // Пустая страница в конце (для четности)
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
            />
          </PageWrapper>
        );
        
      case 'about':
        return (
          <PageWrapper key={`page-${index}`}>
            <AboutPage 
              author={author} 
              pageNumber={pageNumber}
              isLeft={isLeft}
            />
          </PageWrapper>
        );
        
      case 'introduction':
        return (
          <PageWrapper key={`page-${index}`}>
            <IntroductionPage 
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
        const chapterPoems = poems.filter(p => p.chapterId === poem.chapterId);
        return (
          <PageWrapper key={`page-${index}`}>
            <PoemPage
              poem={poem}
              pageNumber={pageNumber}
              isLeft={isLeft}
              chapterPoems={chapterPoems}
            />
          </PageWrapper>
        );
        
      case 'contact':
        return (
          <PageWrapper key={`page-${index}`}>
            <ContactPage 
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
    <div className="book-container w-full min-h-screen flex items-center justify-center p-2 md:p-4">
      {/* Боковая навигация - ФИКСИРОВАНА в правом верхнем углу */}
      <SidebarNav
        isBookOpen={isBookOpen}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        pageStructure={pageStructure}
      />
      
      <AnimatePresence mode="wait">
        {!isBookOpen ? (
          <motion.div
            key="cover"
            className="w-full max-w-lg md:max-w-xl lg:max-w-2xl aspect-[3/4] shadow-cover rounded-r-lg overflow-hidden"
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
            className="relative w-full max-w-[95vw] lg:max-w-[85vw] xl:max-w-[1400px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Кнопка закрытия */}
            <motion.button
              onClick={handleCloseBook}
              className="absolute -top-12 right-0 text-parchment-200 hover:text-parchment-100 
                         transition-colors z-10 flex items-center gap-2 font-serif text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span>Закрыть книгу</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            
            {/* Книга */}
            <div className="flex items-center justify-center">
              {/* Кнопка "Назад" */}
              <motion.button
                onClick={handlePrevPage}
                className="nav-arrow mr-4 hidden md:flex"
                disabled={currentPage === 0}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: currentPage === 0 ? 0.3 : 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              
              {/* HTMLFlipBook с защитой от hover-перелистывания */}
              <div 
                ref={containerRef}
                className={`shadow-book rounded-lg overflow-hidden book-drag-container ${isDragging ? 'is-dragging' : ''}`}
              >
                <HTMLFlipBook
                  ref={bookRef}
                  width={550}
                  height={750}
                  size="stretch"
                  minWidth={320}
                  maxWidth={700}
                  minHeight={450}
                  maxHeight={950}
                  maxShadowOpacity={0.5}
                  showCover={false}
                  mobileScrollSupport={true}
                  onFlip={handleFlip}
                  className="book-flip"
                  style={{}}
                  startPage={0}
                  drawShadow={true}
                  flippingTime={800}
                  usePortrait={true}
                  startZIndex={0}
                  autoSize={true}
                  clickEventForward={false}
                  useMouseEvents={true}
                  swipeDistance={50}
                  showPageCorners={false}
                  disableFlipByClick={true}
                >
                  {pageStructure.map((page, index) => renderPage(page, index))}
                </HTMLFlipBook>
              </div>
              
              {/* Кнопка "Вперёд" */}
              <motion.button
                onClick={handleNextPage}
                className="nav-arrow ml-4 hidden md:flex"
                disabled={currentPage >= pageStructure.length - 2}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: currentPage >= pageStructure.length - 2 ? 0.3 : 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
            
            {/* Мобильная навигация */}
            <div className="flex md:hidden justify-center gap-4 mt-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="nav-arrow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-parchment-200 font-serif self-center">
                {currentPage + 1} / {pageStructure.length}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= pageStructure.length - 2}
                className="nav-arrow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
