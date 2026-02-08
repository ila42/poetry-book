content = r"""import { useState, useMemo } from 'react';
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
  ariaLabel = """ + repr('\u0421\u043e\u0434\u0435\u0440\u0436\u0430\u043d\u0438\u0435 \u043a\u043d\u0438\u0433\u0438') + """,
  searchPlaceholder = """ + repr('\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e...') + """,
  searchLabel = """ + repr('\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0441\u0442\u0438\u0445\u0430\u043c') + """,
  emptyLabel = """ + repr('\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e') + r""",
}: ReaderTocPanelProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.poemNumber !== undefined && String(item.poemNumber).includes(q))
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
          filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.poemItem} ${currentPageIndex === item.pageIndex ? styles.itemActive : ''}`}
              onClick={() => handleItemClick(item.pageIndex)}
              role="listitem"
              aria-current={currentPageIndex === item.pageIndex ? 'true' : undefined}
            >
              <span className={styles.poemTitle}>
                <span className={styles.poemTitleText}>{item.title}</span>
                <span className={styles.dots} />
              </span>
              {item.pageNumber !== undefined && (
                <span className={styles.pageNum}>{item.pageNumber}</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
"""

with open(r'c:\dev\poetry-book-clean\src\components\ReaderTocPanel\ReaderTocPanel.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('Done')
