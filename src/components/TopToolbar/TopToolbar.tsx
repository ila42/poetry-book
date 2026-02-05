import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReaderTocPanel } from '@/components/ReaderTocPanel';
import { useSearchOptional } from '@/context/SearchContext';
import type { TocItem } from '@/data/toc';
import styles from './TopToolbar.module.css';

const READER_FONT_MIN = 14;
const READER_FONT_MAX = 22;
const READER_FONT_STEP = 1;
const READER_FONT_STORAGE_KEY = 'reader_font_size';

function getStoredFontSize(): number {
  if (typeof window === 'undefined') return 16;
  const v = localStorage.getItem(READER_FONT_STORAGE_KEY);
  if (v == null) return 16;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 16 : Math.max(READER_FONT_MIN, Math.min(READER_FONT_MAX, n));
}

/**
 * Подсвечивает совпадения в тексте
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = lowerText.indexOf(lowerQuery, lastIndex);
  let key = 0;
  
  while (matchIndex !== -1) {
    // Текст до совпадения
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }
    // Само совпадение (выделенное)
    parts.push(
      <mark key={key++} className="bg-yellow-200 text-inherit rounded px-0.5">
        {text.slice(matchIndex, matchIndex + lowerQuery.length)}
      </mark>
    );
    lastIndex = matchIndex + lowerQuery.length;
    matchIndex = lowerText.indexOf(lowerQuery, lastIndex);
  }
  
  // Остаток текста
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
}

interface TopToolbarProps {
  /** Пункты оглавления (стихи). Если передан — по клику hamburger открывается панель «Содержание» */
  tocItems?: TocItem[];
  /** Пункты избранного (стихи) */
  favoriteItems?: TocItem[];
  /** Идентификаторы избранных стихов */
  favoritePoemIds?: string[];
  /** Текущий стих (id), если пользователь на странице стиха */
  currentPoemId?: string;
  /** Переключить избранное для стиха */
  onToggleFavorite?: (poemId: string) => void;
  /** Текущий индекс страницы книги (для подсветки в TOC) */
  currentPageIndex?: number;
  /** Переход на страницу книги по индексу (закрывает панель) */
  onNavigateToPage?: (pageIndex: number) => void;
  /** Размер шрифта в зоне чтения (px) */
  readerFontSize?: number;
  /** Изменить размер шрифта (новое значение в px) */
  onReaderFontSizeChange?: (px: number) => void;
}

