const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const pool = require('../db');

// GET words with their sub-words (paginated)
// query: ?page=1&limit=10
router.get('/words', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM words');
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    const [words] = await pool.query(
      'SELECT * FROM words ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    for (const w of words) {
      const [subs] = await pool.query(
        'SELECT * FROM sub_words WHERE word_id = ? ORDER BY id ASC',
        [w.id]
      );
      w.subs = subs;
    }
    res.json({ words, total, page, limit, totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET full export of all words + sub-words (no pagination), for backup/sync
router.get('/words/export', async (req, res) => {
  try {
    const [words] = await pool.query('SELECT * FROM words ORDER BY id ASC');
    for (const w of words) {
      const [subs] = await pool.query('SELECT * FROM sub_words WHERE word_id = ? ORDER BY id ASC', [w.id]);
      w.subs = subs;
    }
    res.json({ exportedAt: new Date().toISOString(), words });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IMPORT words + sub-words, merging by uuid so syncing between machines
// never creates duplicates and never deletes anything already present.
// body: { words: [{ uuid, main_word, subs: [{ uuid, kanji, hiragana, english }, ...] }, ...] }
router.post('/words/import', async (req, res) => {
  const { words } = req.body;
  if (!Array.isArray(words)) {
    return res.status(400).json({ error: 'words must be an array' });
  }
  const conn = await pool.getConnection();
  let wordsAdded = 0, wordsUpdated = 0, subsAdded = 0, subsUpdated = 0;
  try {
    await conn.beginTransaction();
    for (const w of words) {
      if (!w.main_word || !Array.isArray(w.subs)) continue;
      const wordUuid = w.uuid || randomUUID();

      const [existing] = await conn.query('SELECT id FROM words WHERE uuid = ?', [wordUuid]);
      let wordId;
      if (existing.length > 0) {
        wordId = existing[0].id;
        await conn.query('UPDATE words SET main_word = ? WHERE id = ?', [w.main_word, wordId]);
        wordsUpdated++;
      } else {
        const [result] = await conn.query('INSERT INTO words (uuid, main_word) VALUES (?, ?)', [wordUuid, w.main_word]);
        wordId = result.insertId;
        wordsAdded++;
      }

      for (const s of w.subs) {
        if (!s.kanji || !s.hiragana || !s.english) continue;
        const subUuid = s.uuid || randomUUID();
        const [existingSub] = await conn.query('SELECT id FROM sub_words WHERE uuid = ?', [subUuid]);
        if (existingSub.length > 0) {
          await conn.query(
            'UPDATE sub_words SET word_id = ?, kanji = ?, hiragana = ?, english = ? WHERE id = ?',
            [wordId, s.kanji, s.hiragana, s.english, existingSub[0].id]
          );
          subsUpdated++;
        } else {
          await conn.query(
            'INSERT INTO sub_words (uuid, word_id, kanji, hiragana, english) VALUES (?, ?, ?, ?, ?)',
            [subUuid, wordId, s.kanji, s.hiragana, s.english]
          );
          subsAdded++;
        }
      }
    }
    await conn.commit();
    res.json({ wordsAdded, wordsUpdated, subsAdded, subsUpdated });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET single word with subs
router.get('/words/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM words WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const [subs] = await pool.query('SELECT * FROM sub_words WHERE word_id = ?', [req.params.id]);
    rows[0].subs = subs;
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE word with sub-words
// body: { main_word, subs: [{ kanji, hiragana, english }, ...] }
router.post('/words', async (req, res) => {
  const { main_word, subs } = req.body;
  if (!main_word || !Array.isArray(subs) || subs.length === 0) {
    return res.status(400).json({ error: 'main_word and at least one sub word are required' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const wordUuid = randomUUID();
    const [result] = await conn.query('INSERT INTO words (uuid, main_word) VALUES (?, ?)', [wordUuid, main_word]);
    const wordId = result.insertId;
    for (const s of subs) {
      if (!s.kanji || !s.hiragana || !s.english) {
        throw new Error('Each sub word needs kanji, hiragana and english');
      }
      await conn.query(
        'INSERT INTO sub_words (uuid, word_id, kanji, hiragana, english) VALUES (?, ?, ?, ?, ?)',
        [randomUUID(), wordId, s.kanji, s.hiragana, s.english]
      );
    }
    await conn.commit();
    res.status(201).json({ id: wordId, uuid: wordUuid, main_word, subs });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// UPDATE word + subs (replace subs)
router.put('/words/:id', async (req, res) => {
  const { main_word, subs } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE words SET main_word = ? WHERE id = ?', [main_word, req.params.id]);
    await conn.query('DELETE FROM sub_words WHERE word_id = ?', [req.params.id]);
    for (const s of subs) {
      await conn.query(
        'INSERT INTO sub_words (uuid, word_id, kanji, hiragana, english) VALUES (?, ?, ?, ?, ?)',
        [randomUUID(), req.params.id, s.kanji, s.hiragana, s.english]
      );
    }
    await conn.commit();
    res.json({ id: Number(req.params.id), main_word, subs });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// DELETE word (subs cascade)
router.delete('/words/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM words WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET flashcards (optionally shuffled)
// query: ?random=true
router.get('/flashcards', async (req, res) => {
  try {
    const [words] = await pool.query('SELECT * FROM words');
    for (const w of words) {
      const [subs] = await pool.query('SELECT * FROM sub_words WHERE word_id = ?', [w.id]);
      w.subs = subs;
    }
    if (req.query.random === 'true') {
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
    }
    res.json(words);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET quiz questions (one per sub-word)
// query: ?count=10&random=true
// Each question: show kanji, user types hiragana + english
router.get('/quiz', async (req, res) => {
  try {
    const [words] = await pool.query('SELECT * FROM words');
    const questions = [];
    for (const w of words) {
      const [subs] = await pool.query('SELECT * FROM sub_words WHERE word_id = ?', [w.id]);
      for (const s of subs) {
        questions.push({
          id: s.id,
          main_word: w.main_word,
          kanji: s.kanji,
          hiragana: s.hiragana,
          english: s.english
        });
      }
    }
    if (req.query.random === 'true') {
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }
    const count = Math.min(Number(req.query.count) || 10, questions.length);
    res.json(questions.slice(0, count));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
