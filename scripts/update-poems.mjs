import fs from 'fs';
import mammoth from 'mammoth';

// Извлекаем стихи из 1-36.docx
async function extractPoems136() {
  const { value } = await mammoth.extractRawText({ path: '1-36.docx' });
  const lines = value.split(/\r?\n/);

  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('*')) return false;
    if (/^ЧАСТЬ\b/i.test(trimmed)) return false;
    if (/^Глава\b/i.test(trimmed)) return false;
    return true;
  });

  const poems = [];
  let current = null;

  for (const lineRaw of filtered) {
    const line = lineRaw.replace(/\s+$/, '');
    const match = line.match(/^\s*(\d+)\.\s+(.+)$/);

    if (match) {
      if (current) poems.push(current);
      current = {
        number: Number(match[1]),
        title: match[2].trim(),
        lines: [],
      };
      continue;
    }

    if (current) current.lines.push(line);
  }

  if (current) poems.push(current);

  return poems.map((poem) => ({
    number: poem.number,
    title: poem.title,
    text: poem.lines.join('\n').replace(/\n+$/, '').replace(/^\n+/, ''),
  }));
}

// Извлекаем триптих
async function extractTriptych() {
  const files = fs.readdirSync('.');
  const triptychFile = files.find(f => f.endsWith('.docx') && f !== '1-36.docx');
  
  if (!triptychFile) {
    console.error('Triptych file not found');
    return null;
  }

  const { value } = await mammoth.extractRawText({ path: triptychFile });
  
  // Разбираем триптих на три части
  const text = value.trim();
  
  return {
    title: 'ТРИПТИХ: ОСЕНЬ И КАЛИКИ',
    text: text,
  };
}

// Читаем существующий content.json
const contentPath = 'src/data/content.json';
const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

// Извлекаем стихи
const poems136 = await extractPoems136();
const triptych = await extractTriptych();

console.log(`Извлечено ${poems136.length} стихов из 1-36.docx`);
if (triptych) {
  console.log('Извлечён триптих');
}

// Создаём карту стихов по ID (poem-1, poem-2, ..., poem-40)
const poemMap = new Map();
poems136.forEach(poem => {
  const id = `poem-${poem.number}`;
  poemMap.set(id, poem);
});

// Функция для нормализации текста
function normalizeText(text) {
  // Убираем лишние пустые строки, но сохраняем структуру стиха
  return text
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Обновляем стихи ТОЛЬКО в Томе 1 (volume-1)
let updatedCount = 0;

function updatePoemsInVolume1(volume) {
  if (!volume || volume.id !== 'volume-1') return;
  
  function processItems(items) {
    if (!items) return;
    
    for (const item of items) {
      if (item.poems) {
        for (const poem of item.poems) {
          // Обновляем по ID стиха
          if (poemMap.has(poem.id)) {
            const extracted = poemMap.get(poem.id);
            poem.text = normalizeText(extracted.text);
            updatedCount++;
            console.log(`✓ Обновлён стих #${poem.number}: ${poem.title}`);
          }
          
          // Обновляем триптих (стих 56)
          if (poem.id === 'poem-56' && triptych) {
            poem.text = normalizeText(triptych.text);
            updatedCount++;
            console.log(`✓ Обновлён триптих: ${poem.title}`);
          }
        }
      }
      
      if (item.chapters) {
        processItems(item.chapters);
      }
    }
  }
  
  processItems(volume.parts);
}

// Обновляем ТОЛЬКО Том 1
const volume1 = content.volumes.find(v => v.id === 'volume-1');
if (volume1) {
  updatePoemsInVolume1(volume1);
} else {
  console.error('Том 1 не найден!');
}

console.log(`\nВсего обновлено ${updatedCount} стихов`);

// Сохраняем обновлённый content.json
fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf-8');
console.log('content.json обновлён!');
