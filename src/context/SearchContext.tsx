import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Poem } from '@/types';
import type { TocItem } from '@/data/toc';

export interface SearchResult {
  /** ID стиха */
  poemId: string;
  /** Название стиха */
  title: string;
  /** Индекс страницы для навигации */
  pageIndex: number;
  /** Контекст (фрагмент текста с совпадением) */
  context: string;
  /** Количество совпадений в этом стихе */
  matchCount: number;
}

interface SearchContextValue {
  /** Поисковый запрос */
  query: string;
  /** Установить запрос */
  setQuery: (q: string) => void;
  /** Активен ли режим поиска */
  isSearchActive: boolean;
  /** Включить режим поиска */
  openSearch: () => void;
  /** Закрыть режим поиска */
  closeSearch: () => void;
  /** Результаты поиска */
  results: SearchResult[];
  /** Общее количество совпадений */
  totalMatches: number;
  /** Индекс текущего выбранного результата */
  currentResultIndex: number;
  /** Выбрать результат по индексу */
  selectResult: (index: number) => void;
  /** Перейти к следующему результату */
  goToNextResult: () => void;
  /** Перейти к предыдущему результату */
  goToPrevResult: () => void;
  /** Перейти к выбранному стиху */
  navigateToResult: (result: SearchResult) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return ctx;
}

export function useSearchOptional() {
  return useContext(SearchContext);
}

interface SearchProviderProps {
  children: ReactNode;
  /** Все стихи книги */
  poems: Poem[];
  /** Элементы оглавления (для получения pageIndex) */
  tocItems: TocItem[];
  /** Callback для навигации к странице */
  onNavigateToPage?: (pageIndex: number) => void;
}

/**
 * Извлекает контекст вокруг первого совпадения
 */
function extractContext(text: string, query: string, contextLength: number = 60): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);
  
  if (matchIndex === -1) return '';
  
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(text.length, matchIndex + query.length + contextLength);
  
  let context = text.slice(start, end);
  
  // Добавляем многоточия если обрезали
  if (start > 0) context = '…' + context;
  if (end < text.length) context = context + '…';
  
  // Заменяем переносы строк на пробелы
  context = context.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  
  return context;
}

/**
 * Подсчитывает количество совпадений в тексте
 */
function countMatches(text: string, query: string): number {
  if (!query.trim()) return 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  let count = 0;
  let pos = 0;
  while ((pos = lowerText.indexOf(lowerQuery, pos)) !== -1) {
    count++;
    pos += lowerQuery.length;
  }
  return count;
}

export function SearchProvider({ children, poems, tocItems, onNavigateToPage }: SearchProviderProps) {
  const [query, setQueryState] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // Поиск по всем стихам
  const results = useMemo<SearchResult[]>(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery || trimmedQuery.length < 2) return [];

    const searchResults: SearchResult[] = [];

    poems.forEach((poem) => {
      const titleLower = poem.title.toLowerCase();
      const contentLower = poem.content.toLowerCase();
      
      const titleMatches = countMatches(titleLower, trimmedQuery);
      const contentMatches = countMatches(contentLower, trimmedQuery);
      const totalPoemMatches = titleMatches + contentMatches;
      
      if (totalPoemMatches > 0) {
        // Находим pageIndex из tocItems
        const tocItem = tocItems.find(item => item.id === poem.id);
        if (!tocItem) return;
        
        // Извлекаем контекст (приоритет: контент, затем заголовок)
        let context = '';
        if (contentMatches > 0) {
          context = extractContext(poem.content, trimmedQuery);
        } else if (titleMatches > 0) {
          context = extractContext(poem.title, trimmedQuery);
        }
        
        searchResults.push({
          poemId: poem.id,
          title: poem.title,
          pageIndex: tocItem.pageIndex,
          context,
          matchCount: totalPoemMatches,
        });
      }
    });

    return searchResults;
  }, [query, poems, tocItems]);

  // Общее количество совпадений
  const totalMatches = useMemo(() => {
    return results.reduce((sum, r) => sum + r.matchCount, 0);
  }, [results]);

  // Сброс индекса при изменении результатов
  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    setCurrentResultIndex(0);
  }, []);

  const openSearch = useCallback(() => {
    setIsSearchActive(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchActive(false);
    setQueryState('');
    setCurrentResultIndex(0);
  }, []);

  const selectResult = useCallback((index: number) => {
    if (index >= 0 && index < results.length) {
      setCurrentResultIndex(index);
    }
  }, [results.length]);

  const goToNextResult = useCallback(() => {
    if (results.length === 0) return;
    setCurrentResultIndex((prev) => (prev + 1) % results.length);
  }, [results.length]);

  const goToPrevResult = useCallback(() => {
    if (results.length === 0) return;
    setCurrentResultIndex((prev) => (prev - 1 + results.length) % results.length);
  }, [results.length]);

  const navigateToResult = useCallback((result: SearchResult) => {
    onNavigateToPage?.(result.pageIndex);
    closeSearch();
  }, [onNavigateToPage, closeSearch]);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        isSearchActive,
        openSearch,
        closeSearch,
        results,
        totalMatches,
        currentResultIndex,
        selectResult,
        goToNextResult,
        goToPrevResult,
        navigateToResult,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
