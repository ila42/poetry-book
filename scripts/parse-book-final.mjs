/**
 * Парсер финальной сборки книги стихов
 * Корректно различает оглавление и стихи, обрабатывает части и главы
 */
import fs from 'fs';
import mammoth from 'mammoth';

// Найти файл "Финальная сборка книги стихов.docx" или использовать book-content.txt
const FINAL_DOCX = 'Финальная сборка книги стихов.docx';
const TEXT_CACHE = 'book-content.txt';
const OUTPUT_PATH = 'src/data/content.json';

// Загрузить существующий контент для сохранения audio URLs
const existingContent = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));

// Собрать карту audioUrl по номеру стиха
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

// Проверить наличие аудиофайлов
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

// Получить текст из файла
let rawText;
if (fs.existsSync(TEXT_CACHE)) {
  console.log(`Reading from cached ${TEXT_CACHE}`);
  rawText = fs.readFileSync(TEXT_CACHE, 'utf8');
} else if (fs.existsSync(FINAL_DOCX)) {
  console.log(`Extracting text from ${FINAL_DOCX}`);
  rawText = (await mammoth.extractRawText({ path: FINAL_DOCX })).value;
  fs.writeFileSync(TEXT_CACHE, rawText, 'utf8');
} else {
  console.error(`File not found: ${FINAL_DOCX}`);
  console.error('Please run: node scripts/extract-and-count.mjs first');
  process.exit(1);
}

const lines = rawText.split(/\r?\n/);

// Регулярные выражения
const PART_REGEX = /^ЧАСТЬ\s+([IVXLCDM]+)\.\s*(.+)$/i;
const CHAPTER_REGEX = /^ГЛАВА\s+(\d+)\.\s*(.+)$/i;

// Оглавление: "NNN. Название — первая строка стиха..." (длинное описание после тире, >20 символов)
const isTocLine = (line) => {
  const match = line.match(/^0*(\d+)\.\s+(.+?)\s*[—–]\s+(.+)$/);
  if (!match) return false;
  // Если после тире длинный текст (более 15 символов) — это оглавление
  // Короткие названия типа "Любовь — война" не считаются оглавлением
  return match[3].length > 15;
};

// Заголовок стиха: "NNN. НАЗВАНИЕ" или "NNN.НАЗВАНИЕ" (с или без пробела)
const POEM_HEADER_REGEX = /^0*(\d+)\.\s*(.+)$/;

// Конвертация римских цифр
const romanToNumber = (roman) => {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  let prev = 0;
  for (const char of roman.toUpperCase()) {
    const val = map[char] || 0;
    if (val > prev) total += val - 2 * prev;
    else total += val;
    prev = val;
  }
  return total || null;
};

// Структура для хранения результата
const parts = [];
let currentPart = null;
let currentChapter = null;
let currentPoem = null;

// Счётчики для отладки
let tocLinesSkipped = 0;
let poemsFound = 0;

// Нормализация текста стиха
const normalizePoem = (lines) => {
  // Убрать пустые строки в начале и конце
  while (lines.length > 0 && lines[0].trim() === '') lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
  
  // Объединить, сохраняя переносы строк
  const result = [];
  let emptyCount = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      emptyCount++;
      continue;
    }
    // Добавить один перенос строки между строфами (если было 2+ пустых строк)
    if (emptyCount >= 2 && result.length > 0) {
      result.push('');
    }
    result.push(trimmed);
    emptyCount = 0;
  }
  
  return result.join('\n');
};

