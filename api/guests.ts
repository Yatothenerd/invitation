import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  try {
    // Use your deployed domain in production, localhost in dev oh yeah
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/WeddingGuest.xlsx`);
    if (!response.ok) {
      return res.status(404).json({ error: 'WeddingGuest.xlsx not found' });
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    res.status(200).json({ guests: json });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}