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

## Enabling HTTPS with a self-signed cert (optional, LAN-only testing)

The server can terminate HTTPS itself — no reverse proxy needed — if you point it at a cert and key via the `TLS_CERT_PATH`/`TLS_KEY_PATH` env vars. These steps generate a self-signed cert good for your LAN IP (works on WSL/Ubuntu; run them from the repo root):

1. **Find your LAN IP** (the address your phone will use to reach this machine):

   ```bash
   hostname -I | awk '{print $1}'
   ```

   Note it down — you'll need it below. (If you're on WSL2 with the default NAT network, this is the WSL VM's own IP, not your Windows host's LAN IP — see the WSL note below.)

2. **Generate the cert**, replacing `192.168.1.50` with the IP from step 1:

   ```bash
   mkdir -p certs
   IP=192.168.1.50
   openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
     -keyout certs/key.pem -out certs/cert.pem \
     -subj "/CN=$IP" \
     -addext "subjectAltName=IP:$IP"
   ```

3. **Enable it in `docker-compose.yml`** — uncomment the `./certs:/certs:ro` volume line and the `environment:` block (both already there, commented out).

4. **Rebuild and restart**:

   ```bash
   docker compose up -d --build
   ```

   The server logs should now say `(HTTPS)`. Visit `https://<your-LAN-IP>:3001` from your phone.

5. **Trust the cert on your iPhone.** Safari will show a privacy warning first — tap "Show Details" → "visit this website" to get past it. To avoid that warning on every visit, install the cert as a trusted profile instead:

   - Get `certs/cert.pem` onto the phone (AirDrop it, or email it to yourself).
   - Open it — iOS will prompt to install a profile (Settings → General → VPN & Device Management → install).
   - Then go to Settings → General → About → Certificate Trust Settings, and enable full trust for the certificate.

**WSL2 networking note:** if your phone can't reach `https://<WSL-IP>:3001` at all, it's a Windows-side networking gap, not the app. Newer WSL (Windows 11, WSL ≥ 2.0.0) can use *mirrored* networking, which makes the WSL VM share the Windows host's network directly — add this to `%UserProfile%\.wslconfig` on Windows, then `wsl --shutdown` and restart WSL:

```ini
[wsl2]
networkingMode=mirrored
```

With mirrored networking, use your Windows machine's own LAN IP (not the WSL-internal one) in steps 1–2 above. On older WSL without mirrored mode, forward the port from Windows to WSL instead (run in an admin PowerShell, replacing `<WSL-IP>` with the address from step 1):

```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=<WSL-IP> connectport=3001
netsh advfirewall firewall add rule name="WhiskeyApp" dir=in action=allow protocol=TCP localport=3001
```

Then use your Windows machine's LAN IP from your phone.

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
