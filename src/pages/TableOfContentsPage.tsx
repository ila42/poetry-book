import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import tocJson from '@/data/toc-book.json';
import { contentPoems } from '@/data/contentHelpers';
import type {
  BookTocData,
  TocSection,
  TocNode,
  TocChapterNode,
  TocPoemNode,
  TocMarkerNode,
  FlatPoem,
} from '@/types/toc-types';

const tocData = tocJson as BookTocData;

/* ═══════════════════════════════════════════════
 * Utility helpers
 * ═══════════════════════════════════════════════ */

/** Collect every poem recursively for search */
function flattenPoems(data: BookTocData): FlatPoem[] {
  const result: FlatPoem[] = [];
  for (const section of data.sections) {
    for (const item of section.items) {
      if (item.type === 'poem') {
        result.push({ ...item, sectionId: section.id });
      } else if (item.type === 'chapter') {
        for (const child of item.items) {
          if (child.type === 'poem') {
            result.push({ ...child, sectionId: section.id, chapterId: item.id });
          }
        }
      } else if (item.type === 'marker' && item.items) {
        for (const child of item.items) {
          if (child.type === 'poem') {
            result.push({ ...child, sectionId: section.id });
          }
        }
      }
    }
  }
  return result;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    /* fallback: noop */
  });
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ═══════════════════════════════════════════════
 * Icons (inline SVG to avoid deps)
 * ═══════════════════════════════════════════════ */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
      <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5 text-ink-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
 * Sub-components
 * ═══════════════════════════════════════════════ */

/** Header */
function TocHeader() {
  const formatPoemNumber = (num: number | undefined): string | null =>
    num === undefined ? null : String(num).padStart(3, '0');

  return (
    <header className="text-center pt-10 pb-6 md:pt-14 md:pb-8">
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-widest text-burgundy-800 uppercase">
        Оглавление
      </h1>
      <p className="mt-2 font-display text-lg md:text-xl text-ink-500 tracking-wide">
        {tocData.meta.bookTitle}
      </p>
      {/* decorative divider */}
      <div className="mt-4 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-burgundy-400 to-transparent" />
      <p className="mt-2 font-serif text-xs text-ink-400 uppercase tracking-[0.3em]">
        {contentPoems.length > 0 && (
          <>
            Стихи № {formatPoemNumber(1)}–{formatPoemNumber(contentPoems[contentPoems.length - 1]?.number)}
          </>
        )}
      </p>
    </header>
  );
}

/** Search bar */
function TocSearch({
  query,
  onChange,
}: {
  query: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Поиск по названию стиха..."
        aria-label="Поиск по названию стиха"
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink-200 bg-white/80
                   font-serif text-base text-ink-800 placeholder:text-ink-400
                   focus:outline-none focus:ring-2 focus:ring-burgundy-400/40 focus:border-burgundy-400
                   transition-all duration-200 shadow-sm"
      />
    </div>
  );
}

