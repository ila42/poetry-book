import { RefObject, useEffect, useRef } from 'react';

interface UseSwipeNavigationOptions {
  onSwipeLeft: () => void;  // свайп влево = следующая страница
  onSwipeRight: () => void; // свайп вправо = предыдущая страница
  threshold?: number;       // минимальное расстояние свайпа в пикселях
  enabled?: boolean;
}

/**
 * Обнаруживает горизонтальные свайпы на touch-устройствах и вызывает
 * соответствующий коллбэк.
 *
 * Почему { passive: false } на touchmove:
 *   Chrome Android игнорирует e.preventDefault() на обработчиках,
 *   зарегистрированных как passive (или по умолчанию passive на document/body).
 *   Без preventDefault() браузер перехватывает горизонтальный жест под себя
 *   (навигация назад/вперёд или pull-to-refresh) и не генерирует click.
 *   passive: false — явное разрешение вызывать preventDefault().
 */
export function useSwipeNavigation(
  elementRef: RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight, threshold = 50, enabled = true }: UseSwipeNavigationOptions,
) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const isHorizontal = useRef<boolean | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = elementRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isHorizontal.current = null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      // Определяем направление жеста при первом значимом движении
      if (isHorizontal.current === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }

      // Если жест горизонтальный — блокируем дефолтное поведение браузера
      // (иначе Android Chrome перехватывает свайп под навигацию истории)
      if (isHorizontal.current) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;

      // Засчитываем только явно горизонтальный свайп нужной длины
      if (isHorizontal.current && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) {
          onSwipeLeft();
        } else {
          onSwipeRight();
        }
      }

      startX.current = null;
      startY.current = null;
      isHorizontal.current = null;
    };

    // touchstart может быть passive — preventDefault здесь не нужен
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    // touchmove ДОЛЖЕН быть { passive: false } — иначе Chrome игнорирует preventDefault
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, enabled, elementRef]);
}
