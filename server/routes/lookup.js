import { Router } from "express";

const router = Router();

const TYPE_PATTERNS = [
  [/bourbon/, "Bourbon"],
  [/rye/, "Rye"],
  [/single[\s-]?malt/, "Single Malt Scotch"],
  [/scotch/, "Scotch"],
  [/irish/, "Irish Whiskey"],
  [/japanese/, "Japanese Whisky"],
  [/blended/, "Blended Whiskey"],
  [/tennessee/, "Tennessee Whiskey"],
  [/whisky|whiskey/, "Whiskey"],
];

function detectType(text) {
  const t = (text || "").toLowerCase();
  for (const [pattern, label] of TYPE_PATTERNS) {
    if (pattern.test(t)) return label;
  }
  return null;
}

// Retailer titles/descriptions often state proof plainly ("107 Proof") or,
// more tersely in all-caps titles, as a trailing token ("750ML 107P").
function extractProof(text) {
  const t = text || "";
  const explicit = t.match(/(\d+(?:\.\d+)?)\s*(?:degrees?\s*)?proof\b/i);
  if (explicit) return Number(explicit[1]);
  const abbreviated = t.match(/\b(\d{2,3}(?:\.\d+)?)\s*p\b/i);
  if (abbreviated) return Number(abbreviated[1]);
  return null;
}

function extractAge(text) {
  const match = (text || "").match(/\b(\d{1,2})\s*(?:years?|yrs?|yo)\b/i);
  return match ? Number(match[1]) : null;
}

// Open Food Facts: free, keyless, no rate limit for occasional lookups.
// https://world.openfoodfacts.org/data
async function lookupOpenFoodFacts(code) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
    headers: {
      "User-Agent": "WhiskeyApp/1.0 (self-hosted whiskey collection tracker)",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const name = p.product_name || p.product_name_en || null;
  if (!name) return null;
  return {
    name,
    brand: p.brands || null,
    category: p.categories || "",
    description: p.generic_name || p.generic_name_en || "",
  };
}

// UPCitemdb trial endpoint: free, keyless, limited to 100 lookups/day per IP.
// https://www.upcitemdb.com/api/explorer#!/lookup/get_trial_lookup
async function lookupUpcItemDb(code) {
  const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items && data.items[0];
  if (!item || !item.title) return null;
  return {
    name: item.title,
    brand: item.brand || null,
    category: item.category || "",
    description: item.description || "",
  };
}

router.get("/barcode/:code", async (req, res) => {
  const code = req.params.code.replace(/[^0-9]/g, "");
  if (!code) return res.status(400).json({ error: "Invalid barcode" });

  let openFoodFacts = null;
  let upcItemDb = null;
  try {
    [openFoodFacts, upcItemDb] = await Promise.all([
      lookupOpenFoodFacts(code).catch(() => null),
      lookupUpcItemDb(code).catch(() => null),
    ]);
  } catch {
    return res.status(502).json({ error: "Barcode lookup service unavailable" });
  }

  const match = openFoodFacts || upcItemDb;
  if (!match) {
    return res.status(404).json({ error: `No product found for barcode ${code}` });
  }

  const text = [openFoodFacts, upcItemDb]
    .filter(Boolean)
    .flatMap((m) => [m.category, m.description])
    .join(" ");

  res.json({
    barcode: code,
    name: match.name,
    brand: match.brand,
    type: detectType(text),
    proof: extractProof(text),
    age: extractAge(text),
    source: openFoodFacts ? "openfoodfacts" : "upcitemdb",
  });
});

export default router;
