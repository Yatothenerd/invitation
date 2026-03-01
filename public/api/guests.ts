import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

import * as XLSX from 'xlsx';

export default async function handler(req, res) {
  try {
    // Build base URL depending on environment
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    // Fetch the Excel file from public/
    const response = await fetch(`${baseUrl}/WeddingGuest.xlsx`);
    if (!response.ok) {
      return res.status(404).json({ error: 'WeddingGuest.xlsx not found' });
    }

    // Convert to buffer
    const buffer = await response.arrayBuffer();

    // Parse with XLSX
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const guests = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Return JSON response
    res.status(200).json({ guests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
