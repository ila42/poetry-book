import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 50;

/**
 * Подписка на location: при наличии location.hash выполняет плавный скролл к элементу.
 * Если элемент ещё не отрендерен, повторяет попытки через requestAnimationFrame/таймаут.
 */
export function useScrollToHash() {
  const location = useLocation();
  const attemptRef = useRef(0);

  useEffect(() => {
    const hash = location.hash;
    if (!hash || hash.length < 2) {
      attemptRef.current = 0;
      return;
    }

    const id = hash.slice(1);
    if (!id) return;

    const scrollToEl = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        attemptRef.current = 0;
        return true;
      }
      return false;
    };

    if (scrollToEl()) return;

    attemptRef.current = 0;
    const schedule = () => {
      attemptRef.current += 1;
      if (attemptRef.current > MAX_ATTEMPTS) return;
      if (scrollToEl()) return;
      requestAnimationFrame(() => {
        setTimeout(schedule, RETRY_DELAY_MS);
      });
    };
    const t = setTimeout(schedule, RETRY_DELAY_MS);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);
}
