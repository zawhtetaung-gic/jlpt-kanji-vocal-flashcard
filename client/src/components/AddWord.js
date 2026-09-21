import React, { useState, useEffect } from 'react';
import { createWord, updateWord, getWords } from '../api';

const emptySub = { kanji: '', hiragana: '', english: '' };

export default function AddWord({ onAdded, editTarget, onEditDone }) {
  const [editId, setEditId] = useState(null);
  const [main, setMain] = useState('');
  const [subs, setSubs] = useState([{ ...emptySub }]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (editTarget) {
      setEditId(editTarget.id);
      setMain(editTarget.main_word);
      setSubs(editTarget.subs && editTarget.subs.length ? editTarget.subs.map((s) => ({
        kanji: s.kanji,
        hiragana: s.hiragana,
        english: s.english
      })) : [{ ...emptySub }]);
      setMsg('');
      if (onEditDone) onEditDone();
    }
  }, [editTarget, onEditDone]);

  const updateSub = (i, field, value) => {
    setSubs((s) => s.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));
  };

  const addSub = () => setSubs((s) => [...s, { ...emptySub }]);
  const removeSub = (i) => setSubs((s) => (s.length > 1 ? s.filter((_, idx) => idx !== i) : s));

  const reset = () => {
    setEditId(null);
    setMain('');
    setSubs([{ ...emptySub }]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!main) {
      setMsg('Main word is required.');
      return;
    }
    const cleaned = subs.filter((s) => s.kanji || s.hiragana || s.english);
    if (cleaned.length === 0) {
      setMsg('Add at least one sub word.');
      return;
    }
    for (const s of cleaned) {
      if (!s.kanji || !s.hiragana || !s.english) {
        setMsg('Each sub word needs kanji, hiragana and english.');
        return;
      }
    }
    try {
      if (editId) {
        await updateWord(editId, { main_word: main, subs: cleaned });
        setMsg('Updated!');
      } else {
        await createWord({ main_word: main, subs: cleaned });
        setMsg('Saved!');
      }
      reset();
      onAdded();
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  };

  return (
    <div className="card">
      <h2>{editId ? 'Edit Word' : 'Add Word'}</h2>
      <form onSubmit={submit}>
        <label>Main word</label>
        <input
          placeholder="流"
          value={main}
          onChange={(e) => setMain(e.target.value)}
        />

        <label>Sub words</label>
        {subs.map((s, i) => (
          <div className="sub-row" key={i}>
            <input
              placeholder="kanji (流れる)"
              value={s.kanji}
              onChange={(e) => updateSub(i, 'kanji', e.target.value)}
            />
            <input
              placeholder="hiragana (ながれる)"
              value={s.hiragana}
              onChange={(e) => updateSub(i, 'hiragana', e.target.value)}
            />
            <input
              placeholder="english (to flow)"
              value={s.english}
              onChange={(e) => updateSub(i, 'english', e.target.value)}
            />
            {subs.length > 1 && (
              <button type="button" className="del" onClick={() => removeSub(i)}>✕</button>
            )}
          </div>
        ))}

        <button type="button" className="add-sub" onClick={addSub}>+ Add sub word</button>
        <button type="submit">{editId ? 'Update' : 'Save'}</button>
        {editId && (
          <button type="button" className="cancel" onClick={reset}>Cancel</button>
        )}
      </form>
      {msg && <p className="msg">{msg}</p>}
    </div>
  );
}
