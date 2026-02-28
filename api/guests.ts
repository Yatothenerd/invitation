import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

export default async function handler(req: any, res: any) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'WeddingGuest.xlsx');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'WeddingGuest.xlsx not found in public/' });
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    return res.status(200).json({ guests: json });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
