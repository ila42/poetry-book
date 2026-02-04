import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BookReader } from './BookReader';
import { contentPoems } from '@/data/contentHelpers';
import { bookInfo } from '@/data/author';
import { getTocItems } from '@/data/toc';

export function PoemRoute() {
  const { poemId } = useParams();

  const pageIndex = useMemo(() => {
    if (!poemId) return null;
    const tocItems = getTocItems(bookInfo, contentPoems);
    const target = tocItems.find((item) => item.id === poemId);
    return target?.pageIndex ?? null;
  }, [poemId]);

  if (!poemId || pageIndex == null) {
    return <Navigate to="/read" replace />;
  }

  return <BookReader key={poemId} initialPageIndex={pageIndex} />;
}
