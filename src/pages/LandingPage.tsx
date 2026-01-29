import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { author, bookInfo } from '@/data/author';
import { ContactForm } from '@/components/ContactForm';
import { contentPoems } from '@/data/contentHelpers';

export function LandingPage() {
  // State для раскрытия списков
  const [showAllAudio, setShowAllAudio] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [expandedPoem, setExpandedPoem] = useState<string | null>(null);
  
  // Фильтруем стихи с аудио
  const poemsWithAudio = contentPoems.filter(p => p.audioUrl);
  const firstFiveAudio = poemsWithAudio.slice(0, 5);
  const restAudio = poemsWithAudio.slice(5);
  
  // Последние 5 стихотворений
  const recentPoems = contentPoems.slice(-5).reverse();
  
  // Фото
  const photos = [
    { id: 'photo-1', title: 'Портрет ребенка', url: '/images/gallery/photo_2026-01-19_13-34-43 (2).jpg' },
    { id: 'photo-2', title: 'Мальчик в лесу', url: '/images/gallery/photo_2026-01-19_13-34-43.jpg' },
  ];
  const firstTwoPhotos = photos.slice(0, 2);
  const restPhotos = photos.slice(2);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Хедер */}
      <header className="sticky top-0 z-50 bg-[#F5F5F0]/95 backdrop-blur-sm border-b border-[#E5E5E0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16 sm:h-20">
            {/* Логотип / Имя автора - по центру */}
            <a href="/" className="flex items-center gap-2">
              <span className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#2C3E50] leading-tight">
                {author.name}
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Книга */}
      <section id="book-content" className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
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
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#2C3E50] mb-4 leading-tight">
                Сборник стихов
              </h1>
              <p className="font-serif text-lg sm:text-xl text-[#2C3E50]/60 mb-2">
                {author.fullName}
              </p>
              <p className="text-[#2C3E50]/50 mb-8">
                {bookInfo.year} год
              </p>
              
              <p className="font-serif text-[#2C3E50]/70 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                Приглашаю вас в путешествие по страницам моей книги.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
                
                {/* Кнопка Аудиоархива - вторичный стиль */}
                <Link
                  to="/audio-archive"
                  className="inline-flex items-center justify-center gap-2
                             px-8 py-4 bg-transparent text-burgundy-700
                             font-serif text-lg font-medium rounded-md
                             border-2 border-burgundy-400
                             hover:border-burgundy-600 hover:bg-burgundy-50/20
                             transition-all duration-300
                             shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v9.28c-1.591 0-3-1.159-3-2.5S10.409 7.28 12 7.28c1.591 0 3 1.159 3 2.5S13.591 12.28 12 12.28V3zm8.5 8.5a2 2 0 1 1 .001-4.001A2 2 0 0 1 20.5 11.5zM4 11.5a2 2 0 1 1 .001-4.001A2 2 0 0 1 4 11.5zm12.5 7.5v-5h-1v5h1zm-8 0v-5h-1v5h1z"/>
                  </svg>
                  <span>Аудиоархив</span>
                </Link>
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

      {/* Послушать - Аудио */}
      <section id="audio" className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C3E50] text-center mb-12">
              Послушать
            </h2>
            
            {/* Первые 5 аудиозаписей */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {firstFiveAudio.map((poem) => (
                <motion.div
                  key={poem.id}
                  className="p-4 bg-white rounded-lg border border-[#2C3E50]/10 hover:border-[#2C3E50]/30 transition-all duration-200 shadow-sm hover:shadow-md"
                  whileHover={{ y: -2 }}
                >
                  <h3 className="font-serif text-lg text-[#2C3E50] mb-2">{poem.title}</h3>
                  <p className="text-sm text-[#2C3E50]/60 mb-3 italic line-clamp-2">
                    {poem.content}
                  </p>
                  <audio controls className="w-full h-8">
                    <source src={poem.audioUrl || ''} type="audio/mp4" />
                  </audio>
                </motion.div>
              ))}
            </div>

            {/* Кнопка раскрытия - сразу после первых 5 записей */}
            {poemsWithAudio.length > 5 && !showAllAudio && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setShowAllAudio(!showAllAudio)}
                  className="inline-flex items-center gap-2 
                             px-6 py-3
                             bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-burgundy-500
                             text-parchment-100 font-serif font-medium rounded-md
                             hover:from-burgundy-600 hover:via-burgundy-500 hover:to-burgundy-400
                             shadow-lg hover:shadow-xl transition-all duration-300
                             border border-burgundy-500/40 ring-1 ring-burgundy-400/30"
                >
                  <span>Послушать всё ↓</span>
                  <svg 
                    className="w-4 h-4 transition-transform duration-300"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
            )}

            {/* Остальные аудиозаписи (раскрывающиеся) */}
            <motion.div
              initial={false}
              animate={{ height: showAllAudio ? 'auto' : 0, opacity: showAllAudio ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {showAllAudio && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {restAudio.map((poem) => (
                    <motion.div
                      key={poem.id}
                      className="p-4 bg-white rounded-lg border border-[#2C3E50]/10 hover:border-[#2C3E50]/30 transition-all duration-200 shadow-sm hover:shadow-md"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -2 }}
                    >
                      <h3 className="font-serif text-lg text-[#2C3E50] mb-2">{poem.title}</h3>
                      <p className="text-sm text-[#2C3E50]/60 mb-3 italic line-clamp-2">
                        {poem.content}
                      </p>
                      <audio controls className="w-full h-8">
                        <source src={poem.audioUrl || ''} type="audio/mp4" />
                      </audio>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Кнопка "Свернуть" - видна когда список развёрнут */}
            {poemsWithAudio.length > 5 && showAllAudio && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllAudio(!showAllAudio)}
                  className="inline-flex items-center gap-2 
                             px-6 py-3
                             bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-burgundy-500
                             text-parchment-100 font-serif font-medium rounded-md
                             hover:from-burgundy-600 hover:via-burgundy-500 hover:to-burgundy-400
                             shadow-lg hover:shadow-xl transition-all duration-300
                             border border-burgundy-500/40 ring-1 ring-burgundy-400/30"
                >
                  <span>Свернуть ↑</span>
                  <svg 
                    className="w-4 h-4 transition-transform duration-300 rotate-180"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Разделитель */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#2C3E50]/20 to-transparent" />
      </div>

      {/* Посмотреть - Фотогалерея */}
      <section id="gallery" className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C3E50] text-center mb-12">
              Посмотреть
            </h2>
            
            {/* Фото - основной блок (показываем 2 при свёрнуто, всё при развёрнуто) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {(showAllPhotos ? photos : firstTwoPhotos).map((photo) => (
                <motion.div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>

            {/* Остальные фото (только при раскрытии и если их больше 2) */}
            {showAllPhotos && restPhotos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {restPhotos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Кнопка раскрытия - только если фото больше 2 */}
            {photos.length > 2 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllPhotos(!showAllPhotos)}
                  className="inline-flex items-center gap-2 
                             px-6 py-3
                             bg-gradient-to-r from-burgundy-700 via-burgundy-600 to-burgundy-500
                             text-parchment-100 font-serif font-medium rounded-md
                             hover:from-burgundy-600 hover:via-burgundy-500 hover:to-burgundy-400
                             shadow-lg hover:shadow-xl transition-all duration-300
                             border border-burgundy-500/40 ring-1 ring-burgundy-400/30"
                >
                  <span>{showAllPhotos ? 'Свернуть ↑' : 'Посмотреть всё ↓'}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${showAllPhotos ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Разделитель */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#2C3E50]/20 to-transparent" />
      </div>

      {/* Новое - Свежие стихи */}
      <section id="new" className="py-16 sm:py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C3E50] text-center mb-12">
              Новое
            </h2>
            
            {/* Список стихотворений аккордеоном */}
            <div className="space-y-3 max-w-2xl mx-auto">
              {recentPoems.map((poem) => (
                <motion.div
                  key={poem.id}
                  className="border border-[#2C3E50]/20 rounded-lg overflow-hidden"
                  initial={false}
                >
                  {/* Заголовок - кликабельный */}
                  <button
                    onClick={() => setExpandedPoem(expandedPoem === poem.id ? null : poem.id)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F5F5F0] transition-colors duration-200"
                  >
                    <h3 className="font-serif text-lg text-[#2C3E50] text-left">
                      {poem.title}
                    </h3>
                    <svg
                      className={`w-5 h-5 text-[#2C3E50] transition-transform duration-300 ${
                        expandedPoem === poem.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>

                  {/* Текст - раскрывающийся */}
                  <motion.div
                    initial={false}
                    animate={{ height: expandedPoem === poem.id ? 'auto' : 0, opacity: expandedPoem === poem.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-[#F5F5F0]/50 border-t border-[#2C3E50]/10">
                      <p className="font-serif text-[#2C3E50] leading-relaxed whitespace-pre-line">
                        {poem.content}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
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
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C3E50] text-center mb-10">
              Обратная связь
            </h2>
            
            {/* Форма контактов */}
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
