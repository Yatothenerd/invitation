const XLSX = require('xlsx');
const fs = require('fs');

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h >>> 0, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
function toBase62(num) {
  if (num === 0) return '0';
  let s = '';
  while (num > 0) {
    s = BASE62[num % 62] + s;
    num = Math.floor(num / 62);
  }
  return s;
}
function encodeGuestName(name) {
  const n = fnv1a32((name || '').trim().toLowerCase());
  const code = toBase62(n);
  return code.padStart(6, '0');
}

const paths = [
  './public/WeddingGuest.xlsx',
  './src/WeddingGuest.xlsx'
];

let filePath = paths.find(p => fs.existsSync(p));
if (!filePath) {
  console.error('No WeddingGuest.xlsx found');
  process.exit(1);
}
const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
console.log('Found', data.length, 'rows');
for (const row of data.slice(0, 50)) {
  const name = (row.Name || row.name || Object.values(row)[0] || '').toString();
  console.log(name, '->', encodeGuestName(name));
}
