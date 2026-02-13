import { useState, useMemo } from 'react';
import type { TocItem } from '@/data/toc';
import styles from './ReaderTocPanel.module.css';

interface ReaderTocPanelProps {
  items: TocItem[];
  currentPageIndex: number;
  onSelect: (pageIndex: number) => void;
  onClose?: () => void;
  ariaLabel?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  emptyLabel?: string;
}

export function ReaderTocPanel({
  items,
  currentPageIndex,
  onSelect,
  ariaLabel = '\u0421\u043e\u0434\u0435\u0440\u0436\u0430\u043d\u0438\u0435 \u043a\u043d\u0438\u0433\u0438',
  searchPlaceholder = '\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e...',
  searchLabel = '\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0441\u0442\u0438\u0445\u0430\u043c',
  emptyLabel = '\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e',
}: ReaderTocPanelProps) {
  const [query, setQuery] = useState('');

  const formatPoemNumber = (num: number | undefined): string | null => {
    if (num === undefined) return null;
    return String(num).padStart(3, '0');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    // При поиске показываем только стихи, но сохраняем заголовки частей/глав,
    // если в них есть совпавшие стихи
    const matchingPoemIds = new Set<string>();
    const parentIds = new Set<string>();

    // Сначала находим все совпавшие стихи
    items.forEach((item) => {
      if (
        (item.type === 'poem' || item.type === 'poem-of-day') &&
        (item.title.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          (item.poemNumber !== undefined && String(item.poemNumber).includes(q)))
      ) {
        matchingPoemIds.add(item.id);
      }
    });

    if (matchingPoemIds.size === 0) return [];

    // Определяем, какие заголовки частей/глав нужно показать
    let lastPartId: string | undefined;
    let lastChapterId: string | undefined;
    items.forEach((item) => {
      if (item.type === 'part') lastPartId = item.id;
      else if (item.type === 'chapter') lastChapterId = item.id;
      else if (matchingPoemIds.has(item.id)) {
        if (lastPartId) parentIds.add(lastPartId);
        if (lastChapterId) parentIds.add(lastChapterId);
      }
    });

    return items.filter(
      (item) =>
        matchingPoemIds.has(item.id) || parentIds.has(item.id)
    );
  }, [items, query]);

  const handleItemClick = (pageIndex: number) => {
    if (pageIndex >= 0) {
      onSelect(pageIndex);
    }
  };

  return (
    <div className={styles.root} role="navigation" aria-label={ariaLabel}>
      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={searchLabel}
        />
      </div>
      <div className={styles.list} role="list">
        {filtered.length === 0 ? (
          <p className={styles.empty}>{emptyLabel}</p>
        ) : (
          filtered.map((item) => {
            // Заголовки частей
            if (item.type === 'part') {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.partHeader} ${currentPageIndex === item.pageIndex ? styles.itemActive : ''}`}
                  onClick={() => handleItemClick(item.pageIndex)}
                  role="listitem"
                  aria-current={currentPageIndex === item.pageIndex ? 'true' : undefined}
                >
                  <span className={styles.partTitle}>
                    {item.title}
                    {item.subtitle && (
                      <span className={styles.partSubtitle}> — {item.subtitle}</span>
                    )}
                  </span>
                </button>
              );
            }

            // Заголовки глав
            if (item.type === 'chapter') {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.chapterHeader} ${currentPageIndex === item.pageIndex ? styles.itemActive : ''}`}
                  onClick={() => handleItemClick(item.pageIndex)}
                  role="listitem"
                  aria-current={currentPageIndex === item.pageIndex ? 'true' : undefined}
                >
                  <span className={styles.chapterTitle}>
                    {item.title}
                    {item.subtitle && (
                      <span className={styles.chapterSubtitle}> — {item.subtitle}</span>
                    )}
                  </span>
                </button>
              );
            }

            // Интерлюдии - показываем как неактивный текст
            if (item.type === 'interlude') {
              return (
                <div
                  key={item.id}
                  className={styles.interludeHeader}
                  role="listitem"
                >
                  <span className={styles.interludeTitle}>[{item.title}]</span>
                </div>
              );
            }

            // Подразделы внутри главы (I. Вход, II. Ностос и т.п.)
            if (item.type === 'subsection') {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={styles.subsectionHeader}
                  onClick={() => handleItemClick(item.pageIndex)}
                  role="listitem"
                >
                  <span className={styles.subsectionTitle}>({item.title})</span>
                </button>
              );
            }

            // Стихотворение дня
            if (item.type === 'poem-of-day') {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.poemItem} ${currentPageIndex === item.pageIndex ? styles.itemActive : ''}`}
                  onClick={() => handleItemClick(item.pageIndex)}
                  role="listitem"
                  aria-current={currentPageIndex === item.pageIndex ? 'true' : undefined}
                >
                  <span className={styles.poemTitle}>
                    {item.poemNumber !== undefined && (
                      <span className={styles.poemNumber}>
                        {formatPoemNumber(item.poemNumber)}.
                      </span>
                    )}
                    <span className={styles.poemTitleText}>{item.title}</span>
                    <span className={styles.dots} />
                  </span>
                  {item.pageNumber !== undefined && (
                    <span className={styles.pageNum}>{item.pageNumber}</span>
                  )}
                </button>
              );
            }

            // Стихи
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.poemItem} ${currentPageIndex === item.pageIndex ? styles.itemActive : ''}`}
                onClick={() => handleItemClick(item.pageIndex)}
                role="listitem"
                aria-current={currentPageIndex === item.pageIndex ? 'true' : undefined}
              >
                <span className={styles.poemTitle}>
                  {item.poemNumber !== undefined && (
                    <span className={styles.poemNumber}>
                      {formatPoemNumber(item.poemNumber)}.
                    </span>
                  )}
                  <span className={styles.poemTitleText}>{item.title}</span>
                  <span className={styles.dots} />
                </span>
                {item.pageNumber !== undefined && (
                  <span className={styles.pageNum}>{item.pageNumber}</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
