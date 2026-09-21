require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const wordsRouter = require('./routes/words');
const vocab2Router = require('./routes/vocab2');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.use('/api', wordsRouter);
app.use('/api', vocab2Router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
