import { motion } from 'framer-motion';
import { useAudioPlayer, Track } from './AudioPlayerContext';

interface InlineAudioPlayerProps {
  track: Track;
  showChapterPlay?: boolean;
  chapterTracks?: Track[];
}

export function InlineAudioPlayer({ track, showChapterPlay, chapterTracks }: InlineAudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    play,
    pause,
    setPlaylist,
  } = useAudioPlayer();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;
  const isTrackLoading = isCurrentTrack && isLoading;

  // Остановка всплытия событий, чтобы клик не листал страницу книги
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  const handlePlay = (e: React.MouseEvent) => {
    stopPropagation(e);
    if (isCurrentTrack) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      play(track);
    }
  };

  const handlePlayChapter = (e: React.MouseEvent) => {
    stopPropagation(e);
    if (chapterTracks && chapterTracks.length > 0) {
      const trackIndex = chapterTracks.findIndex(t => t.id === track.id);
      setPlaylist(chapterTracks, trackIndex >= 0 ? trackIndex : 0);
      play(chapterTracks[trackIndex >= 0 ? trackIndex : 0]);
    }
  };

  return (
    <motion.div
      className="inline-audio-player bg-parchment-200/60 backdrop-blur-sm 
                 rounded-lg p-3 border border-burgundy-300/30
                 shadow-sm"
      data-no-drag="true"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      onClick={stopPropagation}
      onMouseDown={(e) => { stopPropagation(e); e.preventDefault(); }}
      onMouseUp={stopPropagation}
      onMouseMove={stopPropagation}
      onMouseEnter={stopPropagation}
      onMouseLeave={stopPropagation}
      onTouchStart={stopPropagation}
      onTouchEnd={stopPropagation}
      onTouchMove={stopPropagation}
    >
      <div className="flex items-center gap-3">
        {/* Play Button */}
        <button
          onClick={handlePlay}
          onMouseDown={stopPropagation}
          disabled={isTrackLoading}
          className="w-10 h-10 flex items-center justify-center rounded-full
                     bg-gradient-to-br from-burgundy-600 to-burgundy-800
                     text-parchment-100 hover:from-burgundy-500 hover:to-burgundy-700
                     shadow-md hover:shadow-lg transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     border border-burgundy-500/30"
          aria-label={isTrackPlaying ? 'Пауза' : 'Воспроизвести'}
        >
          {isTrackLoading ? (
            <motion.div
              className="w-4 h-4 border-2 border-parchment-100 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : isTrackPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-burgundy-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span className="text-sm font-serif text-ink-700 truncate">
              {isTrackPlaying ? 'Сейчас играет' : 'Прослушать'}
            </span>
          </div>
          
          {/* Animated bars when playing */}
          {isTrackPlaying && (
            <div className="flex items-end gap-0.5 mt-1 h-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-burgundy-500 rounded-full"
                  animate={{ 
                    height: [4, 12, 6, 10, 4],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Play Chapter Button */}
        {showChapterPlay && chapterTracks && chapterTracks.length > 1 && (
          <button
            onClick={handlePlayChapter}
            onMouseDown={stopPropagation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                       bg-burgundy-100/50 hover:bg-burgundy-200/50
                       text-burgundy-700 text-xs font-serif
                       border border-burgundy-300/50 transition-colors"
            title="Воспроизвести всю главу"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
            </svg>
            <span>Вся глава</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
