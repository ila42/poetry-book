import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Poem {
  id: string;
  number: number;
  title: string;
  alternateTitle?: string;
  firstLine: string;
  text: string;
  audioUrl: string;
  isNew?: boolean;
  isDiptych?: boolean;
  isTriptych?: boolean;
}

export interface Chapter {
  id: string;
  number: number | null;
  title: string;
  subtitle: string | null;
  isIntermezzo?: boolean;
  poems: Poem[];
}

export interface Part {
  id: string;
  number: number | null;
  title: string;
  subtitle: string | null;
  romanNumeral?: string;
  isEpilogue?: boolean;
  chapters: Chapter[] | null;
  poems?: Poem[];
}

export interface Volume {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  parts: Part[];
}

export interface BookData {
  book: {
    title: string;
    author: string;
    year: number | string; // Поддерживает диапазон вида "1980-2025"
    version: string;
    epigraph?: string | {
      text: string;
      source: string;
    };
    afterword?: string;
  };
  volumes: Volume[];
}

interface ContentContextType {
  data: BookData | null;
  loading: boolean;
  error: string | null;
  saveData: (newData: BookData) => void;
  addPoem: (volumeId: string, partId: string, chapterId: string | null, poem: Poem) => void;
  updatePoem: (poemId: string, updates: Partial<Poem>) => void;
  deletePoem: (poemId: string) => void;
  addChapter: (volumeId: string, partId: string, chapter: Chapter) => void;
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void;
  deleteChapter: (chapterId: string) => void;
  addPart: (volumeId: string, part: Part) => void;
  updatePart: (partId: string, updates: Partial<Part>) => void;
  deletePart: (partId: string) => void;
  updateBook: (updates: Partial<BookData['book']>) => void;
  reorderPoems: (chapterId: string, poemIds: string[]) => void;
  reorderChapters: (partId: string, chapterIds: string[]) => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return context;
}

interface ContentProviderProps {
  children: ReactNode;
}

