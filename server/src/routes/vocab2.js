const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const pool = require('../db');

// GET full export of all vocab2 rows (no pagination), for backup/sync
router.get('/vocab2/export', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vocab2 ORDER BY id ASC');
    res.json({ exportedAt: new Date().toISOString(), vocab: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IMPORT vocab2, merging by uuid so syncing between machines never creates
// duplicates and never deletes anything already present.
// body: { vocab: [{ uuid, jp, en }, ...] }
router.post('/vocab2/import', async (req, res) => {
  const { vocab } = req.body;
  if (!Array.isArray(vocab)) {
    return res.status(400).json({ error: 'vocab must be an array' });
  }
  const conn = await pool.getConnection();
  let added = 0, updated = 0;
  try {
    await conn.beginTransaction();
    for (const v of vocab) {
      if (!v.jp || !v.en) continue;
      const vUuid = v.uuid || randomUUID();
      const [existing] = await conn.query('SELECT id FROM vocab2 WHERE uuid = ?', [vUuid]);
      if (existing.length > 0) {
        await conn.query('UPDATE vocab2 SET jp = ?, en = ? WHERE id = ?', [v.jp, v.en, existing[0].id]);
        updated++;
      } else {
        await conn.query('INSERT INTO vocab2 (uuid, jp, en) VALUES (?, ?, ?)', [vUuid, v.jp, v.en]);
        added++;
      }
    }
    await conn.commit();
    res.json({ added, updated });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

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
    const uuid = randomUUID();
    const [result] = await pool.query('INSERT INTO vocab2 (uuid, jp, en) VALUES (?, ?, ?)', [uuid, jp, en]);
    res.status(201).json({ id: result.insertId, uuid, jp, en });
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
