import React, { useState, useEffect } from "react";
import { getVocab2Flashcards } from "../api";

export default function Vocab2Flashcard() {
  const [random, setRandom] = useState(true);
  const [dir, setDir] = useState("jp-en"); // 'jp-en' or 'en-jp'
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState("next");
  const [slideKey, setSlideKey] = useState(0);

  const load = async () => {
    const data = await getVocab2Flashcards(random, dir);
    setCards(data);
    setIndex(0);
    setFlipped(false);
    setDirection("next");
    setSlideKey((k) => k + 1);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const go = (dirNav) => {
    setFlipped(false);
    setDirection(dirNav);
    setSlideKey((k) => k + 1);
    setIndex((i) => {
      if (!cards.length) return 0;
      return dirNav === "next"
        ? (i + 1) % cards.length
        : (i - 1 + cards.length) % cards.length;
    });
  };

  const card = cards[index];

  return (
    <div className="card">
      <h2>Vocab Flashcards</h2>
      <label className="toggle">
        <input type="checkbox" checked={random} onChange={(e) => setRandom(e.target.checked)} />
        Random order
      </label>
      <label className="toggle">
        <span>Front:</span>
        <select value={dir} onChange={(e) => setDir(e.target.value)}>
          <option value="jp-en">JP → EN</option>
          <option value="en-jp">EN → JP</option>
        </select>
      </label>
      <button onClick={load}>Reload</button>

      {cards.length === 0 && <p>No vocab yet.</p>}
      {card && (
        <div className="fc-stage">
          <div
            key={slideKey}
            className={`flashcard ${direction === "next" ? "slide-left" : "slide-right"}`}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className={`fc-inner ${flipped ? "flipped" : ""}`}>
              <div className="fc-face fc-front">
                <div className="fc-top">{index + 1} / {cards.length}</div>
                <div className="fc-kanji">{card.front}</div>
                <div className="fc-hint">tap to reveal</div>
              </div>
              <div className="fc-face fc-back">
                <div className="fc-top">{index + 1} / {cards.length}</div>
                <div className="fc-english">{card.back}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="nav">
        <button onClick={() => go("prev")}>Prev</button>
        <button onClick={() => go("next")}>Next</button>
      </div>
    </div>
  );
}
