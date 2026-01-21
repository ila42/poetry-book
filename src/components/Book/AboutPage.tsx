import { motion } from 'framer-motion';
import { Author } from '@/types';
import { BookPage } from './BookPage';

interface AboutPageProps {
  author: Author;
  pageNumber?: number;
  isLeft?: boolean;
}

export function AboutPage({ author, pageNumber, isLeft }: AboutPageProps) {
  return (
    <BookPage pageNumber={pageNumber} isLeft={isLeft}>
      <div className="max-w-prose mx-auto">
        <motion.h2 
          className="font-display text-2xl md:text-3xl text-burgundy-800 text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Об авторе
        </motion.h2>
        
        <div className="divider mb-8" />
        
        {/* Фото автора */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="w-40 h-48 md:w-48 md:h-56 bg-parchment-200 rounded-sm overflow-hidden shadow-lg">
              <img
                src={author.photoUrl}
                alt={author.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback если фото не найдено
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-parchment-300 text-ink-400">
                      <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  `;
                }}
              />
            </div>
            {/* Декоративная рамка */}
            <div className="absolute -inset-2 border border-burgundy-300/30 rounded-sm pointer-events-none" />
          </div>
        </motion.div>
        
        {/* Имя автора */}
        <motion.h3 
          className="font-display text-xl text-burgundy-800 text-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {author.fullName}
        </motion.h3>
        
        {/* Годы жизни */}
        <motion.p 
          className="text-center text-ink-500 text-sm mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          {author.birthYear}{author.deathYear ? ` — ${author.deathYear}` : ' г.р.'}
        </motion.p>
        
        {/* Биография */}
        <motion.div 
          className="font-serif text-ink-700 leading-relaxed whitespace-pre-line text-justify"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {author.biography}
        </motion.div>
      </div>
    </BookPage>
  );
}