/** Epigraph front-matter block */
function TocFrontMatter({ items }: { items: TocMarkerNode[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-8">
      {items.map((m) => (
        <blockquote
          key={m.id}
          id={m.id}
          className="mx-auto max-w-lg border-l-2 border-burgundy-300 pl-5 py-2 text-ink-500 italic font-serif text-sm md:text-base leading-relaxed"
        >
          {m.text && <p>{m.text}</p>}
        </blockquote>
      ))}
    </div>
  );
}

/** Poem row with dot leaders */
function PoemRow({
  poem,
  highlight,
}: {
  poem: TocPoemNode;
  highlight?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${poem.id}`;
    copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [poem.id]);

  const handleClick = useCallback(() => {
    scrollToId(poem.id);
    window.history.replaceState(null, '', `#${poem.id}`);
  }, [poem.id]);

  // Highlight matching substring
  const titleNode = useMemo(() => {
    if (!highlight) return poem.title;
    const idx = poem.title.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx < 0) return poem.title;
    const before = poem.title.slice(0, idx);
    const match = poem.title.slice(idx, idx + highlight.length);
    const after = poem.title.slice(idx + highlight.length);
    return (
      <>
        {before}
        <mark className="bg-yellow-200/70 text-inherit rounded px-0.5">{match}</mark>
        {after}
      </>
    );
  }, [poem.title, highlight]);

  const poemNumberMap = useMemo(() => {
    const map = new Map<string, number>();
    contentPoems.forEach((p) => {
      if (p.number !== undefined) {
        map.set(p.id, p.number);
      }
    });
    return map;
  }, []);

  const poemNumber = poemNumberMap.get(poem.id);
  const formattedNumber = poemNumber !== undefined ? String(poemNumber).padStart(3, '0') : null;

  return (
    <div id={poem.id} className="group flex items-baseline gap-1 py-[3px] scroll-mt-24">
      {/* title */}
      <button
        type="button"
        onClick={handleClick}
        className="shrink-0 text-left font-serif text-[0.9rem] md:text-[0.95rem] text-ink-700
                   hover:text-burgundy-700 transition-colors cursor-pointer focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-burgundy-400/50 rounded"
      >
        {formattedNumber && (
          <span className="inline-block mr-1 text-ink-400 tabular-nums min-w-[3ch]">
            {formattedNumber}.
          </span>
        )}
        {titleNode}
      </button>

      {/* dot leaders */}
      <span
        className="flex-1 min-w-[12px] mx-1 border-b border-dotted border-ink-300/60
                   self-baseline relative top-[-3px]"
        aria-hidden="true"
      />

      {/* page number */}
      <span className="shrink-0 font-serif text-sm text-ink-400 tabular-nums min-w-[2em] text-right">
        {poem.page}
      </span>

      {/* copy link button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="shrink-0 ml-1 opacity-0 group-hover:opacity-60 hover:!opacity-100
                   transition-opacity text-ink-400 hover:text-burgundy-600
                   focus:opacity-100 focus:outline-none"
        title="Скопировать ссылку"
        aria-label={`Скопировать ссылку на «${poem.title}»`}
      >
        {copied ? (
          <span className="text-xs text-green-600 font-serif">✓</span>
        ) : (
          <LinkIcon />
        )}
      </button>
    </div>
  );
}

/** Block / subsection / interlude label */
function SubheadingLabel({ node }: { node: TocNode }) {
  if (node.type === 'block') {
    return (
      <div id={node.id} className="mt-3 mb-1 scroll-mt-24">
        <span className="inline-block font-serif text-xs uppercase tracking-widest text-burgundy-500/80">
          {node.title}
        </span>
      </div>
    );
  }
  if (node.type === 'subsection') {
    return (
      <div id={node.id} className="mt-3 mb-1 scroll-mt-24">
        <span className="inline-block font-serif text-sm italic text-ink-500">
          {node.title}
        </span>
      </div>
    );
  }
  if (node.type === 'interlude') {
    return (
      <div id={node.id} className="mt-4 mb-2 text-center scroll-mt-24">
        <span className="inline-block font-serif text-xs uppercase tracking-[0.2em] text-ink-400">
          ── {node.title} ──
        </span>
      </div>
    );
  }
  if (node.type === 'marker') {
    const marker = node as TocMarkerNode;
    return (
      <div id={node.id} className="mt-3 mb-1 scroll-mt-24">
        <span className="inline-block font-serif text-xs uppercase tracking-widest text-burgundy-600/70">
          {marker.title}
        </span>
        {marker.text && (
          <p className="mt-0.5 font-serif text-xs italic text-ink-400 leading-relaxed">
            {marker.text}
          </p>
        )}
      </div>
    );
  }
  return null;
}

/** Renders a flat list of TocNode items (poems + labels) */
function ItemList({
  items,
  searchQuery,
  matchingIds,
}: {
  items: TocNode[];
  searchQuery: string;
  matchingIds: Set<string> | null;
}) {
  return (
    <>
      {items.map((item) => {
        if (item.type === 'poem') {
          if (matchingIds && !matchingIds.has(item.id)) return null;
          return (
            <PoemRow
              key={item.id}
              poem={item}
              highlight={searchQuery || undefined}
            />
          );
        }
        // Non-poem items (labels/subheadings): show only if not filtering, or if context is needed
        if (!matchingIds) {
          return <SubheadingLabel key={item.id} node={item} />;
        }
        return null;
      })}
    </>
  );
}

/** Chapter accordion */
function ChapterSection({
  chapter,
  expanded,
  onToggle,
  searchQuery,
  matchingIds,
}: {
  chapter: TocChapterNode;
  expanded: boolean;
  onToggle: () => void;
  searchQuery: string;
  matchingIds: Set<string> | null;
}) {
  // If filtering, check if this chapter has any matching poems
  const hasMatches = useMemo(() => {
    if (!matchingIds) return true;
    return chapter.items.some(
      (item) => item.type === 'poem' && matchingIds.has(item.id),
    );
  }, [chapter.items, matchingIds]);

  if (!hasMatches) return null;

  // Force expand when searching
  const isExpanded = matchingIds ? true : expanded;

  return (
    <div className="mt-2" role="region" aria-label={`${chapter.label}. ${chapter.title}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 py-2 px-1 text-left group/ch
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400/50 rounded"
        aria-expanded={isExpanded}
      >
        <ChevronIcon open={isExpanded} />
        <span className="font-display text-sm md:text-[0.95rem] font-semibold text-ink-700 group-hover/ch:text-burgundy-700 transition-colors">
          {chapter.label}.{' '}
          <span className="font-normal">{chapter.title}</span>
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pl-5 md:pl-7 pb-1">
            <ItemList items={chapter.items} searchQuery={searchQuery} matchingIds={matchingIds} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Marker section (ИНТЕРМЕЦЦО) that has its own poems */
function MarkerSectionBlock({
  marker,
  searchQuery,
  matchingIds,
}: {
  marker: TocMarkerNode;
  searchQuery: string;
  matchingIds: Set<string> | null;
}) {
  const hasMatches = useMemo(() => {
    if (!matchingIds) return true;
    return marker.items?.some((p) => matchingIds.has(p.id)) ?? false;
  }, [marker.items, matchingIds]);

  if (!hasMatches && matchingIds) return null;

  return (
    <div className="mt-4 mb-2" id={marker.id}>
      <div className="text-center mb-2">
        <span className="inline-block font-display text-xs md:text-sm uppercase tracking-[0.15em] text-burgundy-600/80 border-b border-burgundy-200/50 pb-0.5">
          {marker.title}
        </span>
      </div>
      {marker.items && (
        <div className="pl-4 md:pl-6">
          {marker.items.map((poem) => {
            if (matchingIds && !matchingIds.has(poem.id)) return null;
            return <PoemRow key={poem.id} poem={poem} highlight={searchQuery || undefined} />;
          })}
        </div>
      )}
    </div>
  );
}

/** Top-level section (Part / Epilogue / Post Scriptum) */
function SectionBlock({
  section,
  expanded,
  onToggle,
  expandedChapters,
  onToggleChapter,
  searchQuery,
  matchingIds,
}: {
  section: TocSection;
  expanded: boolean;
  onToggle: () => void;
  expandedChapters: Set<string>;
  onToggleChapter: (id: string) => void;
  searchQuery: string;
  matchingIds: Set<string> | null;
}) {
  // If filtering, check if this section has any matching poems
  const hasMatches = useMemo(() => {
    if (!matchingIds) return true;
    function check(items: TocNode[]): boolean {
      return items.some((item) => {
        if (item.type === 'poem') return matchingIds!.has(item.id);
        if (item.type === 'chapter') return check(item.items);
        if (item.type === 'marker' && (item as TocMarkerNode).items) {
          return (item as TocMarkerNode).items!.some((p) => matchingIds!.has(p.id));
        }
        return false;
      });
    }
    return check(section.items);
  }, [section.items, matchingIds]);

  if (!hasMatches) return null;

  const isExpanded = matchingIds ? true : expanded;
  const sectionTitle = section.title
    ? `${section.label}. ${section.title}`
    : section.label;

  // Section type styling
  const headerClasses =
    section.type === 'part'
      ? 'bg-burgundy-50/60 border-burgundy-200/50'
      : 'bg-ink-50/40 border-ink-200/40';

  return (
    <section
      id={section.id}
      className="mb-4 scroll-mt-20"
      aria-label={sectionTitle}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 py-3 px-4 md:px-5
                    rounded-lg border ${headerClasses}
                    hover:shadow-sm transition-all duration-200 group/sec
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400/50`}
        aria-expanded={isExpanded}
      >
        <h2 className="font-display text-base md:text-lg text-ink-800 tracking-wide text-left">
          <span className="font-bold">{section.label}</span>
          {section.title && (
            <span className="font-normal text-ink-600">.{' '}{section.title}</span>
          )}
        </h2>
        <span className="shrink-0 text-ink-400 group-hover/sec:text-burgundy-600 transition-colors">
          <ChevronIcon open={isExpanded} />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pt-2 pb-3 px-2 md:px-4">
            {section.items.map((item) => {
              if (item.type === 'chapter') {
                return (
                  <ChapterSection
                    key={item.id}
                    chapter={item}
                    expanded={expandedChapters.has(item.id)}
                    onToggle={() => onToggleChapter(item.id)}
                    searchQuery={searchQuery}
                    matchingIds={matchingIds}
                  />
                );
              }
              if (item.type === 'marker' && (item as TocMarkerNode).items) {
                return (
                  <MarkerSectionBlock
                    key={item.id}
                    marker={item as TocMarkerNode}
                    searchQuery={searchQuery}
                    matchingIds={matchingIds}
                  />
                );
              }
              if (item.type === 'poem') {
                if (matchingIds && !matchingIds.has(item.id)) return null;
                return (
                  <PoemRow
                    key={item.id}
                    poem={item}
                    highlight={searchQuery || undefined}
                  />
                );
              }
              // labels visible only when not filtering
              if (!matchingIds) {
                return <SubheadingLabel key={item.id} node={item} />;
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
 * Main page component
 * ═══════════════════════════════════════════════ */

export function TableOfContentsPage() {
  const [query, setQuery] = useState('');

  // All poems flat for search
  const allPoems = useMemo(() => flattenPoems(tocData), []);

  // Matching poem IDs (null = no filter)
  const matchingIds = useMemo<Set<string> | null>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const ids = new Set<string>();
    for (const p of allPoems) {
      if (p.title.toLowerCase().includes(q) || String(p.page).includes(q)) {
        ids.add(p.id);
      }
    }
    return ids;
  }, [query, allPoems]);

  // Expand / collapse state — default: all sections & chapters expanded
  const allSectionIds = useMemo(
    () => new Set(tocData.sections.map((s) => s.id)),
    [],
  );
  const allChapterIds = useMemo(() => {
    const ids = new Set<string>();
    for (const sec of tocData.sections) {
      for (const item of sec.items) {
        if (item.type === 'chapter') ids.add(item.id);
      }
    }
    return ids;
  }, []);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(allSectionIds);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(allChapterIds);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleChapter = useCallback((id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Expand / collapse all
  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
    setExpandedChapters(new Set());
  }, []);

  const expandAll = useCallback(() => {
    setExpandedSections(allSectionIds);
    setExpandedChapters(allChapterIds);
  }, [allSectionIds, allChapterIds]);

  // Scroll to hash anchor on mount
  const didScroll = useRef(false);
  useEffect(() => {
    if (didScroll.current) return;
    const hash = window.location.hash.slice(1);
    if (hash) {
      didScroll.current = true;
      requestAnimationFrame(() => scrollToId(hash));
    }
  }, []);

  // Match count for search feedback
  const matchCount = matchingIds?.size ?? null;

  return (
    <div className="min-h-screen bg-parchment-100">
      {/* Top navigation bar */}
      <nav className="sticky top-0 z-30 bg-parchment-100/95 backdrop-blur-sm border-b border-ink-100/50">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-ink-500 hover:text-burgundy-700 transition-colors font-serif text-sm"
          >
            <HomeIcon />
            <span className="hidden sm:inline">На главную</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-serif text-ink-500 hover:text-burgundy-600 px-2 py-1 rounded
                         hover:bg-burgundy-50 transition-colors"
              title="Свернуть все"
            >
              Свернуть
            </button>
            <span className="text-ink-300">|</span>
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-serif text-ink-500 hover:text-burgundy-600 px-2 py-1 rounded
                         hover:bg-burgundy-50 transition-colors"
              title="Развернуть все"
            >
              Развернуть
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pb-16">
        <TocHeader />

        <TocSearch query={query} onChange={setQuery} />

        {/* search feedback */}
        {matchCount !== null && (
          <p className="text-center text-sm font-serif text-ink-400 -mt-4 mb-6">
            {matchCount === 0
              ? 'Ничего не найдено'
              : `Найдено: ${matchCount} ${matchCount === 1 ? 'стихотворение' : matchCount < 5 ? 'стихотворения' : 'стихотворений'}`}
          </p>
        )}

        <TocFrontMatter items={tocData.frontMatter} />

        {/* sections */}
        {tocData.sections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            expanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            expandedChapters={expandedChapters}
            onToggleChapter={toggleChapter}
            searchQuery={query.trim()}
            matchingIds={matchingIds}
          />
        ))}

        {/* footer stats */}
        <footer className="mt-12 text-center text-xs text-ink-300 font-serif">
          <p>{allPoems.length} стихотворений &middot; {tocData.sections.length} раздела</p>
        </footer>
      </main>
    </div>
  );
}
