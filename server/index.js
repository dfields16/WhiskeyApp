import express from "express";
import cors from "cors";
import https from "https";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import whiskeysRouter from "./routes/whiskeys.js";
import lookupRouter from "./routes/lookup.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/whiskeys", whiskeysRouter);
app.use("/api/lookup", lookupRouter);
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

// If TLS_KEY_PATH/TLS_CERT_PATH are set, serve HTTPS directly (e.g. with a
// self-signed cert for LAN testing) so browsers treat the origin as secure
// — required for camera access when scanning barcodes. Falls back to plain
// HTTP when they're not set, so local dev is unaffected.
const tlsKeyPath = process.env.TLS_KEY_PATH;
const tlsCertPath = process.env.TLS_CERT_PATH;

if (tlsKeyPath && tlsCertPath) {
  const options = {
    key: fs.readFileSync(tlsKeyPath),
    cert: fs.readFileSync(tlsCertPath),
  };
  https.createServer(options, app).listen(PORT, () => {
    console.log(`WhiskeyApp server listening on port ${PORT} (HTTPS)`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`WhiskeyApp server listening on port ${PORT} (HTTP)`);
  });
}
