import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  audioUrl: string;
  chapterId?: string;
  chapterTitle?: string;
}

interface AudioPlayerContextType {
  // State
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  playlistMode: boolean;
  
  // Actions
  play: (track?: Track) => void;
  pause: () => void;
  toggle: () => void;
  setTrack: (track: Track) => void;
  setPlaylist: (tracks: Track[], startIndex?: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  togglePlaylistMode: () => void;
  clearPlaylist: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playlistMode, setPlaylistMode] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (playlistMode && currentIndex < playlist.length - 1) {
        nextTrack();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [playlistMode, currentIndex, playlist.length]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          toggle();
          break;
        case 'ArrowLeft':
          if (e.shiftKey) {
            prevTrack();
          } else {
            seek(Math.max(0, currentTime - 10));
          }
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            nextTrack();
          } else {
            seek(Math.min(duration, currentTime + 10));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, volume]);

  // Preload next track
  useEffect(() => {
    if (playlistMode && currentIndex < playlist.length - 1) {
      const nextAudio = new Audio();
      nextAudio.preload = 'metadata';
      nextAudio.src = playlist[currentIndex + 1].audioUrl;
    }
  }, [currentIndex, playlist, playlistMode]);

  const play = useCallback((track?: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (track) {
      setCurrentTrack(track);
      audio.src = track.audioUrl;
      audio.load();
    }

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.error('Playback failed:', err);
      setIsPlaying(false);
    });
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (currentTrack) {
      play();
    }
  }, [isPlaying, currentTrack, play, pause]);

  const setTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    const audio = audioRef.current;
    if (audio) {
      audio.src = track.audioUrl;
      audio.load();
    }
  }, []);

  const setPlaylist = useCallback((tracks: Track[], startIndex = 0) => {
    setPlaylistState(tracks);
    setCurrentIndex(startIndex);
    if (tracks.length > 0) {
      setTrack(tracks[startIndex]);
      setPlaylistMode(true);
    }
  }, [setTrack]);

  const nextTrack = useCallback(() => {
    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      play(playlist[nextIndex]);
    }
  }, [currentIndex, playlist, play]);

  const prevTrack = useCallback(() => {
    if (currentTime > 3) {
      // If more than 3 seconds in, restart current track
      seek(0);
    } else if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      play(playlist[prevIndex]);
    }
  }, [currentIndex, currentTime, playlist, play]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      setVolumeState(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const togglePlaylistMode = useCallback(() => {
    setPlaylistMode(prev => !prev);
  }, []);

  const clearPlaylist = useCallback(() => {
    setPlaylistState([]);
    setCurrentIndex(0);
    setPlaylistMode(false);
  }, []);

  const value: AudioPlayerContextType = {
    currentTrack,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    playlistMode,
    play,
    pause,
    toggle,
    setTrack,
    setPlaylist,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    togglePlaylistMode,
    clearPlaylist,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}
