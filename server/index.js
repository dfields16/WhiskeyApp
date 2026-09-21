import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import whiskeysRouter from "./routes/whiskeys.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/whiskeys", whiskeysRouter);
app.get("/api/health", (req, res) => res.json({ ok: true }));

// In production the client is built into ./public and served from the same
// container/port as the API, so this can run as a single self-hosted service.
const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`WhiskeyApp server listening on port ${PORT}`);
});
