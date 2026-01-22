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
