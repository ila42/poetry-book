import { motion } from 'framer-motion';
import { Poem } from '@/types';

interface PoemPageProps {
  poem: Poem;
  pageNumber?: number;
  isLeft?: boolean;
  chapterPoems?: Poem[];
  /** Режим читалки: белый фон, крупный текст, 1 страница = 1 стих */
  variant?: 'default' | 'reader';
}

export function PoemPage({ poem, pageNumber, isLeft, variant = 'default' }: PoemPageProps) {
  const isReader = variant === 'reader';

  return (
    <motion.div
      className={`w-full flex flex-col ${isReader ? 'reader-poem-page flex-1 justify-center items-center' : 'page h-full'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-no-flip
    >
      <div className={`flex flex-col overflow-hidden w-full max-w-2xl ${isReader ? 'py-4 text-center' : 'flex-1 p-3 md:p-4'}`}>
        <h3 className={isReader ? 'reader-poem-title' : 'poem-title text-center shrink-0'}>
          {poem.title}
        </h3>

        <div className="divider shrink-0 mx-auto" />

        <div
          className={
            isReader
              ? 'reader-poem-text flex-1 overflow-y-auto overflow-x-hidden text-center'
              : 'poem-text flex-1 overflow-y-auto overflow-x-hidden pr-2'
          }
          style={{
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: isReader ? 'rgba(0,0,0,0.2) transparent' : 'rgba(122, 29, 57, 0.4) transparent',
          }}
        >
          {poem.content}
        </div>
      </div>

      {pageNumber !== undefined && !isReader && (
        <div className={`page-number ${isLeft ? 'page-number-left' : 'page-number-right'}`}>
          {pageNumber}
        </div>
      )}
    </motion.div>
  );
}
