import { useState } from "react";
import { copyToClipboard } from "../clipboard.js";
import Icon from "./Icon.jsx";

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
    state === "copying" ? "Copying" : state === "copied" ? "Copied" : state === "error" ? "Failed" : label;
  const iconName = state === "copied" ? "check" : state === "error" ? "error" : "copy";

  return (
    <button
      type="button"
      className="btn action-btn"
      onClick={handleClick}
      disabled={state === "copying"}
      aria-label={label}
    >
      <Icon name={iconName} className="action-icon" />
      <span className="action-label">{text}</span>
    </button>
  );
}
