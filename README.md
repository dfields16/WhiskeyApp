# WhiskeyApp

A personal whiskey collection catalog: log bottles, tasting notes, and details, then export any entry (or the whole collection) as JSON.

- **Frontend:** React + Vite (client-rendered SPA)
- **Backend:** Express REST API
- **Storage:** SQLite (via `better-sqlite3`)

## Project layout

```
client/   React + Vite app
server/   Express API + SQLite database
```

## Local development

Run the API and the Vite dev server side by side (two terminals):

```bash
cd server && npm install && npm run dev   # http://localhost:3001
cd client && npm install && npm run dev   # http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to the Express server, so open `http://localhost:5173`. The SQLite file is created at `server/data/whiskey.db`.

## Running on your own server (Docker)

The whole app — API and built React client — runs as a single container. The SQLite database is stored on a named volume so it survives restarts and rebuilds.

```bash
docker compose up -d --build
```

The app is then available at `http://<your-server>:3001`.

To use a different port, edit the `ports` mapping in `docker-compose.yml` (e.g. `"8080:3001"`).

Without compose:

```bash
docker build -t whiskeyapp .
docker run -d --name whiskeyapp -p 3001:3001 -v whiskey-data:/data whiskeyapp
```

## Scanning a barcode (mobile)

The Basics step of the add/edit form has a **📷 Scan Barcode** button that opens your camera, reads a UPC/EAN barcode, and looks it up to pre-fill the name, type, and distillery/brand fields (anything you've already typed is left alone). It uses two free, keyless APIs — [Open Food Facts](https://world.openfoodfacts.org/) first, then [UPCitemdb](https://www.upcitemdb.com/)'s trial endpoint (capped at 100 lookups/day per server) as a fallback — so coverage varies by product and neither is whiskey-specific; you'll often still need to fill in distillery-specific details (mash bill, cask, tasting notes, etc.) by hand.

**Requires HTTPS.** Browsers only allow camera access (`getUserMedia`) on a secure origin — `https://` or `localhost`. Scanning works out of the box in local dev (`localhost`) but won't work on a plain-HTTP self-hosted deployment reached over `http://your-server:3001`. Put the container behind a reverse proxy (e.g. Caddy or nginx with Let's Encrypt, or a self-signed cert for LAN-only use) to get HTTPS on your own server. The rest of the app works fine without it — this only affects the scan button.

## Exporting entries

Each whiskey's detail page has an **Export** button that copies that bottle as formatted JSON (empty/null fields omitted) to your clipboard, in this shape:

```json
{
  "name": "Example 12 Year",
  "age": 12,
  "proof": 80,
  "type": "Bourbon",
  "details": {
    "dist": "Example Distillery",
    "loc": "Kentucky, USA",
    "mash": "70C/18R/12B",
    "cask": "American Oak",
    "finish": "None",
    "notes": "Warehouse A, Rickhouse",
    "distilled": "2014-03-12",
    "bottled": "2026-04-18",
    "batch": "B24"
  },
  "taste": {
    "nose": "Vanilla, oak, caramel",
    "palate": "Toffee, baking spice",
    "finish": "Long, warm, oak",
    "notes": "Rich and spicy"
  }
}
```

The collection page's **Export All** button copies every entry as a JSON array in the same shape.
