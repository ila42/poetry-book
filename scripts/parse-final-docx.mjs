import fs from 'fs';
import mammoth from 'mammoth';

const [, , providedPath] = process.argv;
let docxPath = providedPath;

if (!docxPath) {
  const files = fs.readdirSync('.');
  docxPath = files.find((file) => file.endsWith('.docx'));
}

if (!docxPath) {
  console.error('Usage: node scripts/parse-final-docx.mjs <path-to-docx>');
  process.exit(1);
}

const outputPath = 'src/data/content.json';
const existingContent = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

const rawText = fs.existsSync('book-content.txt')
  ? fs.readFileSync('book-content.txt', 'utf8')
  : (await mammoth.extractRawText({ path: docxPath })).value;

const rawLines = rawText.split(/\r?\n/).map((line) => line.replace(/\s+$/, ''));
const lines = rawLines.filter((line) => !line.trim().startsWith('*'));

const LABEL_EPIGRAPH = '\u042d\u041f\u0418\u0413\u0420\u0410\u0424';
const LABEL_PART = '\u0427\u0410\u0421\u0422\u042c';
const LABEL_CHAPTER = '\u0413\u043b\u0430\u0432\u0430';
const partPrefix = new RegExp(`^${LABEL_PART}\\s+`, 'i');
const partRegex = new RegExp(`^${LABEL_PART}\\s+([IVXLCDM]+)\\.\\s*(.+)$`, 'i');
const chapterRegex = new RegExp(`^${LABEL_CHAPTER}\\s+(\\d+)\\.?\\s*(.+)$`, 'i');

const parts = [];
let currentPart = null;
let currentChapter = null;
let currentPoem = null;
let pendingPartSubtitle = false;

const epigraphRaw = [];
let inEpigraph = false;

const audioByNumber = new Map();
for (const volume of existingContent.volumes ?? []) {
  for (const part of volume.parts ?? []) {
    if (part.poems) {
      part.poems.forEach((poem) => {
        if (poem.audioUrl) audioByNumber.set(poem.number, poem.audioUrl);
      });
    }
    if (part.chapters) {
      part.chapters.forEach((chapter) => {
        chapter.poems?.forEach((poem) => {
          if (poem.audioUrl) audioByNumber.set(poem.number, poem.audioUrl);
        });
      });
    }
  }
}

const audioDir = 'public/audio';
const audioExtensions = ['.m4a', '.mp3', '.wav', '.ogg'];

const resolveAudioUrl = (number) => {
  for (const ext of audioExtensions) {
    const fileName = `poem-${number}${ext}`;
    if (fs.existsSync(`${audioDir}/${fileName}`)) {
      return `/audio/${fileName}`;
    }
  }
  return audioByNumber.get(number) ?? null;
};

const romanToNumber = (roman) => {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prev = 0;
  for (const char of roman.toUpperCase()) {
    const valueNum = map[char] || 0;
    if (valueNum > prev) total += valueNum - 2 * prev;
    else total += valueNum;
    prev = valueNum;
  }
  return total || null;
};

const isEmpty = (line) => line.trim() === '';
const stripBlockquote = (line) => line.replace(/^>\s?/, '').trimEnd();

const normalizeLines = (raw) => {
  const out = [];
  let emptyCount = 0;
  for (const lineRaw of raw) {
    const line = stripBlockquote(lineRaw).trim();
    if (!line) {
      emptyCount += 1;
      continue;
    }
    if (emptyCount >= 2 && out.length > 0) out.push('');
    out.push(line);
    emptyCount = 0;
  }
  return out.join('\n').trim();
};

