import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.DB_PATH || path.join(__dirname, "data", "whiskey.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS whiskeys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    proof REAL,
    type TEXT,
    dist TEXT,
    loc TEXT,
    mash TEXT,
    cask TEXT,
    details_finish TEXT,
    details_notes TEXT,
    distilled TEXT,
    bottled TEXT,
    batch TEXT,
    taste_nose TEXT,
    taste_palate TEXT,
    taste_finish TEXT,
    taste_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Maps a DB row (flat, prefixed columns) to the nested export JSON shape.
export function rowToWhiskey(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    proof: row.proof,
    type: row.type,
    details: {
      dist: row.dist,
      loc: row.loc,
      mash: row.mash,
      cask: row.cask,
      finish: row.details_finish,
      notes: row.details_notes,
      distilled: row.distilled,
      bottled: row.bottled,
      batch: row.batch,
    },
    taste: {
      nose: row.taste_nose,
      palate: row.taste_palate,
      finish: row.taste_finish,
      notes: row.taste_notes,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps an incoming nested payload (matching the export JSON shape) to flat DB columns.
export function whiskeyToRow(whiskey) {
  const details = whiskey.details || {};
  const taste = whiskey.taste || {};
  return {
    name: whiskey.name,
    age: whiskey.age ?? null,
    proof: whiskey.proof ?? null,
    type: whiskey.type ?? null,
    dist: details.dist ?? null,
    loc: details.loc ?? null,
    mash: details.mash ?? null,
    cask: details.cask ?? null,
    details_finish: details.finish ?? null,
    details_notes: details.notes ?? null,
    distilled: details.distilled ?? null,
    bottled: details.bottled ?? null,
    batch: details.batch ?? null,
    taste_nose: taste.nose ?? null,
    taste_palate: taste.palate ?? null,
    taste_finish: taste.finish ?? null,
    taste_notes: taste.notes ?? null,
  };
}
