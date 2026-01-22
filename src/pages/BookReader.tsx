import { Link } from 'react-router-dom';
import { Book } from '@/components/Book';
import { AudioPlayerProvider, GlobalAudioPlayer } from '@/components/AudioPlayer';
import { author, bookInfo } from '@/data/author';
import { contentChapters, contentPoems } from '@/data/contentHelpers';

export function BookReader() {
  return (
    <AudioPlayerProvider>
      <div className="min-h-screen pb-20 leather-background">
        {/* Многослойный кожаный фон */}
        <div className="fixed inset-0 leather-base" />
        <div className="fixed inset-0 leather-grain-fine" />
        <div className="fixed inset-0 leather-grain-coarse" />
        <div className="fixed inset-0 leather-highlights" />
        <div className="fixed inset-0 leather-wear" />
        <div className="fixed inset-0 leather-vignette" />
        
        {/* Кнопка "Назад на главную" - золотистый стиль */}
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
          <span>На главную</span>
        </Link>
        
        {/* Книга */}
        <Book 
          bookInfo={bookInfo}
          chapters={contentChapters}
          poems={contentPoems}
        />
        
        {/* Глобальный аудиоплеер */}
        <GlobalAudioPlayer />
        
        {/* Футер */}
        <footer className="fixed bottom-20 left-0 right-0 py-2 text-center pointer-events-none">
          <p className="text-parchment-200/40 text-xs font-serif">
            © {new Date().getFullYear()} {author.name}. Все права защищены.
          </p>
        </footer>
      </div>
    </AudioPlayerProvider>
  );
}
