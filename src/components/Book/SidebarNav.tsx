import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import contentData from '@/data/content.json';

interface SidebarNavProps {
  isBookOpen: boolean;
  currentPage: number;
  onNavigate: (pageIndex: number) => void;
  pageStructure: Array<{ type: string; content?: unknown; id?: string }>;
}

export function SidebarNav({ isBookOpen, currentPage, onNavigate, pageStructure }: SidebarNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set(['volume-1']));
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
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
    if (type === 'about') return pageStructure.findIndex(p => p.type === 'about');
    if (type === 'contact') return pageStructure.findIndex(p => p.type === 'contact');
    if (type === 'introduction') return pageStructure.findIndex(p => p.type === 'introduction');
    return pageStructure.findIndex(p => p.id === id);
  };

  const handleNavigateToPage = (type: string, id?: string) => {
    const pageIndex = getPageIndex(type, id);
    if (pageIndex >= 0) {
      onNavigate(pageIndex);
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
    <div ref={menuRef} className="sidebar-nav-container" data-no-drag="true">
      {/* Hamburger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="sidebar-nav-toggle"
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
                <span className="sidebar-nav-page">стр. {currentPage + 1}</span>
              </div>

              {/* Quick Links */}
              <div className="sidebar-nav-quick">
                <button 
                  onClick={() => handleNavigateToPage('toc')}
                  className="sidebar-nav-quick-link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Оглавление
                </button>
                <button 
                  onClick={() => handleNavigateToPage('about')}
                  className="sidebar-nav-quick-link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Об авторе
                </button>
                <button 
                  onClick={() => handleNavigateToPage('contact')}
                  className="sidebar-nav-quick-link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Контакты
                </button>
              </div>

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
                                onClick={() => part.chapters ? togglePart(part.id) : handleNavigateToPage('part', part.id)}
                                className="sidebar-nav-part-header"
                              >
                                {part.chapters && (
                                  <svg 
                                    className={`w-2.5 h-2.5 transition-transform ${expandedParts.has(part.id) ? 'rotate-90' : ''}`}
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <span className="sidebar-nav-part-title">
                                  {'romanNumeral' in part && part.romanNumeral && <span className="sidebar-nav-roman">{part.romanNumeral}.</span>}
                                  {part.title}
                                </span>
                              </button>

                              {/* Chapters */}
                              <AnimatePresence>
                                {part.chapters && expandedParts.has(part.id) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    {part.chapters.map((chapter) => (
                                      <button
                                        key={chapter.id}
                                        onClick={() => handleNavigateToPage('chapter', chapter.id)}
                                        className="sidebar-nav-chapter"
                                      >
                                        <span className="sidebar-nav-chapter-num">{chapter.number}.</span>
                                        <span className="sidebar-nav-chapter-title">{chapter.title}</span>
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Direct Poems (no chapters) */}
                              {!part.chapters && part.poems && part.poems.length > 0 && (
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
