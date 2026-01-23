import { motion } from 'framer-motion';
import { Poem } from '@/types';
import { BookPage } from './BookPage';

interface PoemPageProps {
  poem: Poem;
  pageNumber?: number;
  isLeft?: boolean;
  chapterPoems?: Poem[];
}

export function PoemPage({ poem, pageNumber, isLeft }: PoemPageProps) {
  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft}>
      <div className="max-w-prose mx-auto">
        {/* Эпиграф */}
        {poem.epigraph && (
          <motion.div 
            className="mb-6 text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-serif text-sm italic text-ink-600">
              {poem.epigraph}
            </p>
          </motion.div>
        )}
        
        {/* Посвящение */}
        {poem.dedication && (
          <motion.div 
            className="mb-6 text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-serif text-sm italic text-ink-500">
              {poem.dedication}
            </p>
          </motion.div>
        )}
        
        {/* Название стихотворения */}
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
        
        {/* Текст стихотворения */}
        <motion.div 
          className="poem-text text-ink-800 text-center md:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {poem.content}
        </motion.div>
        
        {/* Дата написания */}
        {poem.date && (
          <motion.p 
            className="text-right text-sm text-ink-500 mt-6 font-serif italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {poem.date}
          </motion.p>
        )}
      </div>
    </BookPage>
  );
}
