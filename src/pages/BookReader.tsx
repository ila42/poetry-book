import { useState, useMemo, useCallback } from 'react';
import { Book } from '@/components/Book';
import { TopToolbar } from '@/components/TopToolbar';
import { AudioPlayerProvider, GlobalAudioPlayer } from '@/components/AudioPlayer';
import { author, bookInfo } from '@/data/author';
import { contentChapters, contentPoems } from '@/data/contentHelpers';
import { getTocItems } from '@/data/toc';

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

export function BookReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const [readerFontSize, setReaderFontSize] = useState(getInitialReaderFontSize);
  const tocItems = useMemo(() => getTocItems(bookInfo, contentPoems), [bookInfo, contentPoems]);

  const handleReaderFontSizeChange = useCallback((px: number) => {
    setReaderFontSize(px);
    try {
      localStorage.setItem(READER_FONT_STORAGE_KEY, String(px));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-white">
        <TopToolbar
          tocItems={tocItems}
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
    </AudioPlayerProvider>
  );
}
