// Non-destructive migration: adds a `uuid` column to words, sub_words and
// vocab2 for existing databases (fresh installs get it via schema.sql).
// Safe to run multiple times.
require('dotenv').config();
const pool = require('../src/db');

async function columnExists(table, column) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].cnt > 0;
}

async function indexExists(table, index) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, index]
  );
  return rows[0].cnt > 0;
}

async function addUuidColumn(table) {
  if (!(await columnExists(table, 'uuid'))) {
    console.log(`Adding uuid column to ${table}...`);
    await pool.query(`ALTER TABLE ${table} ADD COLUMN uuid CHAR(36) NULL AFTER id`);
  }

  const [rows] = await pool.query(`SELECT id FROM ${table} WHERE uuid IS NULL`);
  for (const row of rows) {
    await pool.query(`UPDATE ${table} SET uuid = UUID() WHERE id = ?`, [row.id]);
  }
  if (rows.length > 0) {
    console.log(`Backfilled uuid for ${rows.length} row(s) in ${table}.`);
  }

  if (!(await indexExists(table, 'uuid'))) {
    console.log(`Adding unique index on ${table}.uuid...`);
    await pool.query(`ALTER TABLE ${table} MODIFY uuid CHAR(36) NOT NULL, ADD UNIQUE INDEX uuid (uuid)`);
  }
}

(async () => {
  try {
    await addUuidColumn('words');
    await addUuidColumn('sub_words');
    await addUuidColumn('vocab2');
    console.log('Migration complete.');
    await pool.end();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
