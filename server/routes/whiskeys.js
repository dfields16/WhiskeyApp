import { Router } from "express";
import { db, rowToWhiskey, whiskeyToRow } from "../db.js";

const router = Router();

const listStmt = db.prepare("SELECT * FROM whiskeys ORDER BY name COLLATE NOCASE ASC");
const getStmt = db.prepare("SELECT * FROM whiskeys WHERE id = ?");
const insertStmt = db.prepare(`
  INSERT INTO whiskeys (
    name, age, proof, type, dist, loc, mash, cask,
    details_finish, details_notes, distilled, bottled, batch,
    taste_nose, taste_palate, taste_finish, taste_notes
  ) VALUES (
    @name, @age, @proof, @type, @dist, @loc, @mash, @cask,
    @details_finish, @details_notes, @distilled, @bottled, @batch,
    @taste_nose, @taste_palate, @taste_finish, @taste_notes
  )
`);
const updateStmt = db.prepare(`
  UPDATE whiskeys SET
    name = @name, age = @age, proof = @proof, type = @type,
    dist = @dist, loc = @loc, mash = @mash, cask = @cask,
    details_finish = @details_finish, details_notes = @details_notes,
    distilled = @distilled, bottled = @bottled, batch = @batch,
    taste_nose = @taste_nose, taste_palate = @taste_palate,
    taste_finish = @taste_finish, taste_notes = @taste_notes,
    updated_at = datetime('now')
  WHERE id = @id
`);
const deleteStmt = db.prepare("DELETE FROM whiskeys WHERE id = ?");

function validate(body) {
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return "name is required";
  }
  return null;
}

// List (summary data used by the collection view)
router.get("/", (req, res) => {
  const rows = listStmt.all();
  res.json(rows.map(rowToWhiskey));
});

// Export the whole collection in the nested JSON format
router.get("/export", (req, res) => {
  const rows = listStmt.all();
  const whiskeys = rows.map(rowToWhiskey).map(stripMeta).map(stripEmpty);
  res.setHeader("Content-Disposition", 'attachment; filename="whiskey-collection.json"');
  res.type("application/json").send(JSON.stringify(whiskeys, null, 2));
});

router.get("/:id", (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(rowToWhiskey(row));
});

router.get("/:id/export", (req, res) => {
  const row = getStmt.get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  const whiskey = stripEmpty(stripMeta(rowToWhiskey(row)));
  const filename = `${(whiskey.name || "whiskey").replace(/[^a-z0-9_-]+/gi, "_")}.json`;
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.type("application/json").send(JSON.stringify(whiskey, null, 2));
});

router.post("/", (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const row = whiskeyToRow(req.body);
  const info = insertStmt.run(row);
  const created = getStmt.get(info.lastInsertRowid);
  res.status(201).json(rowToWhiskey(created));
});

router.put("/:id", (req, res) => {
  const existing = getStmt.get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const row = whiskeyToRow(req.body);
  updateStmt.run({ ...row, id: req.params.id });
  const updated = getStmt.get(req.params.id);
  res.json(rowToWhiskey(updated));
});

router.delete("/:id", (req, res) => {
  const info = deleteStmt.run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

function stripMeta({ id, createdAt, updatedAt, ...rest }) {
  return rest;
}

// Recursively drops null/undefined/empty-string values (and objects left
// empty by that) so exported JSON only contains fields that are actually set.
function stripEmpty(value) {
  if (Array.isArray(value)) {
    return value.map(stripEmpty).filter((v) => v !== undefined);
  }
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const [key, raw] of Object.entries(value)) {
      const cleaned = stripEmpty(raw);
      if (cleaned === null || cleaned === undefined || cleaned === "") continue;
      if (typeof cleaned === "object" && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) {
        continue;
      }
      out[key] = cleaned;
    }
    return out;
  }
  return value;
}

export default router;
