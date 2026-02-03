import { useState, useMemo } from 'react';
import { Book } from '@/components/Book';
import { TopToolbar } from '@/components/TopToolbar';
import { AudioPlayerProvider, GlobalAudioPlayer } from '@/components/AudioPlayer';
import { author, bookInfo } from '@/data/author';
import { contentChapters, contentPoems } from '@/data/contentHelpers';
import { getTocItems } from '@/data/toc';

export function BookReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const tocItems = useMemo(() => getTocItems(bookInfo, contentPoems), [bookInfo, contentPoems]);

  return (
    <AudioPlayerProvider>
      <div className="min-h-screen bg-white">
        <TopToolbar
          tocItems={tocItems}
          currentPageIndex={currentPage}
          onNavigateToPage={setCurrentPage}
        />

        <Book
          bookInfo={bookInfo}
          chapters={contentChapters}
          poems={contentPoems}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
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
