import { RefObject, useEffect, useRef } from 'react';

const HIDE_DELAY_MS = 1200;
const SCROLLBAR_EDGE_PX = 14; // зона у правого края, считаем нажатием по ползунку

/**
 * Показывает ползунок при прокрутке (колёсико/палец) или при нажатии на него.
 * При нажатии на ползунок он остаётся видимым, пока им пользуются; скрывается после отпускания.
 */
export function useScrollbarReveal(elementRef: RefObject<HTMLElement | null>) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inUseRef = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const scheduleHide = () => {
      if (inUseRef.current) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        el.classList.remove('scrollbar-visible');
        timeoutRef.current = null;
      }, HIDE_DELAY_MS);
    };

    const show = () => {
      el.classList.add('scrollbar-visible');
      scheduleHide();
    };

    const isInScrollbarZone = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      return clientX >= rect.right - SCROLLBAR_EDGE_PX;
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      if (x === undefined || !isInScrollbarZone(x)) return;
      el.classList.add('scrollbar-visible');
      inUseRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const onPointerUp = () => {
      if (!inUseRef.current) return;
      inUseRef.current = false;
      scheduleHide();
    };

    el.addEventListener('wheel', show, { passive: true });
    el.addEventListener('touchmove', show, { passive: true });
    el.addEventListener('mousedown', onPointerDown);
    el.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchend', onPointerUp, { passive: true });

    return () => {
      el.removeEventListener('wheel', show);
      el.removeEventListener('touchmove', show);
      el.removeEventListener('mousedown', onPointerDown);
      el.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchend', onPointerUp);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [elementRef]);
}
