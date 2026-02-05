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

/**
 * Извлекает все стихи из content.json в формате Poem[]
 */
export function extractPoems(): Poem[] {
  const poems: Poem[] = [];
  
  (contentData.volumes as ContentVolume[]).forEach((volume) => {
    volume.parts.forEach((part) => {
      // Стихи напрямую в части (без глав)
      if (part.poems && part.poems.length > 0) {
        part.poems.forEach((poem) => {
          poems.push({
            id: poem.id,
            title: poem.title,
            content: poem.text,
            chapterId: part.id,
            audioUrl: poem.audioUrl || undefined,
            epigraph: poem.epigraph,
            dedication: poem.dedication,
          });
        });
      }
      
      // Стихи внутри глав
      if (part.chapters && part.chapters.length > 0) {
        part.chapters.forEach((chapter) => {
          if (chapter.poems && chapter.poems.length > 0) {
            chapter.poems.forEach((poem) => {
              poems.push({
                id: poem.id,
                title: poem.title,
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
 * Извлекает все главы/части из content.json в формате Chapter[]
 */
export function extractChapters(): Chapter[] {
  const chapters: Chapter[] = [];
  let order = 1;
  
  (contentData.volumes as ContentVolume[]).forEach((volume) => {
    volume.parts.forEach((part) => {
      // Если у части есть главы - добавляем главы
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
        // Если у части нет глав - сама часть становится "главой"
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

/**
 * Получает информацию о книге из content.json
 */
export function getBookInfo() {
  return {
    title: contentData.book.title,
    subtitle: contentData.book.version,
    author: contentData.book.author,
    year: contentData.book.year,
    epigraph: contentData.book.epigraph,
  };
}

// Экспорт готовых данных
export const contentPoems = extractPoems();
export const contentChapters = extractChapters();

/**
 * Получает случайный стих из доступных
 */
export function getRandomPoem(poems: Poem[] = contentPoems): Poem {
  const randomIndex = Math.floor(Math.random() * poems.length);
  return poems[randomIndex];
}

/**
 * Получает "Стихотворение дня" с обновлением раз в 24 часа.
 * Использует localStorage для сохранения выбора.
 */
export function getPoemOfTheDay(): Poem {
  if (typeof window === 'undefined') {
    return getRandomPoem(contentPoems);
  }

  const STORAGE_KEY = 'poem_of_the_day_data';
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      const { id, date } = JSON.parse(storedData);
      const lastDate = new Date(date).getTime();
      const now = new Date().getTime();

      // Если прошло меньше 24 часов
      if (now - lastDate < TWENTY_FOUR_HOURS) {
        const storedPoem = contentPoems.find(p => p.id === id);
        if (storedPoem) {
          return storedPoem;
        }
      }
    }
  } catch (e) {
    console.error('Error reading from localStorage', e);
  }

  // Если данных нет, прошло > 24ч или сохраненный стих не найден
  const newPoem = getRandomPoem(contentPoems);
  
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
