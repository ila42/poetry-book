/**
 * parse-toc-docx.mjs
 *
 * Reads the DOCX table-of-contents file and outputs a structured JSON
 * at src/data/toc-book.json.
 *
 * Usage:
 *   node scripts/parse-toc-docx.mjs
 *
 * The script auto-finds the file matching "оглавление (2).docx" in the
 * project root. You can also pass an explicit path:
 *   node scripts/parse-toc-docx.mjs path/to/file.docx
 */

import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ────────────────────────────────────────────
// Transliteration for stable URL-safe slugs
// ────────────────────────────────────────────
const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function slugify(text) {
  return text
    .toLowerCase()
    .split('')
    .map((c) => TRANSLIT[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

// ────────────────────────────────────────────
// Known titles that contain an em-dash inside
// (first-dash heuristic would truncate them)
// ────────────────────────────────────────────
const TITLE_OVERRIDES = {
  96: 'Любовь — война',
  104: 'Слово — Беда',
};

// ────────────────────────────────────────────
// Core parser: raw text → structured TOC JSON
// ────────────────────────────────────────────
export function parseTocText(rawText) {
  const lines = rawText.split(/\r?\n/);

  const result = {
    meta: { bookTitle: '' },
    frontMatter: [],
    sections: [],
  };

  let currentSection = null;   // top-level section (Part / Epilogue / PS)
  let currentChapter = null;   // chapter inside a section
  let currentMarkerSection = null; // marker section (INTERMECCO) at section level
  let lastFrontMatterItem = null;

  // --- helpers ---
  function addItem(item) {
    if (currentMarkerSection) {
      currentMarkerSection.items.push(item);
    } else if (currentChapter) {
      currentChapter.items.push(item);
    } else if (currentSection) {
      currentSection.items.push(item);
    }
  }

  function startSection(section) {
    currentChapter = null;
    currentMarkerSection = null;
    currentSection = section;
    result.sections.push(section);
  }

  function startChapter(chapter) {
    currentChapter = chapter;
    currentMarkerSection = null;
    if (currentSection) currentSection.items.push(chapter);
  }

  function startMarkerSection(marker) {
    currentChapter = null;
    currentMarkerSection = marker;
    if (currentSection) currentSection.items.push(marker);
  }

  // --- main loop ---
  for (const raw of lines) {
    const trimmed = raw.trim();

    // skip empty / separator lines
    if (!trimmed || /^={3,}$/.test(trimmed)) continue;

    // skip metadata header lines
    if (/^РЕЕСТР\b/i.test(trimmed)) continue;
    if (/^Финальная\s+сборка/i.test(trimmed)) continue;

    // book title (first occurrence)
    if (!result.meta.bookTitle && /ПРОСТО ЧЕЛОВЕКОМ/i.test(trimmed)) {
      result.meta.bookTitle = 'ПРОСТО ЧЕЛОВЕКОМ';
      continue;
    }

    // ── ЧАСТЬ N. TITLE ──
    const partMatch = trimmed.match(/^ЧАСТЬ\s+([IVX]+)\.\s+(.+)$/i);
    if (partMatch) {
      const roman = partMatch[1].toUpperCase();
      startSection({
        type: 'part',
        id: `part-${roman.toLowerCase()}`,
        label: `ЧАСТЬ ${roman}`,
        title: partMatch[2].trim(),
        items: [],
      });
      continue;
    }

    // ── ГЛАВА N. TITLE ──
    const chapterMatch = trimmed.match(/^ГЛАВА\s+(\d+)\.\s+(.+)$/i);
    if (chapterMatch) {
      const num = parseInt(chapterMatch[1], 10);
      startChapter({
        type: 'chapter',
        id: `chapter-${num}`,
        label: `ГЛАВА ${num}`,
        title: chapterMatch[2].trim(),
        items: [],
      });
      continue;
    }

    // ── ЭПИЛОГ ──
    if (/^ЭПИЛОГ\s*$/i.test(trimmed)) {
      startSection({
        type: 'epilogue',
        id: 'epilogue',
        label: 'ЭПИЛОГ',
        title: '',
        items: [],
      });
      continue;
    }

    // ── NNN. Title — first line... ──  (poem)
    const poemLineMatch = trimmed.match(/^(\d{1,3})\.\s+(.+)$/);
    if (poemLineMatch) {
      const page = parseInt(poemLineMatch[1], 10);
      const rest = poemLineMatch[2];

      let title;
      if (TITLE_OVERRIDES[page]) {
        title = TITLE_OVERRIDES[page];
      } else {
        const dashIdx = rest.indexOf(' \u2014 '); // em-dash with spaces
        title = dashIdx >= 0 ? rest.substring(0, dashIdx).trim() : rest.trim();
      }

      addItem({
        type: 'poem',
        id: `poem-${page}`,
        title,
        page,
      });
      continue;
    }

    // ── [ BRACKET MARKER ] ──
    const bracketMatch = trimmed.match(/^\[\s*(.+?)\s*\]$/);
    if (bracketMatch) {
      const content = bracketMatch[1].trim();

      // POST SCRIPTUM
      if (/POST\s*SCRIPTUM/i.test(content)) {
        startSection({
          type: 'postscriptum',
          id: 'post-scriptum',
          label: 'POST SCRIPTUM',
          title: '',
          items: [],
        });
        continue;
      }

      // ИНТЕРМЕЦЦО (part-level marker section)
      const intermeccoMatch = content.match(/^ИНТЕРМЕЦЦО\s+(.+)$/i);
      if (intermeccoMatch) {
        const suffix = intermeccoMatch[1].trim();
        // derive a numeric id from Roman numeral or text
        const numPart = suffix.replace(/[^IVX0-9]/gi, '').toLowerCase() || slugify(suffix);
        startMarkerSection({
          type: 'marker',
          id: `intermecco-${numPart}`,
          title: `ИНТЕРМЕЦЦО ${suffix}`,
          items: [],
        });
        continue;
      }

      // ЭПИГРАФ / Эпиграф (may have inline text after colon)
      const epigraphMatch = content.match(/^[ЭЕэе]пиграф(?::\s*(.+))?$/i);
      if (epigraphMatch) {
        const text = epigraphMatch[1]?.trim() || '';
        if (!currentSection) {
          // front matter epigraph
          const marker = { type: 'marker', id: 'epigraph', title: 'ЭПИГРАФ' };
          if (text) marker.text = text;
          result.frontMatter.push(marker);
          lastFrontMatterItem = marker;
        } else {
          // within a chapter
          const markerId = currentChapter
            ? `epigraph-${currentChapter.id}`
            : `epigraph-${currentSection.id}`;
          const marker = { type: 'marker', id: markerId, title: 'ЭПИГРАФ' };
          if (text) marker.text = text;
          addItem(marker);
        }
        continue;
      }

      // other bracket markers
      const id = `marker-${slugify(content)}`;
      if (!currentSection) {
        const marker = { type: 'marker', id, title: content };
        result.frontMatter.push(marker);
        lastFrontMatterItem = marker;
      } else {
        addItem({ type: 'marker', id, title: content });
      }
      continue;
    }

    // ── (PARENTHESIS MARKER) ──
    const parenMatch = trimmed.match(/^\((.+)\)$/);
    if (parenMatch) {
      const content = parenMatch[1].trim();

      // (Блок: Title)
      const blockMatch = content.match(/^Блок:\s*(.+)$/i);
      if (blockMatch) {
        addItem({ type: 'block', id: `block-${slugify(blockMatch[1])}`, title: blockMatch[1].trim() });
        continue;
      }

      // (Подраздел: Title)
      const subsMatch = content.match(/^Подраздел:\s*(.+)$/i);
      if (subsMatch) {
        addItem({ type: 'subsection', id: `subsection-${slugify(subsMatch[1])}`, title: subsMatch[1].trim() });
        continue;
      }

      // (Интерлюдия ...)
      if (/^Интерлюдия/i.test(content)) {
        addItem({ type: 'interlude', id: `interlude-${slugify(content)}`, title: content });
        continue;
      }

      // generic parenthesis marker (e.g. Roman-numeral subsections)
      addItem({ type: 'subsection', id: `subsection-${slugify(content)}`, title: content });
      continue;
    }

    // ── Epigraph text (line starting with «) that follows a front-matter marker ──
    if (lastFrontMatterItem && /^[«""\u00ab]/.test(trimmed)) {
      lastFrontMatterItem.text = trimmed;
      lastFrontMatterItem = null;
      continue;
    }

    // anything else that doesn't match → ignore
    if (lastFrontMatterItem) lastFrontMatterItem = null;
  }

  return result;
}

// ────────────────────────────────────────────
// Counts (for verification)
// ────────────────────────────────────────────
function countPoems(data) {
  let count = 0;
  function walk(items) {
    for (const item of items) {
      if (item.type === 'poem') count++;
      if (item.items) walk(item.items);
    }
  }
  for (const section of data.sections) walk(section.items);
  return count;
}

function countChapters(data) {
  let count = 0;
  for (const section of data.sections) {
    for (const item of section.items) {
      if (item.type === 'chapter') count++;
    }
  }
  return count;
}

// ────────────────────────────────────────────
// Main
// ────────────────────────────────────────────
async function main() {
  // Find docx file
  let docxPath = process.argv[2];

  if (!docxPath) {
    const files = fs.readdirSync(ROOT);
    const found = files.find(
      (f) => f.includes('оглавление (2)') && f.endsWith('.docx'),
    );
    if (!found) {
      console.error('Cannot find the TOC .docx file. Pass it as an argument.');
      process.exit(1);
    }
    docxPath = path.join(ROOT, found);
  }

  console.log(`Reading: ${docxPath}`);
  const { value: rawText } = await mammoth.extractRawText({ path: docxPath });
  const result = parseTocText(rawText);

  const outputPath = path.join(ROOT, 'src', 'data', 'toc-book.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

  console.log(`\n✔  Generated ${path.relative(ROOT, outputPath)}`);
  console.log(`   Book title : ${result.meta.bookTitle}`);
  console.log(`   Front-matter items: ${result.frontMatter.length}`);
  console.log(`   Top-level sections: ${result.sections.length}`);
  console.log(`   Chapters  : ${countChapters(result)}`);
  console.log(`   Poems     : ${countPoems(result)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
