import React, { useState } from 'react';
import AddWord from './components/AddWord';
import WordList from './components/WordList';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';
import AddVocab2 from './components/AddVocab2';
import Vocab2List from './components/Vocab2List';
import Vocab2Flashcard from './components/Vocab2Flashcard';

export default function App() {
  const [tab, setTab] = useState('add');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editTarget, setEditTarget] = useState(null);

  return (
    <div className="app">
      <h1>JLPT Quiz</h1>
      <nav>
        <button className={tab === 'add' ? 'active' : ''} onClick={() => setTab('add')}>Kanji Words</button>
        <button className={tab === 'flashcard' ? 'active' : ''} onClick={() => setTab('flashcard')}>Kanji Cards</button>
        <button className={tab === 'quiz' ? 'active' : ''} onClick={() => setTab('quiz')}>Quiz</button>
        <button className={tab === 'vocab' ? 'active' : ''} onClick={() => setTab('vocab')}>Vocab</button>
        <button className={tab === 'vocabCard' ? 'active' : ''} onClick={() => setTab('vocabCard')}>Vocab Cards</button>
      </nav>

      {tab === 'add' && (
        <>
          <AddWord
            onAdded={() => setRefreshKey((k) => k + 1)}
            editTarget={editTarget}
            onEditDone={() => setEditTarget(null)}
          />
          <WordList refreshKey={refreshKey} onEdit={(w) => { setEditTarget(w); setTab('add'); }} />
        </>
      )}
      {tab === 'flashcard' && <Flashcard />}
      {tab === 'quiz' && <Quiz />}
      {tab === 'vocab' && (
        <>
          <AddVocab2 onAdded={() => setRefreshKey((k) => k + 1)} />
          <Vocab2List refreshKey={refreshKey} />
        </>
      )}
      {tab === 'vocabCard' && <Vocab2Flashcard />}
    </div>
  );
}
