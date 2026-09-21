const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET vocab2 (paginated)
router.get('/vocab2', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM vocab2');
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    const [rows] = await pool.query(
      'SELECT * FROM vocab2 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json({ words: rows, total, page, limit, totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE vocab2
router.post('/vocab2', async (req, res) => {
  const { jp, en } = req.body;
  if (!jp || !en) return res.status(400).json({ error: 'jp and en are required' });
  try {
    const [result] = await pool.query('INSERT INTO vocab2 (jp, en) VALUES (?, ?)', [jp, en]);
    res.status(201).json({ id: result.insertId, jp, en });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE vocab2
router.delete('/vocab2/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM vocab2 WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET vocab2 flashcards
// query: ?random=true&dir=jp-en  (dir: 'jp-en' => front jp, back en; 'en-jp' => front en, back jp)
router.get('/vocab2/flashcards', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vocab2');
    const dir = req.query.dir === 'en-jp' ? 'en-jp' : 'jp-en';
    let cards = rows.map((r) => ({
      id: r.id,
      front: dir === 'jp-en' ? r.jp : r.en,
      back: dir === 'jp-en' ? r.en : r.jp
    }));
    if (req.query.random === 'true') {
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
    }
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
