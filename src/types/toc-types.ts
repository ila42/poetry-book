/* ────────────────────────────────────────────
 * Types for the book table-of-contents
 * (mirrors the JSON produced by scripts/parse-toc-docx.mjs)
 * ──────────────────────────────────────────── */

export interface BookTocData {
  meta: { bookTitle: string };
  frontMatter: TocMarkerNode[];
  sections: TocSection[];
}

/** Top-level section: Part I / Part II / Epilogue / Post Scriptum */
export interface TocSection {
  type: 'part' | 'epilogue' | 'postscriptum';
  id: string;
  label: string;
  title: string;
  items: TocNode[];
}

/** Discriminated union for every item type in the TOC tree */
export type TocNode =
  | TocChapterNode
  | TocPoemNode
  | TocMarkerNode
  | TocBlockNode
  | TocSubsectionNode
  | TocInterludeNode;

export interface TocChapterNode {
  type: 'chapter';
  id: string;
  label: string;
  title: string;
  items: TocNode[];
}

export interface TocPoemNode {
  type: 'poem';
  id: string;
  title: string;
  page: number;
}

export interface TocMarkerNode {
  type: 'marker';
  id: string;
  title: string;
  text?: string;
  items?: TocPoemNode[];
}

export interface TocBlockNode {
  type: 'block';
  id: string;
  title: string;
}

export interface TocSubsectionNode {
  type: 'subsection';
  id: string;
  title: string;
}

export interface TocInterludeNode {
  type: 'interlude';
  id: string;
  title: string;
  items?: TocPoemNode[];
}

/** Flattened poem entry used for searching */
export interface FlatPoem {
  id: string;
  title: string;
  page: number;
  sectionId: string;
  chapterId?: string;
}
