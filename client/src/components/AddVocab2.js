import React, { useState } from "react";
import { createVocab2 } from "../api";

export default function AddVocab2({ onAdded }) {
  const [jp, setJp] = useState("");
  const [en, setEn] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!jp || !en) {
      setMsg("Both Japanese and English are required.");
      return;
    }
    try {
      await createVocab2({ jp, en });
      setJp("");
      setEn("");
      setMsg("Saved!");
      onAdded();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  };

  return (
    <div className="card">
      <h2>Add Vocab (JP / EN)</h2>
      <form onSubmit={submit}>
        <label>Japanese</label>
        <input
          placeholder="日本語"
          value={jp}
          onChange={(e) => setJp(e.target.value)}
        />
        <label>English</label>
        <input
          placeholder="Japanese language"
          value={en}
          onChange={(e) => setEn(e.target.value)}
        />
        <button type="submit">Save</button>
      </form>
      {msg && <p className="msg">{msg}</p>}
    </div>
  );
}
