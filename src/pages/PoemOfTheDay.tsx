import { BookReader } from './BookReader';
import { getPoemOfTheDayPageIndex } from '@/data/toc';
import { bookInfo } from '@/data/author';

export function PoemOfTheDay() {
  return <BookReader initialPageIndex={getPoemOfTheDayPageIndex(bookInfo)} />;
}