// Проверка на эпиграф и посвящение
const extractMeta = (text) => {
  const lines = text.split('\n');
  let dedication = undefined;
  let epigraph = undefined;
  
  // Ищем посвящение в скобках в начале
  if (lines.length > 0 && /^\(.+\)$/.test(lines[0])) {
    // Проверяем, что это не источник эпиграфа (обычно короткий)
    if (lines[0].length < 100) {
      // Это может быть посвящение или источник эпиграфа
      // Проверяем, есть ли цитата перед ним
      if (lines.length > 1 && /^[«""„]/.test(lines[1])) {
        // Это не посвящение, источник идёт после цитаты
      } else {
        dedication = lines[0];
        lines.shift();
      }
    }
  }
  
  // Ищем эпиграф (цитата в кавычках + источник в скобках или с тире)
  if (lines.length >= 2) {
    const firstLine = lines[0];
    const secondLine = lines[1];
    
    const isQuote = /^[«""„]/.test(firstLine);
    const isSource = /^\(.*\)$/.test(secondLine) || /^[—–]\s*.+$/.test(secondLine);
    
    if (isQuote && isSource) {
      epigraph = `${firstLine}\n${secondLine}`;
      lines.splice(0, 2);
    }
  }
  
  return {
    text: lines.join('\n').trim(),
    dedication,
    epigraph,
  };
};

// Сохранить текущий стих
const finalizePoem = () => {
  if (!currentPoem) return;
  
  const normalizedText = normalizePoem(currentPoem.lines);
  if (!normalizedText) {
    currentPoem = null;
    return;
  }
  
  const { text, dedication, epigraph } = extractMeta(normalizedText);
  if (!text) {
    currentPoem = null;
    return;
  }
  
  const target = currentChapter?.poems ?? currentPart?.poems;
  if (!target) {
    console.warn(`No target for poem ${currentPoem.number}. ${currentPoem.title}`);
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
  
  poemsFound++;
  currentPoem = null;
};

// Начать новую часть
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
};

