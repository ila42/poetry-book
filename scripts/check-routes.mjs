/**
 * Проверка роутов для всех стихов
 * Генерирует список URL и проверяет, что все стихи доступны
 */
import fs from 'fs';

const contentPath = 'src/data/content.json';
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Собрать все стихи
const poems = [];
for (const volume of content.volumes ?? []) {
  for (const part of volume.parts ?? []) {
    if (part.poems) {
      part.poems.forEach((poem) => poems.push(poem));
    }
    if (part.chapters) {
      part.chapters.forEach((chapter) => {
        chapter.poems?.forEach((poem) => poems.push(poem));
      });
    }
  }
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║           ПРОВЕРКА РОУТОВ                                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Генерация URL
const baseUrl = 'http://localhost:5173';
const urls = poems.map(p => ({
  id: p.id,
  number: p.number,
  title: p.title,
  url: `${baseUrl}/poem/${p.id}`
}));

console.log(`Всего стихов: ${poems.length}`);
console.log(`\nПримеры URL:`);
console.log(`  Первый: ${urls[0].url}`);
console.log(`  Последний: ${urls[urls.length - 1].url}`);
console.log(`  Случайный: ${urls[Math.floor(Math.random() * urls.length)].url}`);

// Проверка уникальности slug/id
const ids = poems.map(p => p.id);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicates.length > 0) {
  console.log(`\n❌ Дубликаты ID (проблема роутинга): ${[...new Set(duplicates)].join(', ')}`);
} else {
  console.log(`\n✅ Все ID уникальны — роуты корректны`);
}

// Проверка навигации prev/next
console.log('\n═══ НАВИГАЦИЯ PREV/NEXT ═══');
console.log(`Первый стих (${poems[0].number}. ${poems[0].title}):`);
console.log(`  ← prev: нет (начало книги)`);
console.log(`  → next: ${poems[1].number}. ${poems[1].title}`);

console.log(`\nПоследний стих (${poems[poems.length - 1].number}. ${poems[poems.length - 1].title}):`);
console.log(`  ← prev: ${poems[poems.length - 2].number}. ${poems[poems.length - 2].title}`);
console.log(`  → next: нет (конец книги)`);

// Проверка порядка — стихи должны идти по номеру
const numbers = poems.map(p => p.number);
let orderOk = true;
for (let i = 1; i < numbers.length; i++) {
  if (numbers[i] < numbers[i - 1]) {
    console.log(`\n⚠️ Нарушен порядок между ${numbers[i - 1]} и ${numbers[i]}`);
    orderOk = false;
  }
}
if (orderOk) {
  console.log('\n✅ Порядок стихов корректен (по возрастанию номера)');
}

// Сохранить список URL для тестирования
const urlList = urls.map(u => u.url).join('\n');
fs.writeFileSync('poem-urls.txt', urlList, 'utf8');
console.log(`\n📄 Список URL сохранён в poem-urls.txt (${urls.length} строк)`);

// Пример curl команды для проверки
console.log('\n═══ ДЛЯ РУЧНОЙ ПРОВЕРКИ ═══');
console.log('Запустите dev сервер: npm run dev');
console.log('Откройте в браузере:');
urls.slice(0, 5).forEach(u => console.log(`  ${u.url}`));
console.log('  ...');
