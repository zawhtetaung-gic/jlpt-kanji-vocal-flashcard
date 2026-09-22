import React, { useState, useEffect } from "react";
import { getWords, deleteWord, exportWords, importWords } from "../api";
import ImportExport from "./ImportExport";

const PAGE_SIZE = 5;

export default function WordList({ refreshKey, onEdit }) {
  const [data, setData] = useState({
    words: [],
    total: 0,
    page: 1,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getWords(page, PAGE_SIZE)
      .then((d) => setData(d))
      .catch(() => setData({ words: [], total: 0, page: 1, totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [page, refreshKey]);

  const remove = async (id) => {
    await deleteWord(id);
    const remaining = data.words.length - 1;
    if (remaining === 0 && page > 1) {
      setPage((p) => p - 1);
    } else {
      getWords(page, PAGE_SIZE)
        .then(setData)
        .catch(() => {});
    }
  };

  const edit = async (id) => {
    const full = await getWords(page, PAGE_SIZE);
    const w = full.words.find((x) => x.id === id);
    if (w) onEdit(w);
  };

  const startNum = (page - 1) * PAGE_SIZE;

  const reload = () => {
    setPage(1);
    getWords(1, PAGE_SIZE).then(setData).catch(() => {});
  };

  return (
    <div className="card">
      <h2>Word List ({data.total})</h2>
      <ImportExport
        label="Kanji words"
        filename="jlpt-kanji-words.json"
        onExport={exportWords}
        onImport={async (parsed) => {
          const words = Array.isArray(parsed) ? parsed : parsed.words;
          if (!Array.isArray(words)) throw new Error("Invalid file: expected a words array");
          const r = await importWords(words);
          return `Added ${r.wordsAdded} word(s), updated ${r.wordsUpdated}; added ${r.subsAdded} sub-word(s), updated ${r.subsUpdated}.`;
        }}
        onImported={reload}
      />
      {loading && <p>Loading...</p>}
      {!loading && data.words.length === 0 && (
        <p>No words yet. Add some above.</p>
      )}
      <ul className="list">
        {data.words.map((w, i) => (
          <li key={w.id}>
            <span className="num">{startNum + i + 1}.</span>
            <span className="main">{w.main_word}</span>
            <span className="subs">
              {w.subs &&
                w.subs
                  .map((s) => `${s.kanji} (${s.hiragana}) ${s.english}`)
                  .join(" · ")}
            </span>
            <button className="edit" onClick={() => edit(w.id)}>
              Edit
            </button>
            <button className="del" onClick={() => remove(w.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      {data.totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {data.page} / {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
