import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

// Find the triptych file (not 1-36.docx)
const files = fs.readdirSync('.');
const triptychFile = files.find(f => f.endsWith('.docx') && f !== '1-36.docx');

if (!triptychFile) {
  console.error('Triptych docx file not found');
  process.exit(1);
}

console.log('Processing:', triptychFile);

const { value } = await mammoth.extractRawText({ path: triptychFile });

// Output raw text for analysis
console.log('---RAW TEXT---');
console.log(value);