const finalizePoem = () => {
  if (!currentPoem) return;

  const raw = [...currentPoem.lines];
  const cleaned = raw.map((line) => stripBlockquote(line));

  const nonEmptyIndexes = cleaned
    .map((line, index) => ({ line: line.trim(), index }))
    .filter((item) => item.line !== '')
    .map((item) => item.index);

  let dedication;
  let epigraph;

  if (nonEmptyIndexes.length > 0) {
    const firstIndex = nonEmptyIndexes[0];
    const firstLine = cleaned[firstIndex].trim();
    const secondIndex = nonEmptyIndexes[1];
    const secondLine = secondIndex !== undefined ? cleaned[secondIndex].trim() : '';

    const isQuote = /^«/.test(firstLine) || /^["“„]/.test(firstLine);
    const isSource = /^\(.*\)$/.test(secondLine) || /^—\s+/.test(secondLine);

    if (isQuote && isSource) {
      epigraph = `${firstLine}\n${secondLine}`;
      cleaned[firstIndex] = '';
      cleaned[secondIndex] = '';
    } else if (/^\(.*\)$/.test(firstLine)) {
      dedication = firstLine;
      cleaned[firstIndex] = '';
    }
  }

  const text = normalizeLines(cleaned);
  if (!text) {
    currentPoem = null;
    return;
  }

  const target = currentChapter?.poems ?? currentPart?.poems;
  if (!target) {
    currentPoem = null;
    return;
  }

  target.push({
    id: `poem-${currentPoem.number}`,
    number: currentPoem.number,
    title: currentPoem.title,
    firstLine: text.split('\n')[0] || '',
    text,
    audioUrl: resolveAudioUrl(currentPoem.number),
    ...(dedication ? { dedication } : {}),
    ...(epigraph ? { epigraph } : {}),
  });

  currentPoem = null;
};

const startPart = (roman, title) => {
  finalizePoem();
  const number = romanToNumber(roman);
  currentPart = {
    id: `part-${number ?? parts.length + 1}`,
    number: number ?? parts.length + 1,
    romanNumeral: roman,
    title: title.trim(),
    subtitle: '',
    chapters: null,
    poems: [],
  };
  parts.push(currentPart);
  currentChapter = null;
  pendingPartSubtitle = true;
};

const startChapter = (number, title) => {
  finalizePoem();
  if (!currentPart) {
    startPart('I', 'СТИХОТВОРЕНИЯ');
  }
  if (!currentPart.chapters) {
    currentPart.chapters = [];
    currentPart.poems = undefined;
  }
  currentChapter = {
    id: `chapter-${number}`,
    number,
    title: title.trim(),
    subtitle: '',
    poems: [],
  };
  currentPart.chapters.push(currentChapter);
};

const startPoem = (number, title) => {
  finalizePoem();
  currentPoem = { number, title: title.trim(), lines: [] };
};

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  const trimmed = line.trim().replace(/^\uFEFF/, '');

  if (trimmed === LABEL_EPIGRAPH) {
    inEpigraph = true;
    continue;
  }

  if (inEpigraph) {
    if (partPrefix.test(trimmed)) {
      inEpigraph = false;
    } else {
      epigraphRaw.push(line);
      continue;
    }
  }

  if (partPrefix.test(trimmed)) {
    const match = trimmed.match(partRegex);
    if (match) {
      startPart(match[1], match[2]);
      continue;
    }
  }

  if (pendingPartSubtitle && trimmed.startsWith('(') && trimmed.endsWith(')') && currentPart) {
    currentPart.subtitle = trimmed;
    pendingPartSubtitle = false;
    continue;
  }
  if (pendingPartSubtitle && trimmed !== '') {
    pendingPartSubtitle = false;
  }

  const chapterMatch = trimmed.match(chapterRegex);
  if (chapterMatch) {
    startChapter(Number(chapterMatch[1]), chapterMatch[2]);
    continue;
  }

  const poemMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
  if (poemMatch) {
    startPoem(Number(poemMatch[1]), poemMatch[2]);
    continue;
  }

  if (currentPoem) {
    currentPoem.lines.push(line);
  }
}

finalizePoem();

const epigraphText = normalizeLines(epigraphRaw);

const nextContent = {
  book: {
    title: existingContent.book?.title ?? 'Книга стихов',
    author: existingContent.book?.author ?? 'Автор',
    year: existingContent.book?.year ?? '',
    version: existingContent.book?.version ?? '',
    epigraph: epigraphText || undefined,
  },
  volumes: [
    {
      id: 'volume-1',
      number: 1,
      title: 'ТОМ I',
      subtitle: '',
      parts,
    },
  ],
};

fs.writeFileSync(outputPath, JSON.stringify(nextContent, null, 2), 'utf8');
console.log(`Saved ${outputPath} with ${parts.reduce((acc, part) => {
  if (part.poems) return acc + part.poems.length;
  if (part.chapters) return acc + part.chapters.reduce((sum, ch) => sum + ch.poems.length, 0);
  return acc;
}, 0)} poems.`);
