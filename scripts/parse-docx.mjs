import mammoth from 'mammoth';

const [, , docxPath] = process.argv;

if (!docxPath) {
  console.error('Usage: node scripts/parse-docx.mjs <path-to-docx>');
  process.exit(1);
}

const { value } = await mammoth.extractRawText({ path: docxPath });
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

const normalized = poems.map((poem) => ({
  number: poem.number,
  title: poem.title,
  text: poem.lines.join('\n').replace(/\n+$/, '').replace(/^\n+/, ''),
}));

console.log(JSON.stringify(normalized, null, 2));
