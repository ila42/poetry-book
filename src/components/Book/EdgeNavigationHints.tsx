import { motion } from 'framer-motion';

interface EdgeNavigationHintsProps {
  visible?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

/**
 * Компонент для показа кликабельных стрелок навигации на краях экрана
 * Стрелки расположены вертикально в центре, минималистичны и не отвлекают
 */
export function EdgeNavigationHints({
  visible = true,
  onNextPage,
  onPrevPage,
}: EdgeNavigationHintsProps) {
  // Стрелки всегда видны, если visible = true
  if (!visible) return null;

  return (
    <>
      {/* Левая стрелка - предыдущая страница */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPrevPage?.();
        }}
        className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 
                   w-12 h-12 sm:w-14 sm:h-14
                   text-[#d4af37] hover:text-[#f4d03f]
                   transition-all duration-200
                   flex items-center justify-center
                   group backdrop-blur-sm bg-[#3d2817]/80 hover:bg-[#3d2817]/95 
                   border border-[#d4af37]/30 hover:border-[#d4af37]/50
                   rounded-full shadow-lg hover:shadow-xl
                   pointer-events-auto"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ opacity: 1, scale: 1.1, x: 2 }}
        whileTap={{ scale: 0.95 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.3 }}
        aria-label="Предыдущая страница"
        title="Предыдущая страница"
        data-no-flip
      >
        {/* Стрелка */}
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 relative z-10"
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
        className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 
                   w-12 h-12 sm:w-14 sm:h-14
                   text-[#d4af37] hover:text-[#f4d03f]
                   transition-all duration-200
                   flex items-center justify-center
                   group backdrop-blur-sm bg-[#3d2817]/80 hover:bg-[#3d2817]/95 
                   border border-[#d4af37]/30 hover:border-[#d4af37]/50
                   rounded-full shadow-lg hover:shadow-xl
                   pointer-events-auto"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ opacity: 1, scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.95 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.3 }}
        aria-label="Следующая страница"
        title="Следующая страница"
        data-no-flip
      >
        {/* Стрелка */}
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 relative z-10"
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

