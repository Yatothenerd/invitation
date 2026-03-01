import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  try {
    // Use your deployed domain or relative path
    const response = await fetch(`${process.env.VERCEL_URL}/WeddingGuest.xlsx`);
    const buffer = await response.arrayBuffer();

    // Parse the Excel file from buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    res.status(200).json({ guests: json });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
