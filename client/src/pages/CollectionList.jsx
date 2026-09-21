import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listWhiskeys, exportAllWhiskeysJson } from "../api.js";
import CopyExportButton from "../components/CopyExportButton.jsx";

export default function CollectionList() {
  const [whiskeys, setWhiskeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listWhiskeys()
      .then(setWhiskeys)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading collection...</p>;
  if (error) return <p className="error">{error}</p>;

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
      )}
    </div>
  );
}
