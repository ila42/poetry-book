import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Poem } from '@/types';
import { BookPage } from './BookPage';
import { useScrollbarReveal } from '@/hooks';

interface TableOfContentsProps {
  chapters?: unknown[];
  poems: Poem[];
  onNavigate: (pageIndex: number) => void;
  getPageForChapter?: (chapterId: string) => number;
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
  poems, 
  onNavigate, 
  // getPageForPoem не используется — номер страницы вычисляется как POEMS_START_PAGE + index
  pageNumber,
  isLeft,
  hasEpigraph = false,
  epigraphPageNumber,
  currentPage,
  pageStructure
}: TableOfContentsProps) {
  const tocScrollRef = useRef<HTMLDivElement>(null);
  const navScrollRef = useRef<HTMLElement>(null);
  useScrollbarReveal(tocScrollRef);
  useScrollbarReveal(navScrollRef);

  const poemOfDayIndex = hasEpigraph ? 3 : 2;
  const poemsStartIndex = poemOfDayIndex + 1;
  const poemOfDayPageNumber = poemOfDayIndex + 1;
  const poemsStartPageNumber = poemsStartIndex + 1;

  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft}>
      <div ref={tocScrollRef} className="scrollbar-edge h-full flex flex-col px-2 md:px-3 py-4 overflow-y-auto">
        <motion.h2 
          className="font-display text-xl md:text-2xl text-burgundy-800 text-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Содержание
        </motion.h2>
        
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-burgundy-400 to-transparent mx-auto mb-4" />
        
        <nav ref={navScrollRef} className="scrollbar-edge flex-1 overflow-y-auto space-y-1" data-no-flip>
          {/* Эпиграф */}
          {hasEpigraph && epigraphPageNumber && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                const pageIndex = pageStructure?.findIndex(p => p.type === 'epigraph') ?? -1;
                if (pageIndex >= 0) onNavigate(pageIndex);
              }}
              className={`w-full text-left group py-1 rounded transition-colors ${
                (pageStructure?.[currentPage ?? 0])?.type === 'epigraph' 
                  ? 'bg-burgundy-100' 
                  : 'hover:bg-parchment-200/50'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0 }}
            >
              <div className="flex items-center font-serif text-base">
                <span className={`italic ${
                  (pageStructure?.[currentPage ?? 0])?.type === 'epigraph' 
                    ? 'text-burgundy-700 font-semibold' 
                    : 'text-burgundy-600 group-hover:text-burgundy-800'
                }`}>
                  Эпиграф
                </span>
                <span className="flex-1 border-b border-dotted border-ink-300 mx-2" />
                <span className="text-ink-500">{epigraphPageNumber}</span>
              </div>
            </motion.button>
          )}

          {/* Стихотворение дня */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              const pageIndex = pageStructure?.findIndex(p => p.type === 'poem-of-day') ?? -1;
              if (pageIndex >= 0) onNavigate(pageIndex);
            }}
            className={`w-full text-left group py-1 rounded transition-colors ${
              (pageStructure?.[currentPage ?? 0])?.type === 'poem-of-day' 
                ? 'bg-burgundy-100' 
                : 'hover:bg-parchment-200/50'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center font-serif text-base">
              <span className={`italic ${
                (pageStructure?.[currentPage ?? 0])?.type === 'poem-of-day' 
                  ? 'text-burgundy-700 font-semibold' 
                  : 'text-burgundy-600 group-hover:text-burgundy-800'
              }`}>
                Стихотворение дня
              </span>
              <span className="flex-1 border-b border-dotted border-ink-300 mx-2" />
              <span className="text-ink-500">{poemOfDayPageNumber}</span>
            </div>
          </motion.button>

          {/* Список стихотворений */}
          {poems.map((poem, index) => {
            const poemPageNumber = poemsStartPageNumber + index;
            const isActive = (pageStructure?.[currentPage ?? 0])?.type === 'poem' 
              && (pageStructure?.[currentPage ?? 0])?.id === poem.id;
            
            return (
              <motion.button
                key={poem.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(poemsStartIndex + index);
                }}
                className={`w-full text-left group py-0.5 px-1 rounded transition-colors ${
                  isActive 
                    ? 'bg-burgundy-100' 
                    : 'hover:bg-parchment-200/50'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(0.02 * index, 0.5) }}
              >
                <div className="flex items-center gap-0.5 font-serif text-base">
                  <span className={`flex-1 min-w-0 break-words ${
                    isActive 
                      ? 'text-burgundy-700 font-semibold' 
                      : 'text-ink-700 group-hover:text-burgundy-700'
                  }`}>
                    {index + 1}. {poem.title}
                  </span>
                  <span className="flex-shrink-0 border-b border-dotted border-ink-300 mx-0.5 min-w-[14px]" />
                  <span className={`flex-shrink-0 w-6 text-right ${isActive ? 'text-burgundy-600' : 'text-ink-400'}`}>
                    {poemPageNumber}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </BookPage>
  );
}
