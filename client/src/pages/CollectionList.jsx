import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listWhiskeys, exportAllWhiskeysJson } from "../api.js";
import CopyExportButton from "../components/CopyExportButton.jsx";

const GROUP_FIELDS = [
  { value: "none", label: "None" },
  { value: "type", label: "Type" },
  { value: "dist", label: "Distillery" },
  { value: "loc", label: "Location" },
];

function groupValue(whiskey, field) {
  if (field === "type") return whiskey.type;
  return whiskey.details?.[field];
}

export default function CollectionList() {
  const [whiskeys, setWhiskeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [groupBy, setGroupBy] = useState("none");

  useEffect(() => {
    listWhiskeys()
      .then(setWhiskeys)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter/group options are always derived from whatever's actually in the
  // collection, not a fixed list.
  const types = useMemo(() => {
    const set = new Set(whiskeys.map((w) => w.type).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [whiskeys]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return whiskeys.filter((w) => {
      if (typeFilter && w.type !== typeFilter) return false;
      if (!q) return true;
      const haystack = [w.name, w.type, w.details?.dist, w.details?.loc]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [whiskeys, search, typeFilter]);

  const groups = useMemo(() => {
    if (groupBy === "none") return null;
    const map = new Map();
    for (const w of filtered) {
      const raw = groupValue(w, groupBy);
      const label = raw && raw.trim() ? raw : "Unspecified";
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(w);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === "Unspecified") return 1;
      if (b === "Unspecified") return -1;
      return a.localeCompare(b);
    });
  }, [filtered, groupBy]);

  if (loading) return <p>Loading collection...</p>;
  if (error) return <p className="error">{error}</p>;

  const isFiltered = search.trim() !== "" || typeFilter !== "";

  return (
    <div>
      <div className="section-header">
        <h1>My Collection</h1>
        {whiskeys.length > 0 && (
          <CopyExportButton fetchJson={exportAllWhiskeysJson} label="Export All" />
        )}
      </div>

      {whiskeys.length === 0 ? (
        <p className="empty">
          No whiskeys yet. <Link to="/new">Add your first bottle</Link>.
        </p>
      ) : (
        <>
          <div className="collection-controls">
            <input
              type="search"
              className="text-input search-input"
              placeholder="Search by name, type, or distillery"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search whiskeys"
            />
            <div className="control-group">
              <label htmlFor="type-filter">Type</label>
              <select
                id="type-filter"
                className="select-input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label htmlFor="group-by">Group by</label>
              <select
                id="group-by"
                className="select-input"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                {GROUP_FIELDS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isFiltered && (
            <p className="result-count">
              {filtered.length} of {whiskeys.length} whiskeys
            </p>
          )}

          {filtered.length === 0 ? (
            <p className="empty">No whiskeys match your search.</p>
          ) : groups ? (
            groups.map(([label, items]) => (
              <div key={label} className="whiskey-group">
                <h2 className="group-heading">
                  {label} <span className="group-count">({items.length})</span>
                </h2>
                <WhiskeyList whiskeys={items} />
              </div>
            ))
          ) : (
            <WhiskeyList whiskeys={filtered} />
          )}
        </>
      )}
    </div>
  );
}

function WhiskeyList({ whiskeys }) {
  return (
    <ul className="whiskey-list">
      {whiskeys.map((w) => (
        <li key={w.id}>
          <Link to={`/whiskey/${w.id}`} className="whiskey-card">
            <div className="whiskey-card-name">{w.name}</div>
            <div className="whiskey-card-meta">
              {w.type || "Unknown type"}
              {w.age ? ` · ${w.age} yr` : ""}
              {w.proof ? ` · ${w.proof} proof` : ""}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
