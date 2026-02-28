import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import XLSX from "xlsx";
const xlsxLib: any = (XLSX as any)?.default ?? XLSX;
import fs from "fs";

let db: Database.Database;
try {
  db = new Database("wedding.db");
} catch (err: any) {
  console.error('Failed to open wedding.db:', err?.message || err);
  // If the file is corrupted (SQLITE_NOTADB), remove it and recreate
  try {
    if (fs.existsSync('wedding.db')) {
      fs.unlinkSync('wedding.db');
      console.log('Corrupt wedding.db removed, recreating.');
    }
  } catch (e) {
    console.error('Failed to remove corrupt wedding.db:', e);
  }
  db = new Database('wedding.db');
}

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/wishes", (req, res) => {
    try {
      const wishes = db.prepare("SELECT * FROM wishes ORDER BY created_at DESC").all();
      res.json(wishes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wishes" });
    }
  });

  app.post("/api/wishes", (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required" });
    }
    try {
      const info = db.prepare("INSERT INTO wishes (name, message) VALUES (?, ?)").run(name, message);
      res.json({ id: info.lastInsertRowid, name, message });
    } catch (error) {
      res.status(500).json({ error: "Failed to save wish" });
    }
  });

  app.get("/api/guests", (req, res) => {
    try {
      // Prefer the file in `public/` (where Vite serves static assets),
      // fall back to `src/` if present.
      let filePath = path.join(process.cwd(), 'public', 'WeddingGuest.xlsx');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), 'src', 'WeddingGuest.xlsx');
      }
      if (!fs.existsSync(filePath)) {
        return res.json([]);
      }
      const workbook = xlsxLib.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsxLib.utils.sheet_to_json(worksheet);
      // Assume the column name is "Name" or similar. Let's just return the whole row objects for now.
      res.json(data);
    } catch (error) {
      console.error("Error reading guests:", error);
      res.status(500).json({ error: "Failed to read guest list" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
