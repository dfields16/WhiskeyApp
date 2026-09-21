import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteWhiskey, exportWhiskeyJson, getWhiskey } from "../api.js";
import CopyExportButton from "../components/CopyExportButton.jsx";

export default function WhiskeyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [whiskey, setWhiskey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getWhiskey(id)
      .then(setWhiskey)
      .catch((e) => setError(e.message));
  }, [id]);

  async function handleDelete() {
    if (!confirm(`Delete "${whiskey.name}"? This can't be undone.`)) return;
    await deleteWhiskey(id);
    navigate("/");
  }

  if (error) return <p className="error">{error}</p>;
  if (!whiskey) return <p>Loading...</p>;

  const { details, taste } = whiskey;
  const isFilled = (v) => v !== null && v !== undefined && v !== "";
  const hasDetails = Object.values(details).some(isFilled);
  const hasTaste = Object.values(taste).some(isFilled);

  return (
    <div>
      <Link to="/" className="back-link">
        &larr; Back to collection
      </Link>

      <div className="section-header">
        <h1>{whiskey.name}</h1>
        <div className="actions">
          <CopyExportButton fetchJson={() => exportWhiskeyJson(whiskey.id)} />
          <Link className="btn" to={`/whiskey/${whiskey.id}/edit`}>
            Edit
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="fact-grid">
        <Fact label="Type" value={whiskey.type} />
        <Fact label="Age" value={whiskey.age ? `${whiskey.age} years` : null} />
        <Fact label="Proof" value={whiskey.proof} />
      </div>

      {hasDetails && (
        <section className="card">
          <h2>Details</h2>
          <div className="fact-grid">
            <Fact label="Distillery" value={details.dist} />
            <Fact label="Location" value={details.loc} />
            <Fact label="Mash Bill" value={details.mash} />
            <Fact label="Cask" value={details.cask} />
            <Fact label="Cask Finish" value={details.finish} />
            <Fact label="Distilled" value={details.distilled} />
            <Fact label="Bottled" value={details.bottled} />
            <Fact label="Batch" value={details.batch} />
          </div>
          {details.notes && (
            <p className="notes">
              <strong>Notes:</strong> {details.notes}
            </p>
          )}
        </section>
      )}

      {hasTaste && (
        <section className="card">
          <h2>Tasting Notes</h2>
          <div className="fact-grid">
            <Fact label="Nose" value={taste.nose} />
            <Fact label="Palate" value={taste.palate} />
            <Fact label="Finish" value={taste.finish} />
          </div>
          {taste.notes && (
            <p className="notes">
              <strong>Notes:</strong> {taste.notes}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Fact({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="fact">
      <div className="fact-label">{label}</div>
      <div className="fact-value">{value}</div>
    </div>
  );
}
