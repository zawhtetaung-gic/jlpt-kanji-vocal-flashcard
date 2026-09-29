import React, { useState, useEffect } from 'react';
import { getFlashcards } from '../api';

export default function Flashcard() {
  const [random, setRandom] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showHiragana, setShowHiragana] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState('next');
  const [slideKey, setSlideKey] = useState(0);

  const load = async (overrides = {}) => {
    const r = overrides.random ?? random;
    const f = overrides.filter ?? filter;
    const data = await getFlashcards(r, f);
    setCards(data);
    setIndex(0);
    setFlipped(false);
    setDirection('next');
    setSlideKey((k) => k + 1);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const changeFilter = (value) => {
    setFilter(value);
    load({ filter: value });
  };

  const go = (dir) => {
    setFlipped(false);
    setDirection(dir);
    setSlideKey((k) => k + 1);
    setIndex((i) => {
      if (!cards.length) return 0;
      return dir === 'next'
        ? (i + 1) % cards.length
        : (i - 1 + cards.length) % cards.length;
    });
  };
  const next = () => go('next');
  const prev = () => go('prev');

  const card = cards[index];

  const backCols = [
    { key: 'kanji', cls: 'fc-col-kanji' },
    ...(showHiragana ? [{ key: 'hiragana', cls: 'fc-col-hiragana' }] : []),
    ...(showEnglish ? [{ key: 'english', cls: 'fc-col-english' }] : [])
  ];

  return (
    <div className="card">
      <h2>Flashcards</h2>
      <div className="fc-toolbar">
        <label className="toggle">
          <input
            type="checkbox"
            checked={random}
            onChange={(e) => setRandom(e.target.checked)}
          />
          Random order
        </label>

        <label className="toggle">
          Show:
          <select value={filter} onChange={(e) => changeFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="today">Today</option>
          </select>
        </label>

        <div className="fc-visibility">
          <span>Back shows:</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={showHiragana}
              onChange={(e) => setShowHiragana(e.target.checked)}
            />
            Hiragana
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={showEnglish}
              onChange={(e) => setShowEnglish(e.target.checked)}
            />
            English
          </label>
        </div>

        <button onClick={load}>Reload</button>
      </div>

      {cards.length === 0 && (
        <p>{filter === 'today' ? 'No words added today.' : 'No words yet.'}</p>
      )}
      {card && (
        <div className="fc-stage">
          <div
            key={slideKey}
            className={`flashcard ${direction === 'next' ? 'slide-left' : 'slide-right'}`}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className={`fc-inner ${flipped ? 'flipped' : ''}`}>
              <div className="fc-face fc-front">
                <div className="fc-top">{index + 1} / {cards.length}</div>
                <div className="fc-kanji">{card.main_word}</div>
                <div className="fc-hint">tap to reveal</div>
              </div>
              <div className="fc-face fc-back">
                <div className="fc-top">{index + 1} / {cards.length}</div>
                <div
                  className="fc-back-list"
                  style={{ gridTemplateColumns: `repeat(${backCols.length}, auto)` }}
                >
                  {(card.subs || []).map((s, i) => (
                    <React.Fragment key={i}>
                      {backCols.map((c) => (
                        <span key={c.key} className={c.cls}>
                          {s[c.key]}
                        </span>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="nav">
        <button onClick={prev}>Prev</button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}
