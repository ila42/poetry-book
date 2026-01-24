import { useEffect } from 'react';

interface UseEdgeClickNavigationOptions {
  onNextPage: () => void;
  onPrevPage: () => void;
  edgePercentage?: number; // Процент от края (по умолчанию 15%)
  enabled?: boolean; // Можно отключить
}

/**
 * Хук для навигации по клику на края экрана
 * Обеспечивает безопасность: не срабатывает на интерактивных элементах
 */
export function useEdgeClickNavigation({
  onNextPage,
  onPrevPage,
  edgePercentage = 15,
  enabled = true,
}: UseEdgeClickNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // ===== Исключения: НЕ срабатываем на интерактивных элементах =====
      
      // 1. Кнопки, ссылки, инпуты
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return;
      }

      // 2. Элементы с data-no-click-nav атрибутом
      if (target.closest('[data-no-click-nav]')) {
        return;
      }

      // 3. Специфические интерактивные классы
      if (
        target.closest('nav') ||
        target.closest('.interactive') ||
        target.closest('.modal') ||
        target.closest('.dropdown') ||
        target.closest('.menu')
      ) {
        return;
      }

      // 4. Если пользователь выделяет текст - не срабатываем
      // (проверяем, есть ли выделенный текст)
      if (window.getSelection()?.toString()) {
        return;
      }

      // ===== Определяем зону клика =====
      const clientX = e.clientX;
      const windowWidth = window.innerWidth;
      const edgeWidth = (windowWidth * edgePercentage) / 100;

      // Правая зона - переход на следующую страницу
      if (clientX > windowWidth - edgeWidth) {
        e.preventDefault?.();
        onNextPage();
        return;
      }

      // Левая зона - переход на предыдущую страницу (опционально)
      if (clientX < edgeWidth) {
        e.preventDefault?.();
        onPrevPage();
        return;
      }
    };

    // Добавляем обработчик клика
    document.addEventListener('click', handleClick, true); // true = capture phase

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [onNextPage, onPrevPage, edgePercentage, enabled]);
}
