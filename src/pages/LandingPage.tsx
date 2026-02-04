import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { author, bookInfo } from '@/data/author';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <section id="book-content" className="min-h-screen flex items-center">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 lg:gap-16">
            {/* Обложка книги - интерактивная */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/read"
                className="relative group outline-none block"
                aria-label="Открыть книгу для чтения"
              >
                {/* Тень под книгой */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black/10 blur-2xl rounded-full" />
                
                {/* Обложка */}
                <div className="relative w-[240px] sm:w-[280px] lg:w-[320px] aspect-[3/4] 
                                bg-gradient-to-br from-[#8B4557] via-[#6B3344] to-[#4A2332]
                                rounded-sm shadow-2xl overflow-hidden
                                transform hover:scale-[1.02] transition-all duration-300
                                cursor-pointer group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                  {/* Декоративные элементы обложки */}
                  <div className="absolute inset-4 border border-[#D4AF37]/30 rounded-sm" />
                  <div className="absolute inset-6 border border-[#D4AF37]/20 rounded-sm" />
                  
                  {/* Содержимое обложки */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-[#D4AF37]/60 text-3xl mb-4">❦</div>
                    <h2 className="font-serif text-xl sm:text-2xl text-[#F5F0E8] mb-2">
                      {bookInfo.title}
                    </h2>
                    <p className="font-serif text-sm text-[#D4AF37]/70 italic">
                      {bookInfo.subtitle}
                    </p>
                    <div className="w-16 h-px bg-[#D4AF37]/40 my-4" />
                    <p className="font-serif text-[#F5F0E8]/80">
                      {author.name}
                    </p>
                    <div className="text-[#D4AF37]/60 text-3xl mt-4">❧</div>
                  </div>
                  
                  {/* Overlay с подсказкой при наведении */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 
                                  transition-all duration-300 flex items-center justify-center
                                  opacity-0 group-hover:opacity-100">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <svg className="w-8 h-8 text-[#F5F0E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span className="text-[#F5F0E8] text-xs font-serif">Откройте книгу</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            {/* Текст и CTA */}
            <motion.div
              className="flex-1 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2C3E50] mb-4 leading-tight">
                Книга стихов
              </h1>
              <p className="font-serif text-lg sm:text-xl text-[#2C3E50]/60 mb-2">
                {author.fullName}
              </p>
              <p className="text-[#2C3E50]/50 mb-8">
                {bookInfo.year} год
              </p>
              
              <p className="font-serif text-[#2C3E50]/70 leading-relaxed mb-10 max-w-lg mx-auto">
                Приглашаю вас в путешествие по страницам моей книги.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Кнопка "Читать" - единый стиль */}
                <Link
                  to="/read"
                  className="btn-cta"
                >
                  <span>Читать</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>

                {/* Кнопка "Стих дня" */}
                <Link
                  to="/poem-of-the-day"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-[#8B4557] text-[#8B4557] font-serif text-lg font-medium rounded-md hover:bg-[#8B4557] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>Стих дня</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
