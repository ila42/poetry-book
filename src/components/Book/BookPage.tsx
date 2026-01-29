import { ReactNode, useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollbarReveal } from '@/hooks';

interface BookPageProps {
  children: ReactNode;
  pageNumber?: number;
  isLeft?: boolean;
  className?: string;
}

export function BookPage({ children, pageNumber, isLeft = false, className = '' }: BookPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollbarReveal(scrollRef);

  return (
    <motion.div
      className={`page w-full h-full flex flex-col ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-no-flip
    >
      {/* Содержимое страницы - с прокруткой */}
      <div 
        ref={scrollRef}
        className="scrollbar-edge flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto"
        style={{ 
          touchAction: 'pan-y',
          overscrollBehavior: 'contain'
        }}
      >
        {children}
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

// Компонент для титульной страницы
interface TitlePageProps {
  title: string;
  subtitle?: string;
  author: string;
}

export function TitlePage({ title, subtitle, author }: TitlePageProps) {
  return (
    <BookPage className="justify-center items-center text-center">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="ornament mb-8" />
        
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-burgundy-900 mb-4">
          {title}
        </h1>
        
        {subtitle && (
          <p className="font-serif text-lg text-ink-600 italic mb-6">
            {subtitle}
          </p>
        )}
        
        <div className="divider" />
        
        <p className="font-display text-xl md:text-2xl text-burgundy-800 mt-6">
          {author}
        </p>
        
        <div className="ornament mt-8" />
      </div>
    </BookPage>
  );
}

// Компонент для страницы с посвящением
interface DedicationPageProps {
  dedication: string;
}

export function DedicationPage({ dedication }: DedicationPageProps) {
  return (
    <BookPage className="justify-center items-center">
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto">
        <p className="font-serif text-lg italic text-ink-700 text-center leading-relaxed">
          {dedication}
        </p>
      </div>
    </BookPage>
  );
}

// Компонент для страницы с эпиграфом
interface EpigraphPageProps {
  content: string;
  pageNumber?: number;
  isLeft?: boolean;
}

export function EpigraphPage({ content, pageNumber, isLeft }: EpigraphPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollbarReveal(scrollRef);

  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft}>
      <div className="w-full h-full flex flex-col">
        {/* Заголовок - как у стихов */}
        <motion.h3 
          className="poem-title text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Эпиграф
        </motion.h3>
        
        {/* Декоративный разделитель */}
        <div className="divider" />
        
        {/* Текст эпиграфа - как текст стиха, с тонким скроллбаром */}
        <motion.div 
          ref={scrollRef}
          className="scrollbar-edge poem-text flex-1 overflow-y-auto text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ touchAction: 'pan-y' }}
        >
          {content}
        </motion.div>
      </div>
    </BookPage>
  );
}

// Компонент для страницы послесловия
export function AfterwordPage({ content, pageNumber, isLeft }: EpigraphPageProps) {
  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft}>
      <div className="max-w-prose mx-auto">
        <motion.h3 
          className="poem-title text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Черновик вместо послесловия
        </motion.h3>
        <div className="divider mb-6" />
        <div className="font-serif text-ink-800 leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </div>
    </BookPage>
  );
}

// Компонент для страницы главы
interface ChapterPageProps {
  title: string;
  subtitle?: string;
  chapterNumber: number;
}

export function ChapterPage({ title, subtitle, chapterNumber }: ChapterPageProps) {
  return (
    <BookPage className="justify-center items-center">
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="font-serif text-sm text-ink-500 uppercase tracking-widest mb-4">
          Часть {chapterNumber}
        </p>
        
        <div className="ornament mb-6" />
        
        <h2 className="chapter-title mb-4">
          {title}
        </h2>
        
        {subtitle && (
          <p className="font-serif text-lg text-ink-600 italic">
            {subtitle}
          </p>
        )}
        
        <div className="ornament mt-6" />
      </div>
    </BookPage>
  );
}
