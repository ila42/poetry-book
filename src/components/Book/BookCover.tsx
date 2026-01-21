import { motion } from 'framer-motion';
import { BookInfo } from '@/types';

interface BookCoverProps {
  bookInfo: BookInfo;
  onOpen: () => void;
}

export function BookCover({ bookInfo, onOpen }: BookCoverProps) {
  return (
    <motion.div
      className="book-cover w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer"
      onClick={onOpen}
      initial={{ rotateY: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Декоративная рамка */}
      <div className="absolute inset-6 border border-amber-200/20 rounded-sm" />
      <div className="absolute inset-8 border border-amber-200/10 rounded-sm" />
      
      {/* Верхний орнамент */}
      <motion.div 
        className="text-amber-200/60 text-4xl mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        ❦
      </motion.div>
      
      {/* Название книги */}
      <motion.h1 
        className="font-display text-4xl md:text-5xl lg:text-6xl text-amber-100 text-center mb-4 text-shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {bookInfo.title}
      </motion.h1>
      
      {/* Подзаголовок */}
      {bookInfo.subtitle && (
        <motion.p 
          className="font-serif text-lg md:text-xl text-amber-200/80 text-center italic mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {bookInfo.subtitle}
        </motion.p>
      )}
      
      {/* Декоративная линия */}
      <motion.div 
        className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent mb-8"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      />
      
      {/* Имя автора */}
      <motion.p 
        className="font-display text-2xl md:text-3xl text-amber-100/90 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {bookInfo.author}
      </motion.p>
      
      {/* Год издания */}
      <motion.p 
        className="font-serif text-sm text-amber-200/60 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {bookInfo.year}
      </motion.p>
      
      {/* Нижний орнамент */}
      <motion.div 
        className="text-amber-200/60 text-4xl mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        ❧
      </motion.div>
      
      {/* Подсказка */}
      <motion.p 
        className="absolute bottom-8 text-amber-200/50 text-sm font-serif"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Нажмите, чтобы открыть книгу
      </motion.p>
    </motion.div>
  );
}
