import { Link } from 'react-router-dom';
import { Book } from '@/components/Book';
import { AudioPlayerProvider, GlobalAudioPlayer } from '@/components/AudioPlayer';
import { author, bookInfo } from '@/data/author';
import { chapters } from '@/data/chapters';
import { poems } from '@/content/poems';

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
        
        {/* Кнопка "Назад на главную" */}
        <Link
          to="/"
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2
                     bg-parchment-100/90 backdrop-blur-sm rounded-md
                     text-burgundy-800 font-serif text-sm
                     hover:bg-parchment-50 transition-colors duration-200
                     shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>На главную</span>
        </Link>
        
        {/* Книга */}
        <Book 
          bookInfo={bookInfo}
          chapters={chapters}
          poems={poems}
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
