import fs from 'fs';
import mammoth from 'mammoth';

// Найти все docx файлы
const files = fs.readdirSync('.').filter(f => f.endsWith('.docx'));

console.log('Found docx files:');
files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));

// Найти файл с "финальн" или "сборка" в названии
let targetFile = files.find(f => f.toLowerCase().includes('финальн') || f.toLowerCase().includes('сборка'));

// Если не нашли, берём самый большой по размеру
if (!targetFile) {
  let maxSize = 0;
  for (const f of files) {
    const size = fs.statSync(f).size;
    if (size > maxSize) {
      maxSize = size;
      targetFile = f;
    }
  }
}

if (!targetFile) {
  console.error('No docx files found');
  process.exit(1);
}

console.log(`\nUsing: ${targetFile}`);
console.log(`File size: ${(fs.statSync(targetFile).size / 1024).toFixed(1)} KB\n`);

// Извлечь текст
const result = await mammoth.extractRawText({ path: targetFile });
const text = result.value;

// Сохранить для анализа
fs.writeFileSync('book-content.txt', text, 'utf8');
console.log(`Saved book-content.txt (${text.length} chars)\n`);

// Подсчитать стихи по паттерну "NNN. НАЗВАНИЕ"
const poemPattern = /^(\d+)\.\s+(.+)$/gm;
const poems = [];
let match;
while ((match = poemPattern.exec(text)) !== null) {
  poems.push({ number: parseInt(match[1]), title: match[2].trim() });
}

console.log(`Found ${poems.length} poems by pattern "NNN. TITLE"\n`);

// Показать диапазоны номеров
if (poems.length > 0) {
  const numbers = poems.map(p => p.number).sort((a, b) => a - b);
  console.log(`First poem: ${numbers[0]}`);
  console.log(`Last poem: ${numbers[numbers.length - 1]}`);
  
  // Проверить дыры
  const gaps = [];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] - numbers[i-1] > 1) {
      gaps.push({ from: numbers[i-1] + 1, to: numbers[i] - 1 });
    }
  }
  
  if (gaps.length > 0) {
    console.log(`\nGaps in numbering:`);
    gaps.forEach(g => console.log(`  Missing: ${g.from}-${g.to}`));
  } else {
    console.log(`\nNo gaps in numbering`);
  }
  
  // Проверить дубли
  const duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
  if (duplicates.length > 0) {
    console.log(`\nDuplicate numbers: ${[...new Set(duplicates)].join(', ')}`);
  }
}

// Показать первые и последние 10 стихов
console.log('\n--- First 10 poems ---');
poems.slice(0, 10).forEach(p => console.log(`  ${p.number}. ${p.title}`));

console.log('\n--- Last 10 poems ---');
poems.slice(-10).forEach(p => console.log(`  ${p.number}. ${p.title}`));

// Проверить части
const partPattern = /ЧАСТЬ\s+([IVXLCDM]+)\.\s*(.+)/gi;
const parts = [];
while ((match = partPattern.exec(text)) !== null) {
  parts.push({ roman: match[1], title: match[2].trim() });
}
console.log(`\n--- Found ${parts.length} parts ---`);
parts.forEach(p => console.log(`  ${p.roman}. ${p.title}`));

// Проверить главы
const chapterPattern = /Глава\s+(\d+)\.\s*(.+)/gi;
const chapters = [];
while ((match = chapterPattern.exec(text)) !== null) {
  chapters.push({ number: parseInt(match[1]), title: match[2].trim() });
}
console.log(`\n--- Found ${chapters.length} chapters ---`);
chapters.forEach(c => console.log(`  ${c.number}. ${c.title}`));
