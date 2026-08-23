# Echo — Voice Command Shopping Assistant

A voice-controlled shopping list with smart suggestions, built for the technical
assessment. Speak naturally ("add milk", "I need bananas", "remove the eggs",
"find toothpaste under $5") and the app parses intent, updates your list, and
proactively suggests seasonal items, substitutes, and restocks.

**Live demo:** _add your deployed URL here_
**Video/GIF:** _optional, add here_

## Stack

- **Frontend:** React + Vite, Web Speech API for voice recognition, no UI
  framework — hand-built dark/amber theme.
- **Backend:** Node.js + Express, in-memory data store (no DB setup required
  to run this in an assessment window).
- **NLP:** a small rule-based parser (`backend/src/nlp.js`) — no paid API key
  needed, works offline, and is easy to audit/extend.

## Why rule-based NLP instead of a hosted LLM?

The assignment allows any free-tier AI/ML service, but a regex + keyword
parser handles this domain (a closed set of shopping intents: add / remove /
search / quantity) reliably, with zero latency, no API key management, and no
rate limits — which matters for a live voice demo. It's swappable: `nlp.js`
exports a single `parseCommand(text) -> { intent, item, quantity }` function,
so it's a drop-in replacement point for a hosted LLM if broader language
coverage is needed later.

## Running locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # leave VITE_API_URL blank to use the dev proxy
npm install
npm run dev             # http://localhost:5173
```

Open the app in **Chrome or Edge** (Web Speech API support). Other browsers
fall back to the typed-command input below the mic.

## Deployment

- **Backend → Render:** this repo includes `render.yaml`. Connect the repo,
  Render will use `backend` as the root, run `npm install` then `npm start`.
- **Frontend → Vercel:** `frontend/vercel.json` is preconfigured. Set the
  `VITE_API_URL` environment variable to your Render backend URL before
  building.

## Features implemented

- **Voice input:** command recognition via Web Speech API, varied phrasing
  ("add X" / "I need X" / "I want to buy X"), 4-language selector (English,
  Spanish, Hindi, French — recognition language, not translated UI copy).
- **Smart suggestions:** seasonal picks (mocked against current month),
  substitute recommendations per item, "running low" nudges from usage
  history.
- **List management:** add/remove/update quantity by voice, automatic
  category grouping (dairy, produce, pantry, etc.).
- **Voice-activated search:** item search with price-range filtering
  ("toothpaste under $5").
- **UI/UX:** minimalist dark interface, live transcript feedback, loading
  state while a command is processed, inline error banner for mic
  permission/network issues, typed-command fallback for unsupported browsers.

## Project structure

```
backend/
  src/
    data/products.js   # mock catalog: categories, price, season, substitutes
    nlp.js              # rule-based command parser
    store.js            # in-memory shopping list + purchase history
    suggestions.js       # seasonal / substitute / restock suggestion engine
    server.js            # Express routes
frontend/
  src/
    components/          # VoiceOrb, ShoppingList, Suggestions, SearchPanel, ...
    useVoice.js           # Web Speech API hook
    api.js                # backend client
    App.jsx / App.css     # layout + theme
```

## Notes / trade-offs (given the 8-hour scope)

- Data is in-memory and resets on server restart — fine for a demo, would
  move to Postgres/SQLite + auth for multi-user production use.
- "Running low" suggestions are driven by a simple add-count heuristic, not
  real purchase-date tracking.
- Multilingual support covers voice **recognition** language; command
  parsing logic itself is currently English-pattern-based.
