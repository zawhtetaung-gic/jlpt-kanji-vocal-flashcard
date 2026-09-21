import React, { useState, useEffect } from 'react';
import { getQuiz } from '../api';

export default function Quiz() {
  const [random, setRandom] = useState(true);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [hiragana, setHiragana] = useState('');
  const [english, setEnglish] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const data = await getQuiz(count, random);
    setQuestions(data);
    setCurrent(0);
    resetInput();
    setScore(0);
    setFinished(false);
    setLoading(false);
  };

  const resetInput = () => {
    setHiragana('');
    setEnglish('');
    setChecked(false);
  };

  useEffect(() => {
    start();
    // eslint-disable-next-line
  }, []);

  const check = () => {
    if (!hiragana.trim() || !english.trim()) return;
    const q = questions[current];
    const hOk = hiragana.trim() === q.hiragana.trim();
    const eOk = english.trim().toLowerCase() === q.english.trim().toLowerCase();
    if (hOk && eOk) setScore((s) => s + 1);
    setChecked(true);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setCurrent((c) => c + 1);
    resetInput();
  };

  const q = questions[current];

  return (
    <div className="card">
      <h2>Quiz</h2>
      <div className="quiz-controls">
        <label className="toggle">
          <input
            type="checkbox"
            checked={random}
            onChange={(e) => setRandom(e.target.checked)}
          />
          Random questions
        </label>
        <label>
          Questions:
          <input
            type="number"
            min="1"
            max="50"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>
        <button onClick={start} disabled={loading}>Start / Restart</button>
      </div>

      {questions.length === 0 && <p>No words available. Add some first.</p>}

      {q && !finished && (
        <div className="quiz">
          <div className="q-progress">
            {current + 1} / {questions.length}
          </div>
          <div className="q-word">
            <span className="q-main">{q.main_word}</span>
            <span className="kanji">{q.kanji}</span>
          </div>

          <div className="type-inputs">
            <input
              placeholder="Type hiragana"
              value={hiragana}
              onChange={(e) => setHiragana(e.target.value)}
              disabled={checked}
            />
            <input
              placeholder="Type english"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              disabled={checked}
            />
          </div>

          {!checked ? (
            <button className="next" onClick={check} disabled={!hiragana.trim() || !english.trim()}>
              Check
            </button>
          ) : (
            <div className="feedback">
              <div className={hiragana.trim() === q.hiragana.trim() ? 'ok' : 'no'}>
                ひらがな: {hiragana} {hiragana.trim() === q.hiragana.trim() ? '✓' : `✗ (${q.hiragana})`}
              </div>
              <div className={english.trim().toLowerCase() === q.english.trim().toLowerCase() ? 'ok' : 'no'}>
                English: {english} {english.trim().toLowerCase() === q.english.trim().toLowerCase() ? '✓' : `✗ (${q.english})`}
              </div>
              <button className="next" onClick={next}>
                {current + 1 >= questions.length ? 'See results' : 'Next'}
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="result">
          <h3>
            Score: {score} / {questions.length}
          </h3>
          <button onClick={start}>Try again</button>
        </div>
      )}
    </div>
  );
}
