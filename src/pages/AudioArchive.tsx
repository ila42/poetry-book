import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contentPoems, contentChapters } from '@/data/contentHelpers';

export function AudioArchive() {
  // Фильтруем стихи, у которых есть аудио
  const poemsWithAudio = contentPoems.filter(poem => poem.audioUrl);

  // Создаем мапу для быстрого поиска названий глав
  const chaptersMap = new Map(contentChapters.map(ch => [ch.id, ch]));

  // Группируем по главам
  const poemsByChapter = new Map<string, typeof contentPoems>();
  poemsWithAudio.forEach(poem => {
    if (!poemsByChapter.has(poem.chapterId)) {
      poemsByChapter.set(poem.chapterId, []);
    }
    poemsByChapter.get(poem.chapterId)!.push(poem);
  });

  return (
    <div className="min-h-screen pb-20 leather-background relative">
      {/* Многослойный кожаный фон */}
      <div className="fixed inset-0 leather-base" />
      <div className="fixed inset-0 leather-grain-fine" />
      <div className="fixed inset-0 leather-grain-coarse" />
      <div className="fixed inset-0 leather-highlights" />
      <div className="fixed inset-0 leather-wear" />
      <div className="fixed inset-0 leather-vignette" />

      {/* Кнопка "Вернуться на главную" - в левом верхнем углу */}
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5
                   bg-gradient-to-br from-[#3d2817]/95 to-[#2a1a0f]/95
                   backdrop-blur-sm rounded-lg
                   text-[#d4af37] font-serif text-sm
                   border border-[#d4af37]/30
                   hover:border-[#d4af37]/50 hover:text-[#f4d03f]
                   transition-all duration-200
                   shadow-lg hover:shadow-xl
                   hover:shadow-[#d4af37]/10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Вернуться на главную</span>
      </Link>

      {/* Основной контент */}
      <main className="relative z-10 max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Заголовок */}
          <div className="text-center mb-12">
            <motion.h1
              className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#d4af37] mb-4
                         drop-shadow-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Аудиоархив
            </motion.h1>
            <motion.div
              className="w-24 h-px mx-auto mt-4 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          </div>

          {/* Список аудиозаписей */}
          {poemsWithAudio.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-parchment-50/95 rounded-lg shadow-xl border border-burgundy-200/40 p-8 max-w-md mx-auto">
                <p className="font-serif text-ink-800 text-lg">
                  Аудиозаписи пока не добавлены
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {Array.from(poemsByChapter.entries()).map(([chapterId, chapterPoems], chapterIndex) => {
                const chapter = chaptersMap.get(chapterId);
                
                return (
                  <motion.div
                    key={chapterId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: chapterIndex * 0.1 }}
                    className="bg-parchment-50/95 rounded-lg shadow-xl border border-burgundy-200/40 p-6 sm:p-8"
                  >
                    {/* Заголовок главы */}
                    {chapter && (
                      <h2 className="font-display text-xl sm:text-2xl text-burgundy-800 mb-6 pb-4 border-b border-burgundy-200/50">
                        {chapter.title}
                        {chapter.subtitle && (
                          <span className="block text-base text-ink-600 italic mt-1 font-serif">
                            {chapter.subtitle}
                          </span>
                        )}
                      </h2>
                    )}
                    
                    {/* Список стихов */}
                    <div className="space-y-6">
                      {chapterPoems.map((poem, poemIndex) => (
                        <motion.div
                          key={poem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: (chapterIndex * 0.1) + (poemIndex * 0.05) }}
                          className="border-b border-burgundy-200/30 last:border-b-0 pb-6 last:pb-0"
                        >
                          {/* Название стихотворения */}
                          <h3 className="font-display text-lg sm:text-xl text-burgundy-800 mb-4">
                            <Link
                              to={`/read#poem-${poem.id}`}
                              className="hover:text-burgundy-600 transition-colors inline-flex items-center gap-2 group"
                            >
                              <span>{poem.title}</span>
                              <svg
                                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </h3>
                          
                          {/* Аудиоплеер */}
                          <div className="mt-4">
                            <audio
                              controls
                              src={poem.audioUrl}
                              className="w-full h-10
                                         [&::-webkit-media-controls-panel]:bg-parchment-200/80
                                         [&::-webkit-media-controls-play-button]:bg-burgundy-600
                                         [&::-webkit-media-controls-current-time-display]:text-ink-800
                                         [&::-webkit-media-controls-time-remaining-display]:text-ink-800
                                         [&::-webkit-media-controls-timeline]:bg-burgundy-200/50
                                         [&::-webkit-media-controls-volume-slider]:bg-burgundy-200/50
                                         rounded-md"
                              style={{
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                              }}
                            >
                              Ваш браузер не поддерживает аудио элемент.
                            </audio>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>

      {/* Футер */}
      <footer className="fixed bottom-0 left-0 right-0 py-2 text-center pointer-events-none z-10">
        <p className="text-parchment-200/40 text-xs font-serif">
          © {new Date().getFullYear()} Аудиоархив. Все права защищены.
        </p>
      </footer>
    </div>
  );
}
