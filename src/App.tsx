import { useState, useEffect } from 'react';
import { Book } from '@/components/Book';
import { AudioPlayerProvider, GlobalAudioPlayer } from '@/components/AudioPlayer';
import { AdminApp } from '@/admin';
import { author, bookInfo } from '@/data/author';
import { chapters } from '@/data/chapters';
import { poems } from '@/content/poems';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if we're on the admin route
    const checkRoute = () => {
      setIsAdmin(window.location.hash === '#/admin');
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  // Render admin panel
  if (isAdmin) {
    return <AdminApp />;
  }

  // Render main book site
  return (
    <AudioPlayerProvider>
      <div className="min-h-screen pb-20 leather-background">
        {/* Многослойный кожаный фон */}
        
        {/* Слой 1: Базовый градиент кожи */}
        <div className="fixed inset-0 leather-base" />
        
        {/* Слой 2: Текстура зерна кожи (мелкая) */}
        <div className="fixed inset-0 leather-grain-fine" />
        
        {/* Слой 3: Текстура зерна кожи (крупная) */}
        <div className="fixed inset-0 leather-grain-coarse" />
        
        {/* Слой 4: Световые блики и тени */}
        <div className="fixed inset-0 leather-highlights" />
        
        {/* Слой 5: Царапины и потёртости */}
        <div className="fixed inset-0 leather-wear" />
        
        {/* Слой 6: Виньетка */}
        <div className="fixed inset-0 leather-vignette" />
        
        {/* Книга */}
        <Book 
          bookInfo={bookInfo}
          author={author}
          chapters={chapters}
          poems={poems}
        />
        
        {/* Глобальный аудиоплеер */}
        <GlobalAudioPlayer />
        
        {/* Футер - выше плеера */}
        <footer className="fixed bottom-20 left-0 right-0 py-2 text-center pointer-events-none">
          <p className="text-parchment-200/40 text-xs font-serif">
            © {new Date().getFullYear()} {author.name}. Все права защищены.
          </p>
        </footer>
      </div>
    </AudioPlayerProvider>
  );
}

export default App;
