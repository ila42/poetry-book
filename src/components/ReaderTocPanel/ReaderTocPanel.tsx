import { useState, useMemo } from 'react';
import type { TocItem } from '@/data/toc';
import styles from './ReaderTocPanel.module.css';

interface ReaderTocPanelProps {
  items: TocItem[];
  currentPageIndex: number;
  onSelect: (pageIndex: number) => void;
  onClose?: () => void;
}

export function ReaderTocPanel({
  items,
  currentPageIndex,
  onSelect,
}: ReaderTocPanelProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [items, query]);

  const handleItemClick = (pageIndex: number) => {
    onSelect(pageIndex);
  };

  return (
    <div className={styles.root} role="navigation" aria-label="Содержание книги">
      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Поиск по названию..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Поиск по стихам"
        />
      </div>
      <div className={styles.list} role="list">
        {filtered.length === 0 ? (
          <p className={styles.empty}>Ничего не найдено</p>
        ) : (
          filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.item} ${currentPageIndex === item.pageIndex ? styles.itemActive : ''}`}
              onClick={() => handleItemClick(item.pageIndex)}
              role="listitem"
              aria-current={currentPageIndex === item.pageIndex ? 'true' : undefined}
            >
              <span className={styles.itemTitle}>{item.title}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
