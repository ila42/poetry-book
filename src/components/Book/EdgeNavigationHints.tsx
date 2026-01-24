import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface EdgeNavigationHintsProps {
  edgePercentage?: number;
  visible?: boolean;
  hideDelay?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

/**
 * Компонент для показа кликабельных стрелок навигации на краях экрана
 * Стрелки расположены вертикально в центре, минималистичны и не отвлекают
 */
export function EdgeNavigationHints({
  edgePercentage = 15,
  visible = true,
  hideDelay = 3000,
  onNextPage,
  onPrevPage,
}: EdgeNavigationHintsProps) {
  const [showHints, setShowHints] = useState(visible);

  useEffect(() => {
    if (!visible) return;

    setShowHints(true);

    if (hideDelay > 0) {
      const timer = setTimeout(() => {
        setShowHints(false);
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [visible, hideDelay]);

  if (!showHints) return null;

  return (
    <>
      {/* Левая стрелка - предыдущая страница */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onPrevPage?.();
        }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 p-4 md:p-6
                   text-parchment-300 hover:text-parchment-100 
                   transition-all duration-200 hover:scale-110
                   flex items-center justify-center
                   group"
        style={{ width: `${edgePercentage}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        aria-label="Предыдущая страница"
        title="Нажмите для предыдущей страницы"
      >
        {/* Стрелка с фоном */}
        <div className="relative flex items-center justify-center">
          {/* Полупрозрачный фон при наведении */}
          <div className="absolute inset-0 rounded-full bg-parchment-100/0 group-hover:bg-parchment-100/10 
                          transition-colors duration-200" />
          
          {/* Стрелка */}
          <svg
            className="w-8 h-8 md:w-10 md:h-10 relative z-10"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </motion.button>

      {/* Правая стрелка - следующая страница */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onNextPage?.();
        }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 p-4 md:p-6
                   text-parchment-300 hover:text-parchment-100 
                   transition-all duration-200 hover:scale-110
                   flex items-center justify-center
                   group"
        style={{ width: `${edgePercentage}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        aria-label="Следующая страница"
        title="Нажмите для следующей страницы"
      >
        {/* Стрелка с фоном */}
        <div className="relative flex items-center justify-center">
          {/* Полупрозрачный фон при наведении */}
          <div className="absolute inset-0 rounded-full bg-parchment-100/0 group-hover:bg-parchment-100/10 
                          transition-colors duration-200" />
          
          {/* Стрелка */}
          <svg
            className="w-8 h-8 md:w-10 md:h-10 relative z-10"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </motion.button>
    </>
  );
}

