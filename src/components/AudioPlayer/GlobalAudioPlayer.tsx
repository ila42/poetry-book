import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from './AudioPlayerContext';

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    playlistMode,
    toggle,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    togglePlaylistMode,
    clearPlaylist,
  } = useAudioPlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Остановка всплытия событий (чтобы клик не запускал перелистывание книги)
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    stopPropagation(e);
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seek(percentage * duration);
  };

  // Handle volume with timeout
  const handleVolumeHover = () => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    setShowVolume(true);
  };

  const handleVolumeLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolume(false);
    }, 1000);
  };

  // Current track index in playlist
  const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);

  if (!currentTrack) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 global-audio-player"
      data-no-drag="true"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', damping: 25 }}
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
      {/* Playlist Panel */}
      <AnimatePresence>
        {showPlaylist && playlist.length > 0 && (
          <motion.div
            className="absolute bottom-full left-0 right-0 max-h-64 overflow-y-auto
                       bg-gradient-to-t from-leather-900 to-leather-950 
                       border-t border-burgundy-800/30 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display text-parchment-100 text-sm">
                  Плейлист главы
                </h4>
                <button
                  onClick={clearPlaylist}
                  className="text-parchment-400 hover:text-parchment-200 text-xs"
                >
                  Очистить
                </button>
              </div>
              <ul className="space-y-1">
                {playlist.map((track, index) => (
                  <li
                    key={track.id}
                    className={`
                      px-3 py-2 rounded cursor-pointer transition-colors
                      ${track.id === currentTrack?.id 
                        ? 'bg-burgundy-800/50 text-parchment-100' 
                        : 'text-parchment-300 hover:bg-burgundy-900/30'}
                    `}
                    onClick={() => {
                      // TODO: Implement track selection from playlist
                      // For now, clicking on playlist items doesn't change tracks
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-parchment-500 w-5">
                        {index + 1}
                      </span>
                      <span className="text-sm font-serif truncate">
                        {track.title}
                      </span>
                      {track.id === currentTrack?.id && isPlaying && (
                        <span className="ml-auto">
                          <span className="flex gap-0.5">
                            {[...Array(3)].map((_, i) => (
                              <motion.span
                                key={i}
                                className="w-0.5 bg-burgundy-400 rounded-full"
                                animate={{ height: [4, 12, 4] }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </span>
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Player */}
      <div className="bg-gradient-to-r from-leather-950 via-leather-900 to-leather-950 
                      border-t border-burgundy-800/50 shadow-2xl">
        {/* Decorative top border */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-burgundy-700/50 to-transparent" />
        
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <motion.div
                className="flex items-center gap-3"
                initial={false}
                animate={{ opacity: 1 }}
              >
                {/* Album Art / Icon */}
                <div className="w-12 h-12 rounded bg-burgundy-900/50 flex items-center justify-center
                                border border-burgundy-700/30 flex-shrink-0">
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-parchment-300 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <svg className="w-6 h-6 text-burgundy-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  )}
                </div>
                
                <div className="min-w-0">
                  <h3 className="font-serif text-parchment-100 text-sm truncate">
                    {currentTrack.title}
                  </h3>
                  {currentTrack.chapterTitle && (
                    <p className="text-parchment-400 text-xs truncate">
                      {currentTrack.chapterTitle}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                onClick={prevTrack}
                disabled={!playlistMode || (currentIndex <= 0 && currentTime < 3)}
                className="w-8 h-8 flex items-center justify-center rounded-full
                           text-parchment-300 hover:text-parchment-100 hover:bg-burgundy-800/30
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Предыдущий (Shift+←)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z"/>
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={toggle}
                disabled={isLoading}
                className="w-12 h-12 flex items-center justify-center rounded-full
                           bg-gradient-to-br from-burgundy-600 to-burgundy-800
                           text-parchment-100 hover:from-burgundy-500 hover:to-burgundy-700
                           shadow-lg hover:shadow-xl transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed
                           border border-burgundy-500/30"
                title="Воспроизведение/Пауза (Пробел)"
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-parchment-100 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                disabled={!playlistMode || currentIndex >= playlist.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-full
                           text-parchment-300 hover:text-parchment-100 hover:bg-burgundy-800/30
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Следующий (Shift+→)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-parchment-400 text-xs font-mono w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="flex-1 h-1.5 bg-burgundy-900 rounded-full cursor-pointer
                             group relative overflow-hidden"
                >
                  {/* Background track pattern */}
                  <div className="absolute inset-0 opacity-20"
                       style={{
                         backgroundImage: `repeating-linear-gradient(
                           90deg,
                           transparent,
                           transparent 2px,
                           rgba(139, 69, 69, 0.3) 2px,
                           rgba(139, 69, 69, 0.3) 4px
                         )`
                       }}
                  />
                  
                  {/* Progress fill */}
                  <motion.div
                    className="h-full bg-gradient-to-r from-burgundy-600 to-burgundy-400 rounded-full
                               relative"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  >
                    {/* Glow effect */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 
                                    bg-parchment-200 rounded-full opacity-0 group-hover:opacity-100
                                    shadow-[0_0_8px_rgba(250,246,242,0.5)] transition-opacity" />
                  </motion.div>
                </div>
                
                <span className="text-parchment-400 text-xs font-mono w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Volume */}
            <div 
              className="relative hidden md:block"
              onMouseEnter={handleVolumeHover}
              onMouseLeave={handleVolumeLeave}
            >
              <button
                onClick={toggleMute}
                className="w-8 h-8 flex items-center justify-center rounded-full
                           text-parchment-300 hover:text-parchment-100 hover:bg-burgundy-800/30
                           transition-all"
                title="Звук (M)"
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : volume < 0.5 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>

              <AnimatePresence>
                {showVolume && (
                  <motion.div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2
                               bg-leather-900 rounded-lg shadow-xl border border-burgundy-800/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-24 h-1.5 appearance-none bg-burgundy-800 rounded-full cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none
                                 [&::-webkit-slider-thumb]:w-3
                                 [&::-webkit-slider-thumb]:h-3
                                 [&::-webkit-slider-thumb]:rounded-full
                                 [&::-webkit-slider-thumb]:bg-parchment-200
                                 [&::-webkit-slider-thumb]:cursor-pointer
                                 [&::-webkit-slider-thumb]:shadow-md"
                      style={{
                        background: `linear-gradient(to right, #ab2146 0%, #ab2146 ${(isMuted ? 0 : volume) * 100}%, #5d3a2b ${(isMuted ? 0 : volume) * 100}%, #5d3a2b 100%)`
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Playlist Toggle */}
            {playlist.length > 0 && (
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`w-8 h-8 flex items-center justify-center rounded-full
                           transition-all ${showPlaylist 
                             ? 'bg-burgundy-700 text-parchment-100' 
                             : 'text-parchment-300 hover:text-parchment-100 hover:bg-burgundy-800/30'}`}
                title="Плейлист"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                </svg>
              </button>
            )}

            {/* Playlist Mode Toggle */}
            <button
              onClick={togglePlaylistMode}
              className={`w-8 h-8 flex items-center justify-center rounded-full
                         transition-all ${playlistMode 
                           ? 'bg-burgundy-700 text-parchment-100' 
                           : 'text-parchment-300 hover:text-parchment-100 hover:bg-burgundy-800/30'}`}
              title={playlistMode ? 'Автовоспроизведение вкл.' : 'Автовоспроизведение выкл.'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
              </svg>
            </button>

            {/* Expand/Collapse (mobile) */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 flex items-center justify-center rounded-full
                         text-parchment-300 hover:text-parchment-100 hover:bg-burgundy-800/30
                         transition-all sm:hidden"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
              </svg>
            </button>
          </div>

          {/* Mobile Progress Bar */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="mt-3 sm:hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-parchment-400 text-xs font-mono">
                    {formatTime(currentTime)}
                  </span>
                  
                  <div
                    ref={progressRef}
                    onClick={handleProgressClick}
                    className="flex-1 h-2 bg-burgundy-900 rounded-full cursor-pointer"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-burgundy-600 to-burgundy-400 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  
                  <span className="text-parchment-400 text-xs font-mono">
                    {formatTime(duration)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decorative bottom pattern */}
        <div className="h-1 bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950"
             style={{
               backgroundImage: `repeating-linear-gradient(
                 90deg,
                 rgba(139, 69, 69, 0.2),
                 rgba(139, 69, 69, 0.2) 1px,
                 transparent 1px,
                 transparent 8px
               )`
             }}
        />
      </div>
    </motion.div>
  );
}
