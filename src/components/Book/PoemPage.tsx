import { motion } from 'framer-motion';
import { Poem } from '@/types';

interface PoemPageProps {
  poem: Poem;
  pageNumber?: number;
  isLeft?: boolean;
  chapterPoems?: Poem[];
}

export function PoemPage({ poem, pageNumber, isLeft }: PoemPageProps) {
  return (
    <motion.div
      className="page w-full h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-no-flip
    >
      {/* Контент страницы */}
      <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
        {/* Название стихотворения */}
        <h3 className="poem-title text-center shrink-0">
          {poem.title}
        </h3>
        
        {/* Декоративный разделитель */}
        <div className="divider shrink-0" />
        
        {/* Текст стихотворения - прокрутка колёсиком и пальцем */}
        <div 
          className="poem-text flex-1 overflow-y-auto overflow-x-hidden pr-2"
          style={{ 
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(122, 29, 57, 0.4) transparent'
          }}
        >
          {poem.content}
        </div>
      </div>
      
      {/* Номер страницы */}
      {pageNumber !== undefined && (
        <div className={`page-number ${isLeft ? 'page-number-left' : 'page-number-right'}`}>
          {pageNumber}
        </div>
      )}
    </motion.div>
  );
}
