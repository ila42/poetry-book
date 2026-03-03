import { Poem, Chapter } from '@/types';
import contentData from './content.json';

interface ContentPoem {
  id: string;
  number: number;
  title: string;
  alternateTitle?: string;
  firstLine?: string;
  text: string;
  audioUrl?: string | null;
  epigraph?: string;
  dedication?: string;
}

interface ContentChapter {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  poems?: ContentPoem[];
}

interface ContentPart {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  romanNumeral?: string;
  chapters?: ContentChapter[] | null;
  poems?: ContentPoem[];
}

interface ContentVolume {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  parts: ContentPart[];
}

export interface ContentDataShape {
  book: { title: string; author: string; year: string; version?: string; epigraph?: string };
  volumes: ContentVolume[];
}

/**
 * Извлекает все стихи из произвольного content-объекта в формате Poem[]
 */
export function extractPoemsFromData(data: ContentDataShape): Poem[] {
  const poems: Poem[] = [];
  
  (data.volumes as ContentVolume[]).forEach((volume) => {
    volume.parts.forEach((part) => {
      if (part.poems && part.poems.length > 0) {
        part.poems.forEach((poem) => {
          poems.push({
            id: poem.id,
            number: poem.number,
            title: poem.title,
            alternateTitle: poem.alternateTitle,
            content: poem.text,
            chapterId: part.id,
            audioUrl: poem.audioUrl || undefined,
            epigraph: poem.epigraph,
            dedication: poem.dedication,
          });
        });
      }
      
      if (part.chapters && part.chapters.length > 0) {
        part.chapters.forEach((chapter) => {
          if (chapter.poems && chapter.poems.length > 0) {
            chapter.poems.forEach((poem) => {
              poems.push({
                id: poem.id,
                number: poem.number,
                title: poem.title,
                alternateTitle: poem.alternateTitle,
                content: poem.text,
                chapterId: chapter.id,
                audioUrl: poem.audioUrl || undefined,
                epigraph: poem.epigraph,
                dedication: poem.dedication,
              });
            });
          }
        });
      }
    });
  });
  
  return poems;
}

/**
 * Извлекает все главы/части из произвольного content-объекта в формате Chapter[]
 */
export function extractChaptersFromData(data: ContentDataShape): Chapter[] {
  const chapters: Chapter[] = [];
  let order = 1;
  
  (data.volumes as ContentVolume[]).forEach((volume) => {
    volume.parts.forEach((part) => {
      if (part.chapters && part.chapters.length > 0) {
        part.chapters.forEach((chapter) => {
          chapters.push({
            id: chapter.id,
            title: chapter.title,
            subtitle: chapter.subtitle,
            order: order++,
          });
        });
      } else {
        chapters.push({
          id: part.id,
          title: part.title,
          subtitle: part.subtitle,
          order: order++,
        });
      }
    });
  });
  
  return chapters;
}

export function extractPoems(): Poem[] {
  return extractPoemsFromData(contentData as ContentDataShape);
}

export function extractChapters(): Chapter[] {
  return extractChaptersFromData(contentData as ContentDataShape);
}

export function getBookInfo() {
  return {
    title: contentData.book.title,
    subtitle: contentData.book.version,
    author: contentData.book.author,
    year: contentData.book.year,
    epigraph: contentData.book.epigraph,
  };
}

export const contentPoems = extractPoems();
export const contentChapters = extractChapters();

/**
 * Получает случайный стих из доступных
 */
export function getRandomPoem(poems: Poem[] = contentPoems): Poem {
  const randomIndex = Math.floor(Math.random() * poems.length);
  return poems[randomIndex];
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

/**
 * Получает "Стихотворение дня" с обновлением раз в 24 часа.
 * bookSlug позволяет хранить отдельный выбор для каждой книги.
 */
export function getPoemOfTheDay(bookSlug?: string, poems?: Poem[]): Poem {
  const pool = poems ?? contentPoems;

  if (typeof window === 'undefined') {
    return getRandomPoem(pool);
  }

  const STORAGE_KEY = bookSlug
    ? `poem_of_the_day_${bookSlug}`
    : 'poem_of_the_day_data';

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      const { id, date } = JSON.parse(storedData);
      const lastDate = new Date(date).getTime();
      const now = new Date().getTime();

      if (now - lastDate < TWENTY_FOUR_HOURS) {
        const storedPoem = pool.find(p => p.id === id);
        if (storedPoem) {
          return storedPoem;
        }
      }
    }
  } catch (e) {
    console.error('Error reading from localStorage', e);
  }

  const newPoem = getRandomPoem(pool);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      id: newPoem.id,
      date: new Date().toISOString()
    }));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }

  return newPoem;
}
