import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { author, bookInfo } from '@/data/author';
import { ContactForm } from '@/components/ContactForm';

export function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Хедер */}
      <header className="sticky top-0 z-50 bg-[#F5F5F0]/95 backdrop-blur-sm border-b border-[#E5E5E0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Логотип / Имя автора */}
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-serif font-medium text-[#2C3E50]">
                {author.name}
              </span>
            </a>
            
            {/* Навигация - Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('about')}
                className="text-[#2C3E50]/70 hover:text-[#2C3E50] transition-colors font-serif"
              >
                Об авторе
              </button>
              <button 
                onClick={() => scrollToSection('book')}
                className="text-[#2C3E50]/70 hover:text-[#2C3E50] transition-colors font-serif"
              >
                Сборник
              </button>
              <Link
                to="/audio-archive"
                className="text-[#2C3E50]/70 hover:text-[#2C3E50] transition-colors font-serif"
              >
                Аудиоархив
              </Link>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-[#2C3E50]/70 hover:text-[#2C3E50] transition-colors font-serif"
              >
                Контакты
              </button>
            </nav>
            
            {/* Мобильное меню */}
            <nav className="flex md:hidden items-center gap-4 text-sm">
              <button 
                onClick={() => scrollToSection('book')}
                className="text-[#2C3E50]/70 hover:text-[#2C3E50] transition-colors font-serif"
              >
                Сборник
              </button>
              <Link
                to="/audio-archive"
                className="text-[#2C3E50]/70 hover:text-[#2C3E50] transition-colors font-serif"
              >
                Аудио
              </Link>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-[#2C3E50]/70 hover:text-[#2C3E50] transition-colors font-serif"
              >
                Контакты
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Книга */}
      <section id="book" className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Обложка книги */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                {/* Тень под книгой */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-black/10 blur-2xl rounded-full" />
                
                {/* Обложка */}
                <div className="relative w-[240px] sm:w-[280px] lg:w-[320px] aspect-[3/4] 
                                bg-gradient-to-br from-[#8B4557] via-[#6B3344] to-[#4A2332]
                                rounded-sm shadow-2xl overflow-hidden
                                transform hover:scale-[1.02] transition-transform duration-300">
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
                </div>
              </div>
            </motion.div>
            
            {/* Текст и CTA */}
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2C3E50] mb-4 leading-tight">
                Сборник стихов
              </h1>
              <p className="font-serif text-lg sm:text-xl text-[#2C3E50]/60 mb-2">
                {author.fullName}
              </p>
              <p className="text-[#2C3E50]/50 mb-8">
                {bookInfo.year} год
              </p>
              
              <p className="font-serif text-[#2C3E50]/70 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Поэтический сборник, в котором каждое стихотворение — это отражение 
                определённого момента, чувства, мысли. Приглашаю вас в путешествие 
                по страницам моей книги.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/read"
                  className="inline-flex items-center justify-center gap-2 
                             px-8 py-4 bg-[#2C3E50] text-white
                             font-serif text-lg rounded-md
                             hover:bg-[#1a252f] active:bg-[#0f171d]
                             transition-colors duration-200
                             shadow-lg hover:shadow-xl"
                >
                  <span>Читать онлайн</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                
                <button
                  onClick={() => scrollToSection('about')}
                  className="inline-flex items-center justify-center gap-2
                             px-8 py-4 bg-transparent text-[#2C3E50]
                             font-serif text-lg rounded-md
                             border-2 border-[#2C3E50]/30
                             hover:border-[#2C3E50]/60 hover:bg-[#2C3E50]/5
                             transition-all duration-200"
                >
                  Об авторе
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Разделитель */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#2C3E50]/20 to-transparent" />
      </div>

      {/* Об авторе */}
      <section id="about" className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C3E50] text-center mb-12">
              Об авторе
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-center">
              {/* Фото автора - круглое */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="relative">
                  {/* Декоративное кольцо */}
                  <div className="absolute -inset-2 rounded-full border-2 border-[#2C3E50]/10" />
                  
                  {/* Фото */}
                  <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] lg:w-[250px] lg:h-[250px] 
                                  rounded-full overflow-hidden 
                                  shadow-xl shadow-[#2C3E50]/20
                                  border-4 border-white">
                    <img
                      src={author.photoUrl}
                      alt={author.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-[#E5E5E0] text-[#2C3E50]/30">
                            <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
                
                {/* Имя и годы */}
                <h3 className="font-serif text-xl sm:text-2xl text-[#2C3E50] mt-6 mb-1 text-center">
                  {author.fullName}
                </h3>
                <p className="text-[#2C3E50]/50 text-sm font-serif">
                  {author.birthYear}{author.deathYear ? ` — ${author.deathYear}` : ' г.р.'}
                </p>
              </div>
              
              {/* Биография */}
              <div className="flex-1 text-center md:text-left">
                <div className="font-serif text-[#2C3E50]/70 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                  {author.biography}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Разделитель */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#2C3E50]/20 to-transparent" />
      </div>

      {/* Контакты */}
      <section id="contact" className="py-16 sm:py-24">
        <div className="max-w-[600px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C3E50] text-center mb-4">
              Обратная связь
            </h2>
            <p className="text-center text-[#2C3E50]/60 font-serif mb-10">
              Буду рад вашим отзывам и размышлениям
            </p>
            
            {/* Форма контактов - переопределяем стили */}
            <div className="landing-contact-form">
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Футер */}
      <footer className="py-8 border-t border-[#E5E5E0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#2C3E50]/40 text-sm font-serif">
              © {new Date().getFullYear()} {author.name}. Все права защищены.
            </p>
            <Link
              to="/read"
              className="text-[#2C3E50]/60 hover:text-[#2C3E50] text-sm font-serif transition-colors"
            >
              Читать сборник →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
