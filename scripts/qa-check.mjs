/**
 * QA Проверка книги стихов
 * Проверяет: количество, уникальность, структуру, качество данных
 */
import fs from 'fs';

const contentPath = 'src/data/content.json';
const bookTextPath = 'book-content.txt';

// Загрузка данных
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const bookText = fs.existsSync(bookTextPath) ? fs.readFileSync(bookTextPath, 'utf8') : '';

// Собрать все стихи
const poems = [];
for (const volume of content.volumes ?? []) {
  for (const part of volume.parts ?? []) {
    if (part.poems) {
      part.poems.forEach((poem) => poems.push({ ...poem, partId: part.id, partTitle: part.title }));
    }
    if (part.chapters) {
      part.chapters.forEach((chapter) => {
        chapter.poems?.forEach((poem) => poems.push({ 
          ...poem, 
          partId: part.id, 
          partTitle: part.title,
          chapterId: chapter.id,
          chapterTitle: chapter.title 
        }));
      });
    }
  }
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║           QA ПРОВЕРКА КНИГИ СТИХОВ                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════════════════════════
// 1. ПРОВЕРКА КОЛИЧЕСТВА
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 1. КОЛИЧЕСТВО СТИХОВ ═══');
console.log(`Всего стихов: ${poems.length}`);
console.log(`Требуется: > 200`);
console.log(`Статус: ${poems.length > 200 ? '✅ OK' : '❌ FAIL'}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// 2. УНИКАЛЬНОСТЬ ID
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 2. УНИКАЛЬНОСТЬ ID ═══');
const ids = poems.map(p => p.id);
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicateIds.length > 0) {
  console.log(`❌ Дубликаты ID: ${[...new Set(duplicateIds)].join(', ')}`);
} else {
  console.log('✅ Все ID уникальны');
}
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// 3. УНИКАЛЬНОСТЬ НОМЕРОВ
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 3. УНИКАЛЬНОСТЬ НОМЕРОВ ═══');
const numbers = poems.map(p => p.number).sort((a, b) => a - b);
const duplicateNumbers = numbers.filter((n, i) => numbers.indexOf(n) !== i);
if (duplicateNumbers.length > 0) {
  console.log(`❌ Дубликаты номеров: ${[...new Set(duplicateNumbers)].join(', ')}`);
  duplicateNumbers.forEach(n => {
    const dups = poems.filter(p => p.number === n);
    dups.forEach(p => console.log(`   ${p.id}: "${p.title}"`));
  });
} else {
  console.log('✅ Все номера уникальны');
}
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// 4. ПРОПУСКИ В НУМЕРАЦИИ
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 4. ПРОПУСКИ В НУМЕРАЦИИ ═══');
const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
const minNum = uniqueNumbers[0];
const maxNum = uniqueNumbers[uniqueNumbers.length - 1];
console.log(`Диапазон: ${minNum} - ${maxNum}`);
console.log(`Ожидаемое количество: ${maxNum - minNum + 1}`);
console.log(`Фактическое количество: ${uniqueNumbers.length}`);

const gaps = [];
for (let n = minNum; n <= maxNum; n++) {
  if (!uniqueNumbers.includes(n)) {
    gaps.push(n);
  }
}

if (gaps.length > 0) {
  console.log(`⚠️ Пропущенные номера (${gaps.length}):`);
  // Группируем последовательные пропуски
  const gapRanges = [];
  let start = gaps[0];
  let prev = gaps[0];
  for (let i = 1; i <= gaps.length; i++) {
    if (i === gaps.length || gaps[i] !== prev + 1) {
      if (start === prev) {
        gapRanges.push(`${start}`);
      } else {
        gapRanges.push(`${start}-${prev}`);
      }
      if (i < gaps.length) {
        start = gaps[i];
        prev = gaps[i];
      }
    } else {
      prev = gaps[i];
    }
  }
  console.log(`   ${gapRanges.join(', ')}`);
} else {
  console.log('✅ Нет пропусков');
}
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// 5. ПРОВЕРКА ТЕКСТА
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 5. ПРОВЕРКА ТЕКСТА ═══');
const problems = [];

poems.forEach(poem => {
  const issues = [];
  
  // Пустой текст
  if (!poem.text || poem.text.trim() === '') {
    issues.push('пустой текст');
  }
  
  // Очень короткий текст (меньше 10 символов)
  if (poem.text && poem.text.length < 10) {
    issues.push(`слишком короткий (${poem.text.length} симв.)`);
  }
  
  // Склеенные строки (нет переносов в длинном тексте)
  if (poem.text && poem.text.length > 100 && !poem.text.includes('\n')) {
    issues.push('возможно склеенные строки');
  }
  
  // Мусорные префиксы
  if (poem.text && /^\d{3}\./.test(poem.text)) {
    issues.push('текст начинается с номера (XXX.)');
  }
  
  // Заголовок только из номера
  if (poem.title && /^[\d.\s]+$/.test(poem.title)) {
    issues.push('заголовок только из чисел');
  }
  
  // Служебные слова в тексте
  const serviceWords = ['ЧАСТЬ', 'СОДЕРЖАНИЕ', 'ОГЛАВЛЕНИЕ', 'ГЛАВА'];
  for (const word of serviceWords) {
    if (poem.text && poem.text.includes(word) && !poem.title.includes(word)) {
      issues.push(`служебное слово "${word}" в тексте`);
    }
  }
  
  // Сломанные символы
  if (poem.text && poem.text.includes('�')) {
    issues.push('сломанные символы (□)');
  }
  
  // Странные кавычки
  if (poem.text && (poem.text.includes('\"') || poem.text.includes('\''))) {
    // Это нормально, пропускаем
  }
  
  if (issues.length > 0) {
    problems.push({ poem, issues });
  }
});

if (problems.length > 0) {
  console.log(`⚠️ Найдено ${problems.length} стихов с проблемами:`);
  problems.slice(0, 20).forEach(({ poem, issues }) => {
    console.log(`   ${poem.number}. ${poem.title}: ${issues.join(', ')}`);
  });
  if (problems.length > 20) {
    console.log(`   ... и ещё ${problems.length - 20}`);
  }
} else {
  console.log('✅ Все тексты в порядке');
}
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// 6. ПРОВЕРКА ДУБЛИКАТОВ ТЕКСТА
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 6. ДУБЛИКАТЫ ТЕКСТА ═══');
const textMap = new Map();
poems.forEach(poem => {
  const normalized = poem.text?.replace(/\s+/g, ' ').trim().toLowerCase() || '';
  if (normalized.length > 50) { // Только для достаточно длинных текстов
    if (textMap.has(normalized)) {
      textMap.get(normalized).push(poem);
    } else {
      textMap.set(normalized, [poem]);
    }
  }
});

const textDuplicates = [...textMap.entries()].filter(([, arr]) => arr.length > 1);
if (textDuplicates.length > 0) {
  console.log(`❌ Найдено ${textDuplicates.length} дубликатов текста:`);
  textDuplicates.forEach(([, arr]) => {
    console.log(`   Одинаковый текст:`);
    arr.forEach(p => console.log(`     - ${p.number}. ${p.title}`));
  });
} else {
  console.log('✅ Нет дубликатов текста');
}
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// 7. СВЕРКА С ИСХОДНИКОМ
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 7. СВЕРКА С ИСХОДНИКОМ ═══');
if (bookText) {
  // Найти все заголовки стихов в исходном тексте
  const sourceHeaders = [];
  const headerRegex = /^0*(\d+)\.\s+(.+?)(?:\s*[—–-]\s+.+)?$/gm;
  let match;
  while ((match = headerRegex.exec(bookText)) !== null) {
    // Пропускаем строки оглавления (с описанием после тире)
    if (!match[0].includes('—') && !match[0].includes('–')) {
      sourceHeaders.push({ number: parseInt(match[1]), title: match[2].trim() });
    }
  }
  
  console.log(`Заголовков в исходнике: ${sourceHeaders.length}`);
  console.log(`Стихов в JSON: ${poems.length}`);
  
  // Найти пропущенные
  const jsonNumbers = new Set(poems.map(p => p.number));
  const missing = sourceHeaders.filter(h => !jsonNumbers.has(h.number));
  
  if (missing.length > 0) {
    console.log(`⚠️ Стихи в исходнике, которых нет в JSON (${missing.length}):`);
    missing.slice(0, 15).forEach(h => console.log(`   ${h.number}. ${h.title}`));
    if (missing.length > 15) console.log(`   ... и ещё ${missing.length - 15}`);
  } else {
    console.log('✅ Все стихи из исходника присутствуют');
  }
} else {
  console.log('⚠️ Файл book-content.txt не найден, сверка пропущена');
}
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// 8. СТРУКТУРА ДАННЫХ
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 8. СТРУКТУРА ДАННЫХ ═══');
console.log(`Томов: ${content.volumes?.length ?? 0}`);
let totalParts = 0;
let totalChapters = 0;
content.volumes?.forEach(v => {
  totalParts += v.parts?.length ?? 0;
  v.parts?.forEach(p => {
    totalChapters += p.chapters?.length ?? 0;
  });
});
console.log(`Частей: ${totalParts}`);
console.log(`Глав: ${totalChapters}`);
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// 9. 10 СЛУЧАЙНЫХ СТИХОВ
// ═══════════════════════════════════════════════════════════════════════════
console.log('═══ 9. 10 СЛУЧАЙНЫХ СТИХОВ ДЛЯ РУЧНОЙ ПРОВЕРКИ ═══');
const shuffled = [...poems].sort(() => Math.random() - 0.5);
shuffled.slice(0, 10).forEach(poem => {
  const lines = poem.text?.split('\n') || [];
  const preview = lines.slice(0, 2).join(' / ').substring(0, 60);
  console.log(`${poem.number}. ${poem.title}`);
  console.log(`   "${preview}..."`);
  console.log(`   [${lines.length} строк, ${poem.chapterTitle || poem.partTitle}]`);
});
console.log();

// ═══════════════════════════════════════════════════════════════════════════
// ИТОГ
// ═══════════════════════════════════════════════════════════════════════════
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                       ИТОГ                                 ║');
console.log('╠════════════════════════════════════════════════════════════╣');
const hasIssues = duplicateIds.length > 0 || 
                  duplicateNumbers.length > 0 || 
                  problems.length > 0 || 
                  textDuplicates.length > 0 ||
                  poems.length <= 200;
console.log(`║ Всего стихов: ${poems.length.toString().padEnd(44)}║`);
console.log(`║ Дубликаты ID: ${(duplicateIds.length > 0 ? '❌ ' + duplicateIds.length : '✅ нет').padEnd(44)}║`);
console.log(`║ Дубликаты номеров: ${(duplicateNumbers.length > 0 ? '❌ ' + duplicateNumbers.length : '✅ нет').padEnd(39)}║`);
console.log(`║ Проблемы с текстом: ${(problems.length > 0 ? '⚠️ ' + problems.length : '✅ нет').padEnd(38)}║`);
console.log(`║ Дубликаты текста: ${(textDuplicates.length > 0 ? '❌ ' + textDuplicates.length : '✅ нет').padEnd(40)}║`);
console.log(`║ Пропуски в нумерации: ${(gaps.length > 0 ? '⚠️ ' + gaps.length : '✅ нет').padEnd(36)}║`);
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║ Общий статус: ${hasIssues ? '⚠️  ТРЕБУЕТ ВНИМАНИЯ' : '✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ'}${' '.repeat(hasIssues ? 24 : 18)}║`);
console.log('╚════════════════════════════════════════════════════════════╝');

// Выход с кодом ошибки если есть критические проблемы
if (duplicateIds.length > 0 || poems.length <= 200) {
  process.exit(1);
}
