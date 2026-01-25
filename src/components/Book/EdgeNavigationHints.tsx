import { motion } from 'framer-motion';

interface EdgeNavigationHintsProps {
  visible?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

/**
 * Компонент для показа кликабельных стрелок навигации на краях экрана
 * На мобильных устройствах стрелки меньше и полупрозрачные
 * Стрелки расположены вертикально в центре, минималистичны и не отвлекают
 */
export function EdgeNavigationHints({
  visible = true,
  onNextPage,
  onPrevPage,
}: EdgeNavigationHintsProps) {
  // Стрелки всегда видны, если visible = true
  if (!visible) return null;

  // Общие стили для предотвращения выделения текста и улучшения touch-опыта
  const buttonStyle = {
    touchAction: 'manipulation' as const, // Предотвращает zoom при double-tap
    WebkitTapHighlightColor: 'transparent', // Убирает подсветку при тапе на iOS
    userSelect: 'none' as const, // Предотвращает выделение текста
  };

  return (
    <>
      {/* Левая стрелка - предыдущая страница */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPrevPage?.();
        }}
        className="fixed left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-50 
                   w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                   text-[#d4af37] hover:text-[#f4d03f] active:text-[#f4d03f]
                   transition-all duration-200
                   flex items-center justify-center
                   group backdrop-blur-sm 
                   bg-[#3d2817]/60 sm:bg-[#3d2817]/80 
                   hover:bg-[#3d2817]/95 active:bg-[#3d2817]/95
                   border border-[#d4af37]/20 sm:border-[#d4af37]/30 
                   hover:border-[#d4af37]/50 active:border-[#d4af37]/50
                   rounded-full shadow-md sm:shadow-lg hover:shadow-xl
                   pointer-events-auto select-none"
        style={buttonStyle}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ opacity: 1, scale: 1.1, x: 2 }}
        whileTap={{ scale: 0.9, opacity: 0.8 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.3 }}
        aria-label="Предыдущая страница"
        title="Предыдущая страница"
        data-no-flip
      >
        {/* Стрелка - адаптивный размер */}
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 relative z-10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      {/* Правая стрелка - следующая страница */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNextPage?.();
        }}
        className="fixed right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 
                   w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                   text-[#d4af37] hover:text-[#f4d03f] active:text-[#f4d03f]
                   transition-all duration-200
                   flex items-center justify-center
                   group backdrop-blur-sm 
                   bg-[#3d2817]/60 sm:bg-[#3d2817]/80 
                   hover:bg-[#3d2817]/95 active:bg-[#3d2817]/95
                   border border-[#d4af37]/20 sm:border-[#d4af37]/30 
                   hover:border-[#d4af37]/50 active:border-[#d4af37]/50
                   rounded-full shadow-md sm:shadow-lg hover:shadow-xl
                   pointer-events-auto select-none"
        style={buttonStyle}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ opacity: 1, scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9, opacity: 0.8 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.3 }}
        aria-label="Следующая страница"
        title="Следующая страница"
        data-no-flip
      >
        {/* Стрелка - адаптивный размер */}
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 relative z-10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </>
  );
}

