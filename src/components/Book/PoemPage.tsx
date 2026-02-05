import { motion } from 'framer-motion';
import { Poem } from '@/types';
import { useAudioPlayer } from '@/components/AudioPlayer';
import type { Track } from '@/components/AudioPlayer';

interface PoemPageProps {
  poem: Poem;
  pageNumber?: number;
  isLeft?: boolean;
  chapterPoems?: Poem[];
  /** Режим читалки: белый фон, крупный текст, 1 страница = 1 стих */
  variant?: 'default' | 'reader';
  /** Показать надпись «Стихотворение дня» над заголовком (когда этот стих — стихотворение дня в книге) */
  showPoemOfTheDayLabel?: boolean;
}

export function PoemPage({ poem, pageNumber, isLeft, variant = 'default', showPoemOfTheDayLabel = false }: PoemPageProps) {
  const isReader = variant === 'reader';
  const hasTitle = Boolean(poem.title && poem.title.trim().length > 0);
  const hasMeta = Boolean(poem.dedication || poem.epigraph);
  const hasAudio = Boolean(poem.audioUrl?.trim());
  const { currentTrack, isPlaying, isLoading, play, pause } = useAudioPlayer();
  const track: Track | null = hasAudio ? { id: poem.id, title: poem.title, audioUrl: poem.audioUrl! } : null;
  const isCurrentTrack = track && currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track) return;
    if (isCurrentTrack) {
      if (isPlaying) pause();
      else play();
    } else {
      play(track);
    }
  };

  return (
    <motion.div
      className={`w-full flex flex-col ${isReader ? 'reader-poem-page flex-1 justify-center items-center' : 'page h-full'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-no-flip
    >
      <div className={`flex flex-col overflow-hidden w-full max-w-2xl ${isReader ? 'py-4 text-center' : 'flex-1 p-3 md:p-4'}`}>
        {showPoemOfTheDayLabel && (
          <div className="mb-3 text-center font-serif text-sm text-burgundy-600">
            Стихотворение дня
          </div>
        )}
        {hasTitle && (
          <h3 className={isReader ? 'reader-poem-title' : 'poem-title text-center shrink-0'}>
            {poem.title}
          </h3>
        )}

        {isReader && (
          <div className="flex justify-center my-2 shrink-0">
            <button
              type="button"
              onClick={hasAudio ? handleAudioClick : undefined}
              disabled={hasAudio ? (isLoading && Boolean(isCurrentTrack)) : undefined}
              className={`flex items-center justify-center w-10 h-10 rounded-full bg-burgundy-100/80 text-burgundy-700 border border-burgundy-300/50 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${hasAudio ? 'hover:bg-burgundy-200/80 hover:shadow' : 'opacity-70 cursor-default'}`}
              aria-label={hasAudio ? (isTrackPlaying ? 'Пауза' : 'Прослушать') : 'Аудио недоступно'}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        )}

        {(hasTitle || isReader) && <div className="divider shrink-0 mx-auto" />}

        {hasMeta && (
          <div
            className={`mb-4 text-sm italic text-ink-600 ${isReader ? 'text-center' : ''} whitespace-pre-line`}
          >
            {poem.dedication && <div>{poem.dedication}</div>}
            {poem.epigraph && <div>{poem.epigraph}</div>}
          </div>
        )}

        <div
          className={
            isReader
              ? 'reader-poem-text flex-1 overflow-y-auto overflow-x-hidden text-center'
              : 'poem-text flex-1 overflow-y-auto overflow-x-hidden pr-2'
          }
          style={{
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: isReader ? 'rgba(0,0,0,0.2) transparent' : 'rgba(122, 29, 57, 0.4) transparent',
          }}
        >
          {poem.content}
        </div>
      </div>

      {pageNumber !== undefined && !isReader && (
        <div className={`page-number ${isLeft ? 'page-number-left' : 'page-number-right'}`}>
          {pageNumber}
        </div>
      )}
    </motion.div>
  );
}