// Начать новую главу
const startChapter = (number, title) => {
  finalizePoem();
  if (!currentPart) {
    startPart('I', 'СТИХОТВОРЕНИЯ');
  }
  if (!currentPart.chapters) {
    currentPart.chapters = [];
    currentPart.poems = undefined;
  }
  
  // Проверяем, существует ли уже глава с таким номером (для обработки дубликатов в исходнике)
  const existingChapter = currentPart.chapters.find(ch => ch.number === number);
  if (existingChapter) {
    currentChapter = existingChapter;
    return;
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

// Начать новый стих
const startPoem = (number, title) => {
  finalizePoem();
  currentPoem = { number, title: title.trim(), lines: [] };
};

// Флаги состояния
let inToc = false; // Внутри блока оглавления
let inPreface = true; // Внутри предисловия (до первой части)
let lastPoemNumber = 0; // Последний найденный номер стиха
let expectingFirstPoem = false; // Ожидаем первый стих без номера после оглавления

// Заголовки стихов в части I (без номера, но с названием заглавными)
// Определяем как: строка целиком из заглавных букв, пробелов и знаков препинания
const isUppercaseTitle = (str) => {
  const cleaned = str.replace(/[^а-яёА-ЯЁa-zA-Z]/g, '');
  return cleaned.length > 2 && cleaned === cleaned.toUpperCase();
};

// Известные заголовки первых стихов (без номера)
const KNOWN_FIRST_POEMS = ['ЗДРАВСТВУЙ, ГРИН'];

// Обработка строк
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Пропускаем пустые строки если не в стихе
  if (!trimmed && !currentPoem) continue;
  
  // Проверяем начало части
  const partMatch = trimmed.match(PART_REGEX);
  if (partMatch) {
    inPreface = false;
    inToc = true; // После заголовка части идёт оглавление
    expectingFirstPoem = partMatch[1] === 'I'; // Первая часть может иметь стих без номера
    startPart(partMatch[1], partMatch[2]);
    continue;
  }
  
  // Пропускаем всё до первой части (предисловие)
  if (inPreface) continue;
  
  // Проверяем начало главы
  const chapterMatch = trimmed.match(CHAPTER_REGEX);
  if (chapterMatch) {
    inToc = true; // После заголовка главы идёт оглавление
    expectingFirstPoem = false;
    startChapter(Number(chapterMatch[1]), chapterMatch[2]);
    continue;
  }
  
  // Проверяем строку оглавления (NNN. Название — длинное описание)
  if (isTocLine(trimmed)) {
    tocLinesSkipped++;
    continue;
  }
  
  // Проверяем известный первый стих без номера
  if (expectingFirstPoem && KNOWN_FIRST_POEMS.includes(trimmed)) {
    inToc = false;
    expectingFirstPoem = false;
    lastPoemNumber = 1;
    startPoem(1, trimmed);
    continue;
  }
  
  // Проверяем заголовок стиха (NNN. НАЗВАНИЕ)
  const poemMatch = trimmed.match(POEM_HEADER_REGEX);
  if (poemMatch) {
    const number = Number(poemMatch[1]);
    const title = poemMatch[2].trim();
    
    // Это заголовок стиха если:
    // 1. Номер последовательный или близкий к последнему
    // 2. Не содержит длинного описания через тире
    // 3. Мы уже вышли из режима оглавления
    
    if (number >= lastPoemNumber) {
      inToc = false;
      expectingFirstPoem = false;
      lastPoemNumber = number;
      startPoem(number, title);
      continue;
    }
  }
  
  // Если мы в режиме оглавления, пропускаем
  if (inToc && !currentPoem) continue;
  
  // Добавляем строку к текущему стиху
  if (currentPoem) {
    currentPoem.lines.push(line);
  }
}

// Сохранить последний стих
finalizePoem();

// Собрать эпиграф книги
let bookEpigraph = '';
const epigraphStart = lines.findIndex(l => l.includes('«Я никогда не писал'));
if (epigraphStart >= 0) {
  const epigraphLines = [];
  for (let i = epigraphStart; i < Math.min(epigraphStart + 5, lines.length); i++) {
    if (lines[i].trim()) epigraphLines.push(lines[i].trim());
    if (lines[i].includes('Соснора') || lines[i].includes('Поэт')) break;
  }
  bookEpigraph = epigraphLines.join('\n');
}

// Результат
const result = {
  book: {
    title: existingContent.book?.title ?? 'Нервожилия',
    author: existingContent.book?.author ?? 'Автор',
    year: existingContent.book?.year ?? '1980-2025',
    version: existingContent.book?.version ?? '',
    epigraph: bookEpigraph || existingContent.book?.epigraph || '',
  },
  volumes: [
    {
      id: 'volume-1',
      number: 1,
      title: 'КНИГА 1: ПРОСТО ЧЕЛОВЕКОМ',
      subtitle: '',
      parts,
    },
  ],
};

// Подсчёт стихов
const totalPoems = parts.reduce((acc, part) => {
  if (part.poems) return acc + part.poems.length;
  if (part.chapters) return acc + part.chapters.reduce((sum, ch) => sum + ch.poems.length, 0);
  return acc;
}, 0);

// Сохранить результат
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf8');

console.log('\n=== Parsing Results ===');
console.log(`Parts found: ${parts.length}`);
console.log(`Chapters found: ${parts.reduce((acc, p) => acc + (p.chapters?.length ?? 0), 0)}`);
console.log(`TOC lines skipped: ${tocLinesSkipped}`);
console.log(`Poems found: ${totalPoems}`);
console.log(`\nSaved to ${OUTPUT_PATH}`);

// Выведем структуру
console.log('\n=== Structure ===');
parts.forEach((part) => {
  console.log(`\nЧАСТЬ ${part.romanNumeral}. ${part.title}`);
  if (part.chapters) {
    part.chapters.forEach((ch) => {
      console.log(`  Глава ${ch.number}. ${ch.title} (${ch.poems.length} стихов)`);
    });
  } else if (part.poems) {
    console.log(`  (${part.poems.length} стихов без глав)`);
  }
});
