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
docker compose build
docker compose up -d
```

The app is then available at `http://<your-server>:3001`.

To use a different port, edit the `ports` mapping in `docker-compose.yml` (e.g. `"8080:3001"`).

Without compose:

```bash
docker build -t whiskeyapp .
docker run -d --name whiskeyapp -p 3001:3001 -v whiskey-data:/data whiskeyapp
```

## Exporting entries

Each whiskey's detail page has an **Export** button that downloads that bottle as JSON in this shape:

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

The collection page's **Export All** button downloads every entry as a JSON array in the same shape.
