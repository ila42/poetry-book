import { motion } from 'framer-motion';

interface EdgeNavigationHintsProps {
  visible?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

/**
 * Компонент для показа кликабельных стрелок навигации на краях экрана
 * На мобильных устройствах стрелки узкие (30px) и очень полупрозрачные
 * На десктопе - полноценные круглые кнопки
 */
export function EdgeNavigationHints({
  visible = true,
  onNextPage,
  onPrevPage,
}: EdgeNavigationHintsProps) {
  if (!visible) return null;

  // Общие стили для предотвращения выделения текста и улучшения touch-опыта
  const buttonStyle = {
    touchAction: 'manipulation' as const,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none' as const,
  };

  return (
    <>
      {/* Левая стрелка - предыдущая страница */}
      {/* На мобильных - узкая полупрозрачная полоса, на десктопе - круглая кнопка */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPrevPage?.();
        }}
        className="fixed left-0 sm:left-2 md:left-6 top-1/2 -translate-y-1/2
                   w-[30px] h-24 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14
                   text-[#d4af37]/70 sm:text-[#d4af37] 
                   hover:text-[#f4d03f] active:text-[#f4d03f]
                   transition-all duration-200
                   flex items-center justify-center
                   backdrop-blur-[2px] sm:backdrop-blur-sm
                   bg-[#3d2817]/30 sm:bg-[#3d2817]/70 md:bg-[#3d2817]/80
                   hover:bg-[#3d2817]/90 active:bg-[#3d2817]/95
                   border-r sm:border border-[#d4af37]/10 sm:border-[#d4af37]/30
                   hover:border-[#d4af37]/50 active:border-[#d4af37]/50
                   rounded-r-lg sm:rounded-full 
                   shadow-none sm:shadow-lg hover:shadow-xl
                   pointer-events-auto select-none"
        style={{ ...buttonStyle, zIndex: 200 }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0.7, x: 0 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        whileTap={{ scale: 0.9, opacity: 0.9 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
        aria-label="Предыдущая страница"
        title="Предыдущая страница"
        data-no-flip
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
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
        className="fixed right-0 sm:right-2 md:right-6 top-1/2 -translate-y-1/2
                   w-[30px] h-24 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14
                   text-[#d4af37]/70 sm:text-[#d4af37] 
                   hover:text-[#f4d03f] active:text-[#f4d03f]
                   transition-all duration-200
                   flex items-center justify-center
                   backdrop-blur-[2px] sm:backdrop-blur-sm
                   bg-[#3d2817]/30 sm:bg-[#3d2817]/70 md:bg-[#3d2817]/80
                   hover:bg-[#3d2817]/90 active:bg-[#3d2817]/95
                   border-l sm:border border-[#d4af37]/10 sm:border-[#d4af37]/30
                   hover:border-[#d4af37]/50 active:border-[#d4af37]/50
                   rounded-l-lg sm:rounded-full 
                   shadow-none sm:shadow-lg hover:shadow-xl
                   pointer-events-auto select-none"
        style={{ ...buttonStyle, zIndex: 200 }}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 0.7, x: 0 }}
        whileHover={{ opacity: 1, scale: 1.05 }}
        whileTap={{ scale: 0.9, opacity: 0.9 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        aria-label="Следующая страница"
        title="Следующая страница"
        data-no-flip
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </>
  );
}

