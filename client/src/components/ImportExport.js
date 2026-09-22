import React, { useRef, useState } from "react";

// Generic export/import control. `onExport` returns the JSON-able payload
// to download; `onImport(parsed)` sends a parsed file to the server and
// should return a short result summary (or throw).
export default function ImportExport({ label, filename, onExport, onImport, onImported }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const doExport = async () => {
    setBusy(true);
    setMsg("");
    try {
      const data = await onExport();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg("Exported.");
    } catch (err) {
      setMsg("Export failed: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const pickFile = () => fileRef.current && fileRef.current.click();

  const doImport = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = await onImport(parsed);
      setMsg(result);
      if (onImported) onImported();
    } catch (err) {
      setMsg("Import failed: " + err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="import-export">
      <span className="ie-label">{label}</span>
      <button type="button" disabled={busy} onClick={doExport}>Export JSON</button>
      <button type="button" className="add-sub" disabled={busy} onClick={pickFile}>Import JSON</button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={doImport}
      />
      {msg && <span className="ie-msg">{msg}</span>}
    </div>
  );
}
