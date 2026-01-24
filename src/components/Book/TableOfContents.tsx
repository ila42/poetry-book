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
  afterwordPageNumber
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
        
        <nav className="space-y-6">
          {/* Эпиграф - первый пункт */}
          {hasEpigraph && epigraphPageNumber && (
            <motion.button
              onClick={() => onNavigate(epigraphPageNumber)}
              className="w-full text-left group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0 }}
            >
              <div className="flex items-center">
                <span className="font-display text-lg text-burgundy-800 group-hover:text-burgundy-600 transition-colors italic">
                  Эпиграф
                </span>
                <span className="toc-dots" />
                <span className="text-ink-500 text-sm">
                  {epigraphPageNumber}
                </span>
              </div>
            </motion.button>
          )}

          {/* Главы */}
          {sortedChapters.map((chapter, index) => {
            const chapterPoems = poems.filter(p => p.chapterId === chapter.id);
            
            return (
              <motion.div 
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + (hasEpigraph ? 1 : 0)) }}
              >
                {/* Название главы */}
                <button
                  onClick={() => onNavigate(getPageForChapter(chapter.id))}
                  className="w-full text-left group"
                >
                  <div className="flex items-center">
                    <span className="font-display text-lg text-burgundy-800 group-hover:text-burgundy-600 transition-colors">
                      {chapter.title}
                    </span>
                    <span className="toc-dots" />
                    <span className="text-ink-500 text-sm">
                      {getPageForChapter(chapter.id)}
                    </span>
                  </div>
                  {chapter.subtitle && (
                    <p className="text-sm text-ink-500 italic ml-4">
                      {chapter.subtitle}
                    </p>
                  )}
                </button>
                
                {/* Стихи в главе */}
                <ul className="mt-2 ml-6 space-y-1">
                  {chapterPoems.map(poem => (
                    <li key={poem.id}>
                      <button
                        onClick={() => onNavigate(getPageForPoem(poem.id))}
                        className="w-full text-left flex items-center text-sm group"
                      >
                        <span className="text-ink-600 group-hover:text-burgundy-600 transition-colors">
                          {poem.title}
                        </span>
                        <span className="flex-1 border-b border-dotted border-ink-300 mx-2" />
                        <span className="text-ink-400">
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
              onClick={() => onNavigate(afterwordPageNumber)}
              className="w-full text-left group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (sortedChapters.length + (hasEpigraph ? 2 : 1)) }}
            >
              <div className="flex items-center">
                <span className="font-display text-lg text-burgundy-800 group-hover:text-burgundy-600 transition-colors italic">
                  Вместо послесловия
                </span>
                <span className="toc-dots" />
                <span className="text-ink-500 text-sm">
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
