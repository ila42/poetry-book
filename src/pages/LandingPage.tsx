import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { author, bookInfo } from '@/data/author';
import { ContactForm } from '@/components/ContactForm';

export function LandingPage() {
  return (
    <div className="min-h-screen leather-background">
      {/* Многослойный кожаный фон */}
      <div className="fixed inset-0 leather-base" />
      <div className="fixed inset-0 leather-grain-fine" />
      <div className="fixed inset-0 leather-grain-coarse" />
      <div className="fixed inset-0 leather-highlights" />
      <div className="fixed inset-0 leather-wear" />
      <div className="fixed inset-0 leather-vignette" />
      
      {/* Контент */}
      <div className="relative z-10">
        {/* Hero Section - Об авторе */}
        <section className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-3 sm:px-4">
          <motion.div
            className="max-w-4xl w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Декоративная карточка */}
            <div className="bg-parchment-100/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden relative">
              {/* Декоративная рамка */}
              <div className="absolute inset-2 sm:inset-4 border border-burgundy-300/30 rounded-sm pointer-events-none" />
              
              <div className="p-4 sm:p-8 md:p-12">
                {/* Верхний орнамент */}
                <motion.div 
                  className="text-burgundy-600/60 text-2xl sm:text-4xl text-center mb-4 sm:mb-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  ❦
                </motion.div>
                
                {/* Заголовок */}
                <motion.h1 
                  className="font-display text-2xl sm:text-4xl md:text-5xl text-burgundy-800 text-center mb-2 sm:mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {author.fullName}
                </motion.h1>
                
                {/* Подзаголовок */}
                <motion.p 
                  className="text-center text-ink-600 font-serif italic text-sm sm:text-lg mb-4 sm:mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {author.shortBio}
                </motion.p>
                
                {/* Декоративная линия */}
                <div className="w-20 sm:w-32 h-0.5 mx-auto bg-gradient-to-r from-transparent via-burgundy-400 to-transparent mb-4 sm:mb-8" />
                
                {/* Контент: Фото + Биография */}
                <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-center md:items-start">
                  {/* Фото автора */}
                  <motion.div 
                    className="flex-shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="relative">
                      <div className="w-32 h-40 sm:w-48 sm:h-60 md:w-56 md:h-72 bg-parchment-200 rounded-sm overflow-hidden shadow-lg">
                        <img
                          src={author.photoUrl}
                          alt={author.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-parchment-300 text-ink-400">
                                <svg class="w-12 sm:w-20 h-12 sm:h-20" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                              </div>
                            `;
                          }}
                        />
                      </div>
                      {/* Декоративная рамка фото */}
                      <div className="absolute -inset-1 sm:-inset-2 border border-burgundy-300/30 rounded-sm pointer-events-none" />
                    </div>
                    
                    {/* Годы жизни */}
                    <p className="text-center text-ink-500 text-xs sm:text-sm mt-2 sm:mt-4 font-serif">
                      {author.birthYear}{author.deathYear ? ` — ${author.deathYear}` : ' г.р.'}
                    </p>
                  </motion.div>
                  
                  {/* Биография */}
                  <motion.div 
                    className="flex-1 text-center md:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h2 className="font-display text-xl sm:text-2xl text-burgundy-700 mb-2 sm:mb-4">
                      Об авторе
                    </h2>
                    <div className="font-serif text-ink-700 leading-relaxed whitespace-pre-line text-sm sm:text-base md:text-justify">
                      {author.biography}
                    </div>
                  </motion.div>
                </div>
                
                {/* Нижний орнамент */}
                <motion.div 
                  className="text-burgundy-600/60 text-2xl sm:text-4xl text-center mt-4 sm:mt-8"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  ❧
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* Список литературы */}
        <section className="py-8 sm:py-16 px-3 sm:px-4">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-parchment-100/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden p-4 sm:p-8 md:p-12">
              {/* Заголовок секции */}
              <h2 className="font-display text-2xl sm:text-3xl text-burgundy-800 text-center mb-2">
                Библиография
              </h2>
              <div className="w-20 sm:w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-burgundy-400 to-transparent mb-4 sm:mb-8" />
              
              {/* Книга */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-gradient-to-br from-burgundy-800 to-burgundy-900 rounded-lg p-4 sm:p-6 shadow-lg
                              border border-burgundy-700/50 hover:shadow-xl transition-shadow duration-300">
                  {/* Декоративные элементы обложки */}
                  <div className="absolute inset-2 sm:inset-3 border border-amber-200/10 rounded-sm pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                    {/* Миниатюра книги */}
                    <div className="w-16 h-20 sm:w-24 sm:h-32 bg-gradient-to-br from-burgundy-700 to-burgundy-800 
                                    rounded shadow-md flex items-center justify-center
                                    border border-amber-200/20 flex-shrink-0">
                      <span className="text-amber-200/60 text-2xl sm:text-3xl">📖</span>
                    </div>
                    
                    {/* Информация о книге */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-display text-xl sm:text-2xl text-amber-100 mb-1">
                        {bookInfo.title}
                      </h3>
                      {bookInfo.subtitle && (
                        <p className="font-serif text-amber-200/70 italic text-xs sm:text-sm mb-2">
                          {bookInfo.subtitle}
                        </p>
                      )}
                      <p className="font-serif text-amber-200/60 text-xs sm:text-sm">
                        {bookInfo.year} год
                      </p>
                    </div>
                    
                    {/* Кнопка "Читать" */}
                    <Link
                      to="/read"
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 
                                 bg-amber-100 text-burgundy-800 
                                 font-serif text-base sm:text-lg rounded-md
                                 hover:bg-amber-50 active:bg-amber-200 transition-colors duration-200
                                 shadow-md hover:shadow-lg"
                    >
                      <span>Читать</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
              
              {/* Подсказка */}
              <p className="text-center text-ink-500 text-xs sm:text-sm font-serif mt-4 sm:mt-6 italic">
                Нажмите «Читать», чтобы открыть книгу
              </p>
            </div>
          </motion.div>
        </section>
        
        {/* Обратная связь */}
        <section id="contact" className="py-8 sm:py-16 px-3 sm:px-4 pb-16 sm:pb-24">
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-2xl sm:text-3xl text-parchment-100 text-center mb-2">
              Обратная связь
            </h2>
            <div className="w-20 sm:w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-parchment-300 to-transparent mb-4 sm:mb-8" />
            
            <ContactForm />
            
            {/* Дополнительные контакты */}
            <motion.div 
              className="mt-6 sm:mt-8 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <p className="font-serif text-parchment-200/70 text-xs sm:text-sm mb-2">
                Или напишите напрямую:
              </p>
              <a 
                href="mailto:author@poetrybook.ru" 
                className="font-serif text-parchment-100 hover:text-amber-200 transition-colors text-sm sm:text-base"
              >
                author@poetrybook.ru
              </a>
            </motion.div>
          </motion.div>
        </section>
        
        {/* Футер */}
        <footer className="py-4 sm:py-6 text-center border-t border-parchment-200/10">
          <p className="text-parchment-200/40 text-[10px] sm:text-xs font-serif px-4">
            © {new Date().getFullYear()} {author.name}. Все права защищены.
          </p>
        </footer>
      </div>
    </div>
  );
}
