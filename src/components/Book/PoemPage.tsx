import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Poem } from '@/types';
import { BookPage } from './BookPage';
import { useScrollbarReveal } from '@/hooks';

interface PoemPageProps {
  poem: Poem;
  pageNumber?: number;
  isLeft?: boolean;
  chapterPoems?: Poem[];
}

export function PoemPage({ poem, pageNumber, isLeft }: PoemPageProps) {
  const poemScrollRef = useRef<HTMLDivElement>(null);
  useScrollbarReveal(poemScrollRef);

  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft}>
      <div className="w-full h-full flex flex-col" data-no-flip>
        {/* Название стихотворения - как было раньше */}
        <motion.h3 
          className="poem-title text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {poem.title}
        </motion.h3>
        
        {/* Декоративный разделитель */}
        <div className="divider" />
        
        {/* Текст стихотворения - широкий, с прокруткой */}
        <motion.div 
          ref={poemScrollRef}
          className="scrollbar-edge poem-text flex-1 overflow-y-auto text-center md:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ touchAction: 'pan-y' }}
        >
          {poem.content}
        </motion.div>
      </div>
    </BookPage>
  );
}
