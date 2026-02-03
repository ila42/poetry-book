import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import contentDataRaw from '@/data/content.json';

// Типы для content.json
interface ContentPoem {
  id: string;
  number: number;
  title: string;
  text: string;
  audioUrl?: string | null;
}

interface ContentChapter {
  id: string;
  number: number | null;
  title: string;
  subtitle?: string | null;
  poems?: ContentPoem[];
}

interface ContentPart {
  id: string;
  number: number | null;
  title: string;
  subtitle?: string | null;
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

interface ContentData {
  book: {
    title: string;
    author: string;
    year: string;
    version?: string;
    epigraph?: { text: string; source: string };
  };
  volumes: ContentVolume[];
}

const contentData = contentDataRaw as ContentData;

interface SidebarNavProps {
  isBookOpen: boolean;
  currentPage: number;
  onNavigate: (pageIndex: number) => void;
  pageStructure: Array<{ type: string; content?: unknown; id?: string }>;
  totalPages?: number;
}

export function SidebarNav({ isBookOpen, currentPage, onNavigate, pageStructure }: SidebarNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set(['volume-1']));
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [goToPage, setGoToPage] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Get page index for a specific item
  const getPageIndex = (type: string, id?: string) => {
    if (type === 'toc') return pageStructure.findIndex(p => p.type === 'toc');
    if (type === 'epigraph') return pageStructure.findIndex(p => p.type === 'epigraph');
    if (type === 'afterword') return pageStructure.findIndex(p => p.type === 'afterword');
    return pageStructure.findIndex(p => p.id === id);
  };

  // Проверяем, активен ли элемент (находится ли пользователь на этой странице)
  const isItemActive = (type: string, id?: string) => {
    if (!id) return false;
    const pageItem = pageStructure[currentPage];
    if (!pageItem) return false;
    return pageItem.type === type && pageItem.id === id;
  };

  const handleNavigateToPage = (type: string, id?: string) => {
    const pageIndex = getPageIndex(type, id);
    if (pageIndex >= 0) {
      onNavigate(pageIndex);
      setIsOpen(false);
    }
  };

  // Обработчик перехода на введённую страницу
  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(goToPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pageStructure.length) {
      onNavigate(pageNum - 1); // Индексация с 0
      setGoToPage('');
      setIsOpen(false);
    }
  };

  const toggleVolume = (volId: string) => {
    const newSet = new Set(expandedVolumes);
    if (newSet.has(volId)) {
      newSet.delete(volId);
    } else {
      newSet.add(volId);
    }
    setExpandedVolumes(newSet);
  };

  const togglePart = (partId: string) => {
    const newSet = new Set(expandedParts);
    if (newSet.has(partId)) {
      newSet.delete(partId);
    } else {
      newSet.add(partId);
    }
    setExpandedParts(newSet);
  };

  if (!isBookOpen) return null;

  return (
    <div 
      ref={menuRef} 
      className="sidebar-nav-container" 
      data-no-drag="true"
      style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
    >
      {/* Hamburger Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`sidebar-nav-toggle ${isOpen ? 'sidebar-nav-toggle--open' : ''}`}
        style={{ position: 'relative', zIndex: 10000 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню навигации'}
      >
        <div className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <span />
          <span />
          <span />
        </div>
      </motion.button>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              className="fixed inset-0 bg-black/50 md:hidden -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.nav
              className="sidebar-nav-menu"
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="sidebar-nav-header">
                <span className="sidebar-nav-title">Содержание</span>
                <span className="sidebar-nav-page">стр. {currentPage + 1} / {pageStructure.length}</span>
              </div>

              {/* Кнопка закрытия меню - Вернуться к книге */}
              <button 
                onClick={() => setIsOpen(false)}
                className="sidebar-nav-home-link w-full text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Вернуться к книге
              </button>

              {/* Divider */}
              <div className="sidebar-nav-divider" />

              {/* Перейти на страницу */}
              <form onSubmit={handleGoToPage} className="sidebar-nav-goto">
                <label className="sidebar-nav-goto-label">
                  Перейти на страницу:
                </label>
                <div className="sidebar-nav-goto-input-wrap">
                  <input
                    type="number"
                    min={1}
                    max={pageStructure.length}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    placeholder={`1-${pageStructure.length}`}
                    className="sidebar-nav-goto-input"
                  />
                  <button type="submit" className="sidebar-nav-goto-btn">
                    →
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="sidebar-nav-divider" />

              {/* Content Structure */}
              <div className="sidebar-nav-content">
                {contentData.volumes.map((volume) => (
                  <div key={volume.id} className="sidebar-nav-volume">
                    {/* Volume Header */}
                    <button
                      onClick={() => toggleVolume(volume.id)}
                      className="sidebar-nav-volume-header"
                    >
                      <svg 
                        className={`w-3 h-3 transition-transform ${expandedVolumes.has(volume.id) ? 'rotate-90' : ''}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{volume.title}</span>
                    </button>

                    {/* Volume Content */}
                    <AnimatePresence>
                      {expandedVolumes.has(volume.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {volume.parts.map((part) => (
                            <div key={part.id} className="sidebar-nav-part">
                              {/* Part Header */}
                              <button
                                onClick={() => (part.chapters && part.chapters.length > 0) ? togglePart(part.id) : handleNavigateToPage('part', part.id)}
                                className="sidebar-nav-part-header"
                              >
                                {part.chapters && part.chapters.length > 0 && (
                                  <svg 
                                    className={`w-2.5 h-2.5 transition-transform ${expandedParts.has(part.id) ? 'rotate-90' : ''}`}
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <span className="sidebar-nav-part-title">
                                  {part.romanNumeral && <span className="sidebar-nav-roman">{part.romanNumeral}.</span>}
                                  {part.title}
                                </span>
                              </button>

                              {/* Chapters */}
                              <AnimatePresence>
                                {part.chapters && part.chapters.length > 0 && expandedParts.has(part.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    {part.chapters.map((chapter: ContentChapter) => (
                                      <button
                                        key={chapter.id}
                                        onClick={() => handleNavigateToPage('chapter', chapter.id)}
                                        className={`sidebar-nav-chapter ${isItemActive('chapter', chapter.id) ? 'active' : ''}`}
                                      >
                                        <span className="sidebar-nav-chapter-num">{chapter.number ?? ''}.</span>
                                        <span className="sidebar-nav-chapter-title">{chapter.title}</span>
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Direct Poems (no chapters) */}
                              {(!part.chapters || part.chapters.length === 0) && part.poems && part.poems.length > 0 && (
                                <div className="sidebar-nav-poems-count">
                                  {part.poems.length} стих{part.poems.length > 4 ? 'ов' : part.poems.length > 1 ? 'а' : ''}
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
