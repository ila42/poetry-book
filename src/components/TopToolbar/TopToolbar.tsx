import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReaderTocPanel } from '@/components/ReaderTocPanel';
import type { TocItem } from '@/data/toc';
import styles from './TopToolbar.module.css';

interface TopToolbarProps {
  /** Пункты оглавления (стихи). Если передан — по клику hamburger открывается панель «Содержание» */
  tocItems?: TocItem[];
  /** Текущий индекс страницы книги (для подсветки в TOC) */
  currentPageIndex?: number;
  /** Переход на страницу книги по индексу (закрывает панель) */
  onNavigateToPage?: (pageIndex: number) => void;
}

export function TopToolbar({ tocItems = [], currentPageIndex = 0, onNavigateToPage }: TopToolbarProps) {
  const [open, setOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  const showToc = tocItems.length > 0 && onNavigateToPage !== undefined;

  const close = useCallback(() => {
    setOpen(false);
    setTocOpen(false);
    setSearchVisible(false);
  }, []);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const openToc = useCallback(() => setTocOpen(true), []);
  const closeToc = useCallback(() => setTocOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) === false &&
        hamburgerRef.current?.contains(target) === false
      ) {
        close();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, close]);

  const handleBack = () => {
    navigate(-1);
    close();
  };

  const handleTocSelect = useCallback(
    (pageIndex: number) => {
      onNavigateToPage?.(pageIndex);
      close();
    },
    [onNavigateToPage, close]
  );

  const handlePlayPause = () => {
    console.log('play/pause');
  };

  const handleSearch = () => {
    setSearchVisible((prev) => !prev);
    if (!searchVisible) console.log('search');
  };

  const handleSettings = () => {
    console.log('settings');
  };

  const handleList = () => {
    openToc();
  };

  const handleBookmark = () => {
    console.log('bookmark');
  };

  return (
    <>
      <button
        ref={hamburgerRef}
        type="button"
        className={styles.hamburger}
        onClick={toggle}
        aria-label={open ? 'Закрыть меню читалки' : 'Открыть меню читалки'}
        aria-expanded={open}
      >
        <span className={styles.hamburgerBar} />
        <span className={styles.hamburgerBar} />
        <span className={styles.hamburgerBar} />
      </button>

      {/* Backdrop: клик вне панели закрывает */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={close}
        onKeyDown={(e) => e.key === 'Escape' && close()}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.panelOpen : ''} ${tocOpen && showToc ? styles.tocPanel : ''}`}
        role={tocOpen && showToc ? 'dialog' : 'toolbar'}
        aria-label={tocOpen && showToc ? 'Содержание книги' : 'Панель читалки'}
      >
        {tocOpen && showToc ? (
          <div className={styles.tocPanelInner}>
            <button
              type="button"
              className={styles.tocBack}
              onClick={closeToc}
              aria-label="Вернуться к меню"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>К меню</span>
            </button>
            <div className={styles.tocListWrap}>
              <ReaderTocPanel
                items={tocItems}
                currentPageIndex={currentPageIndex}
                onSelect={handleTocSelect}
              />
            </div>
          </div>
        ) : (
          <div className={styles.toolbarInner}>
            {searchVisible ? (
              <div className={styles.searchRow}>
                <input
                  type="search"
                  placeholder="Поиск..."
                  className={styles.searchInput}
                  autoFocus
                  aria-label="Поиск"
                />
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => setSearchVisible(false)}
                  aria-label="Закрыть поиск"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={handleBack}
                  aria-label="Назад"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={handlePlayPause}
                  aria-label="Воспроизведение / пауза"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={handleSearch}
                  aria-label="Поиск"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={handleSettings}
                  aria-label="Настройки"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={handleList}
                  aria-label="Оглавление"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={handleBookmark}
                  aria-label="Закладка"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
