import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BookPageProps {
  children: ReactNode;
  pageNumber?: number;
  isLeft?: boolean;
  className?: string;
}

export function BookPage({ children, pageNumber, isLeft = false, className = '' }: BookPageProps) {
  return (
    <motion.div
      className={`page w-full h-full flex flex-col ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-no-flip
    >
      {/* Содержимое страницы */}
      <div className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide">
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
  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft} className="justify-center items-center">
      <div className="max-w-md mx-auto flex flex-col justify-center h-full">
        <motion.h3 
          className="poem-title text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Эпиграф
        </motion.h3>
        <div className="font-serif italic text-lg text-ink-800 leading-relaxed text-center whitespace-pre-line">
          {content}
        </div>
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
