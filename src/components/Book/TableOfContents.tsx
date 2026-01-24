import { motion } from 'framer-motion';
import { Chapter, Poem } from '@/types';
import { BookPage } from './BookPage';

interface TableOfContentsProps {
  chapters: Chapter[];
  poems: Poem[];
  onNavigate: (pageIndex: number) => void;
  getPageForChapter: (chapterId: string) => number;
  getPageForPoem: (poemId: string) => number;
  pageNumber?: number;
  isLeft?: boolean;
  hasEpigraph?: boolean;
  hasAftervord?: boolean;
  epigraphPageNumber?: number;
  afterwordPageNumber?: number;
  currentPage?: number;
  pageStructure?: Array<{ type: string; content?: unknown; id?: string }>;
}

export function TableOfContents({ 
  chapters, 
  poems, 
  onNavigate, 
  getPageForChapter,
  getPageForPoem,
  pageNumber,
  isLeft,
  hasEpigraph = false,
  hasAftervord = false,
  epigraphPageNumber,
  afterwordPageNumber,
  currentPage,
  pageStructure
}: TableOfContentsProps) {
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft}>
      <div className="max-w-md mx-auto">
        <motion.h2 
          className="font-display text-2xl md:text-3xl text-burgundy-800 text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Содержание
        </motion.h2>
        
        <div className="divider mb-8" />
        
        <nav className="space-y-6" data-no-flip>
          {/* Эпиграф - первый пункт */}
          {hasEpigraph && epigraphPageNumber && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                const pageIndex = pageStructure?.findIndex(p => p.type === 'epigraph') ?? -1;
                if (pageIndex >= 0) onNavigate(pageIndex);
              }}
              className={`w-full text-left group hover-toc-item ${(pageStructure?.[currentPage ?? 0])?.type === 'epigraph' ? 'active-toc' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0 }}
            >
              <div className="flex items-center">
                <span className={`font-display text-lg transition-colors italic ${(pageStructure?.[currentPage ?? 0])?.type === 'epigraph' ? 'text-parchment-100 font-semibold' : 'text-burgundy-800 group-hover:text-burgundy-600'}`}>
                  Эпиграф
                </span>
                <span className="toc-dots" />
                <span className={`text-sm ${(pageStructure?.[currentPage ?? 0])?.type === 'epigraph' ? 'text-parchment-100 font-medium' : 'text-ink-500'}`}>
                  {epigraphPageNumber}
                </span>
              </div>
            </motion.button>
          )}

                {/* Главы */}
          {sortedChapters.map((chapter, index) => {
            const chapterPoems = poems.filter(p => p.chapterId === chapter.id);
            const isChapterActive = (pageStructure?.[currentPage ?? 0])?.type === 'chapter' && (pageStructure?.[currentPage ?? 0])?.id === chapter.id;
            
            return (
              <motion.div 
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + (hasEpigraph ? 1 : 0)) }}
              >
                {/* Название главы */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(getPageForChapter(chapter.id) - 1);
                  }}
                  className={`w-full text-left group hover-toc-item ${isChapterActive ? 'active-toc' : ''}`}
                >
                  <div className="flex items-center">
                    <span className={`font-display text-lg transition-colors ${isChapterActive ? 'text-parchment-100 font-semibold' : 'text-burgundy-800 group-hover:text-burgundy-600'}`}>
                      {chapter.title}
                    </span>
                    <span className="toc-dots" />
                    <span className={`text-sm ${isChapterActive ? 'text-parchment-100 font-medium' : 'text-ink-500'}`}>
                      {getPageForChapter(chapter.id)}
                    </span>
                  </div>
                  {chapter.subtitle && (
                    <p className={`text-sm italic ml-4 ${isChapterActive ? 'text-parchment-200' : 'text-ink-500'}`}>
                      {chapter.subtitle}
                    </p>
                  )}
                </button>
                
                {/* Стихи в главе */}
                <ul className="mt-2 ml-6 space-y-1">
                  {chapterPoems.map(poem => (
                    <li key={poem.id}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(getPageForPoem(poem.id) - 1);
                        }}
                        className={`w-full text-left flex items-center text-sm group transition-all ${(pageStructure?.[currentPage ?? 0])?.type === 'poem' && (pageStructure?.[currentPage ?? 0])?.id === poem.id ? 'active-poem' : ''}`}
                      >
                        <span className={`group-hover:text-burgundy-600 transition-colors ${(pageStructure?.[currentPage ?? 0])?.type === 'poem' && (pageStructure?.[currentPage ?? 0])?.id === poem.id ? 'text-burgundy-400 font-medium' : 'text-ink-600'}`}>
                          {poem.title}
                        </span>
                        <span className="flex-1 border-b border-dotted border-ink-300 mx-2" />
                        <span className={`${(pageStructure?.[currentPage ?? 0])?.type === 'poem' && (pageStructure?.[currentPage ?? 0])?.id === poem.id ? 'text-burgundy-300' : 'text-ink-400'}`}>
                          {getPageForPoem(poem.id)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}

          {/* Послесловие - последний пункт */}
          {hasAftervord && afterwordPageNumber && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                const pageIndex = pageStructure?.findIndex(p => p.type === 'afterword') ?? -1;
                if (pageIndex >= 0) onNavigate(pageIndex);
              }}
              className={`w-full text-left group hover-toc-item ${(pageStructure?.[currentPage ?? 0])?.type === 'afterword' ? 'active-toc' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (sortedChapters.length + (hasEpigraph ? 2 : 1)) }}
            >
              <div className="flex items-center">
                <span className={`font-display text-lg transition-colors italic ${(pageStructure?.[currentPage ?? 0])?.type === 'afterword' ? 'text-parchment-100 font-semibold' : 'text-burgundy-800 group-hover:text-burgundy-600'}`}>
                  Вместо послесловия
                </span>
                <span className="toc-dots" />
                <span className={`text-sm ${(pageStructure?.[currentPage ?? 0])?.type === 'afterword' ? 'text-parchment-100 font-medium' : 'text-ink-500'}`}>
                  {afterwordPageNumber}
                </span>
              </div>
            </motion.button>
          )}
        </nav>
      </div>
    </BookPage>
  );
}
