const BASE = "/api/whiskeys";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export function listWhiskeys() {
  return fetch(BASE).then(handle);
}

export function getWhiskey(id) {
  return fetch(`${BASE}/${id}`).then(handle);
}

export function createWhiskey(data) {
  return fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function updateWhiskey(id, data) {
  return fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(handle);
}

export function deleteWhiskey(id) {
  return fetch(`${BASE}/${id}`, { method: "DELETE" }).then(handle);
}

function exportUrl(id) {
  return id ? `${BASE}/${id}/export` : `${BASE}/export`;
}

// The server already returns formatted, empty-value-stripped JSON text for
// export endpoints, so fetch it as text and reuse it verbatim (e.g. for
// copying to the clipboard) rather than re-serializing.
async function fetchExportText(id) {
  const res = await fetch(exportUrl(id));
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.text();
}

export function exportWhiskeyJson(id) {
  return fetchExportText(id);
}

export function exportAllWhiskeysJson() {
  return fetchExportText();
}

export function lookupBarcode(code) {
  return fetch(`/api/lookup/barcode/${encodeURIComponent(code)}`).then(handle);
}
