import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createWhiskey, getWhiskey, updateWhiskey } from "../api.js";

const EMPTY = {
  name: "",
  age: "",
  proof: "",
  type: "",
  details: {
    dist: "",
    loc: "",
    mash: "",
    cask: "",
    finish: "",
    notes: "",
    distilled: "",
    bottled: "",
    batch: "",
  },
  taste: {
    nose: "",
    palate: "",
    finish: "",
    notes: "",
  },
};

const STEPS = [
  { key: "basics", title: "Basics" },
  { key: "details", title: "Details" },
  { key: "taste", title: "Tasting Notes" },
];

export default function WhiskeyForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const isLastStep = step === STEPS.length - 1;

  useEffect(() => {
    if (mode === "edit" && id) {
      getWhiskey(id).then((w) =>
        setForm({
          name: w.name ?? "",
          age: w.age ?? "",
          proof: w.proof ?? "",
          type: w.type ?? "",
          details: { ...EMPTY.details, ...w.details },
          taste: { ...EMPTY.taste, ...w.taste },
        })
      );
    }
  }, [mode, id]);

  function setField(path, value) {
    setForm((prev) => {
      const next = { ...prev };
      if (path.includes(".")) {
        const [group, key] = path.split(".");
        next[group] = { ...prev[group], [key]: value };
      } else {
        next[path] = value;
      }
      return next;
    });
  }

  function goNext() {
    if (STEPS[step].key === "basics" && !form.name.trim()) {
      setError("Name is required");
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      age: form.age === "" ? null : Number(form.age),
      proof: form.proof === "" ? null : Number(form.proof),
    };
    try {
      const saved =
        mode === "edit" ? await updateWhiskey(id, payload) : await createWhiskey(payload);
      navigate(`/whiskey/${saved.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const sections = {
    basics: (
      <fieldset>
        <legend>Basics</legend>
        <Field label="Name" required value={form.name} onChange={(v) => setField("name", v)} />
        <Field label="Type" value={form.type} onChange={(v) => setField("type", v)} />
        <Field
          label="Age (years)"
          type="number"
          value={form.age}
          onChange={(v) => setField("age", v)}
        />
        <Field
          label="Proof"
          type="number"
          step="0.1"
          value={form.proof}
          onChange={(v) => setField("proof", v)}
        />
      </fieldset>
    ),
    details: (
      <fieldset>
        <legend>Details</legend>
        <Field
          label="Distillery"
          value={form.details.dist}
          onChange={(v) => setField("details.dist", v)}
        />
        <Field
          label="Location"
          value={form.details.loc}
          onChange={(v) => setField("details.loc", v)}
        />
        <Field
          label="Mash Bill"
          value={form.details.mash}
          onChange={(v) => setField("details.mash", v)}
        />
        <Field
          label="Cask"
          value={form.details.cask}
          onChange={(v) => setField("details.cask", v)}
        />
        <Field
          label="Cask Finish"
          value={form.details.finish}
          onChange={(v) => setField("details.finish", v)}
        />
        <Field
          label="Distilled"
          type="date"
          value={form.details.distilled}
          onChange={(v) => setField("details.distilled", v)}
        />
        <Field
          label="Bottled"
          type="date"
          value={form.details.bottled}
          onChange={(v) => setField("details.bottled", v)}
        />
        <Field
          label="Batch"
          value={form.details.batch}
          onChange={(v) => setField("details.batch", v)}
        />
        <Field
          label="Notes"
          textarea
          value={form.details.notes}
          onChange={(v) => setField("details.notes", v)}
        />
      </fieldset>
    ),
    taste: (
      <fieldset>
        <legend>Tasting Notes</legend>
        <Field
          label="Nose"
          textarea
          value={form.taste.nose}
          onChange={(v) => setField("taste.nose", v)}
        />
        <Field
          label="Palate"
          textarea
          value={form.taste.palate}
          onChange={(v) => setField("taste.palate", v)}
        />
        <Field
          label="Finish"
          textarea
          value={form.taste.finish}
          onChange={(v) => setField("taste.finish", v)}
        />
        <Field
          label="Notes"
          textarea
          value={form.taste.notes}
          onChange={(v) => setField("taste.notes", v)}
        />
      </fieldset>
    ),
  };

  return (
    <div>
      <Link to="/" className="back-link">
        &larr; Back to collection
      </Link>
      <h1>{mode === "edit" ? "Edit Whiskey" : "Add Whiskey"}</h1>

      <ol className="stepper">
        {STEPS.map((s, i) => (
          <li
            key={s.key}
            className={
              "stepper-item" +
              (i === step ? " active" : "") +
              (i < step ? " done" : "")
            }
          >
            <span className="stepper-index">{i + 1}</span>
            <span className="stepper-label">{s.title}</span>
          </li>
        ))}
      </ol>

      {error && <p className="error">{error}</p>}

      <form className="whiskey-form" onSubmit={handleSubmit}>
        {sections[STEPS[step].key]}

        <div className="form-nav">
          {step > 0 && (
            <button type="button" className="btn" onClick={goBack}>
              Back
            </button>
          )}
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : isLastStep ? "Save" : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false, ...rest }) {
  if (type === "date") {
    return <DateField label={label} value={value} onChange={onChange} {...rest} />;
  }

  return (
    <label className="field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} {...rest} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      )}
    </label>
  );
}

function DateField({ label, value, onChange, ...rest }) {
  // Safari updates a date input's underlying value when cleared to "" but
  // doesn't always redraw its native picker UI to match. Forcing a remount
  // (via a key that changes only on clear) sidesteps that instead of
  // patching the existing DOM node.
  const [resetKey, setResetKey] = useState(0);

  function handleClear() {
    onChange("");
    setResetKey((k) => k + 1);
  }

  return (
    <div className="field">
      <span>{label}</span>
      <div className="date-row">
        <input
          key={resetKey}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          {...rest}
        />
        {value && (
          <button
            type="button"
            className="date-clear"
            aria-label={`Clear ${label}`}
            onClick={handleClear}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
