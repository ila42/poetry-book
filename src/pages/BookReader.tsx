import { useState, useMemo, useCallback } from 'react';
import { Book } from '@/components/Book';
import { TopToolbar } from '@/components/TopToolbar';
import { AudioPlayerProvider, GlobalAudioPlayer } from '@/components/AudioPlayer';
import { SearchProvider } from '@/context/SearchContext';
import { author, bookInfo } from '@/data/author';
import { contentChapters, contentPoems } from '@/data/contentHelpers';
import { getTocItems } from '@/data/toc';
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
  const [currentPage, setCurrentPage] = useState(initialPageIndex);
  const [readerFontSize, setReaderFontSize] = useState(getInitialReaderFontSize);
  const [favoritePoemIds, setFavoritePoemIds] = useState(() => getFavoritePoemIds());
  const tocItems = useMemo(() => getTocItems(bookInfo, contentPoems), [bookInfo, contentPoems]);

  const currentPoemId = useMemo(() => {
    const item = tocItems.find((tocItem) => tocItem.pageIndex === currentPage);
    if (!item || item.id === 'poem-of-the-day') return undefined;
    return item.id;
  }, [tocItems, currentPage]);

  const favoriteItems = useMemo(
    () => tocItems.filter((item) => item.id !== 'poem-of-the-day' && favoritePoemIds.includes(item.id)),
    [tocItems, favoritePoemIds]
  );

  const handleReaderFontSizeChange = useCallback((px: number) => {
    setReaderFontSize(px);
    try {
      localStorage.setItem(READER_FONT_STORAGE_KEY, String(px));
    } catch {
      /* ignore */
    }
  }, []);

  const handleToggleFavorite = useCallback((poemId: string) => {
    const next = toggleFavoritePoemId(poemId);
    setFavoritePoemIds(next);
  }, []);

  return (
    <AudioPlayerProvider>
      <SearchProvider
        poems={contentPoems}
        tocItems={tocItems}
        onNavigateToPage={setCurrentPage}
      >
        <div className="min-h-screen bg-white">
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
            bookInfo={bookInfo}
            chapters={contentChapters}
            poems={contentPoems}
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            readerFontSize={readerFontSize}
          />

          <GlobalAudioPlayer />

          <footer className="py-6 text-center">
            <p className="text-gray-400 text-xs font-serif">
              © {new Date().getFullYear()} {author.name}. Все права защищены.
            </p>
          </footer>
        </div>
      </SearchProvider>
    </AudioPlayerProvider>
  );
}
