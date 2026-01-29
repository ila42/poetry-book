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

  return poems
    .map((poem) => ({
      number: poem.number,
      title: poem.title,
      // Убираем лишние пустые строки - оставляем только одиночные переносы
      text: poem.lines.join('\n')
        .replace(/\n{2,}/g, '\n')  // Заменяем множественные переносы на одиночные
        .replace(/^\n+/, '')       // Убираем переносы в начале
        .replace(/\n+$/, '')       // Убираем переносы в конце
        .trim(),
    }))
    // Пропускаем стихи с пустым текстом
    .filter(poem => poem.text.length > 0);
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
  
  // Убираем лишние пустые строки
  const text = value
    .replace(/\n{3,}/g, '\n\n')  // Максимум двойной перенос для разделения частей
    .trim();
  
  return {
    title: 'ТРИПТИХ: ОСЕНЬ И КАЛИКИ',
    text: text,
  };
}

// Извлекаем стихи
const poems136 = await extractPoems136();
const triptych = await extractTriptych();

console.log(`Извлечено ${poems136.length} стихов из 1-36.docx`);

// Создаём новую структуру content.json ТОЛЬКО с извлечёнными стихами
const content = {
  "book": {
    "title": "Нервожилия",
    "author": "Автор",
    "year": "1980-2025",
    "version": "",
    "epigraph": {
      "text": "«Я никогда не писал ни для читателя, ни для… ни для кого! Хуже того скажу вам: я и для себя не писал никогда. Это просто находит какое-то состояние, понимаете… и… пишется. А потом не пишется»",
      "source": "Виктор Соснора"
    }
  },
  "volumes": [
    {
      "id": "volume-1",
      "number": 1,
      "title": "ТОМ I",
      "subtitle": "",
      "parts": [
        {
          "id": "part-1",
          "number": 1,
          "title": "СТИХОТВОРЕНИЯ",
          "subtitle": "",
          "chapters": null,
          "poems": []
        }
      ]
    }
  ]
};

// Добавляем все стихи из 1-36.docx
poems136.forEach((poem, index) => {
  content.volumes[0].parts[0].poems.push({
    "id": `poem-${index + 1}`,
    "number": index + 1,
    "title": poem.title,
    "firstLine": poem.text.split('\n')[0] || '',
    "text": poem.text,
    "audioUrl": null
  });
});

// Добавляем триптих как последнее стихотворение
if (triptych) {
  const lastNumber = content.volumes[0].parts[0].poems.length + 1;
  content.volumes[0].parts[0].poems.push({
    "id": `poem-${lastNumber}`,
    "number": lastNumber,
    "title": triptych.title,
    "firstLine": "Осень с погодой обычно обманчива...",
    "text": triptych.text,
    "audioUrl": null
  });
}

const totalPoems = content.volumes[0].parts[0].poems.length;
console.log(`Всего стихотворений в книге: ${totalPoems}`);
console.log(`Ожидаемое количество страниц: ${totalPoems + 3} (титульная + оглавление + эпиграф + стихи)`);

// Сохраняем
fs.writeFileSync('src/data/content.json', JSON.stringify(content, null, 2), 'utf-8');
console.log('Новый content.json создан!');

// Выводим список стихов
console.log('\nСписок стихотворений:');
content.volumes[0].parts[0].poems.forEach(p => {
  console.log(`${p.number}. ${p.title}`);
});
