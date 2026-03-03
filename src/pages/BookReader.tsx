import { useState, useMemo, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Book } from '@/components/Book';
import { TopToolbar } from '@/components/TopToolbar';
import { AudioPlayerProvider, GlobalAudioPlayer } from '@/components/AudioPlayer';
import { SearchProvider } from '@/context/SearchContext';
import { getBookBySlug, getTocItemsForBook, author } from '@/data/books';
import { getFavoritePoemIds, toggleFavoritePoemId } from '@/data/favorites';

const READER_FONT_STORAGE_KEY = 'reader_font_size';
const READER_FONT_MIN = 14;
const READER_FONT_MAX = 22;

function getInitialReaderFontSize(): number {
  if (typeof window === 'undefined') return 16;
  try {
    const v = localStorage.getItem(READER_FONT_STORAGE_KEY);
    if (v != null) {
      const n = parseInt(v, 10);
      if (!Number.isNaN(n)) return Math.max(READER_FONT_MIN, Math.min(READER_FONT_MAX, n));
    }
  } catch {
    /* ignore */
  }
  return 16;
}

interface BookReaderProps {
  initialPageIndex?: number;
}

export function BookReader({ initialPageIndex = 0 }: BookReaderProps) {
  const { bookSlug = 'book-1' } = useParams<{ bookSlug: string }>();
  const bookData = useMemo(() => getBookBySlug(bookSlug), [bookSlug]);

  const [currentPage, setCurrentPage] = useState(initialPageIndex);
  const [readerFontSize, setReaderFontSize] = useState(getInitialReaderFontSize);
  const [favoritePoemIds, setFavoritePoemIds] = useState(() => getFavoritePoemIds(bookSlug));

  const tocItems = useMemo(() => {
    if (!bookData) return [];
    return getTocItemsForBook(bookData);
  }, [bookData]);

  const currentPoemId = useMemo(() => {
    const item = tocItems.find(
      (tocItem) => tocItem.pageIndex === currentPage && (tocItem.type === 'poem' || tocItem.type === 'poem-of-day')
    );
    if (!item || item.id === 'poem-of-the-day') return undefined;
    return item.id;
  }, [tocItems, currentPage]);

  const favoriteItems = useMemo(
    () => tocItems.filter((item) => item.id !== 'poem-of-the-day' && favoritePoemIds.includes(item.id)),
    [tocItems, favoritePoemIds]
  );

  const isInterlude = useMemo(() => {
    return tocItems.some(item => item.pageIndex === currentPage && item.type === 'interlude');
  }, [tocItems, currentPage]);

  const handleReaderFontSizeChange = useCallback((px: number) => {
    setReaderFontSize(px);
    try {
      localStorage.setItem(READER_FONT_STORAGE_KEY, String(px));
    } catch {
      /* ignore */
    }
  }, []);

  const handleToggleFavorite = useCallback((poemId: string) => {
    const next = toggleFavoritePoemId(poemId, bookSlug);
    setFavoritePoemIds(next);
  }, [bookSlug]);

  if (!bookData) {
    return <Navigate to="/" replace />;
  }

  return (
    <AudioPlayerProvider>
      <SearchProvider
        poems={bookData.poems}
        tocItems={tocItems}
        onNavigateToPage={setCurrentPage}
      >
        <div className={`min-h-screen transition-colors duration-300 ${isInterlude ? 'bg-black' : 'bg-white'}`}>
          <TopToolbar
            tocItems={tocItems}
            favoriteItems={favoriteItems}
            favoritePoemIds={favoritePoemIds}
            currentPoemId={currentPoemId}
            onToggleFavorite={handleToggleFavorite}
            currentPageIndex={currentPage}
            onNavigateToPage={setCurrentPage}
            readerFontSize={readerFontSize}
            onReaderFontSizeChange={handleReaderFontSizeChange}
          />

          <Book
            bookInfo={bookData.bookInfo}
            chapters={bookData.chapters}
            poems={bookData.poems}
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            readerFontSize={readerFontSize}
            bookSlug={bookSlug}
            tocData={bookData.tocData}
          />

          <GlobalAudioPlayer />

          {!isInterlude && (
            <footer className="py-6 text-center">
              <p className="text-gray-400 text-xs font-serif">
                &copy; {new Date().getFullYear()} {author.name}. Все права защищены.
              </p>
            </footer>
          )}
        </div>
      </SearchProvider>
    </AudioPlayerProvider>
  );
}