export function TopToolbar({
  tocItems = [],
  favoriteItems = [],
  favoritePoemIds = [],
  currentPoemId,
  onToggleFavorite,
  currentPageIndex = 0,
  onNavigateToPage,
  readerFontSize,
  onReaderFontSizeChange,
}: TopToolbarProps) {
  const [open, setOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Search context (optional - may not be available)
  const search = useSearchOptional();
  const searchVisible = search?.isSearchActive ?? false;

  const showToc = tocItems.length > 0 && onNavigateToPage !== undefined;
  const showFavorites = onNavigateToPage !== undefined;
  const isFavorite = currentPoemId ? favoritePoemIds.includes(currentPoemId) : false;
  const canToggleFavorite = Boolean(currentPoemId && onToggleFavorite);

  const close = useCallback(() => {
    setOpen(false);
    setTocOpen(false);
    setFavoritesOpen(false);
    search?.closeSearch();
  }, [search]);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const openToc = useCallback(() => {
    setFavoritesOpen(false);
    setTocOpen(true);
  }, []);
  const closeToc = useCallback(() => setTocOpen(false), []);

  const openFavorites = useCallback(() => {
    setTocOpen(false);
    setFavoritesOpen(true);
  }, []);
  const closeFavorites = useCallback(() => setFavoritesOpen(false), []);

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
    navigate('/');
    close();
  };

  const handleTocSelect = useCallback(
    (pageIndex: number) => {
      onNavigateToPage?.(pageIndex);
      close();
    },
    [onNavigateToPage, close]
  );

  const handleFavoritesSelect = useCallback(
    (pageIndex: number) => {
      onNavigateToPage?.(pageIndex);
      close();
    },
    [onNavigateToPage, close]
  );

  const handleSearch = useCallback(() => {
    if (search) {
      if (searchVisible) {
        search.closeSearch();
      } else {
        search.openSearch();
        // Фокус на поле ввода после открытия
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  }, [search, searchVisible]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    search?.setQuery(e.target.value);
  }, [search]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        search?.goToPrevResult();
      } else {
        search?.goToNextResult();
      }
    } else if (e.key === 'Escape') {
      search?.closeSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      search?.goToNextResult();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      search?.goToPrevResult();
    }
  }, [search]);

  const handleCloseSearch = useCallback(() => {
    search?.closeSearch();
  }, [search]);

  const fontSize = readerFontSize ?? getStoredFontSize();

  const handleFontDecrease = () => {
    const next = Math.max(READER_FONT_MIN, fontSize - READER_FONT_STEP);
    if (next !== fontSize) {
      onReaderFontSizeChange?.(next);
    }
  };

  const handleFontIncrease = () => {
    const next = Math.min(READER_FONT_MAX, fontSize + READER_FONT_STEP);
    if (next !== fontSize) {
      onReaderFontSizeChange?.(next);
    }
  };

  const handleList = () => {
    openToc();
  };

  const handleBookmark = () => {
    if (!currentPoemId || !onToggleFavorite) return;
    onToggleFavorite(currentPoemId);
  };

  const handleFavorites = () => {
    openFavorites();
  };

  return (
    <>
      <button
        type="button"
        className={styles.homeButton}
        onClick={handleBack}
        aria-label="На главную"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

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
        className={`${styles.panel} ${open ? styles.panelOpen : ''} ${tocOpen && showToc ? styles.tocPanel : ''} ${favoritesOpen && showFavorites ? styles.tocPanel : ''}`}
        role={tocOpen && showToc ? 'dialog' : favoritesOpen && showFavorites ? 'dialog' : 'toolbar'}
        aria-label={tocOpen && showToc ? 'Содержание книги' : favoritesOpen && showFavorites ? 'Избранные стихи' : 'Панель читалки'}
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
        ) : favoritesOpen && showFavorites ? (
          <div className={styles.tocPanelInner}>
            <button
              type="button"
              className={styles.tocBack}
              onClick={closeFavorites}
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
                items={favoriteItems}
                currentPageIndex={currentPageIndex}
                onSelect={handleFavoritesSelect}
                ariaLabel="Избранные стихи"
                searchPlaceholder="Поиск в избранном..."
                searchLabel="Поиск по избранному"
                emptyLabel="Пока нет избранных стихов"
              />
            </div>
          </div>
        ) : searchVisible && search ? (
          <div className={styles.searchPanel}>
            {/* Строка поиска */}
            <div className={styles.searchRow}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Поиск по книге..."
                className={styles.searchInput}
                value={search.query}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                autoFocus
                aria-label="Поиск по книге"
              />
              {/* Счётчик результатов */}
              {search.query.trim().length >= 2 && (
                <span className={styles.searchCount}>
                  {search.results.length > 0
                    ? `${search.results.length} стих.`
                    : 'не найдено'}
                </span>
              )}
              {/* Кнопка закрытия */}
              <button
                type="button"
                className={styles.iconButton}
                onClick={handleCloseSearch}
                aria-label="Закрыть поиск"
                title="Закрыть (Esc)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            {/* Список результатов */}
            {search.query.trim().length >= 2 && search.results.length > 0 && (
              <div className={styles.searchResults}>
                {search.results.map((result, index) => (
                  <button
                    key={result.poemId}
                    type="button"
                    className={`${styles.searchResultItem} ${index === search.currentResultIndex ? styles.searchResultItemActive : ''}`}
                    onClick={() => search.navigateToResult(result)}
                    onMouseEnter={() => search.selectResult(index)}
                  >
                    <span className={styles.searchResultTitle}>{result.title}</span>
                    {result.context && (
                      <span className={styles.searchResultContext}>
                        {highlightMatch(result.context, search.query)}
                      </span>
                    )}
                    <span className={styles.searchResultCount}>
                      {result.matchCount} совп.
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Подсказка если меньше 2 символов */}
            {search.query.trim().length > 0 && search.query.trim().length < 2 && (
              <div className={styles.searchHint}>
                Введите минимум 2 символа для поиска
              </div>
            )}
            
            {/* Ничего не найдено */}
            {search.query.trim().length >= 2 && search.results.length === 0 && (
              <div className={styles.searchEmpty}>
                Ничего не найдено по запросу «{search.query}»
              </div>
            )}
          </div>
        ) : (
          <div className={styles.toolbarInner}>
            <>
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
                  onClick={handleFontDecrease}
                  aria-label="Уменьшить шрифт"
                  disabled={fontSize <= READER_FONT_MIN}
                >
                  <span className={styles.fontButtonLabel}>A−</span>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={handleFontIncrease}
                  aria-label="Увеличить шрифт"
                  disabled={fontSize >= READER_FONT_MAX}
                >
                  <span className={styles.fontButtonLabel}>A+</span>
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
                  onClick={handleFavorites}
                  aria-label="Избранное"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21l-8-5-8 5V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
                    <path d="M8 10h8" />
                    <path d="M8 14h5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`${styles.iconButton} ${isFavorite ? styles.iconButtonActive : ''}`}
                  onClick={handleBookmark}
                  aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                  aria-pressed={isFavorite}
                  disabled={!canToggleFavorite}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
            </>
          </div>
        )}
      </div>
    </>
  );
}
