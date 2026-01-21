import mammoth from 'mammoth';
import fs from 'fs';

// Find the docx file
const files = fs.readdirSync('.');
const docxFile = files.find(f => f.endsWith('.docx'));

if (!docxFile) {
  console.log('No .docx file found');
  process.exit(1);
}

console.log('Reading file:', docxFile);

mammoth.extractRawText({ path: docxFile })
  .then(result => {
    fs.writeFileSync('book-content.txt', result.value, 'utf8');
    console.log('Content extracted to book-content.txt');
    console.log('---');
    console.log(result.value);
  })
  .catch(err => {
    console.error('Error:', err);
  });
