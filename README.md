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

## API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/words` | List all words |
| POST | `/api/words` | Add word {kanji, hiragana, english} |
| PUT | `/api/words/:id` | Update word |
| DELETE | `/api/words/:id` | Delete word |
| GET | `/api/flashcards?random=true` | Flashcard list (shuffled if random) |
| GET | `/api/quiz?count=10&random=true` | Quiz questions |
