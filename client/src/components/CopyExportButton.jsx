import { useState } from "react";
import { copyToClipboard } from "../clipboard.js";

export default function CopyExportButton({ fetchJson, label = "Export" }) {
  const [state, setState] = useState("idle"); // idle | copying | copied | error

  async function handleClick() {
    setState("copying");
    try {
      const json = await fetchJson();
      await copyToClipboard(json);
      setState("copied");
      setTimeout(() => setState("idle"), 1500);
    } catch (err) {
      setState("error");
      setTimeout(() => setState("idle"), 1500);
    }
  }

  const text =
    state === "copying" ? "Copying..." : state === "copied" ? "Copied!" : state === "error" ? "Failed" : label;

  return (
    <button type="button" className="btn" onClick={handleClick} disabled={state === "copying"}>
      {text}
    </button>
  );
}
