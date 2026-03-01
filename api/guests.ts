import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  try {
    const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/WeddingGuest.xlsx`);
    if (!response.ok) return res.status(404).json({ error: 'WeddingGuest.xlsx not found' });

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const guests = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    res.status(200).json({ guests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}