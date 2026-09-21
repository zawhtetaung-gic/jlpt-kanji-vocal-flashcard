const pool = require('./src/db');

(async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS sub_words');
    await pool.query('DROP TABLE IF EXISTS words');
    await pool.query('DROP TABLE IF EXISTS vocab2');
    await pool.query(`
      CREATE TABLE words (
        id INT AUTO_INCREMENT PRIMARY KEY,
        main_word VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool.query(`
      CREATE TABLE sub_words (
        id INT AUTO_INCREMENT PRIMARY KEY,
        word_id INT NOT NULL,
        kanji VARCHAR(255) NOT NULL,
        hiragana VARCHAR(255) NOT NULL,
        english VARCHAR(255) NOT NULL,
        FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool.query(`
      CREATE TABLE vocab2 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        jp VARCHAR(255) NOT NULL,
        en VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('tables recreated');
    await pool.end();
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