export function ContentProvider({ children }: ContentProviderProps) {
  const [data, setData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage or import from content.json
  useEffect(() => {
    const loadData = async () => {
      try {
        // First try localStorage
        const savedData = localStorage.getItem('book_content');
        if (savedData) {
          setData(JSON.parse(savedData));
        } else {
          // Load from content.json
          const response = await import('@/data/content.json');
          setData(response.default as BookData);
        }
      } catch (err) {
        setError('Failed to load content data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data to localStorage
  const saveData = (newData: BookData) => {
    setData(newData);
    localStorage.setItem('book_content', JSON.stringify(newData));
  };

  // Helper to find and update nested data (available for future use)
  const _findAndUpdate = <T,>(
    items: T[],
    predicate: (item: T) => boolean,
    updater: (item: T) => T
  ): T[] => {
    return items.map(item => predicate(item) ? updater(item) : item);
  };
  void _findAndUpdate; // Suppress unused warning

  // Add poem
  const addPoem = (volumeId: string, partId: string, chapterId: string | null, poem: Poem) => {
    if (!data) return;
    
    const newData = { ...data };
    newData.volumes = newData.volumes.map(vol => {
      if (vol.id !== volumeId) return vol;
      return {
        ...vol,
        parts: vol.parts.map(part => {
          if (part.id !== partId) return part;
          
          if (chapterId && part.chapters) {
            return {
              ...part,
              chapters: part.chapters.map(ch => {
                if (ch.id !== chapterId) return ch;
                return { ...ch, poems: [...ch.poems, poem] };
              }),
            };
          } else if (part.poems) {
            return { ...part, poems: [...part.poems, poem] };
          }
          return part;
        }),
      };
    });
    
    saveData(newData);
  };

  // Update poem
  const updatePoem = (poemId: string, updates: Partial<Poem>) => {
    if (!data) return;
    
    const newData = JSON.parse(JSON.stringify(data)) as BookData;
    
    for (const vol of newData.volumes) {
      for (const part of vol.parts) {
        if (part.chapters) {
          for (const ch of part.chapters) {
            const poemIndex = ch.poems.findIndex(p => p.id === poemId);
            if (poemIndex !== -1) {
              ch.poems[poemIndex] = { ...ch.poems[poemIndex], ...updates };
              saveData(newData);
              return;
            }
          }
        }
        if (part.poems) {
          const poemIndex = part.poems.findIndex(p => p.id === poemId);
          if (poemIndex !== -1) {
            part.poems[poemIndex] = { ...part.poems[poemIndex], ...updates };
            saveData(newData);
            return;
          }
        }
      }
    }
  };

  // Delete poem
  const deletePoem = (poemId: string) => {
    if (!data) return;
    
    const newData = JSON.parse(JSON.stringify(data)) as BookData;
    
    for (const vol of newData.volumes) {
      for (const part of vol.parts) {
        if (part.chapters) {
          for (const ch of part.chapters) {
            ch.poems = ch.poems.filter(p => p.id !== poemId);
          }
        }
        if (part.poems) {
          part.poems = part.poems.filter(p => p.id !== poemId);
        }
      }
    }
    
    saveData(newData);
  };

  // Add chapter
  const addChapter = (volumeId: string, partId: string, chapter: Chapter) => {
    if (!data) return;
    
    const newData = { ...data };
    newData.volumes = newData.volumes.map(vol => {
      if (vol.id !== volumeId) return vol;
      return {
        ...vol,
        parts: vol.parts.map(part => {
          if (part.id !== partId) return part;
          return {
            ...part,
            chapters: [...(part.chapters || []), chapter],
          };
        }),
      };
    });
    
    saveData(newData);
  };

  // Update chapter
  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    if (!data) return;
    
    const newData = JSON.parse(JSON.stringify(data)) as BookData;
    
    for (const vol of newData.volumes) {
      for (const part of vol.parts) {
        if (part.chapters) {
          const chIndex = part.chapters.findIndex(ch => ch.id === chapterId);
          if (chIndex !== -1) {
            part.chapters[chIndex] = { ...part.chapters[chIndex], ...updates };
            saveData(newData);
            return;
          }
        }
      }
    }
  };

  // Delete chapter
  const deleteChapter = (chapterId: string) => {
    if (!data) return;
    
    const newData = JSON.parse(JSON.stringify(data)) as BookData;
    
    for (const vol of newData.volumes) {
      for (const part of vol.parts) {
        if (part.chapters) {
          part.chapters = part.chapters.filter(ch => ch.id !== chapterId);
        }
      }
    }
    
    saveData(newData);
  };

  // Add part
  const addPart = (volumeId: string, part: Part) => {
    if (!data) return;
    
    const newData = { ...data };
    newData.volumes = newData.volumes.map(vol => {
      if (vol.id !== volumeId) return vol;
      return { ...vol, parts: [...vol.parts, part] };
    });
    
    saveData(newData);
  };

  // Update part
  const updatePart = (partId: string, updates: Partial<Part>) => {
    if (!data) return;
    
    const newData = JSON.parse(JSON.stringify(data)) as BookData;
    
    for (const vol of newData.volumes) {
      const partIndex = vol.parts.findIndex(p => p.id === partId);
      if (partIndex !== -1) {
        vol.parts[partIndex] = { ...vol.parts[partIndex], ...updates };
        saveData(newData);
        return;
      }
    }
  };

  // Delete part
  const deletePart = (partId: string) => {
    if (!data) return;
    
    const newData = { ...data };
    newData.volumes = newData.volumes.map(vol => ({
      ...vol,
      parts: vol.parts.filter(p => p.id !== partId),
    }));
    
    saveData(newData);
  };

  // Update book info
  const updateBook = (updates: Partial<BookData['book']>) => {
    if (!data) return;
    saveData({ ...data, book: { ...data.book, ...updates } });
  };

  // Reorder poems
  const reorderPoems = (chapterId: string, poemIds: string[]) => {
    if (!data) return;
    
    const newData = JSON.parse(JSON.stringify(data)) as BookData;
    
    for (const vol of newData.volumes) {
      for (const part of vol.parts) {
        if (part.chapters) {
          const chapter = part.chapters.find(ch => ch.id === chapterId);
          if (chapter) {
            const poemMap = new Map(chapter.poems.map(p => [p.id, p]));
            chapter.poems = poemIds.map(id => poemMap.get(id)!).filter(Boolean);
            saveData(newData);
            return;
          }
        }
      }
    }
  };

  // Reorder chapters
  const reorderChapters = (partId: string, chapterIds: string[]) => {
    if (!data) return;
    
    const newData = JSON.parse(JSON.stringify(data)) as BookData;
    
    for (const vol of newData.volumes) {
      const part = vol.parts.find(p => p.id === partId);
      if (part && part.chapters) {
        const chapterMap = new Map(part.chapters.map(ch => [ch.id, ch]));
        part.chapters = chapterIds.map(id => chapterMap.get(id)!).filter(Boolean);
        saveData(newData);
        return;
      }
    }
  };

  return (
    <ContentContext.Provider value={{
      data,
      loading,
      error,
      saveData,
      addPoem,
      updatePoem,
      deletePoem,
      addChapter,
      updateChapter,
      deleteChapter,
      addPart,
      updatePart,
      deletePart,
      updateBook,
      reorderPoems,
      reorderChapters,
    }}>
      {children}
    </ContentContext.Provider>
  );
}
