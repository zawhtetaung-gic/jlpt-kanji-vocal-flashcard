import React, { useState, useEffect } from "react";
import { getVocab2, deleteVocab2 } from "../api";

const PAGE_SIZE = 10;

export default function Vocab2List({ refreshKey }) {
  const [data, setData] = useState({ words: [], total: 0, page: 1, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getVocab2(page, PAGE_SIZE)
      .then(setData)
      .catch(() => setData({ words: [], total: 0, page: 1, totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [page, refreshKey]);

  const remove = async (id) => {
    await deleteVocab2(id);
    const remaining = data.words.length - 1;
    if (remaining === 0 && page > 1) setPage((p) => p - 1);
    else getVocab2(page, PAGE_SIZE).then(setData).catch(() => {});
  };

  const startNum = (page - 1) * PAGE_SIZE;

  return (
    <div className="card">
      <h2>Vocab List ({data.total})</h2>
      {loading && <p>Loading...</p>}
      {!loading && data.words.length === 0 && <p>No vocab yet. Add some above.</p>}
      <ul className="list">
        {data.words.map((w, i) => (
          <li key={w.id}>
            <span className="num">{startNum + i + 1}.</span>
            <span className="main">{w.jp}</span>
            <span className="subs">{w.en}</span>
            <button className="del" onClick={() => remove(w.id)}>✕</button>
          </li>
        ))}
      </ul>

      {data.totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span>Page {data.page} / {data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
