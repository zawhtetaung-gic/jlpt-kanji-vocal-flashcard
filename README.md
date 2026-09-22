# JLPT Quiz App

A full-stack flashcard + quiz app for learning Japanese vocabulary.
- **Backend:** Express + MySQL (`mysql2`)
- **Frontend:** React (Create React App)

You input **kanji**, **hiragana**, and **english** for each word. Then you can study
with **flashcards** and test yourself with a **quiz**. Both modes have a
**Random order** toggle so you can study in order or shuffled.

## Project structure

```
jlpt-quiz-app/
├── server/        Express + MySQL API
│   ├── src/
│   │   ├── db.js
│   │   ├── index.js
│   │   └── routes/words.js
│   ├── db/schema.sql
│   └── .env.example
└── client/        React frontend
    └── src/
        ├── api.js
        ├── App.js
        └── components/
```

## Setup

### 1. Database (MySQL)
Create the database and table:
```bash
mysql -u root -p < server/db/schema.sql
```
Or run the contents of `server/db/schema.sql` in your MySQL client.

### 2. Backend
```bash
cd server
npm install
cp .env.example .env   # then edit DB_PASSWORD etc.
npm run dev            # runs on http://localhost:4000
```

If you already have an existing database from before the `uuid` column was
added, run the migration once (safe to re-run, does not touch existing data):
```bash
npm run migrate
```

### 3. Frontend
```bash
cd client
npm install
npm start              # runs on http://localhost:3000
```
The React app proxies API calls to `http://localhost:4000` (see `client/package.json`).

## Features
- Add / list / delete words (kanji, hiragana, english)
- Flashcards: tap to flip, prev/next, **random order** toggle
- Quiz: multiple choice (kanji+hiragana → pick english), score, **random questions** toggle + count selector
- **Import / Export JSON** for both Kanji Words and Vocab, for backing up or
  moving your data between machines (e.g. work and home laptops)

## Syncing between two machines
Every word, sub-word and vocab entry has a permanent `uuid` assigned when it's
created. Export produces a JSON file carrying those ids; importing merges by
`uuid`:
- an id already in your database gets its contents **updated**, never duplicated
- an id not yet in your database gets **added**
- anything in your database that isn't in the imported file is **left alone**
  (import never deletes)

So the routine for using two laptops is: export on laptop A, copy the JSON
file over (e.g. via email/USB/cloud), import it on laptop B — and vice versa
before you switch back. As long as you import each side's latest export
before making new edits, nothing gets duplicated or lost.

## API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/words` | List all words |
| POST | `/api/words` | Add word {kanji, hiragana, english} |
| PUT | `/api/words/:id` | Update word |
| DELETE | `/api/words/:id` | Delete word |
| GET | `/api/words/export` | Full JSON export of all words + sub-words |
| POST | `/api/words/import` | Merge-import words + sub-words by `uuid` |
| GET | `/api/flashcards?random=true` | Flashcard list (shuffled if random) |
| GET | `/api/quiz?count=10&random=true` | Quiz questions |
| GET | `/api/vocab2/export` | Full JSON export of all vocab |
| POST | `/api/vocab2/import` | Merge-import vocab by `uuid` |
